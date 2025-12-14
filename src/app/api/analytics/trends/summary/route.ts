import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getFriendlyDbError } from "@/lib/reporting";

export const runtime = "nodejs";

type Trend = {
  current: number;
  previous: number;
  percentChange: number;
};

const makeTrend = (current: number, previous: number): Trend => ({
  current,
  previous,
  percentChange: previous === 0 ? (current === 0 ? 0 : 100) : ((current - previous) / previous) * 100,
});

export async function GET() {
  try {
    const now = new Date();
    const currentStart = new Date(now);
    currentStart.setDate(now.getDate() - 6);

    const previousStart = new Date(currentStart);
    previousStart.setDate(previousStart.getDate() - 7);

    const [currentProducts, previousProducts, currentTransfers, previousTransfers, currentVehicles, previousVehicles] =
      await Promise.all([
        prisma.product.count({ where: { createdAt: { gte: currentStart } } }),
        prisma.product.count({ where: { createdAt: { gte: previousStart, lt: currentStart } } }),
        prisma.transfer.count({ where: { date: { gte: currentStart } } }),
        prisma.transfer.count({ where: { date: { gte: previousStart, lt: currentStart } } }),
        prisma.vehicle.count({ where: { createdAt: { gte: currentStart } } }),
        prisma.vehicle.count({ where: { createdAt: { gte: previousStart, lt: currentStart } } }),
      ]);

    const currentConsumption = await prisma.consumption.aggregate({
      where: { date: { gte: currentStart } },
      _sum: { quantity: true },
    });
    const previousConsumption = await prisma.consumption.aggregate({
      where: { date: { gte: previousStart, lt: currentStart } },
      _sum: { quantity: true },
    });

    return NextResponse.json({
      products: makeTrend(currentProducts, previousProducts),
      transfers: makeTrend(currentTransfers, previousTransfers),
      vehicles: makeTrend(currentVehicles, previousVehicles),
      consumption: makeTrend(currentConsumption._sum.quantity ?? 0, previousConsumption._sum.quantity ?? 0),
    });
  } catch (error) {
    console.error("[ANALYTICS_TRENDS_SUMMARY]", error);
    return NextResponse.json(
      { error: getFriendlyDbError(error, "Failed to fetch trends") },
      { status: 500 },
    );
  }
}

