import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getFriendlyDbError } from "@/lib/reporting";

export const runtime = "nodejs";

function parseId(id: string) {
  const numericId = Number(id);
  if (Number.isNaN(numericId) || numericId <= 0) {
    throw new Error("Invalid night shift report id");
  }
  return numericId;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const report = await prisma.nightShiftReport.findUnique({
      where: { id: parseId(id) },
      include: { vehicle: true },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json(report);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load report";
    const status = message.includes("Invalid night shift report id") ? 400 : 500;
    console.error("[NIGHTSHIFT_GET_ID]", error);
    return NextResponse.json({ error: message }, { status });
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

    const existing = await prisma.nightShiftReport.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const dateValue = body.date !== undefined ? String(body.date).trim() : undefined;
    const staffValue = body.staff !== undefined ? String(body.staff).trim() : undefined;
    const summaryValue = body.shiftSummary !== undefined ? String(body.shiftSummary).trim() : undefined;

    if (staffValue !== undefined && staffValue === "") {
      return NextResponse.json({ error: "staff is required" }, { status: 400 });
    }
    if (summaryValue !== undefined && summaryValue === "") {
      return NextResponse.json({ error: "shiftSummary is required" }, { status: 400 });
    }

    const date = dateValue ? new Date(dateValue) : undefined;
    if (dateValue && (!date || Number.isNaN(date.getTime()))) {
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

    const updated = await prisma.nightShiftReport.update({
      where: { id },
      data: {
        date,
        vehicleId,
        staff: staffValue,
        shiftSummary: summaryValue,
        incidents: body.incidents !== undefined ? String(body.incidents).trim() || null : undefined,
        nonCompliance: body.nonCompliance !== undefined ? String(body.nonCompliance).trim() || null : undefined,
      },
      include: { vehicle: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update report";
    const status =
      message.includes("Invalid night shift report id") ||
      message.includes("required") ||
      message.includes("Vehicle not found") ||
      message.includes("Invalid date")
        ? 400
        : 500;
    console.error("[NIGHTSHIFT_PUT]", error);
    return NextResponse.json(
      { error: status === 500 ? getFriendlyDbError(error, message) : message },
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

    await prisma.nightShiftReport.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete report";
    const status = message.includes("Invalid night shift report id") ? 400 : 500;
    console.error("[NIGHTSHIFT_DELETE]", error);
    return NextResponse.json(
      { error: status === 500 ? getFriendlyDbError(error, message) : message },
      { status },
    );
  }
}

