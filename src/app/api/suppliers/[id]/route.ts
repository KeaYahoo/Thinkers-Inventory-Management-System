import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const REQUIRED_FIELDS = ["name", "contact", "spares", "location", "specialty"] as const;

function parseId(id: string) {
  const numericId = Number(id);
  if (Number.isNaN(numericId)) {
    throw new Error("Invalid supplier id");
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

function validateOptionalFields(body: Record<string, unknown>) {
  for (const field of REQUIRED_FIELDS) {
    if (body[field] === undefined) continue;
    const value = body[field];
    if (typeof value !== "string" || value.trim() === "") {
      throw new Error(`Invalid field: ${field}`);
    }
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supplier = await prisma.supplier.findUnique({
      where: { id: parseId(id) },
    });

    if (!supplier) {
      return NextResponse.json({ error: "Supplier not found" }, { status: 404 });
    }

    return NextResponse.json(supplier);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch supplier";
    const status = message.includes("Invalid supplier id") ? 400 : 500;
    console.error("[SUPPLIER_GET]", error);
    return NextResponse.json(
      { error: status === 500 ? getFriendlyDbError(error, "Failed to fetch supplier") : message },
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

    validateOptionalFields(body);

    const existing = await prisma.supplier.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Supplier not found" }, { status: 404 });
    }

    const updated = await prisma.supplier.update({
      where: { id },
      data: {
        name: body.name !== undefined ? String(body.name).trim() : existing.name,
        contact: body.contact !== undefined ? String(body.contact).trim() : existing.contact,
        spares: body.spares !== undefined ? String(body.spares).trim() : existing.spares,
        location: body.location !== undefined ? String(body.location).trim() : existing.location,
        specialty: body.specialty !== undefined ? String(body.specialty).trim() : existing.specialty,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update supplier";
    const status =
      message.includes("Invalid supplier id") || message.includes("Invalid field") ? 400 : 500;
    console.error("[SUPPLIER_PUT]", error);
    return NextResponse.json(
      { error: status === 500 ? getFriendlyDbError(error, "Failed to update supplier") : message },
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
    await prisma.supplier.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete supplier";
    const status = message.includes("Invalid supplier id") ? 400 : 500;
    console.error("[SUPPLIER_DELETE]", error);
    return NextResponse.json(
      { error: status === 500 ? getFriendlyDbError(error, "Failed to delete supplier") : message },
      { status },
    );
  }
}

