import fs from "node:fs/promises";
import path from "node:path";

export function getFriendlyDbError(error: unknown, fallback: string) {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (error.name === "PrismaClientInitializationError" || message.includes("prisma")) {
      return "Database connection or migration error; check DATABASE_URL and run prisma migrate dev.";
    }
  }
  return fallback;
}

type ParsedDateRange = { from?: Date; to?: Date; error?: string };

const isValidDate = (date: Date) => !Number.isNaN(date.getTime());

const isDateOnly = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);

function parseDateParam(value: string): Date | undefined {
  const date = new Date(value);
  return isValidDate(date) ? date : undefined;
}

export function parseDateRange(searchParams: URLSearchParams): ParsedDateRange {
  const fromRaw = searchParams.get("from")?.trim();
  const toRaw = searchParams.get("to")?.trim();

  const from = fromRaw ? parseDateParam(fromRaw) : undefined;
  const to = toRaw ? parseDateParam(toRaw) : undefined;

  if (fromRaw && !from) return { error: "Invalid from date. Use YYYY-MM-DD." };
  if (toRaw && !to) return { error: "Invalid to date. Use YYYY-MM-DD." };

  if (from && isDateOnly(fromRaw!)) {
    from.setHours(0, 0, 0, 0);
  }

  if (to && isDateOnly(toRaw!)) {
    to.setHours(23, 59, 59, 999);
  }

  if (from && to && from > to) {
    return { error: "`from` must be before or equal to `to`." };
  }

  return { from, to };
}

export async function readLogoDataUri() {
  const logoPath = path.join(process.cwd(), "public", "images", "thinkers-logo.png");
  try {
    const file = await fs.readFile(logoPath);
    return `data:image/png;base64,${file.toString("base64")}`;
  } catch (error) {
    console.warn("[REPORTING] Failed to read logo:", error);
    return undefined;
  }
}

