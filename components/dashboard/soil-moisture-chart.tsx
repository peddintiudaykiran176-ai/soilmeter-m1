"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type DotItemDotProps,
  type TooltipContentProps,
} from "recharts";
import {
  formatMoisture,
  formatDateTime,
  formatTime,
  uploadTypeLabel,
} from "@/lib/dashboard/format";
import type { TelemetryRecord, UploadType } from "@/lib/telemetry/types";
import { useTimeZone } from "@/components/dashboard/time-zone-provider";

function isUploadType(value: unknown): value is UploadType {
  return value === "manual" || value === "automatic" || value === "historical";
}

function isTelemetryRecord(value: unknown): value is TelemetryRecord {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  return (
    "id" in value &&
    typeof value.id === "string" &&
    "message" in value &&
    typeof value.message === "string" &&
    "deviceId" in value &&
    typeof value.deviceId === "string" &&
    "timestampUtc" in value &&
    (typeof value.timestampUtc === "string" || value.timestampUtc === null) &&
    "moisture" in value &&
    (typeof value.moisture === "number" || value.moisture === null) &&
    "uploadType" in value &&
    isUploadType(value.uploadType)
  );
}

const readingTypeStyles: Record<
  UploadType,
  { color: string; label: string; shape: "circle" | "diamond" | "square" }
> = {
  manual: { color: "#23845f", label: "Manual", shape: "diamond" },
  automatic: { color: "#2563eb", label: "Automatic", shape: "circle" },
  historical: { color: "#737373", label: "Historical / test", shape: "square" },
};

const readingTypeOrder: UploadType[] = ["manual", "automatic", "historical"];

function ReadingDot({ cx, cy, payload }: DotItemDotProps) {
  if (
    typeof cx !== "number" ||
    typeof cy !== "number" ||
    !isTelemetryRecord(payload)
  ) {
    return null;
  }

  const { color, label, shape } = readingTypeStyles[payload.uploadType];

  return (
    <g
      role="img"
      aria-label={`${label} reading`}
      transform={`translate(${cx} ${cy})`}
    >
      {shape === "circle" ? (
        <circle r={4.5} fill={color} stroke="var(--card)" strokeWidth={2} />
      ) : shape === "diamond" ? (
        <path
          d="M 0 -5.5 L 5.5 0 L 0 5.5 L -5.5 0 Z"
          fill={color}
          stroke="var(--card)"
          strokeWidth={2}
        />
      ) : (
        <rect
          x={-4}
          y={-4}
          width={8}
          height={8}
          rx={1}
          fill={color}
          stroke="var(--card)"
          strokeWidth={2}
        />
      )}
    </g>
  );
}

function MoistureTooltip({
  active,
  payload,
  timeZone,
}: TooltipContentProps & { timeZone: string }) {
  if (!active || !payload.length || !isTelemetryRecord(payload[0]?.payload)) {
    return null;
  }

  const record = payload[0].payload;

  return (
    <div className="min-w-40 rounded-xl border border-border bg-popover p-3 text-popover-foreground shadow-lg">
      <p className="text-xs text-muted-foreground">
        {formatDateTime(record.timestampUtc, timeZone)}
      </p>
      <p className="mt-1 text-xl font-semibold tracking-tight">
        {formatMoisture(record.moisture)}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {uploadTypeLabel(record.uploadType)} reading
      </p>
    </div>
  );
}

export function SoilMoistureChart({
  records,
}: {
  records: TelemetryRecord[];
}) {
  const { timeZone } = useTimeZone();

  if (records.length === 0) {
    return (
      <div className="flex min-h-[220px] flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-6 text-center">
        <p className="font-medium text-foreground">No readings in the past 24 hours</p>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          New timestamped moisture uploads for this field will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[220px] w-full flex-1 flex-col">
      <div
        className="min-h-[190px] w-full flex-1"
        aria-label="Soil moisture readings during the past 24 hours"
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={records}
            margin={{ top: 14, right: 12, bottom: 4, left: 0 }}
          >
            <defs>
              <linearGradient id="soil-moisture-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#27966f" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#27966f" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              stroke="var(--border)"
              strokeDasharray="3 5"
            />
            <XAxis
              dataKey="timestampUtc"
              tickFormatter={(value: string) => formatTime(value, timeZone)}
              tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              minTickGap={28}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 20, 40, 60, 80, 100]}
              tickFormatter={(value: number) => `${value}%`}
              tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={48}
            />
            <Tooltip
              content={(props) => (
                <MoistureTooltip {...props} timeZone={timeZone} />
              )}
              cursor={{ stroke: "var(--border)", strokeDasharray: "4 4" }}
            />
            <Area
              type="monotone"
              dataKey="moisture"
              name="Soil moisture"
              stroke="#23845f"
              strokeWidth={2.5}
              fill="url(#soil-moisture-fill)"
              dot={ReadingDot}
              activeDot={{
                r: 5,
                fill: "#23845f",
                stroke: "var(--card)",
                strokeWidth: 2,
              }}
              connectNulls
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <ul
        aria-label="Reading types"
        className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-2 text-[10px] text-muted-foreground"
      >
        {readingTypeOrder.map((type) => {
          const { color, label, shape } = readingTypeStyles[type];
          return (
            <li key={type} className="inline-flex items-center gap-2">
              <span
                aria-hidden="true"
                className={`size-2.5 ${
                  shape === "circle"
                    ? "rounded-full"
                    : shape === "diamond"
                      ? "rotate-45 rounded-[1px]"
                      : "rounded-[1px]"
                }`}
                style={{ backgroundColor: color }}
              />
              {label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
