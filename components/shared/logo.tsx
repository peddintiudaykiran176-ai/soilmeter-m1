import Link from "next/link";
import { Sprout } from "lucide-react";
import { cn } from "@/lib/utils";

export type LogoProps = {
  href?: string;
  compact?: boolean;
  className?: string;
};

export function Logo({
  href = "/",
  compact = false,
  className,
}: LogoProps) {
  return (
    <Link
      href={href}
      aria-label="SoilMeter M1 home"
      className={cn("inline-flex w-fit items-center gap-3", className)}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <Sprout aria-hidden="true" className="size-5" strokeWidth={2.2} />
      </span>
      <span className="flex flex-col">
        <span className="text-base leading-tight font-semibold tracking-tight text-foreground">
          SoilMeter <span className="text-primary">M1</span>
        </span>
        {!compact && (
          <span className="mt-1 text-[0.65rem] leading-none font-medium tracking-[0.16em] text-muted-foreground uppercase">
            Soil intelligence
          </span>
        )}
      </span>
    </Link>
  );
}
