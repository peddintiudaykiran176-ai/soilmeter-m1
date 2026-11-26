"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Crosshair,
  Droplets,
  LoaderCircle,
  MapPin,
  Plus,
  Sprout,
} from "lucide-react";
import { cn } from "@/lib/utils";
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
  onCancel,
  className,
}: {
  onDeviceConnected?: (deviceId: string) => void;
  onCancel?: () => void;
  className?: string;
}) {
  const [step, setStep] = useState(0);
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

  const stepTitles = ["Device ID", "Field details", "Location"];

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

  function continueToNextStep() {
    setError(null);
    const result =
      step === 0
        ? deviceRegistrationSchema.shape.device_id.safeParse(deviceId)
        : deviceRegistrationSchema.shape.field_name.safeParse(fieldName);

    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Review the details.");
      return;
    }

    setStep((currentStep) => currentStep + 1);
  }

  if (connectedDevice) {
    return (
      <section
        aria-live="polite"
        className={cn(
          "flex min-h-[min(440px,calc(100dvh-8rem))] flex-col justify-center rounded-2xl border border-[#dce9dc] bg-white p-4 shadow-sm sm:p-8",
          className,
        )}
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
      className={cn(
        "flex min-h-[min(440px,calc(100dvh-8rem))] flex-col overflow-hidden rounded-2xl border border-[#e5ebe4] bg-white p-4 shadow-[0_14px_45px_rgba(27,54,40,0.06)] sm:p-6",
        className,
      )}
      noValidate
    >
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#edf0eb] pb-3">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-[#ebf7ef] text-[#2e7950]">
            <Plus size={21} />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-[#183b2c] sm:text-base">
              Register &amp; connect new device
            </h2>
            <p className="mt-0.5 text-[11px] text-[#718074] sm:text-xs">
              Add your hardware to monitor soil moisture.
            </p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-[#f5f7f4] px-2.5 py-1 text-[10px] font-medium text-[#778378] sm:text-xs">
          Step {step + 1} of {stepTitles.length}
        </span>
      </div>

      <ol
        aria-label="Device setup progress"
        className="mt-3 grid shrink-0 grid-cols-3 gap-2"
      >
        {stepTitles.map((title, index) => (
          <li key={title} aria-current={step === index ? "step" : undefined}>
            <span
              className={`block h-1 rounded-full ${
                index <= step ? "bg-[#348253]" : "bg-[#e6ece5]"
              }`}
            />
            <span
              className={`mt-1 block truncate text-[10px] ${
                index === step
                  ? "font-semibold text-[#315d3d]"
                  : "text-[#879188]"
              }`}
            >
              {title}
            </span>
          </li>
        ))}
      </ol>

      <div className="mt-4 flex min-h-0 flex-1 flex-col">
        {step === 0 ? (
          <section aria-labelledby="device-step-heading">
            <h3
              id="device-step-heading"
              className="text-base font-semibold text-[#183b2c]"
            >
              Enter your device ID
            </h3>
            <p className="mt-1 text-xs text-[#718074]">
              We verify it against received sensor telemetry.
            </p>
            <label className="mt-5 block space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#516253]">
                Device ID
              </span>
              <input
                autoFocus
                autoComplete="off"
                value={deviceId}
                onChange={(event) => {
                  setDeviceId(event.target.value);
                  setError(null);
                }}
                placeholder="e.g. SOILMETER_001"
                aria-invalid={Boolean(error)}
                className="h-11 w-full rounded-lg border border-[#dfe7df] bg-white px-3.5 text-sm text-[#203c2a] outline-none transition placeholder:text-[#a1aba1] focus:border-[#57a16c] focus:ring-2 focus:ring-[#57a16c]/15"
              />
            </label>
          </section>
        ) : step === 1 ? (
          <section aria-labelledby="field-step-heading">
            <h3
              id="field-step-heading"
              className="text-base font-semibold text-[#183b2c]"
            >
              Name your field
            </h3>
            <p className="mt-1 text-xs text-[#718074]">
              Choose a name and select the crop you’re monitoring.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#516253]">
                  Field name
                </span>
                <input
                  autoFocus
                  value={fieldName}
                  onChange={(event) => {
                    setFieldName(event.target.value);
                    setError(null);
                  }}
                  placeholder="Greenhouse Alpha"
                  aria-invalid={Boolean(error)}
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
          </section>
        ) : (
          <section
            aria-labelledby="location-heading"
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3
                  id="location-heading"
                  className="text-base font-semibold text-[#183b2c]"
                >
                  Add field location
                </h3>
                <p className="mt-1 text-xs text-[#718074]">
                  Optional · Add GPS coordinates or skip this step.
                </p>
              </div>
              <button
                type="button"
                onClick={detectLocation}
                disabled={isLocating}
                className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-[#bfe1ca] bg-[#f2faf4] px-2.5 text-[11px] font-semibold text-[#27804c] transition hover:bg-[#e9f6ec] disabled:cursor-wait disabled:opacity-60 sm:px-3 sm:text-xs"
              >
                {isLocating ? (
                  <LoaderCircle size={14} className="animate-spin" />
                ) : (
                  <Crosshair size={14} />
                )}
                <span className="hidden min-[380px]:inline">
                  {isLocating ? "Finding…" : "Use my location"}
                </span>
                <span className="min-[380px]:hidden">
                  {isLocating ? "Finding…" : "Detect"}
                </span>
              </button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <label className="flex h-10 min-w-0 items-center gap-2 rounded-lg border border-[#dfe7df] px-2.5 sm:px-3">
                <span className="text-[10px] font-medium text-[#829083]">
                  LAT
                </span>
                <input
                  autoFocus
                  type="number"
                  min="-90"
                  max="90"
                  step="any"
                  value={latitude}
                  onChange={(event) => {
                    setLatitude(event.target.value);
                    setError(null);
                  }}
                  placeholder="Latitude"
                  aria-label="Latitude"
                  aria-invalid={Boolean(error)}
                  className="min-w-0 flex-1 bg-transparent text-xs text-[#203c2a] outline-none placeholder:text-[#a1aba1]"
                />
              </label>
              <label className="flex h-10 min-w-0 items-center gap-2 rounded-lg border border-[#dfe7df] px-2.5 sm:px-3">
                <span className="text-[10px] font-medium text-[#829083]">
                  LNG
                </span>
                <input
                  type="number"
                  min="-180"
                  max="180"
                  step="any"
                  value={longitude}
                  onChange={(event) => {
                    setLongitude(event.target.value);
                    setError(null);
                  }}
                  placeholder="Longitude"
                  aria-label="Longitude"
                  aria-invalid={Boolean(error)}
                  className="min-w-0 flex-1 bg-transparent text-xs text-[#203c2a] outline-none placeholder:text-[#a1aba1]"
                />
              </label>
            </div>

            <div className="relative mt-3 min-h-20 max-h-32 flex-1 overflow-hidden rounded-xl border border-[#dfe7df] bg-[#eef3ec]">
              {googleMapUrl ? (
                <>
                  <iframe
                    title={`Google Map centered on ${latitude}, ${longitude}`}
                    src={googleMapUrl}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="absolute inset-0 size-full border-0"
                  />
                  <span className="pointer-events-none absolute left-2 top-2 rounded bg-white/95 px-2 py-1 text-[9px] font-medium text-[#526457] shadow-sm">
                    Google Maps · {Number(latitude).toFixed(4)}°,{" "}
                    {Number(longitude).toFixed(4)}°
                  </span>
                </>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-1 px-4 text-center">
                  <MapPin size={17} className="text-[#398052]" />
                  <p className="text-xs font-medium text-[#44634b]">
                    Coordinates preview
                  </p>
                  <p className="text-[10px] text-[#7d8c7e]">
                    Enter them or use location detection.
                  </p>
                </div>
              )}
            </div>
            <p className="mt-1 text-[10px] leading-4 text-[#879188]">
              Google Maps receives coordinates only when provided.
            </p>
          </section>
        )}
      </div>

      {error && (
        <p
          role="alert"
          className="mt-2 shrink-0 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800"
        >
          {error}
        </p>
      )}

      <div className="mt-3 flex shrink-0 items-center justify-between gap-3 border-t border-[#edf0eb] pt-3">
        {step === 0 ? (
          onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-[#dfe7df] px-3 text-xs font-medium text-[#637466] transition hover:bg-[#f7faf6] sm:px-4 sm:text-sm"
            >
              I’ll do this later
            </button>
          ) : (
            <Link
              href="/dashboard"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-[#dfe7df] px-3 text-xs font-medium text-[#637466] transition hover:bg-[#f7faf6] sm:px-4 sm:text-sm"
            >
              I’ll do this later
            </Link>
          )
        ) : (
          <button
            type="button"
            onClick={() => {
              setError(null);
              setStep((currentStep) => currentStep - 1);
            }}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-[#dfe7df] px-3 text-xs font-medium text-[#637466] transition hover:bg-[#f7faf6] sm:px-4 sm:text-sm"
          >
            <ArrowLeft size={15} />
            Back
          </button>
        )}

        {step < 2 ? (
          <button
            type="button"
            onClick={continueToNextStep}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#15513d] px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-[#103f30] sm:px-5 sm:text-sm"
          >
            Continue <ArrowRight size={15} />
          </button>
        ) : (
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#15513d] px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-[#103f30] disabled:cursor-wait disabled:opacity-60 sm:px-5 sm:text-sm"
          >
            {isSubmitting ? (
              <>
                <LoaderCircle size={16} className="animate-spin" />
                Verifying…
              </>
            ) : (
              <>
                <Sprout size={16} />
                Connect device
                <ArrowRight size={15} />
              </>
            )}
          </button>
        )}
      </div>
    </form>
  );
}
