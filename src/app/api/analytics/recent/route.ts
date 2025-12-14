import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getFriendlyDbError } from "@/lib/reporting";

export const runtime = "nodejs";

type ActivityItem = {
  type: "transfer" | "consumption" | "log";
  timestamp: string;
  description: string;
};

function sortByTimestamp(items: ActivityItem[]) {
  return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export async function GET() {
  try {
    const [transfers, consumptions, logs] = await Promise.all([
      prisma.transfer.findMany({
        orderBy: { date: "desc" },
        include: { product: true, vehicle: true },
        take: 5,
      }),
      prisma.consumption.findMany({
        orderBy: { date: "desc" },
        include: { product: true, vehicle: true },
        take: 5,
      }),
      prisma.vehicleLog.findMany({
        orderBy: { date: "desc" },
        include: { vehicle: true },
        take: 5,
      }),
    ]);

    const activities: ActivityItem[] = [
      ...transfers.map((t) => ({
        type: "transfer" as const,
        timestamp: t.date.toISOString(),
        description: `Transferred ${t.quantity} of ${t.product?.code ?? "item"} ${t.direction === "TO_VEHICLE" ? "to" : "from"} ${t.vehicle?.regNumber ?? "warehouse"}`,
      })),
      ...consumptions.map((c) => ({
        type: "consumption" as const,
        timestamp: c.date.toISOString(),
        description: `Consumed ${c.quantity} of ${c.product?.code ?? "item"} (${c.type})`,
      })),
      ...logs.map((l) => ({
        type: "log" as const,
        timestamp: l.date.toISOString(),
        description: `Vehicle ${l.vehicle?.regNumber ?? ""} logged ${l.liters}L at ${l.location}`,
      })),
    ];

    return NextResponse.json(sortByTimestamp(activities).slice(0, 5));
  } catch (error) {
    console.error("[ANALYTICS_RECENT]", error);
    return NextResponse.json(
      { error: getFriendlyDbError(error, "Failed to fetch recent activity") },
      { status: 500 },
    );
  }
}

