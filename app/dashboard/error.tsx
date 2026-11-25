"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("DASHBOARD TELEMETRY ERROR:", error);
  }, [error]);

  return (
    <section
      role="alert"
      className="mx-auto flex min-h-72 max-w-xl flex-col items-center justify-center rounded-xl border border-border bg-card px-6 py-10 text-center shadow-sm"
    >
      <span className="flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <TriangleAlert aria-hidden="true" className="size-5" />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-foreground">
        Telemetry could not be loaded
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        The dashboard could not retrieve the latest database records. Please try again.
      </p>
      <Button type="button" className="mt-5" onClick={reset}>
        Retry
      </Button>
    </section>
  );
}
