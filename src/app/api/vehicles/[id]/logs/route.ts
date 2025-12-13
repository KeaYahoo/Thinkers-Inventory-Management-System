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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const vehicleId = parseId(id);

    const logs = await prisma.vehicleLog.findMany({
      where: { vehicleId },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(logs);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch logs";
    const status = message.includes("Invalid vehicle id") ? 400 : 500;
    console.error("[VEHICLE_LOGS_GET]", error);
    return NextResponse.json(
      { error: status === 500 ? getFriendlyDbError(error, "Failed to fetch logs") : message },
      { status },
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const vehicleId = parseId(id);
    const body = (await request.json()) as Record<string, unknown>;

    const dateRaw = body.date;
    const date = typeof dateRaw === "string" ? new Date(dateRaw) : null;
    if (!date || Number.isNaN(date.getTime())) {
      return NextResponse.json({ error: "Missing required field: date" }, { status: 400 });
    }

    const location = typeof body.location === "string" ? body.location.trim() : "";
    if (!location) {
      return NextResponse.json(
        { error: "Missing required field: location" },
        { status: 400 },
      );
    }

    const liters = Number(body.liters);
    const cost = Number(body.cost);
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
      typeof body.tripDetails === "string" ? body.tripDetails.trim() : null;

    const log = await prisma.vehicleLog.create({
      data: {
        vehicleId,
        date,
        location,
        liters,
        cost,
        tripDetails: tripDetails || null,
      },
    });

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create log";
    const status = message.includes("Invalid vehicle id") ? 400 : 500;
    console.error("[VEHICLE_LOGS_POST]", error);
    return NextResponse.json(
      { error: status === 500 ? getFriendlyDbError(error, "Failed to create log") : message },
      { status },
    );
  }
}

