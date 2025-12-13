import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getFriendlyDbError, parseDateRange } from "@/lib/reporting";

export const runtime = "nodejs";

type ConsumptionTypeSummary = {
  type: string;
  entries: number;
  quantity: number;
};

type ConsumptionProductRow = {
  productId: number;
  code: string;
  name: string;
  category: string;
  unit: string;
  thinkersQuantity: number;
  otherQuantity: number;
  totalQuantity: number;
};

const normalizeType = (raw: string) => {
  const value = raw.trim().toLowerCase();
  if (value === "internal") return "thinkers";
  if (value === "external") return "other";
  return value;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const { from, to, error: dateError } = parseDateRange(searchParams);
    if (dateError) {
      return NextResponse.json({ error: dateError }, { status: 400 });
    }

    const productIdRaw = searchParams.get("productId")?.trim();
    const vehicleIdRaw = searchParams.get("vehicleId")?.trim();

    let productId: number | undefined;
    let vehicleId: number | undefined;

    if (productIdRaw) {
      const parsed = Number(productIdRaw);
      if (Number.isNaN(parsed) || parsed <= 0) {
        return NextResponse.json({ error: "Invalid productId" }, { status: 400 });
      }
      productId = parsed;
    }

    if (vehicleIdRaw) {
      const parsed = Number(vehicleIdRaw);
      if (Number.isNaN(parsed) || parsed <= 0) {
        return NextResponse.json({ error: "Invalid vehicleId" }, { status: 400 });
      }
      vehicleId = parsed;
    }

    const where = {
      ...(productId ? { productId } : {}),
      ...(vehicleId ? { vehicleId } : {}),
      ...(from || to ? { date: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}),
    };

    const totals = await prisma.consumption.aggregate({
      where,
      _count: { id: true },
      _sum: { quantity: true },
    });

    const byType = await prisma.consumption.groupBy({
      by: ["type"],
      where,
      _count: { id: true },
      _sum: { quantity: true },
    });

    const byProductAndType = await prisma.consumption.groupBy({
      by: ["productId", "type"],
      where,
      _sum: { quantity: true },
    });

    const productIds = Array.from(new Set(byProductAndType.map((row) => row.productId)));
    const products = productIds.length
      ? await prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, code: true, name: true, category: true, unit: true },
          orderBy: { name: "asc" },
        })
      : [];
    const productMap = new Map(products.map((product) => [product.id, product]));

    const productRows = new Map<number, ConsumptionProductRow>();
    for (const row of byProductAndType) {
      const product = productMap.get(row.productId);
      if (!product) continue;

      const existing =
        productRows.get(product.id) ??
        ({
          productId: product.id,
          code: product.code,
          name: product.name,
          category: product.category,
          unit: product.unit,
          thinkersQuantity: 0,
          otherQuantity: 0,
          totalQuantity: 0,
        } satisfies ConsumptionProductRow);

      const quantity = row._sum.quantity ?? 0;
      const bucket = normalizeType(row.type);
      if (bucket === "thinkers") existing.thinkersQuantity += quantity;
      else existing.otherQuantity += quantity;
      existing.totalQuantity += quantity;
      productRows.set(product.id, existing);
    }

    const typeSummary: ConsumptionTypeSummary[] = byType.map((group) => ({
      type: group.type,
      entries: group._count.id,
      quantity: group._sum.quantity ?? 0,
    }));

    return NextResponse.json({
      totals: {
        totalEntries: totals._count.id,
        totalQuantity: totals._sum.quantity ?? 0,
      },
      byType: typeSummary,
      byProduct: Array.from(productRows.values()).sort((a, b) => a.name.localeCompare(b.name)),
    });
  } catch (error) {
    console.error("[ANALYTICS_CONSUMPTION_GET]", error);
    return NextResponse.json(
      { error: getFriendlyDbError(error, "Failed to fetch consumption analytics") },
      { status: 500 },
    );
  }
}
