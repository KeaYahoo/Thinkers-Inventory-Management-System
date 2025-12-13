import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { getFriendlyDbError, parseDateRange, readLogoDataUri } from "@/lib/reporting";
import InventoryReportPDF from "@/components/reports/InventoryReportPDF";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category")?.trim();
    const { from, to, error: dateError } = parseDateRange(searchParams);
    if (dateError) {
      return NextResponse.json({ error: dateError }, { status: 400 });
    }

    const products = await prisma.product.findMany({
      orderBy: { name: "asc" },
      where: {
        ...(category ? { category } : {}),
        ...(from || to ? { purchaseDate: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}),
      },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        category: true,
        remaining: true,
        minStock: true,
        cost: true,
        sellingPrice: true,
      },
    });

    const outOfStockCount = products.filter((product) => product.remaining <= 0).length;
    const lowStockCount = products.filter((product) => product.remaining <= product.minStock).length;
    const totalRemainingUnits = products.reduce((sum, product) => sum + product.remaining, 0);

    const logoSrc = await readLogoDataUri();
    const generatedAt = new Date().toLocaleString("en-ZA");

    const pdfBuffer = await renderToBuffer(
      InventoryReportPDF({
        products,
        summary: {
          totalProducts: products.length,
          lowStockCount,
          outOfStockCount,
          totalRemainingUnits,
        },
        generatedAt,
        logoSrc,
      }),
    );

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="inventory-report.pdf"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[REPORT_INVENTORY_PDF]", error);
    return NextResponse.json(
      { error: getFriendlyDbError(error, "Failed to generate inventory report PDF") },
      { status: 500 },
    );
  }
}
