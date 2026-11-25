import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type AuthInputProps = Omit<ComponentProps<"input">, "id"> & {
  id: string;
  label: string;
  leadingIcon: ReactNode;
  error?: string;
  trailingAction?: ReactNode;
};

export function AuthInput({
  id,
  label,
  leadingIcon,
  error,
  trailingAction,
  className,
  type = "text",
  ...inputProps
}: AuthInputProps) {
  const errorId = `${id}-error`;

  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="text-sm font-medium text-foreground"
      >
        {label}
      </label>
      <div className="relative">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground"
        >
          {leadingIcon}
        </span>
        <input
          {...inputProps}
          id={id}
          type={type}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "h-11 w-full rounded-lg border bg-background pl-10 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground/80 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15",
            trailingAction ? "pr-12" : "pr-3",
            error
              ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/15"
              : "border-input",
            className,
          )}
        />
        {trailingAction && (
          <div className="absolute inset-y-0 right-1 flex items-center">
            {trailingAction}
          </div>
        )}
      </div>
      {error && (
        <p id={errorId} className="text-xs font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
