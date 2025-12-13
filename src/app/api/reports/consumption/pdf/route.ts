import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { getFriendlyDbError, parseDateRange, readLogoDataUri } from "@/lib/reporting";
import ConsumptionReportPDF from "@/components/reports/ConsumptionReportPDF";

export const runtime = "nodejs";

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
      _sum: { quantity: true },
    });

    let thinkersQuantity = 0;
    let otherQuantity = 0;
    for (const entry of byType) {
      const bucket = normalizeType(entry.type);
      const quantity = entry._sum.quantity ?? 0;
      if (bucket === "thinkers") thinkersQuantity += quantity;
      else otherQuantity += quantity;
    }

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

    type Row = {
      productId: number;
      code: string;
      name: string;
      category: string;
      unit: string;
      thinkersQuantity: number;
      otherQuantity: number;
      totalQuantity: number;
    };

    const rowsMap = new Map<number, Row>();
    for (const group of byProductAndType) {
      const product = productMap.get(group.productId);
      if (!product) continue;

      const existing =
        rowsMap.get(product.id) ??
        ({
          productId: product.id,
          code: product.code,
          name: product.name,
          category: product.category,
          unit: product.unit,
          thinkersQuantity: 0,
          otherQuantity: 0,
          totalQuantity: 0,
        } satisfies Row);

      const quantity = group._sum.quantity ?? 0;
      const bucket = normalizeType(group.type);
      if (bucket === "thinkers") existing.thinkersQuantity += quantity;
      else existing.otherQuantity += quantity;
      existing.totalQuantity += quantity;
      rowsMap.set(product.id, existing);
    }

    const rows = Array.from(rowsMap.values()).sort((a, b) => a.name.localeCompare(b.name));

    const filtersLabelParts: string[] = [];
    if (from || to) {
      filtersLabelParts.push(
        `Date: ${from ? from.toLocaleDateString("en-ZA") : "Any"} - ${to ? to.toLocaleDateString("en-ZA") : "Any"}`,
      );
    }
    if (productId) filtersLabelParts.push(`Product: #${productId}`);
    if (vehicleId) filtersLabelParts.push(`Vehicle: #${vehicleId}`);

    const logoSrc = await readLogoDataUri();
    const generatedAt = new Date().toLocaleString("en-ZA");

    const pdfBuffer = await renderToBuffer(
      ConsumptionReportPDF({
        rows,
        summary: {
          totalEntries: totals._count.id,
          totalQuantity: totals._sum.quantity ?? 0,
          thinkersQuantity,
          otherQuantity,
        },
        generatedAt,
        logoSrc,
        filtersLabel: filtersLabelParts.length ? `Filters: ${filtersLabelParts.join(" · ")}` : undefined,
      }),
    );

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="consumption-report.pdf"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[REPORT_CONSUMPTION_PDF]", error);
    return NextResponse.json(
      { error: getFriendlyDbError(error, "Failed to generate consumption report PDF") },
      { status: 500 },
    );
  }
}
