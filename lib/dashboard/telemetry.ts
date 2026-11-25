import { sql } from "@/app/lib/db";
import {
  classifyUploadMessage,
  type TelemetryRecord,
} from "@/lib/telemetry/types";

export type DashboardTelemetry = {
  totalRecords: number;
  latestRecord: TelemetryRecord | null;
  latestMoistureRecord: TelemetryRecord | null;
  recentRecords: TelemetryRecord[];
  chartRecords: TelemetryRecord[];
  devices: TelemetryRecord[];
  registeredDevices: DashboardDevice[];
  sensorReadings: TelemetryRecord[];
  snapshotAtUtc: string;
};

export type DashboardDevice = {
  deviceId: string;
  fieldName: string;
  cropType: string;
  status: "pending" | "verified" | "inactive";
  latitude: number | null;
  longitude: number | null;
  lastReadingAt: string | null;
};

function nullableNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function nullableString(value: unknown): string | null {
  return typeof value === "string" && value !== "" ? value : null;
}

function mapTelemetryRow(row: Record<string, unknown>): TelemetryRecord {
  const message = String(row.message);

  return {
    id: String(row.id),
    deviceId: String(row.device_id),
    message,
    moisture: nullableNumber(row.moisture),
    timestampUtc: nullableString(row.timestamp_utc),
    uploadType: classifyUploadMessage(message),
  };
}

export async function getDashboardTelemetry(
  userId: string,
): Promise<DashboardTelemetry> {
  const [
    recentRows,
    chartRows,
    deviceRows,
    sensorRows,
    registeredDeviceRows,
  ] = await Promise.all([
    sql`
      SELECT
        id::text AS id,
        device_id,
        message,
        moisture,
        to_char(
          created_at AT TIME ZONE 'UTC',
          'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
        ) AS timestamp_utc,
        (COUNT(*) OVER ())::text AS total_records
      FROM soil_telemetry
      WHERE EXISTS (
        SELECT 1
        FROM devices AS owned_device
        WHERE owned_device.device_id = soil_telemetry.device_id
          AND owned_device.user_id = ${userId}::uuid
      )
      ORDER BY created_at DESC NULLS LAST, id DESC
      LIMIT 10
    `,
    sql`
      SELECT
        id::text AS id,
        device_id,
        message,
        moisture,
        to_char(
          created_at AT TIME ZONE 'UTC',
          'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
        ) AS timestamp_utc
      FROM soil_telemetry
      WHERE created_at >= NOW() - INTERVAL '24 hours'
        AND moisture IS NOT NULL
        AND EXISTS (
          SELECT 1
          FROM devices AS owned_device
          WHERE owned_device.device_id = soil_telemetry.device_id
            AND owned_device.user_id = ${userId}::uuid
        )
      ORDER BY created_at ASC, id ASC
    `,
    sql`
      SELECT DISTINCT ON (device_id)
        id::text AS id,
        device_id,
        message,
        moisture,
        to_char(
          created_at AT TIME ZONE 'UTC',
          'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
        ) AS timestamp_utc
      FROM soil_telemetry
      WHERE EXISTS (
        SELECT 1
        FROM devices AS owned_device
        WHERE owned_device.device_id = soil_telemetry.device_id
          AND owned_device.user_id = ${userId}::uuid
      )
      ORDER BY device_id, created_at DESC NULLS LAST, id DESC
    `,
    sql`
      SELECT
        id::text AS id,
        device_id,
        message,
        moisture,
        to_char(
          created_at AT TIME ZONE 'UTC',
          'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
        ) AS timestamp_utc
      FROM (
        SELECT
          id,
          device_id,
          message,
          moisture,
          created_at,
          ROW_NUMBER() OVER (
            PARTITION BY device_id
            ORDER BY created_at DESC NULLS LAST, id DESC
          ) AS device_rank
        FROM soil_telemetry
        WHERE moisture IS NOT NULL
          AND EXISTS (
            SELECT 1
            FROM devices AS owned_device
            WHERE owned_device.device_id = soil_telemetry.device_id
              AND owned_device.user_id = ${userId}::uuid
          )
      ) AS ranked_sensor_readings
      WHERE device_rank = 1
      ORDER BY created_at DESC NULLS LAST, id DESC
    `,
    sql`
      SELECT
        owned_device.device_id,
        owned_device.field_name,
        owned_device.crop_type,
        owned_device.status,
        owned_device.latitude,
        owned_device.longitude,
        to_char(
          latest_reading.created_at AT TIME ZONE 'UTC',
          'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
        ) AS last_reading_at
      FROM devices AS owned_device
      LEFT JOIN LATERAL (
        SELECT created_at
        FROM soil_telemetry
        WHERE soil_telemetry.device_id = owned_device.device_id
        ORDER BY created_at DESC NULLS LAST, id DESC
        LIMIT 1
      ) AS latest_reading ON true
      WHERE owned_device.user_id = ${userId}::uuid
      ORDER BY owned_device.created_at DESC, owned_device.id DESC
    `,
  ]);

  const recentRecords = recentRows.map(mapTelemetryRow);
  const chartRecords = chartRows.map(mapTelemetryRow);
  const devices = deviceRows.map(mapTelemetryRow);
  const sensorReadings = sensorRows.map(mapTelemetryRow);
  const registeredDevices: DashboardDevice[] = registeredDeviceRows.map(
    (row) => ({
      deviceId: String(row.device_id),
      fieldName: String(row.field_name),
      cropType: String(row.crop_type),
      status:
        row.status === "verified" || row.status === "inactive"
          ? row.status
          : "pending",
      latitude: nullableNumber(row.latitude),
      longitude: nullableNumber(row.longitude),
      lastReadingAt: nullableString(row.last_reading_at),
    }),
  );
  const totalRecordsValue: unknown = recentRows[0]?.total_records;
  const parsedTotalRecords = Number(totalRecordsValue ?? 0);

  return {
    totalRecords: Number.isFinite(parsedTotalRecords)
      ? parsedTotalRecords
      : 0,
    latestRecord: recentRecords[0] ?? null,
    latestMoistureRecord: sensorReadings[0] ?? null,
    recentRecords,
    chartRecords,
    devices,
    registeredDevices,
    sensorReadings,
    snapshotAtUtc: new Date().toISOString(),
  };
}
