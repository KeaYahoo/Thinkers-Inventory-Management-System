import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function parseId(id: string) {
  const numericId = Number(id);
  if (Number.isNaN(numericId)) {
    throw new Error("Invalid vehicle id");
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

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as Record<string, unknown>).code === "P2002"
  );
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const vehicleId = parseId(id);

    const stock = await prisma.vehicleStock.findMany({
      where: { vehicleId },
      include: { product: true },
      orderBy: { product: { name: "asc" } },
    });

    return NextResponse.json(stock);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch vehicle stock";
    const status = message.includes("Invalid vehicle id") ? 400 : 500;
    console.error("[VEHICLE_STOCK_GET]", error);
    return NextResponse.json(
      { error: status === 500 ? getFriendlyDbError(error, "Failed to fetch vehicle stock") : message },
      { status },
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const vehicleId = parseId(id);
    const body = (await request.json()) as Record<string, unknown>;

    const productId = Number(body.productId);
    if (!Number.isFinite(productId)) {
      return NextResponse.json(
        { error: "productId must be a valid number" },
        { status: 400 },
      );
    }

    const quantity = Number(body.quantity);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return NextResponse.json(
        { error: "quantity must be a positive integer" },
        { status: 400 },
      );
    }

    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const existing = await prisma.vehicleStock.findUnique({
      where: { vehicleId_productId: { vehicleId, productId } },
    });
    if (existing) {
      return NextResponse.json(
        { error: "This product already exists on the vehicle stock list" },
        { status: 400 },
      );
    }

    const created = await prisma.vehicleStock.create({
      data: { vehicleId, productId, quantity },
      include: { product: true },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to add vehicle stock";
    const status = message.includes("Invalid vehicle id") ? 400 : 500;
    console.error("[VEHICLE_STOCK_POST]", error);
    if (status === 500 && isUniqueConstraintError(error)) {
      return NextResponse.json(
        { error: "This product already exists on the vehicle stock list" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: status === 500 ? getFriendlyDbError(error, "Failed to add vehicle stock") : message },
      { status },
    );
  }
}

