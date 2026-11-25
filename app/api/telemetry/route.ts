
import { NextResponse } from "next/server";
import { sql } from "../../lib/db";

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
