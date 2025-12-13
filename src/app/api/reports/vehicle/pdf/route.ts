import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { getFriendlyDbError, parseDateRange, readLogoDataUri } from "@/lib/reporting";
import VehicleReportPDF from "@/components/reports/VehicleReportPDF";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const { from, to, error: dateError } = parseDateRange(searchParams);
    if (dateError) {
      return NextResponse.json({ error: dateError }, { status: 400 });
    }

    const vehicles = await prisma.vehicle.findMany({
      orderBy: { regNumber: "asc" },
      select: { id: true, regNumber: true, description: true },
    });

    const stockSums = await prisma.vehicleStock.groupBy({
      by: ["vehicleId"],
      _sum: { quantity: true },
    });
    const stockByVehicle = new Map<number, number>(
      stockSums.map((row) => [row.vehicleId, row._sum.quantity ?? 0]),
    );

    const logCounts = await prisma.vehicleLog.groupBy({
      by: ["vehicleId"],
      where: from || to ? { date: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : undefined,
      _count: { id: true },
    });
    const logsByVehicle = new Map<number, number>(
      logCounts.map((row) => [row.vehicleId, row._count.id]),
    );

    const transferCounts = await prisma.transfer.groupBy({
      by: ["vehicleId"],
      where: {
        vehicleId: { not: null },
        ...(from || to ? { date: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}),
      },
      _count: { id: true },
    });
    const transfersByVehicle = new Map<number, number>(
      transferCounts
        .filter((row) => row.vehicleId !== null)
        .map((row) => [row.vehicleId as number, row._count.id]),
    );

    const vehicleRows = vehicles.map((vehicle) => ({
      id: vehicle.id,
      regNumber: vehicle.regNumber,
      description: vehicle.description,
      onRoadUnits: stockByVehicle.get(vehicle.id) ?? 0,
      logCount: logsByVehicle.get(vehicle.id) ?? 0,
      transferCount: transfersByVehicle.get(vehicle.id) ?? 0,
    }));

    const summary = {
      totalVehicles: vehicleRows.length,
      totalOnRoadUnits: vehicleRows.reduce((sum, row) => sum + row.onRoadUnits, 0),
      totalLogs: vehicleRows.reduce((sum, row) => sum + row.logCount, 0),
      totalTransfers: vehicleRows.reduce((sum, row) => sum + row.transferCount, 0),
    };

    const filtersLabel = from || to ? `Filters: ${from ? from.toLocaleDateString("en-ZA") : "Any"} - ${to ? to.toLocaleDateString("en-ZA") : "Any"}` : undefined;
    const logoSrc = await readLogoDataUri();
    const generatedAt = new Date().toLocaleString("en-ZA");

    const pdfBuffer = await renderToBuffer(
      VehicleReportPDF({
        vehicles: vehicleRows,
        summary,
        generatedAt,
        logoSrc,
        filtersLabel,
      }),
    );

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="vehicle-report.pdf"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[REPORT_VEHICLE_PDF]", error);
    return NextResponse.json(
      { error: getFriendlyDbError(error, "Failed to generate vehicle report PDF") },
      { status: 500 },
    );
  }
}

