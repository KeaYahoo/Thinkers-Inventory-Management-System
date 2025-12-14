import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getFriendlyDbError } from "@/lib/reporting";

export const runtime = "nodejs";

export async function GET() {
  try {
    const grouped = await prisma.transfer.groupBy({
      by: ["direction"],
      _count: { id: true },
    });

    const data = grouped.map((row) => ({
      direction: row.direction,
      count: row._count.id,
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("[ANALYTICS_TRANSFERS_DIRECTION]", error);
    return NextResponse.json(
      { error: getFriendlyDbError(error, "Failed to fetch transfer direction mix") },
      { status: 500 },
    );
  }
}

