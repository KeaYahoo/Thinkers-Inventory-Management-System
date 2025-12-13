import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseDateRange } from "@/lib/reporting";

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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category")?.trim();
    const { from, to, error: dateError } = parseDateRange(searchParams);
    if (dateError) {
      return NextResponse.json({ error: dateError }, { status: 400 });
    }

    const products = await prisma.product.findMany({
      orderBy: { name: "asc" },
      where: {
        ...(category ? { category } : {}),
        ...(from || to ? { purchaseDate: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}),
      },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("[PRODUCTS_GET]", error);
    const message =
      error instanceof Error &&
      (error.name === "PrismaClientInitializationError" ||
        error.message.toLowerCase().includes("prisma"))
        ? "Database connection or migration error; check DATABASE_URL and run prisma migrate dev."
        : "Failed to fetch products";
    return NextResponse.json({ error: message }, { status: 500 });
  }
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
    const message =
      error instanceof Error &&
      (error.name === "PrismaClientInitializationError" ||
        error.message.toLowerCase().includes("prisma"))
        ? "Database connection or migration error; check DATABASE_URL and run prisma migrate dev."
        : "Failed to create product";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
