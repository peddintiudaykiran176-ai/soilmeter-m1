"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Droplets,
  MapPin,
  Plus,
  Sprout,
} from "lucide-react";
import { DashboardRefreshControl } from "@/components/dashboard/dashboard-refresh-control";
import { AddDeviceDialog } from "@/components/dashboard/add-device-dialog";
import { SoilMoistureChart } from "@/components/dashboard/soil-moisture-chart";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTimeZone } from "@/components/dashboard/time-zone-provider";
import {
  formatMoisture,
  formatTime,
} from "@/lib/dashboard/format";
import type {
  DashboardDevice,
  DashboardTelemetry,
} from "@/lib/dashboard/telemetry";

const GAUGE_ARC_LENGTH = 264;

function moistureBand(moisture: number | null): string {
  if (moisture === null) {
    return "No reading";
  }
  if (moisture < 30) {
    return "Dry";
  }
  if (moisture <= 70) {
    return "Balanced";
  }
  return "Wet";
}

function MoistureGauge({ moisture }: { moisture: number | null }) {
  const clampedMoisture =
    moisture === null ? 0 : Math.min(100, Math.max(0, moisture));
  const progress = (clampedMoisture / 100) * GAUGE_ARC_LENGTH;
  const band = moistureBand(moisture);
  const bandClass =
    band === "Dry"
      ? "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300"
      : band === "Wet"
        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300"
        : "bg-muted text-muted-foreground";

  return (
    <div className="mx-auto w-full max-w-[270px]">
      <div className="relative h-[clamp(88px,12vh,128px)]">
        <svg
          viewBox="0 0 220 130"
          role="img"
          aria-label={`Soil moisture ${formatMoisture(moisture)}, ${band.toLowerCase()}`}
          className="absolute inset-0 size-full"
        >
          <path
            d="M 26 110 A 84 84 0 0 1 194 110"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.09"
            strokeWidth="13"
            strokeLinecap="round"
          />
          {moisture !== null && (
            <path
              d="M 26 110 A 84 84 0 0 1 194 110"
              fill="none"
              stroke="#27966f"
              strokeWidth="13"
              strokeLinecap="round"
              strokeDasharray={`${progress} ${GAUGE_ARC_LENGTH}`}
            />
          )}
        </svg>
        <div className="absolute inset-x-0 top-[56%] -translate-y-1/2 text-center">
          <p className="text-[32px] font-semibold leading-none tracking-[-0.06em] text-foreground">
            {formatMoisture(moisture)}
          </p>
          <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Relative moisture
          </p>
          <span
            className={`mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${bandClass}`}
          >
            <Droplets size={11} />
            {band}
          </span>
        </div>
        <span className="absolute bottom-5 left-2 text-[9px] text-muted-foreground">
          0%
        </span>
        <span className="absolute bottom-5 right-2 text-[9px] text-muted-foreground">
          100%
        </span>
      </div>
    </div>
  );
}

function FieldSelector({
  devices,
  selectedDeviceId,
  onSelect,
  onAddDevice,
}: {
  devices: DashboardDevice[];
  selectedDeviceId: string;
  onSelect: (deviceId: string) => void;
  onAddDevice: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Select a field">
      {devices.map((device) => (
        <Button
          key={device.deviceId}
          type="button"
          size="sm"
          variant={selectedDeviceId === device.deviceId ? "default" : "outline"}
          aria-pressed={selectedDeviceId === device.deviceId}
          onClick={() => onSelect(device.deviceId)}
          className="max-w-full gap-2 rounded-lg"
        >
          <Sprout className="size-3.5 shrink-0" />
          <span className="truncate">{device.fieldName}</span>
          {device.status === "verified" && (
            <CheckCircle2 className="size-3.5 shrink-0 opacity-80" />
          )}
        </Button>
      ))}
      <Button
        type="button"
        size="icon-sm"
        variant="outline"
        aria-label="Add a device"
        onClick={onAddDevice}
      >
        <Plus className="size-4" />
      </Button>
    </div>
  );
}

function QuickMetric({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "green" | "blue" | "neutral";
}) {
  const toneClass = {
    green: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
    neutral: "bg-muted text-muted-foreground",
  }[tone];

  return (
    <div className="flex min-w-0 items-center gap-2.5 rounded-xl border border-border/70 bg-background p-2">
      <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${toneClass}`}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="truncate text-[10px] text-muted-foreground">{label}</p>
        <p className="truncate text-xs font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}

function FieldMap({ device }: { device: DashboardDevice | null }) {
  const hasCoordinates =
    device?.latitude !== null &&
    device?.latitude !== undefined &&
    device?.longitude !== null &&
    device?.longitude !== undefined;
  const coordinates = hasCoordinates
    ? `${device.latitude},${device.longitude}`
    : null;
  const mapUrl = coordinates
    ? `https://maps.google.com/maps?q=${encodeURIComponent(coordinates)}&z=16&output=embed`
    : null;

  return (
    <Card id="field-map" size="sm" className="h-full overflow-hidden shadow-sm">
      {/* <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <MapPin className="size-4 text-primary" />
          Field map
        </CardTitle>
        <CardDescription className="truncate">
          {device
            ? `${device.fieldName}${device.cropType ? ` · ${device.cropType}` : ""}`
            : "Select a field to view its location"}
        </CardDescription>
      </CardHeader> */}
      <CardContent className="flex min-h-0 flex-1 flex-col">
        {mapUrl && device ? (
          <>
            <div className="relative flex min-h-[120px] flex-1 overflow-hidden rounded-xl border border-border bg-muted">
              <iframe
                title={`Google Maps location for ${device.fieldName}`}
                src={mapUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="size-full border-0"
              />
            </div>
         
          </>
        ) : (
          <div className="flex min-h-[160px] flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-5 text-center">
            <MapPin className="size-6 text-muted-foreground" />
            <p className="mt-2 text-sm font-medium text-foreground">
              {device ? "Location not added yet" : "No field selected"}
            </p>
            <p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">
              Add GPS coordinates to this device to see it on Google Maps.
            </p>
            <Button asChild variant="link" size="sm" className="mt-2">
              <Link href="/devices/new">
                Update device location <ArrowUpRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function TelemetryDashboard({ data }: { data: DashboardTelemetry }) {
  const router = useRouter();
  const { timeZone } = useTimeZone();
  const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState(
    data.registeredDevices[0]?.deviceId ?? "",
  );
  const selectedDevice =
    data.registeredDevices.find(
      (device) => device.deviceId === selectedDeviceId,
    ) ??
    data.registeredDevices[0] ??
    null;
  const selectedReading = selectedDevice
    ? data.sensorReadings.find(
        (reading) => reading.deviceId === selectedDevice.deviceId,
      ) ?? null
    : null;
  const selectedChartRecords = selectedDevice
    ? data.chartRecords.filter(
        (record) => record.deviceId === selectedDevice.deviceId,
      )
    : [];
  const selectedUploadCount = selectedDevice
    ? data.recentRecords.filter(
        (record) => record.deviceId === selectedDevice.deviceId,
      ).length
    : 0;
  const lastUpdated = selectedReading?.timestampUtc ?? selectedDevice?.lastReadingAt ?? null;

  return (
    <div className="flex min-h-[calc(100dvh-6rem)] flex-col gap-3 lg:h-full lg:min-h-0">
      {/* <div className="flex justify-end">
        <DashboardRefreshControl lastUpdatedUtc={data.snapshotAtUtc} />
      </div> */}

      <section
        aria-label="Selected field overview"
        className="grid flex-1 gap-3 lg:min-h-0 lg:grid-cols-[minmax(0,2.2fr)_minmax(300px,0.95fr)]"
      >
        <div className="flex min-h-0 flex-col gap-3">
          <Card
            id="moisture-trend"
            className="flex min-h-[390px] flex-1 flex-col shadow-sm lg:min-h-0"
          >
            <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-2">
              <div className="min-w-0">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="size-4 shrink-0 text-primary" />
                  Moisture trend
                </CardTitle>
                <CardDescription className="mt-1 truncate">
                  {selectedDevice
                    ? `${selectedDevice.fieldName} · individual readings over the past 24 hours`
                    : "Select a connected field to view its readings"}
                </CardDescription>
              </div>
              <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
                Past 24 hours
              </span>
            </CardHeader>
            <CardContent className="flex min-h-0 flex-1 flex-col">
              <SoilMoistureChart records={selectedChartRecords} />
              <div className="mt-3 flex items-center justify-between gap-3 border-t border-border/70 pt-3 text-xs text-muted-foreground">
                <span className="shrink-0">
                  {selectedUploadCount}{" "}
                  {selectedUploadCount === 1 ? "upload" : "uploads"} received
                </span>
                <span className="truncate text-right">
                  {lastUpdated
                    ? `Last reading ${formatTime(lastUpdated, timeZone)} ${timeZone}`
                    : "Waiting for the first reading"}
                </span>
              </div>
            </CardContent>
          </Card>

          <section aria-label="Choose a field" className="shrink-0">
            {data.registeredDevices.length > 0 ? (
              <FieldSelector
                devices={data.registeredDevices}
                selectedDeviceId={selectedDevice?.deviceId ?? ""}
                onSelect={setSelectedDeviceId}
                onAddDevice={() => setIsAddDeviceOpen(true)}
              />
            ) : (
              <Card className="border-dashed shadow-none">
                <CardContent className="flex flex-col items-start justify-between gap-4 py-4 sm:flex-row sm:items-center">
                  <div>
                    <p className="font-medium text-foreground">
                      Connect your first SoilMeter
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Add a device to see field moisture and its location here.
                    </p>
                  </div>
                  <Button
                    type="button"
                    className="gap-2"
                    onClick={() => setIsAddDeviceOpen(true)}
                  >
                    <Plus className="size-4" />
                    Add device
                  </Button>
                </CardContent>
              </Card>
            )}
          </section>
        </div>

        <div className="grid gap-3 lg:min-h-0 lg:grid-rows-[minmax(220px,0.9fr)_minmax(200px,1.1fr)]">
          <Card id="device-status" size="sm" className="min-h-0 shadow-sm">
            <CardHeader className="pb-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Droplets className="size-4 text-primary" />
                    Soil moisture level
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {selectedDevice?.fieldName ?? "No field selected"}
                  </CardDescription>
                </div>
                {selectedDevice && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    {selectedDevice.status === "verified"
                      ? "Verified"
                      : selectedDevice.status}
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <MoistureGauge moisture={selectedReading?.moisture ?? null} />
              <div className="grid grid-cols-3 gap-2">
                <QuickMetric
                  icon={<Droplets className="size-3.5" />}
                  label="Moisture"
                  value={formatMoisture(selectedReading?.moisture ?? null)}
                  tone="green"
                />
                <QuickMetric
                  icon={<Sprout className="size-3.5" />}
                  label="Soil level"
                  value={moistureBand(selectedReading?.moisture ?? null)}
                  tone="neutral"
                />
                <QuickMetric
                  icon={<Clock3 className="size-3.5" />}
                  label="Last update"
                  value={
                    lastUpdated ? `${formatTime(lastUpdated, timeZone)} ${timeZone}` : "—"
                  }
                  tone="blue"
                />
              </div>
              <p
                title="Moisture bands are a general guide. Crop-specific thresholds may differ."
                className="mt-1 truncate text-[10px] leading-4 text-muted-foreground"
              >
                Moisture bands are a general guide. Crop-specific thresholds may differ.
              </p>
            </CardContent>
          </Card>

          <div className="min-h-[220px] lg:min-h-0">
            <FieldMap device={selectedDevice} />
          </div>
        </div>
      </section>
      <AddDeviceDialog
        open={isAddDeviceOpen}
        onOpenChange={setIsAddDeviceOpen}
        onDeviceConnected={(deviceId) => {
          setSelectedDeviceId(deviceId);
          setIsAddDeviceOpen(false);
          router.refresh();
        }}
      />
    </div>
  );
}
