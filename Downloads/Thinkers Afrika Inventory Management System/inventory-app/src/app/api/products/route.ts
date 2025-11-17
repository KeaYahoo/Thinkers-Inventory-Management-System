import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const REQUIRED_FIELDS = [
  "code",
  "name",
  "description",
  "category",
  "stock",
  "unit",
  "cost",
  "markup",
  "minStock",
  "purchaseDate",
];

export async function GET() {
  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    for (const field of REQUIRED_FIELDS) {
      if (body[field] === undefined || body[field] === "") {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 },
        );
      }
    }

    const stock = Number(body.stock);
    const cost = Number(body.cost);
    const markup = Number(body.markup);
    const minStock = Number(body.minStock);
    const remaining = body.remaining !== undefined ? Number(body.remaining) : stock;

    if ([stock, cost, markup, minStock, remaining].some(Number.isNaN)) {
      return NextResponse.json(
        { error: "Numeric fields must contain valid numbers" },
        { status: 400 },
      );
    }

    const sellingPrice = body.sellingPrice
      ? Number(body.sellingPrice)
      : cost * (1 + markup / 100);

    const product = await prisma.product.create({
      data: {
        code: body.code,
        name: body.name,
        description: body.description,
        category: body.category,
        stock,
        unit: body.unit,
        cost,
        markup,
        minStock,
        remaining,
        sellingPrice,
        purchaseDate: new Date(body.purchaseDate),
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("[PRODUCTS_POST]", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 },
    );
  }
}
