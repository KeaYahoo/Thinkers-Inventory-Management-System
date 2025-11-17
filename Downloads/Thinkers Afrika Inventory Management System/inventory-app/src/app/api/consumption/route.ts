import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const entries = await prisma.consumption.findMany({
    orderBy: { date: "desc" },
    include: { product: true },
  });
  return NextResponse.json(entries);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const productId = Number(body.productId);
    const quantity = Number(body.quantity);

    if (Number.isNaN(productId) || Number.isNaN(quantity)) {
      return NextResponse.json(
        { error: "productId and quantity must be numbers" },
        { status: 400 },
      );
    }

    const type = body.type ?? "internal";
    const consumer = body.consumer ?? "Unspecified";
    const date = body.date ? new Date(body.date) : new Date();

    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) {
        throw new Error("Product not found");
      }

      if (product.remaining - quantity < 0) {
        throw new Error("Insufficient stock for this product");
      }

      await tx.product.update({
        where: { id: productId },
        data: {
          remaining: product.remaining - quantity,
          stock: product.stock - quantity,
        },
      });

      return tx.consumption.create({
        data: {
          productId,
          quantity,
          type,
          consumer,
          date,
        },
      });
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to record consumption";
    const status = ["Product not found", "Insufficient"].some((flag) =>
      message.includes(flag),
    )
      ? 400
      : 500;
    console.error("[CONSUMPTION_POST]", error);
    return NextResponse.json({ error: message }, { status });
  }
}
