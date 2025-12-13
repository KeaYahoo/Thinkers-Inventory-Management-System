import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { getFriendlyDbError, readLogoDataUri } from "@/lib/reporting";
import NightShiftReportPDF from "@/components/reports/NightShiftReportPDF";

export const runtime = "nodejs";

function parseId(id: string) {
  const numericId = Number(id);
  if (Number.isNaN(numericId) || numericId <= 0) {
    throw new Error("Invalid night shift report id");
  }
  return numericId;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const reportId = parseId(id);

    const report = await prisma.nightShiftReport.findUnique({
      where: { id: reportId },
      include: { vehicle: { select: { regNumber: true } } },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const logoSrc = await readLogoDataUri();
    const generatedAt = new Date().toLocaleString("en-ZA");

    const pdfBuffer = await renderToBuffer(
      NightShiftReportPDF({
        report,
        generatedAt,
        logoSrc,
      }),
    );

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=\"nightshift-report-${reportId}.pdf\"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate report PDF";
    const status = message.includes("Invalid night shift report id") ? 400 : 500;
    console.error("[REPORT_NIGHTSHIFT_PDF]", error);
    return NextResponse.json(
      { error: status === 500 ? getFriendlyDbError(error, message) : message },
      { status },
    );
  }
}

