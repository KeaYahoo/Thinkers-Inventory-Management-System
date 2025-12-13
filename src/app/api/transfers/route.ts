import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getFriendlyDbError(error: unknown, fallback: string) {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (error.name === "PrismaClientInitializationError" || message.includes("prisma")) {
      return "Database connection or migration error; check DATABASE_URL and run prisma migrate dev.";
    }
  }
  return fallback;
}

function parseOptionalDate(value: unknown): Date | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") throw new Error("date must be an ISO date string");
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error("date must be an ISO date string");
  return date;
}

type TransferDirection = "TO_VEHICLE" | "FROM_VEHICLE";

function parseDirection(value: unknown): TransferDirection {
  if (value === "TO_VEHICLE" || value === "FROM_VEHICLE") return value;
  throw new Error("direction must be TO_VEHICLE or FROM_VEHICLE");
}

function parsePositiveInt(value: unknown, field: string) {
  const numeric = Number(value);
  if (!Number.isInteger(numeric) || numeric <= 0) {
    throw new Error(`${field} must be a positive integer`);
  }
  return numeric;
}

export async function GET() {
  try {
    const transfers = await prisma.transfer.findMany({
      include: { product: true, vehicle: true },
      orderBy: { date: "desc" },
    });
    return NextResponse.json(transfers);
  } catch (error) {
    console.error("[TRANSFERS_GET]", error);
    return NextResponse.json(
      { error: getFriendlyDbError(error, "Failed to fetch transfers") },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const productId = parsePositiveInt(body.productId, "productId");
    const quantity = parsePositiveInt(body.quantity, "quantity");
    const direction = parseDirection(body.direction);
    const date = parseOptionalDate(body.date);
    const notes = typeof body.notes === "string" ? body.notes.trim() : undefined;

    const vehicleIdRaw = body.vehicleId;
    const vehicleId =
      vehicleIdRaw === undefined || vehicleIdRaw === null ? undefined : parsePositiveInt(vehicleIdRaw, "vehicleId");

    if (direction === "TO_VEHICLE" || direction === "FROM_VEHICLE") {
      if (vehicleId === undefined) {
        return NextResponse.json(
          { error: "vehicleId is required for this transfer direction" },
          { status: 400 },
        );
      }
    }

    const transfer = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) {
        throw new Error("Product not found");
      }

      const vehicle = vehicleId !== undefined ? await tx.vehicle.findUnique({ where: { id: vehicleId } }) : null;
      if (vehicleId !== undefined && !vehicle) {
        throw new Error("Vehicle not found");
      }

      if (direction === "TO_VEHICLE") {
        if (product.remaining < quantity) {
          throw new Error(`Insufficient warehouse stock; available ${product.remaining}`);
        }

        await tx.product.update({
          where: { id: productId },
          data: { remaining: product.remaining - quantity },
        });

        await tx.vehicleStock.upsert({
          where: { vehicleId_productId: { vehicleId: vehicleId!, productId } },
          create: { vehicleId: vehicleId!, productId, quantity },
          update: { quantity: { increment: quantity } },
        });
      }

      if (direction === "FROM_VEHICLE") {
        const stock = await tx.vehicleStock.findUnique({
          where: { vehicleId_productId: { vehicleId: vehicleId!, productId } },
        });
        if (!stock) {
          throw new Error("Vehicle does not have this product in stock");
        }
        if (stock.quantity < quantity) {
          throw new Error(`Insufficient vehicle stock; available ${stock.quantity}`);
        }

        const nextQuantity = stock.quantity - quantity;
        if (nextQuantity === 0) {
          await tx.vehicleStock.delete({ where: { id: stock.id } });
        } else {
          await tx.vehicleStock.update({
            where: { id: stock.id },
            data: { quantity: nextQuantity },
          });
        }

        await tx.product.update({
          where: { id: productId },
          data: { remaining: product.remaining + quantity },
        });
      }

      return tx.transfer.create({
        data: {
          productId,
          vehicleId: vehicleId ?? null,
          quantity,
          direction,
          notes: notes || null,
          date: date ?? new Date(),
        },
        include: { product: true, vehicle: true },
      });
    });

    return NextResponse.json(transfer, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create transfer";
    const status =
      message.includes("must be") ||
      message.includes("required") ||
      message.includes("not found") ||
      message.includes("Insufficient") ||
      message.includes("does not have")
        ? 400
        : 500;
    console.error("[TRANSFERS_POST]", error);
    return NextResponse.json(
      { error: status === 500 ? getFriendlyDbError(error, "Failed to create transfer") : message },
      { status },
    );
  }
}

