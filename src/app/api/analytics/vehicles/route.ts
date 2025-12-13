import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getFriendlyDbError, parseDateRange } from "@/lib/reporting";

export const runtime = "nodejs";

type VehicleAnalyticsItem = {
  id: number;
  regNumber: string;
  description: string | null;
  onRoadUnits: number;
  logCount: number;
  transferCount: number;
};

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

    const items: VehicleAnalyticsItem[] = vehicles.map((vehicle) => ({
      id: vehicle.id,
      regNumber: vehicle.regNumber,
      description: vehicle.description,
      onRoadUnits: stockByVehicle.get(vehicle.id) ?? 0,
      logCount: logsByVehicle.get(vehicle.id) ?? 0,
      transferCount: transfersByVehicle.get(vehicle.id) ?? 0,
    }));

    return NextResponse.json({
      totals: {
        totalVehicles: items.length,
        totalOnRoadUnits: items.reduce((sum, item) => sum + item.onRoadUnits, 0),
        totalLogs: items.reduce((sum, item) => sum + item.logCount, 0),
        totalTransfers: items.reduce((sum, item) => sum + item.transferCount, 0),
      },
      vehicles: items,
    });
  } catch (error) {
    console.error("[ANALYTICS_VEHICLES_GET]", error);
    return NextResponse.json(
      { error: getFriendlyDbError(error, "Failed to fetch vehicle analytics") },
      { status: 500 },
    );
  }
}

