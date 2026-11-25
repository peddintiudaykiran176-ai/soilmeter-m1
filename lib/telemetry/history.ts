import { sql } from "@/app/lib/db";
import {
  classifyUploadMessage,
  type TelemetryHistoryApiRecord,
  type TelemetryHistoryPagination,
} from "@/lib/telemetry/types";

export type TelemetryHistoryFilters = {
  userId: string;
  deviceId: string | null;
  startDateUtc: string | null;
  endDateExclusiveUtc: string | null;
  page: number;
  pageSize: number;
};

export type TelemetryHistoryResult = {
  records: TelemetryHistoryApiRecord[];
  pagination: TelemetryHistoryPagination;
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

function mapHistoryRow(row: Record<string, unknown>): TelemetryHistoryApiRecord {
  const message = String(row.message);

  return {
    id: String(row.id),
    device_id: String(row.device_id),
    message,
    moisture: nullableNumber(row.moisture),
    created_at: nullableString(row.created_at),
    upload_type: classifyUploadMessage(message),
  };
}

export async function getTelemetryHistory(
  filters: TelemetryHistoryFilters,
): Promise<TelemetryHistoryResult> {
  const offset = (filters.page - 1) * filters.pageSize;
  const [countRows, recordRows] = await Promise.all([
    sql`
      SELECT COUNT(*)::text AS total_records
      FROM soil_telemetry
      WHERE EXISTS (
          SELECT 1
          FROM devices AS owned_device
          WHERE owned_device.device_id = soil_telemetry.device_id
            AND owned_device.user_id = ${filters.userId}::uuid
        )
        AND (${filters.deviceId}::varchar IS NULL OR device_id = ${filters.deviceId}::varchar)
        AND (${filters.startDateUtc}::timestamptz IS NULL OR created_at >= ${filters.startDateUtc}::timestamptz)
        AND (${filters.endDateExclusiveUtc}::timestamptz IS NULL OR created_at < ${filters.endDateExclusiveUtc}::timestamptz)
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
        ) AS created_at
      FROM soil_telemetry
      WHERE EXISTS (
          SELECT 1
          FROM devices AS owned_device
          WHERE owned_device.device_id = soil_telemetry.device_id
            AND owned_device.user_id = ${filters.userId}::uuid
        )
        AND (${filters.deviceId}::varchar IS NULL OR device_id = ${filters.deviceId}::varchar)
        AND (${filters.startDateUtc}::timestamptz IS NULL OR created_at >= ${filters.startDateUtc}::timestamptz)
        AND (${filters.endDateExclusiveUtc}::timestamptz IS NULL OR created_at < ${filters.endDateExclusiveUtc}::timestamptz)
      ORDER BY soil_telemetry.created_at DESC NULLS LAST, soil_telemetry.id DESC
      LIMIT ${filters.pageSize}
      OFFSET ${offset}
    `,
  ]);

  const totalRecords = Number(countRows[0]?.total_records ?? 0);
  if (!Number.isSafeInteger(totalRecords) || totalRecords < 0) {
    throw new Error("Telemetry history count returned an invalid value");
  }

  return {
    records: recordRows.map(mapHistoryRow),
    pagination: {
      page: filters.page,
      page_size: filters.pageSize,
      total_records: totalRecords,
      total_pages: Math.ceil(totalRecords / filters.pageSize),
    },
  };
}
