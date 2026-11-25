import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type LoadingProps = {
  label?: string;
  fullPage?: boolean;
  className?: string;
};

export function Loading({
  label = "Loading...",
  fullPage = false,
  className,
}: LoadingProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "inline-flex items-center gap-3 text-sm text-muted-foreground",
        fullPage && "flex min-h-[50vh] w-full justify-center",
        className,
      )}
    >
      <LoaderCircle
        aria-hidden="true"
        className="size-5 animate-spin text-primary motion-reduce:animate-none"
      />
      <span>{label}</span>
    </div>
  );
}
