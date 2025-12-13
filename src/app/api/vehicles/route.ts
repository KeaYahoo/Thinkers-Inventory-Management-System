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

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as Record<string, unknown>).code === "P2002"
  );
}

export async function GET() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      orderBy: { regNumber: "asc" },
    });
    return NextResponse.json(vehicles);
  } catch (error) {
    console.error("[VEHICLES_GET]", error);
    return NextResponse.json(
      { error: getFriendlyDbError(error, "Failed to fetch vehicles") },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const regNumber = typeof body.regNumber === "string" ? body.regNumber.trim() : "";
    if (!regNumber) {
      return NextResponse.json(
        { error: "Missing required field: regNumber" },
        { status: 400 },
      );
    }

    const description =
      typeof body.description === "string" ? body.description.trim() : null;

    const vehicle = await prisma.vehicle.create({
      data: {
        regNumber,
        description: description || null,
      },
    });

    return NextResponse.json(vehicle, { status: 201 });
  } catch (error) {
    console.error("[VEHICLES_POST]", error);
    if (isUniqueConstraintError(error)) {
      return NextResponse.json(
        { error: "A vehicle with this registration number already exists" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: getFriendlyDbError(error, "Failed to create vehicle") },
      { status: 500 },
    );
  }
}

