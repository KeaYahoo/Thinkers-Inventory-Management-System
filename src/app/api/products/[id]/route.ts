import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function parseId(id: string) {
  const numericId = Number(id);
  if (Number.isNaN(numericId)) {
    throw new Error("Invalid product id");
  }
  return numericId;
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseId(params.id) },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("[PRODUCT_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const body = await request.json();
    const id = parseId(params.id);

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const cost = body.cost !== undefined ? Number(body.cost) : product.cost;
    const markup =
      body.markup !== undefined ? Number(body.markup) : product.markup;
    const stock = body.stock !== undefined ? Number(body.stock) : product.stock;
    const remaining =
      body.remaining !== undefined ? Number(body.remaining) : product.remaining;
    const minStock =
      body.minStock !== undefined ? Number(body.minStock) : product.minStock;

    if ([cost, markup, stock, remaining, minStock].some(Number.isNaN)) {
      return NextResponse.json(
        { error: "Numeric fields must contain valid numbers" },
        { status: 400 },
      );
    }

    const sellingPrice = body.sellingPrice
      ? Number(body.sellingPrice)
      : cost * (1 + markup / 100);

    const updated = await prisma.product.update({
      where: { id },
      data: {
        code: body.code ?? product.code,
        name: body.name ?? product.name,
        description: body.description ?? product.description,
        category: body.category ?? product.category,
        unit: body.unit ?? product.unit,
        purchaseDate: body.purchaseDate
          ? new Date(body.purchaseDate)
          : product.purchaseDate,
        cost,
        markup,
        stock,
        minStock,
        remaining,
        sellingPrice,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update product";
    const status = message.includes("Invalid product id") ? 400 : 500;
    console.error("[PRODUCT_PUT]", error);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const id = parseId(params.id);

    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete product";
    const status = message.includes("Invalid product id") ? 400 : 500;
    console.error("[PRODUCT_DELETE]", error);
    return NextResponse.json({ error: message }, { status });
  }
}
