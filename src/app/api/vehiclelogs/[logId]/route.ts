import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function parseId(id: string) {
  const numericId = Number(id);
  if (Number.isNaN(numericId)) {
    throw new Error("Invalid vehicle log id");
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

function parseDate(value: unknown): Date | null {
  if (typeof value !== "string") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ logId: string }> },
) {
  try {
    const { logId } = await params;
    const record = await prisma.vehicleLog.findUnique({
      where: { id: parseId(logId) },
      include: { vehicle: true },
    });
    if (!record) {
      return NextResponse.json({ error: "Vehicle log not found" }, { status: 404 });
    }
    return NextResponse.json(record);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch vehicle log";
    const status = message.includes("Invalid vehicle log id") ? 400 : 500;
    console.error("[VEHICLE_LOG_GET]", error);
    return NextResponse.json(
      { error: status === 500 ? getFriendlyDbError(error, "Failed to fetch vehicle log") : message },
      { status },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ logId: string }> },
) {
  try {
    const { logId } = await params;
    const id = parseId(logId);
    const body = (await request.json()) as Record<string, unknown>;

    const existing = await prisma.vehicleLog.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Vehicle log not found" }, { status: 404 });
    }

    const date = body.date !== undefined ? parseDate(body.date) : existing.date;
    if (!date) {
      return NextResponse.json({ error: "Missing required field: date" }, { status: 400 });
    }

    const location =
      body.location !== undefined ? String(body.location).trim() : existing.location;
    if (!location) {
      return NextResponse.json(
        { error: "Missing required field: location" },
        { status: 400 },
      );
    }

    const liters =
      body.liters !== undefined ? Number(body.liters) : existing.liters;
    const cost = body.cost !== undefined ? Number(body.cost) : existing.cost;

    if (!Number.isFinite(liters) || liters <= 0) {
      return NextResponse.json(
        { error: "liters must be a number greater than zero" },
        { status: 400 },
      );
    }
    if (!Number.isFinite(cost) || cost < 0) {
      return NextResponse.json(
        { error: "cost must be a number greater than or equal to zero" },
        { status: 400 },
      );
    }

    const tripDetails =
      body.tripDetails !== undefined ? String(body.tripDetails).trim() : existing.tripDetails ?? "";

    const updated = await prisma.vehicleLog.update({
      where: { id },
      data: {
        date,
        location,
        liters,
        cost,
        tripDetails: tripDetails || null,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update vehicle log";
    const status = message.includes("Invalid vehicle log id") ? 400 : 500;
    console.error("[VEHICLE_LOG_PUT]", error);
    return NextResponse.json(
      { error: status === 500 ? getFriendlyDbError(error, "Failed to update vehicle log") : message },
      { status },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ logId: string }> },
) {
  try {
    const { logId } = await params;
    const id = parseId(logId);
    const deleted = await prisma.vehicleLog.delete({ where: { id } });
    return NextResponse.json(deleted);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete vehicle log";
    const status = message.includes("Invalid vehicle log id") ? 400 : 500;
    console.error("[VEHICLE_LOG_DELETE]", error);
    return NextResponse.json(
      { error: status === 500 ? getFriendlyDbError(error, "Failed to delete vehicle log") : message },
      { status },
    );
  }
}

