import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function parseId(id: string) {
  const numericId = Number(id);
  if (Number.isNaN(numericId)) {
    throw new Error("Invalid vehicle stock id");
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
  { params }: { params: Promise<{ stockId: string }> },
) {
  try {
    const { stockId } = await params;
    const record = await prisma.vehicleStock.findUnique({
      where: { id: parseId(stockId) },
      include: { product: true },
    });
    if (!record) {
      return NextResponse.json({ error: "Vehicle stock entry not found" }, { status: 404 });
    }
    return NextResponse.json(record);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch vehicle stock";
    const status = message.includes("Invalid vehicle stock id") ? 400 : 500;
    console.error("[VEHICLE_STOCK_ENTRY_GET]", error);
    return NextResponse.json(
      { error: status === 500 ? getFriendlyDbError(error, "Failed to fetch vehicle stock") : message },
      { status },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ stockId: string }> },
) {
  try {
    const { stockId } = await params;
    const id = parseId(stockId);
    const body = (await request.json()) as Record<string, unknown>;

    const existing = await prisma.vehicleStock.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Vehicle stock entry not found" }, { status: 404 });
    }

    const quantity = Number(body.quantity);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return NextResponse.json(
        { error: "quantity must be a positive integer" },
        { status: 400 },
      );
    }

    const updated = await prisma.vehicleStock.update({
      where: { id },
      data: { quantity },
      include: { product: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update vehicle stock";
    const status = message.includes("Invalid vehicle stock id") ? 400 : 500;
    console.error("[VEHICLE_STOCK_ENTRY_PUT]", error);
    return NextResponse.json(
      { error: status === 500 ? getFriendlyDbError(error, "Failed to update vehicle stock") : message },
      { status },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ stockId: string }> },
) {
  try {
    const { stockId } = await params;
    const id = parseId(stockId);
    const deleted = await prisma.vehicleStock.delete({
      where: { id },
      include: { product: true },
    });
    return NextResponse.json(deleted);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete vehicle stock";
    const status = message.includes("Invalid vehicle stock id") ? 400 : 500;
    console.error("[VEHICLE_STOCK_ENTRY_DELETE]", error);
    return NextResponse.json(
      { error: status === 500 ? getFriendlyDbError(error, "Failed to delete vehicle stock") : message },
      { status },
    );
  }
}

