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
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: parseId(id) },
    });

    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    return NextResponse.json(vehicle);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch vehicle";
    const status = message.includes("Invalid vehicle id") ? 400 : 500;
    console.error("[VEHICLE_GET]", error);
    return NextResponse.json(
      { error: status === 500 ? getFriendlyDbError(error, "Failed to fetch vehicle") : message },
      { status },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: paramId } = await params;
    const id = parseId(paramId);
    const body = (await request.json()) as Record<string, unknown>;

    const existing = await prisma.vehicle.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    const regNumberRaw = body.regNumber;
    const regNumber =
      regNumberRaw !== undefined ? String(regNumberRaw).trim() : existing.regNumber;
    if (!regNumber) {
      return NextResponse.json(
        { error: "Missing required field: regNumber" },
        { status: 400 },
      );
    }

    const description =
      body.description !== undefined ? String(body.description).trim() : existing.description ?? "";

    const updated = await prisma.vehicle.update({
      where: { id },
      data: {
        regNumber,
        description: description || null,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update vehicle";
    const status = message.includes("Invalid vehicle id") ? 400 : 500;
    console.error("[VEHICLE_PUT]", error);
    if (status === 500 && isUniqueConstraintError(error)) {
      return NextResponse.json(
        { error: "A vehicle with this registration number already exists" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: status === 500 ? getFriendlyDbError(error, "Failed to update vehicle") : message },
      { status },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: paramId } = await params;
    const id = parseId(paramId);
    await prisma.vehicle.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete vehicle";
    const status = message.includes("Invalid vehicle id") ? 400 : 500;
    console.error("[VEHICLE_DELETE]", error);
    return NextResponse.json(
      { error: status === 500 ? getFriendlyDbError(error, "Failed to delete vehicle") : message },
      { status },
    );
  }
}

