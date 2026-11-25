import type { UploadType } from "@/lib/telemetry/types";

export function formatDateTime(value: string | null, timeZone = "UTC"): string {
  if (!value) {
    return "Timestamp unavailable";
  }

  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) {
    return "Timestamp unavailable";
  }

  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZoneName: "short",
  }).format(date);
}

export function formatTime(value: string, timeZone = "UTC"): string {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}

export function formatMoisture(value: number | null): string {
  if (value === null || !Number.isFinite(value)) {
    return "—";
  }

  return `${Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1)}%`;
}

export function uploadTypeLabel(value: UploadType): string {
  if (value === "historical") {
    return "Historical / test";
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}
