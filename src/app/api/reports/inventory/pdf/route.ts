import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import fs from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import InventoryReportPDF from "@/components/reports/InventoryReportPDF";

export const runtime = "nodejs";

function getPrismaFriendlyMessage(error: unknown) {
  if (!(error instanceof Error)) return null;
  const message = error.message.toLowerCase();
  if (error.name === "PrismaClientInitializationError" || message.includes("prisma")) {
    return "Database connection or migration error; check DATABASE_URL and run prisma migrate dev.";
  }
  return null;
}

async function readLogoDataUri() {
  const logoPath = path.join(process.cwd(), "public", "images", "thinkers-logo.png");
  try {
    const file = await fs.readFile(logoPath);
    return `data:image/png;base64,${file.toString("base64")}`;
  } catch (error) {
    console.warn("[REPORT_INVENTORY_PDF] Failed to read logo:", error);
    return undefined;
  }
}

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { name: "asc" },
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
    const message = getPrismaFriendlyMessage(error) ?? "Failed to generate inventory report PDF";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
