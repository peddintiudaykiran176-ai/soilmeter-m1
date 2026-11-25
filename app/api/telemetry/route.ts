
import { NextResponse } from "next/server";
import { getTelemetryHistory } from "@/lib/telemetry/history";
import { sql } from "../../lib/db";

const PRIVATE_NO_STORE_HEADERS = {
  "Cache-Control": "private, no-store",
};
const MAX_PAGE_NUMBER = 10_000;

function parsePositiveInteger(
  value: string | null,
  defaultValue: number,
  maximum: number,
): number | null {
  if (value === null) {
    return defaultValue;
  }

  if (!/^[1-9]\d*$/.test(value)) {
    return null;
  }

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed <= maximum ? parsed : null;
}

function parseUtcDate(value: string | null): string | null | undefined {
  if (value === null) {
    return null;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return undefined;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  if (
    !Number.isFinite(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    return undefined;
  }

  return date.toISOString();
}

export async function GET(request: Request) {
  try {
    const { auth } = await import("@/auth");
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401, headers: PRIVATE_NO_STORE_HEADERS },
      );
    }

    const { searchParams } = new URL(request.url);
    const rawDeviceId = searchParams.get("device_id");
    const deviceId = rawDeviceId?.trim() || null;
    const startDate = parseUtcDate(searchParams.get("start_date"));
    const endDate = parseUtcDate(searchParams.get("end_date"));
    const page = parsePositiveInteger(
      searchParams.get("page"),
      1,
      MAX_PAGE_NUMBER,
    );
    const pageSize = parsePositiveInteger(
      searchParams.get("page_size"),
      10,
      100,
    );

    if (rawDeviceId !== null && !deviceId) {
      return NextResponse.json(
        { error: "device_id cannot be empty" },
        { status: 400, headers: PRIVATE_NO_STORE_HEADERS },
      );
    }

    if (startDate === undefined || endDate === undefined) {
      return NextResponse.json(
        { error: "Dates must be valid YYYY-MM-DD values interpreted in UTC" },
        { status: 400, headers: PRIVATE_NO_STORE_HEADERS },
      );
    }

    if (startDate && endDate && startDate > endDate) {
      return NextResponse.json(
        { error: "start_date must be on or before end_date" },
        { status: 400, headers: PRIVATE_NO_STORE_HEADERS },
      );
    }

    if (page === null || pageSize === null) {
      return NextResponse.json(
        {
          error: `page must be between 1 and ${MAX_PAGE_NUMBER}; page_size must be between 1 and 100`,
        },
        { status: 400, headers: PRIVATE_NO_STORE_HEADERS },
      );
    }

    let endDateExclusive: string | null = null;
    if (endDate) {
      const exclusiveDate = new Date(endDate);
      exclusiveDate.setUTCDate(exclusiveDate.getUTCDate() + 1);
      endDateExclusive = exclusiveDate.toISOString();
    }

    const result = await getTelemetryHistory({
      userId: session.user.id,
      deviceId,
      startDateUtc: startDate,
      endDateExclusiveUtc: endDateExclusive,
      page,
      pageSize,
    });

    return NextResponse.json(result, {
      headers: PRIVATE_NO_STORE_HEADERS,
    });
  } catch (error) {
    console.error("TELEMETRY HISTORY QUERY ERROR:", error);

    return NextResponse.json(
      { error: "Unable to fetch telemetry history" },
      { status: 500, headers: PRIVATE_NO_STORE_HEADERS },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { device_id, message, moisture = null } = body;

    if (
      typeof device_id !== "string" ||
      typeof message !== "string" ||
      !device_id.trim() ||
      !message.trim()
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid input" },
        { status: 400 }
      );
    }

    if (
      moisture !== null &&
      (typeof moisture !== "number" || !Number.isFinite(moisture))
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid moisture value" },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO soil_telemetry
        (device_id, message, moisture)
      VALUES
        (${device_id}, ${message}, ${moisture})
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      message: "Data saved successfully",
      data: result[0],
    });
  } catch (error) {
  console.error("TELEMETRY INSERT ERROR:", error);

  return NextResponse.json(
    {
      success: false,
      error: error instanceof Error
        ? error.message
        : "Unknown database error",
    },
    { status: 500 }
  );
}
}
