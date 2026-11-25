"use client";

import { useState, type FormEvent } from "react";
import { ChevronLeft, ChevronRight, LoaderCircle, RotateCcw, Rows3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTimeZone } from "@/components/dashboard/time-zone-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  formatMoisture,
  formatDateTime,
  uploadTypeLabel,
} from "@/lib/dashboard/format";
import type {
  TelemetryHistoryApiRecord,
  TelemetryHistoryPagination,
  TelemetryHistoryResponse,
  TelemetryRecord,
  UploadType,
} from "@/lib/telemetry/types";

type Filters = {
  deviceId: string;
  startDate: string;
  endDate: string;
};

const uploadTypeClassNames: Record<UploadType, string> = {
  manual:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300",
  automatic:
    "bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-300",
  historical: "bg-muted text-muted-foreground",
};

function isApiRecord(value: unknown): value is TelemetryHistoryApiRecord {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  return (
    "id" in value &&
    typeof value.id === "string" &&
    "device_id" in value &&
    typeof value.device_id === "string" &&
    "message" in value &&
    typeof value.message === "string" &&
    "moisture" in value &&
    (value.moisture === null ||
      (typeof value.moisture === "number" && Number.isFinite(value.moisture))) &&
    "created_at" in value &&
    (value.created_at === null || typeof value.created_at === "string") &&
    "upload_type" in value &&
    (value.upload_type === "manual" ||
      value.upload_type === "automatic" ||
      value.upload_type === "historical")
  );
}

function isHistoryResponse(value: unknown): value is TelemetryHistoryResponse {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  if (!("records" in value) || !Array.isArray(value.records)) {
    return false;
  }

  if (!("pagination" in value) || typeof value.pagination !== "object" || value.pagination === null) {
    return false;
  }

  const pagination = value.pagination;
  return (
    value.records.every(isApiRecord) &&
    "page" in pagination &&
    Number.isSafeInteger(pagination.page) &&
    "page_size" in pagination &&
    Number.isSafeInteger(pagination.page_size) &&
    "total_records" in pagination &&
    Number.isSafeInteger(pagination.total_records) &&
    "total_pages" in pagination &&
    Number.isSafeInteger(pagination.total_pages)
  );
}

function toTelemetryRecord(record: TelemetryHistoryApiRecord): TelemetryRecord {
  return {
    id: record.id,
    deviceId: record.device_id,
    message: record.message,
    moisture: record.moisture,
    timestampUtc: record.created_at,
    uploadType: record.upload_type,
  };
}

function toApiError(value: unknown): string | null {
  if (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof value.error === "string"
  ) {
    return value.error;
  }

  return null;
}

function UploadTypeBadge({ type }: { type: UploadType }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${uploadTypeClassNames[type]}`}
    >
      {uploadTypeLabel(type)}
    </span>
  );
}

export function TelemetryHistory({
  initialRecords,
  initialPagination,
  deviceIds,
}: {
  initialRecords: TelemetryRecord[];
  initialPagination: TelemetryHistoryPagination;
  deviceIds: string[];
}) {
  const [records, setRecords] = useState(initialRecords);
  const [pagination, setPagination] = useState(initialPagination);
  const [deviceId, setDeviceId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [appliedFilters, setAppliedFilters] = useState<Filters>({
    deviceId: "",
    startDate: "",
    endDate: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { timeZone } = useTimeZone();

  async function loadPage(page: number, filters: Filters) {
    setIsLoading(true);
    setError(null);

    const searchParams = new URLSearchParams({
      page: String(page),
      page_size: String(initialPagination.page_size),
    });

    if (filters.deviceId) {
      searchParams.set("device_id", filters.deviceId);
    }
    if (filters.startDate) {
      searchParams.set("start_date", filters.startDate);
    }
    if (filters.endDate) {
      searchParams.set("end_date", filters.endDate);
    }

    try {
      const response = await fetch(`/api/telemetry?${searchParams.toString()}`, {
        method: "GET",
        cache: "no-store",
        credentials: "same-origin",
      });
      const result: unknown = await response.json();

      if (!response.ok) {
        setError(toApiError(result) ?? "Unable to fetch telemetry history.");
        return;
      }

      if (!isHistoryResponse(result)) {
        setError("The telemetry history response was invalid.");
        return;
      }

      setRecords(result.records.map(toTelemetryRecord));
      setPagination(result.pagination);
      setAppliedFilters(filters);
    } catch (requestError) {
      console.error("TELEMETRY HISTORY REQUEST ERROR:", requestError);
      setError("Unable to load telemetry history. Check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (startDate && endDate && startDate > endDate) {
      setError("The start date must be on or before the end date.");
      return;
    }

    void loadPage(1, { deviceId, startDate, endDate });
  }

  function clearFilters() {
    setDeviceId("");
    setStartDate("");
    setEndDate("");
    void loadPage(1, { deviceId: "", startDate: "", endDate: "" });
  }

  const firstRecord =
    records.length === 0 ? 0 : (pagination.page - 1) * pagination.page_size + 1;
  const lastRecord =
    records.length === 0 ? 0 : firstRecord + records.length - 1;

  return (
    <Card id="recent-telemetry" className="scroll-mt-24 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Rows3 aria-hidden="true" className="size-4 text-primary" />
          Telemetry history
        </CardTitle>
        <CardDescription>
          Stored records ordered newest first. Date filters use UTC days.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <form
          onSubmit={applyFilters}
          className="grid gap-3 rounded-xl border border-border bg-muted/20 p-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">
            Device
            <select
              value={deviceId}
              onChange={(event) => setDeviceId(event.target.value)}
              disabled={isLoading}
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">All devices</option>
              {deviceIds.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">
            Start date (UTC)
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              disabled={isLoading}
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">
            End date (UTC)
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              disabled={isLoading}
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <div className="flex items-end gap-2">
            <Button type="submit" disabled={isLoading} className="flex-1">
              Apply filters
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={clearFilters}
              disabled={isLoading}
              aria-label="Clear telemetry filters"
            >
              <RotateCcw aria-hidden="true" />
            </Button>
          </div>
        </form>

        {error && (
          <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            <p>{error}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void loadPage(pagination.page, appliedFilters)}
              disabled={isLoading}
            >
              Retry
            </Button>
          </div>
        )}

        {isLoading && (
          <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
            Loading telemetry history…
          </p>
        )}

        {!isLoading && records.length === 0 && !error ? (
          <div className="rounded-lg bg-muted/50 px-4 py-10 text-center">
            <p className="font-medium text-foreground">No telemetry records found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              New uploads or records matching these filters will appear here.
            </p>
          </div>
        ) : records.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th scope="col" className="px-3 py-3 font-medium">
                    Received ({timeZone})
                  </th>
                  <th scope="col" className="px-3 py-3 font-medium">Device</th>
                  <th scope="col" className="px-3 py-3 font-medium">Moisture</th>
                  <th scope="col" className="px-3 py-3 font-medium">Classification</th>
                  <th scope="col" className="px-3 py-3 font-medium">Message</th>
                  <th scope="col" className="px-3 py-3 font-medium">Record</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr
                    key={record.id}
                    className="border-b border-border/70 last:border-0"
                  >
                    <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">
                      {formatDateTime(record.timestampUtc, timeZone)}
                    </td>
                    <td className="max-w-40 truncate px-3 py-3 font-mono text-xs text-foreground">
                      {record.deviceId}
                    </td>
                    <td className="px-3 py-3 font-medium text-foreground">
                      {formatMoisture(record.moisture)}
                    </td>
                    <td className="px-3 py-3">
                      <UploadTypeBadge type={record.uploadType} />
                    </td>
                    <td
                      className="max-w-64 truncate px-3 py-3 text-muted-foreground"
                      title={record.message}
                    >
                      {record.message}
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-muted-foreground">
                      #{record.id}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Showing {firstRecord}–{lastRecord} of {pagination.total_records} records
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void loadPage(pagination.page - 1, appliedFilters)}
              disabled={isLoading || pagination.page <= 1}
            >
              <ChevronLeft aria-hidden="true" />
              Previous
            </Button>
            <span className="min-w-24 text-center text-xs text-muted-foreground">
              {pagination.total_pages === 0
                ? "No pages"
                : `Page ${pagination.page} of ${pagination.total_pages}`}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void loadPage(pagination.page + 1, appliedFilters)}
              disabled={isLoading || pagination.page >= pagination.total_pages}
            >
              Next
              <ChevronRight aria-hidden="true" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
