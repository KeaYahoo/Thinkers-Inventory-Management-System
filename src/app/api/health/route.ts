import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("[HEALTH_CHECK]", error);
    return NextResponse.json(
      { status: "error", detail: (error as Error).message },
      { status: 500 },
    );
  }
}
