"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Crosshair,
  Droplets,
  LoaderCircle,
  MapPin,
  Plus,
  Sprout,
} from "lucide-react";
import {
  connectDeviceResponseSchema,
  connectedDeviceSchema,
  cropTypes,
  deviceRegistrationSchema,
} from "@/lib/devices/schemas";
import { useTimeZone } from "@/components/dashboard/time-zone-provider";
import { formatDateTime, formatMoisture } from "@/lib/dashboard/format";

export function DeviceRegistrationForm({
  onDeviceConnected,
}: {
  onDeviceConnected?: (deviceId: string) => void;
}) {
  const [deviceId, setDeviceId] = useState("");
  const [fieldName, setFieldName] = useState("");
  const [cropType, setCropType] = useState<(typeof cropTypes)[number]>("Tomato");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<
    ReturnType<typeof connectedDeviceSchema.parse> | null
  >(null);
  const { timeZone } = useTimeZone();

  const hasCoordinates = latitude.trim() !== "" && longitude.trim() !== "";
  const googleMapUrl = hasCoordinates
    ? `https://maps.google.com/maps?q=${encodeURIComponent(`${latitude},${longitude}`)}&z=15&output=embed`
    : null;

  function detectLocation() {
    setError(null);
    if (!navigator.geolocation) {
      setError("Location detection is not available in this browser.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLatitude(coords.latitude.toFixed(5));
        setLongitude(coords.longitude.toFixed(5));
        setIsLocating(false);
      },
      (locationError) => {
        setError(
          locationError.code === 1
            ? "Allow location access in your browser, or enter coordinates manually."
            : "Unable to detect your location. Please enter coordinates manually.",
        );
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  async function connectDevice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const parsed = deviceRegistrationSchema.safeParse({
      device_id: deviceId,
      field_name: fieldName,
      crop_type: cropType,
      latitude: latitude.trim() === "" ? null : Number(latitude),
      longitude: longitude.trim() === "" ? null : Number(longitude),
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Review the device details.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
        cache: "no-store",
      });
      const payload: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        const apiError =
          typeof payload === "object" &&
          payload !== null &&
          "error" in payload &&
          typeof payload.error === "string"
            ? payload.error
            : "Unable to connect this device.";
        setError(apiError);
        return;
      }

      const result = connectDeviceResponseSchema.safeParse(payload);
      if (!result.success) {
        setError("The device connection response was invalid. Please try again.");
        return;
      }

      setConnectedDevice(result.data.device);
      onDeviceConnected?.(parsed.data.device_id);
    } catch (requestError) {
      console.error("DEVICE CONNECTION REQUEST ERROR:", requestError);
      setError("Unable to connect right now. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (connectedDevice) {
    return (
      <section
        aria-live="polite"
        className="rounded-2xl border border-[#dce9dc] bg-white p-6 shadow-sm sm:p-8"
      >
        <div className="flex size-12 items-center justify-center rounded-full bg-[#e8f4e8] text-[#34714a]">
          <Check size={23} />
        </div>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-[#6c9775]">
          Device verified
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#183b2c]">
          {connectedDevice.field_name} is connected
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#68796c]">
          SoilMeter found telemetry for this device. Here is its latest soil
          moisture reading.
        </p>
        <div className="mt-6 flex items-center justify-between gap-4 rounded-xl bg-[#f3f7f1] p-5">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-white text-[#4c8159]">
              <Droplets size={19} />
            </span>
            <div>
              <p className="text-sm font-medium text-[#31513a]">Soil moisture</p>
              <p className="mt-1 text-xs text-[#7b897d]">
                {connectedDevice.last_reading_at
                  ? `Updated ${formatDateTime(connectedDevice.last_reading_at, timeZone)}`
                  : "No moisture reading has been received yet"}
              </p>
            </div>
          </div>
          <p className="text-3xl font-semibold tracking-tight text-[#214a34]">
            {formatMoisture(connectedDevice.moisture)}
          </p>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[#17513d] px-5 text-sm font-semibold text-white transition hover:bg-[#103e2f]"
          >
            Open field dashboard <ArrowRight size={16} />
          </Link>
          <button
            type="button"
            onClick={() => setConnectedDevice(null)}
            className="inline-flex h-11 items-center justify-center rounded-lg border border-[#dce6db] px-5 text-sm font-medium text-[#42614a] transition hover:bg-[#f7faf6]"
          >
            Add another device
          </button>
        </div>
      </section>
    );
  }

  return (
    <form
      onSubmit={connectDevice}
      className="rounded-2xl border border-[#e5ebe4] bg-white p-5 shadow-[0_14px_45px_rgba(27,54,40,0.06)] sm:p-8"
      noValidate
    >
      <div className="flex items-center justify-between gap-4 border-b border-[#edf0eb] pb-5">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-[#ebf7ef] text-[#2e7950]">
            <Plus size={21} />
          </span>
          <div>
            <h2 className="font-semibold text-[#183b2c]">
              Register &amp; connect new device
            </h2>
            <p className="mt-1 text-xs text-[#718074]">
              Add your hardware to begin soil moisture monitoring.
            </p>
          </div>
        </div>
        <span className="hidden rounded-full bg-[#f5f7f4] px-3 py-1.5 text-xs font-medium text-[#778378] sm:inline-flex">
          Step 1 of 1
        </span>
      </div>

      <div className="mt-6 space-y-5">
        <label className="block space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#516253]">
            Device ID 
          </span>
          <input
            required
            autoComplete="off"
            value={deviceId}
            onChange={(event) => setDeviceId(event.target.value)}
            placeholder="e.g. SOILMETER_001"
            className="h-11 w-full rounded-lg border border-[#dfe7df] bg-white px-3.5 text-sm text-[#203c2a] outline-none transition placeholder:text-[#a1aba1] focus:border-[#57a16c] focus:ring-2 focus:ring-[#57a16c]/15"
          />
          <span className="block text-xs text-[#879188]">
            We verify this ID against received sensor telemetry.
          </span>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#516253]">
              Field name
            </span>
            <input
              required
              value={fieldName}
              onChange={(event) => setFieldName(event.target.value)}
              placeholder="Greenhouse Alpha"
              className="h-11 w-full rounded-lg border border-[#dfe7df] bg-white px-3.5 text-sm text-[#203c2a] outline-none transition placeholder:text-[#a1aba1] focus:border-[#57a16c] focus:ring-2 focus:ring-[#57a16c]/15"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#516253]">
              Crop type
            </span>
            <select
              value={cropType}
              onChange={(event) => {
                const selectedCrop = cropTypes.find(
                  (crop) => crop === event.target.value,
                );
                if (selectedCrop) {
                  setCropType(selectedCrop);
                }
              }}
              className="h-11 w-full rounded-lg border border-[#dfe7df] bg-white px-3.5 text-sm text-[#203c2a] outline-none transition focus:border-[#57a16c] focus:ring-2 focus:ring-[#57a16c]/15"
            >
              {cropTypes.map((crop) => (
                <option key={crop} value={crop}>
                  {crop === "Tomato" ? "Tomatoes (Vegetables)" : crop}
                </option>
              ))}
            </select>
          </label>
        </div>

        <section aria-labelledby="location-heading" className="space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3
                id="location-heading"
                className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#516253]"
              >
                Location (GPS coordinates)
              </h3>
              <p className="mt-1 text-xs text-[#879188]">
                Optional · Pin the field for easier organization.
              </p>
            </div>
            <button
              type="button"
              onClick={detectLocation}
              disabled={isLocating}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#bfe1ca] bg-[#f2faf4] px-3 text-xs font-semibold text-[#27804c] transition hover:bg-[#e9f6ec] disabled:cursor-wait disabled:opacity-60"
            >
              {isLocating ? (
                <LoaderCircle size={14} className="animate-spin" />
              ) : (
                <Crosshair size={14} />
              )}
              {isLocating ? "Finding location…" : "Auto-detect my location"}
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex h-10 items-center gap-2 rounded-lg border border-[#dfe7df] px-3">
              <span className="text-xs font-medium text-[#829083]">LAT</span>
              <input
                type="number"
                min="-90"
                max="90"
                step="any"
                value={latitude}
                onChange={(event) => setLatitude(event.target.value)}
                placeholder="Latitude"
                aria-label="Latitude"
                className="min-w-0 flex-1 bg-transparent text-sm text-[#203c2a] outline-none placeholder:text-[#a1aba1]"
              />
            </label>
            <label className="flex h-10 items-center gap-2 rounded-lg border border-[#dfe7df] px-3">
              <span className="text-xs font-medium text-[#829083]">LNG</span>
              <input
                type="number"
                min="-180"
                max="180"
                step="any"
                value={longitude}
                onChange={(event) => setLongitude(event.target.value)}
                placeholder="Longitude"
                aria-label="Longitude"
                className="min-w-0 flex-1 bg-transparent text-sm text-[#203c2a] outline-none placeholder:text-[#a1aba1]"
              />
            </label>
          </div>

          <div className="relative h-52 overflow-hidden rounded-xl border border-[#dfe7df] bg-[#eef3ec] sm:h-60">
            {googleMapUrl ? (
              <>
                <iframe
                  title={`Google Map centered on ${latitude}, ${longitude}`}
                  src={googleMapUrl}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0 size-full border-0"
                />
                <span className="pointer-events-none absolute left-3 top-3 rounded bg-white/95 px-2.5 py-1.5 text-[10px] font-medium text-[#526457] shadow-sm">
                  Google Maps · {Number(latitude).toFixed(4)}°,{" "}
                  {Number(longitude).toFixed(4)}°
                </span>
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 px-5 text-center">
                <span className="flex size-10 items-center justify-center rounded-full bg-white text-[#398052] shadow-sm">
                  <MapPin size={19} />
                </span>
                <p className="text-sm font-medium text-[#44634b]">
                  Add coordinates to view your location
                </p>
                <p className="text-xs text-[#7d8c7e]">
                  Enter them above or use auto-detect.
                </p>
              </div>
            )}
          </div>
          <p className="text-[11px] leading-4 text-[#879188]">
            Google Maps receives the coordinates used to display this location.
          </p>
        </section>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-800"
        >
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-col-reverse gap-3 border-t border-[#edf0eb] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/dashboard"
          className="inline-flex h-10 items-center justify-center rounded-lg border border-[#dfe7df] px-4 text-sm font-medium text-[#637466] transition hover:bg-[#f7faf6]"
        >
          I’ll do this later
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#15513d] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#103f30] disabled:cursor-wait disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <LoaderCircle size={16} className="animate-spin" />
              Verifying device…
            </>
          ) : (
            <>
              <Sprout size={16} />
              Verify &amp; start monitoring
              <ArrowRight size={15} />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
