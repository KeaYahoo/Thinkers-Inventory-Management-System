import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const REQUIRED_FIELDS = ["name", "contact", "spares", "location", "specialty"] as const;

function getFriendlyDbError(error: unknown, fallback: string) {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (error.name === "PrismaClientInitializationError" || message.includes("prisma")) {
      return "Database connection or migration error; check DATABASE_URL and run prisma migrate dev.";
    }
  }
  return fallback;
}

export async function GET() {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(suppliers);
  } catch (error) {
    console.error("[SUPPLIERS_GET]", error);
    return NextResponse.json(
      { error: getFriendlyDbError(error, "Failed to fetch suppliers") },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    for (const field of REQUIRED_FIELDS) {
      const value = body[field];
      if (typeof value !== "string" || value.trim() === "") {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 },
        );
      }
    }

    const supplier = await prisma.supplier.create({
      data: {
        name: String(body.name).trim(),
        contact: String(body.contact).trim(),
        spares: String(body.spares).trim(),
        location: String(body.location).trim(),
        specialty: String(body.specialty).trim(),
      },
    });

    return NextResponse.json(supplier, { status: 201 });
  } catch (error) {
    console.error("[SUPPLIERS_POST]", error);
    return NextResponse.json(
      { error: getFriendlyDbError(error, "Failed to create supplier") },
      { status: 500 },
    );
  }
}

