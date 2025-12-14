import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getFriendlyDbError } from "@/lib/reporting";

export const runtime = "nodejs";

export async function GET() {
  try {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - 29);

    const grouped = await prisma.consumption.groupBy({
      by: ["date"],
      where: { date: { gte: start } },
      _sum: { quantity: true },
    });

    const data = grouped
      .map((row) => ({ date: row.date.toISOString(), quantity: row._sum.quantity ?? 0 }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return NextResponse.json(data);
  } catch (error) {
    console.error("[ANALYTICS_CONSUMPTION_TIME]", error);
    return NextResponse.json(
      { error: getFriendlyDbError(error, "Failed to fetch consumption trend") },
      { status: 500 },
    );
  }
}

