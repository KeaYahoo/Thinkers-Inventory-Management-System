import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEFAULT_DAYS = 14;
const MIN_DAYS = 7;
const MAX_DAYS = 30;

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const daysParam = Number(url.searchParams.get("days") ?? DEFAULT_DAYS);
    const days = Number.isFinite(daysParam)
      ? Math.min(MAX_DAYS, Math.max(MIN_DAYS, Math.floor(daysParam)))
      : DEFAULT_DAYS;

    const now = new Date();
    const endDateUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const startDateUtc = new Date(endDateUtc);
    startDateUtc.setUTCDate(endDateUtc.getUTCDate() - (days - 1));

    const products = await prisma.product.findMany({ select: { remaining: true } });
    const currentTotalRemaining = products.reduce((sum, product) => sum + product.remaining, 0);

    const consumptionEntries = await prisma.consumption.findMany({
      where: { date: { gte: startDateUtc } },
      select: { date: true, quantity: true },
    });

    const dailyConsumption = new Map<string, number>();
    for (const entry of consumptionEntries) {
      const key = entry.date.toISOString().slice(0, 10);
      dailyConsumption.set(key, (dailyConsumption.get(key) ?? 0) + entry.quantity);
    }

    const totalConsumptionSinceStart = Array.from(dailyConsumption.values()).reduce(
      (sum, value) => sum + value,
      0,
    );

    let futureConsumption = totalConsumptionSinceStart;
    const series: Array<{ date: string; remainingStock: number }> = [];

    for (let offset = 0; offset < days; offset += 1) {
      const date = new Date(startDateUtc);
      date.setUTCDate(startDateUtc.getUTCDate() + offset);
      const key = date.toISOString().slice(0, 10);
      const remainingStock = currentTotalRemaining + futureConsumption;
      series.push({ date: key, remainingStock });
      futureConsumption -= dailyConsumption.get(key) ?? 0;
    }

    return NextResponse.json(series);
  } catch (error) {
    console.error("[ANALYTICS_TRENDS_GET]", error);
    const message =
      error instanceof Error &&
      (error.name === "PrismaClientInitializationError" ||
        error.message.toLowerCase().includes("prisma"))
        ? "Database connection or migration error; check DATABASE_URL and run prisma migrate dev."
        : "Failed to fetch inventory trends";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

