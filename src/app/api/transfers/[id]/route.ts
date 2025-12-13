import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function parseId(id: string) {
  const numericId = Number(id);
  if (Number.isNaN(numericId)) {
    throw new Error("Invalid transfer id");
  }
  return numericId;
}

function getFriendlyDbError(error: unknown, fallback: string) {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (error.name === "PrismaClientInitializationError" || message.includes("prisma")) {
      return "Database connection or migration error; check DATABASE_URL and run prisma migrate dev.";
    }
  }
  return fallback;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const record = await prisma.transfer.findUnique({
      where: { id: parseId(id) },
      include: { product: true, vehicle: true },
    });
    if (!record) {
      return NextResponse.json({ error: "Transfer not found" }, { status: 404 });
    }
    return NextResponse.json(record);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch transfer";
    const status = message.includes("Invalid transfer id") ? 400 : 500;
    console.error("[TRANSFER_GET]", error);
    return NextResponse.json(
      { error: status === 500 ? getFriendlyDbError(error, "Failed to fetch transfer") : message },
      { status },
    );
  }
}

