import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type LowStockStatus = "critical" | "warning";

function getFriendlyDbError(error: unknown, fallback: string) {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (error.name === "PrismaClientInitializationError" || message.includes("prisma")) {
      return "Database connection or migration error; check DATABASE_URL and run prisma migrate dev.";
    }
  }
  return fallback;
}

function parseLimit(value: string | null) {
  if (value === null) return undefined;
  const numeric = Number(value);
  if (!Number.isInteger(numeric) || numeric <= 0) {
    throw new Error("limit must be a positive integer");
  }
  return numeric;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const limit = parseLimit(url.searchParams.get("limit"));

    const products = await prisma.product.findMany({
      select: {
        id: true,
        code: true,
        name: true,
        category: true,
        remaining: true,
        minStock: true,
      },
    });

    const alerts = products
      .filter((product) => product.remaining <= product.minStock)
      .map((product) => {
        const status: LowStockStatus = product.remaining <= 0 ? "critical" : "warning";
        return { ...product, status };
      })
      .sort((a, b) => {
        const severityA = a.status === "critical" ? 0 : 1;
        const severityB = b.status === "critical" ? 0 : 1;
        if (severityA !== severityB) return severityA - severityB;
        return a.name.localeCompare(b.name);
      });

    return NextResponse.json({ alerts: limit ? alerts.slice(0, limit) : alerts });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch low-stock alerts";
    const status = message.includes("limit must be") ? 400 : 500;
    console.error("[LOW_STOCK_ALERTS_GET]", error);
    return NextResponse.json(
      { error: status === 500 ? getFriendlyDbError(error, "Failed to fetch low-stock alerts") : message },
      { status },
    );
  }
}

