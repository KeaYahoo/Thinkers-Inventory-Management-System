import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getFriendlyDbError } from "@/lib/reporting";

export const runtime = "nodejs";

const REQUIRED_FIELDS = ["date", "staff", "shiftSummary"] as const;

export async function GET() {
  try {
    const reports = await prisma.nightShiftReport.findMany({
      orderBy: { date: "desc" },
      include: { vehicle: true },
    });
    return NextResponse.json(reports);
  } catch (error) {
    console.error("[NIGHTSHIFT_GET]", error);
    return NextResponse.json(
      { error: getFriendlyDbError(error, "Failed to fetch night shift reports") },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    for (const field of REQUIRED_FIELDS) {
      const value = body[field];
      if (value === undefined || value === null || String(value).trim() === "") {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 },
        );
      }
    }

    const date = new Date(String(body.date));
    if (Number.isNaN(date.getTime())) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }

    const vehicleIdRaw = body.vehicleId;
    const vehicleId =
      vehicleIdRaw === undefined || vehicleIdRaw === null || vehicleIdRaw === ""
        ? undefined
        : Number(vehicleIdRaw);

    if (vehicleId !== undefined && (Number.isNaN(vehicleId) || vehicleId <= 0)) {
      return NextResponse.json({ error: "vehicleId must be a valid number" }, { status: 400 });
    }

    if (vehicleId !== undefined) {
      const exists = await prisma.vehicle.findUnique({ where: { id: vehicleId }, select: { id: true } });
      if (!exists) {
        return NextResponse.json({ error: "Vehicle not found" }, { status: 400 });
      }
    }

    const report = await prisma.nightShiftReport.create({
      data: {
        date,
        vehicleId,
        staff: String(body.staff).trim(),
        shiftSummary: String(body.shiftSummary).trim(),
        incidents: body.incidents ? String(body.incidents).trim() : undefined,
        nonCompliance: body.nonCompliance ? String(body.nonCompliance).trim() : undefined,
      },
      include: { vehicle: true },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error("[NIGHTSHIFT_POST]", error);
    return NextResponse.json(
      { error: getFriendlyDbError(error, "Failed to create night shift report") },
      { status: 500 },
    );
  }
}

