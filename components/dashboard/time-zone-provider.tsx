"use client";

import {
  createContext,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";

const TIME_ZONE_STORAGE_KEY = "soilmeter-time-zone";
const TIME_ZONE_CHANGE_EVENT = "soilmeter-time-zone-change";
let inMemoryTimeZone = "UTC";
const fallbackTimeZones = [
  "Africa/Cairo",
  "Africa/Johannesburg",
  "America/Anchorage",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Mexico_City",
  "America/New_York",
  "America/Sao_Paulo",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Shanghai",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Brisbane",
  "Australia/Sydney",
  "Europe/Berlin",
  "Europe/London",
  "Europe/Paris",
  "Pacific/Auckland",
];

type TimeZoneContextValue = {
  timeZone: string;
  setTimeZone: (timeZone: string) => void;
};

const TimeZoneContext = createContext<TimeZoneContextValue | null>(null);

export function getTimeZoneOptions(): string[] {
  const zones =
    typeof Intl.supportedValuesOf === "function"
      ? Intl.supportedValuesOf("timeZone")
      : fallbackTimeZones;

  return ["UTC", ...zones.filter((zone) => zone !== "UTC")];
}

function isValidTimeZone(value: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value });
    return true;
  } catch (error) {
    if (error instanceof RangeError) {
      return false;
    }

    throw error;
  }
}

function subscribeToTimeZone(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(TIME_ZONE_CHANGE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(TIME_ZONE_CHANGE_EVENT, callback);
  };
}

function getTimeZoneSnapshot(): string {
  try {
    const savedTimeZone = window.localStorage.getItem(TIME_ZONE_STORAGE_KEY);
    if (savedTimeZone && isValidTimeZone(savedTimeZone)) {
      inMemoryTimeZone = savedTimeZone;
      return savedTimeZone;
    }
  } catch (error) {
    console.error("TIME ZONE PREFERENCE ERROR:", error);
  }

  return inMemoryTimeZone;
}

function getServerTimeZoneSnapshot() {
  return "UTC";
}

export function TimeZoneProvider({ children }: { children: ReactNode }) {
  const timeZone = useSyncExternalStore(
    subscribeToTimeZone,
    getTimeZoneSnapshot,
    getServerTimeZoneSnapshot,
  );

  function setTimeZone(nextTimeZone: string) {
    if (!isValidTimeZone(nextTimeZone)) {
      throw new RangeError(`Invalid time zone: ${nextTimeZone}`);
    }

    inMemoryTimeZone = nextTimeZone;
    try {
      window.localStorage.setItem(TIME_ZONE_STORAGE_KEY, nextTimeZone);
    } catch (error) {
      console.error("TIME ZONE PREFERENCE ERROR:", error);
    }
    window.dispatchEvent(new Event(TIME_ZONE_CHANGE_EVENT));
  }

  return (
    <TimeZoneContext.Provider value={{ timeZone, setTimeZone }}>
      {children}
    </TimeZoneContext.Provider>
  );
}

export function useTimeZone(): TimeZoneContextValue {
  const context = useContext(TimeZoneContext);
  if (!context) {
    throw new Error("useTimeZone must be used within a TimeZoneProvider.");
  }

  return context;
}
