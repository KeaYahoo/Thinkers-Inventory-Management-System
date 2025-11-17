import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function parseId(id: string) {
  const numericId = Number(id);
  if (Number.isNaN(numericId)) {
    throw new Error("Invalid consumption id");
  }
  return numericId;
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const record = await prisma.consumption.findUnique({
      where: { id: parseId(params.id) },
      include: { product: true },
    });

    if (!record) {
      return NextResponse.json(
        { error: "Consumption not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(record);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load entry";
    const status = message.includes("Invalid consumption id") ? 400 : 500;
    console.error("[CONSUMPTION_GET]", error);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const body = await request.json();
    const id = parseId(params.id);

    const existing = await prisma.consumption.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Consumption not found" },
        { status: 404 },
      );
    }

    const newQuantity =
      body.quantity !== undefined ? Number(body.quantity) : existing.quantity;
    if (Number.isNaN(newQuantity) || newQuantity < 0) {
      return NextResponse.json(
        { error: "Quantity must be a positive number" },
        { status: 400 },
      );
    }

    const newProductId =
      body.productId !== undefined
        ? Number(body.productId)
        : existing.productId;

    if (Number.isNaN(newProductId)) {
      return NextResponse.json(
        { error: "productId must be a number" },
        { status: 400 },
      );
    }

    const type = body.type ?? existing.type;
    const consumer = body.consumer ?? existing.consumer;
    const date = body.date ? new Date(body.date) : existing.date;

    const updated = await prisma.$transaction(async (tx) => {
      if (newProductId === existing.productId) {
        const product = await tx.product.findUnique({
          where: { id: existing.productId },
        });
        if (!product) throw new Error("Product not found");

        const delta = newQuantity - existing.quantity;
        if (delta > 0 && product.remaining < delta) {
          throw new Error("Insufficient stock for update");
        }

        if (delta !== 0) {
          await tx.product.update({
            where: { id: product.id },
            data:
              delta > 0
                ? {
                    remaining: { decrement: delta },
                    stock: { decrement: delta },
                  }
                : {
                    remaining: { increment: Math.abs(delta) },
                    stock: { increment: Math.abs(delta) },
                  },
          });
        }
      } else {
        const currentProduct = await tx.product.findUnique({
          where: { id: existing.productId },
        });
        const newProduct = await tx.product.findUnique({
          where: { id: newProductId },
        });
        if (!currentProduct || !newProduct) {
          throw new Error("Product not found");
        }

        await tx.product.update({
          where: { id: currentProduct.id },
          data: {
            remaining: { increment: existing.quantity },
            stock: { increment: existing.quantity },
          },
        });

        if (newProduct.remaining < newQuantity) {
          throw new Error("Insufficient stock for update");
        }

        await tx.product.update({
          where: { id: newProduct.id },
          data: {
            remaining: { decrement: newQuantity },
            stock: { decrement: newQuantity },
          },
        });
      }

      return tx.consumption.update({
        where: { id },
        data: {
          productId: newProductId,
          quantity: newQuantity,
          type,
          consumer,
          date,
        },
      });
    });

    return NextResponse.json(updated);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update entry";
    const status =
      message.includes("Invalid consumption id") ||
      message.includes("Insufficient") ||
      message.includes("Product not found")
        ? 400
        : 500;
    console.error("[CONSUMPTION_PUT]", error);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const id = parseId(params.id);

    const deleted = await prisma.$transaction(async (tx) => {
      const record = await tx.consumption.delete({
        where: { id },
      });
      await tx.product.update({
        where: { id: record.productId },
        data: {
          remaining: { increment: record.quantity },
          stock: { increment: record.quantity },
        },
      });
      return record;
    });

    return NextResponse.json(deleted);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete entry";
    const status = message.includes("Invalid consumption id") ? 400 : 500;
    console.error("[CONSUMPTION_DELETE]", error);
    return NextResponse.json({ error: message }, { status });
  }
}
