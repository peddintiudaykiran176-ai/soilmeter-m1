import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db/drizzle";
import { users } from "@/lib/db/schema";
import {
  connectDeviceResponseSchema,
  deviceRegistrationSchema,
} from "@/lib/devices/schemas";
import { sql } from "@/app/lib/db";

const PRIVATE_NO_STORE_HEADERS = {
  "Cache-Control": "private, no-store",
};

function nullableNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401, headers: PRIVATE_NO_STORE_HEADERS },
    );
  }

  const accountEmail = session.user.email?.trim().toLowerCase();
  if (!accountEmail) {
    return NextResponse.json(
      { error: "Your session has no account email. Please sign in again." },
      { status: 401, headers: PRIVATE_NO_STORE_HEADERS },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid device registration request." },
      { status: 400, headers: PRIVATE_NO_STORE_HEADERS },
    );
  }

  const parsed = deviceRegistrationSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Review the device details." },
      { status: 400, headers: PRIVATE_NO_STORE_HEADERS },
    );
  }

  let step = "account lookup";
  try {
    const [owner] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, accountEmail))
      .limit(1);

    if (!owner) {
      return NextResponse.json(
        { error: "Your account could not be found. Please sign in again." },
        { status: 401, headers: PRIVATE_NO_STORE_HEADERS },
      );
    }

    step = "device telemetry verification";
    const [verification] = await sql`
      SELECT
        EXISTS (
          SELECT 1
          FROM soil_telemetry
          WHERE device_id = ${parsed.data.device_id}
        ) AS has_telemetry,
        (
          SELECT moisture
          FROM soil_telemetry
          WHERE device_id = ${parsed.data.device_id}
            AND moisture IS NOT NULL
          ORDER BY created_at DESC NULLS LAST, id DESC
          LIMIT 1
        ) AS moisture,
        (
          SELECT to_char(
            created_at AT TIME ZONE 'UTC',
            'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
          )
          FROM soil_telemetry
          WHERE device_id = ${parsed.data.device_id}
            AND moisture IS NOT NULL
          ORDER BY created_at DESC NULLS LAST, id DESC
          LIMIT 1
        ) AS last_reading_at
    `;

    if (verification?.has_telemetry !== true) {
      return NextResponse.json(
        {
          error:
            "No telemetry was found for this device ID. Check the ID and make sure the sensor has sent data.",
        },
        { status: 404, headers: PRIVATE_NO_STORE_HEADERS },
      );
    }

    step = "device ownership insert";
    const [createdDevice] = await sql`
      INSERT INTO devices (
        user_id,
        device_id,
        field_name,
        crop_type,
        latitude,
        longitude,
        status
      )
      VALUES (
        ${owner.id}::uuid,
        ${parsed.data.device_id},
        ${parsed.data.field_name},
        ${parsed.data.crop_type},
        ${parsed.data.latitude},
        ${parsed.data.longitude},
        'verified'
      )
      ON CONFLICT (device_id) DO NOTHING
      RETURNING
        id::text AS id,
        field_name,
        crop_type,
        status
    `;

    if (!createdDevice) {
      return NextResponse.json(
        {
          error:
            "This device ID cannot be connected. Check the ID or contact your workspace owner.",
        },
        { status: 409, headers: PRIVATE_NO_STORE_HEADERS },
      );
    }

    step = "device response validation";
    const result = connectDeviceResponseSchema.safeParse({
      device: {
        id: createdDevice.id,
        field_name: createdDevice.field_name,
        crop_type: createdDevice.crop_type,
        status: createdDevice.status,
        moisture: nullableNumber(verification.moisture),
        last_reading_at:
          typeof verification.last_reading_at === "string"
            ? verification.last_reading_at
            : null,
      },
    });

    if (!result.success) {
      throw new Error("Connected device response did not match its schema.");
    }

    return NextResponse.json(result.data, {
      status: 201,
      headers: PRIVATE_NO_STORE_HEADERS,
    });
  } catch (error) {
    console.error(`DEVICE REGISTRATION ERROR (${step}):`, error);
    const message =
      step === "account lookup"
        ? "Unable to match this session to an account. Please sign in again."
        : step === "device telemetry verification"
          ? "Unable to check this device's sensor readings right now. Please try again."
          : step === "device ownership insert"
            ? "Unable to link this device to your account. Please retry."
            : "The device was linked, but its latest moisture reading could not be loaded.";
    return NextResponse.json(
      { error: message },
      { status: 500, headers: PRIVATE_NO_STORE_HEADERS },
    );
  }
}
