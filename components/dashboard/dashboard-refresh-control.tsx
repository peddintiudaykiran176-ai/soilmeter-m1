"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { formatDateTime } from "@/lib/dashboard/format";
import { Button } from "@/components/ui/button";
import { useTimeZone } from "@/components/dashboard/time-zone-provider";

export function DashboardRefreshControl({
  lastUpdatedUtc,
}: {
  lastUpdatedUtc: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { timeZone } = useTimeZone();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <p
        aria-live="polite"
        className="text-xs text-muted-foreground sm:text-sm"
      >
        Updated {formatDateTime(lastUpdatedUtc, timeZone)}
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isPending}
        onClick={() => startTransition(() => router.refresh())}
      >
        <RefreshCw
          aria-hidden="true"
          className={isPending ? "size-4 animate-spin" : "size-4"}
        />
        {isPending ? "Refreshing" : "Refresh"}
      </Button>
    </div>
  );
}
