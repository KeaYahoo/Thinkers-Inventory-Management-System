import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const grouped = await prisma.product.groupBy({
      by: ["category"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    });

    return NextResponse.json(
      grouped.map((group) => ({
        category: group.category,
        count: group._count.id,
      })),
    );
  } catch (error) {
    console.error("[ANALYTICS_CATEGORIES_GET]", error);
    const message =
      error instanceof Error &&
      (error.name === "PrismaClientInitializationError" ||
        error.message.toLowerCase().includes("prisma"))
        ? "Database connection or migration error; check DATABASE_URL and run prisma migrate dev."
        : "Failed to fetch category breakdown";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
