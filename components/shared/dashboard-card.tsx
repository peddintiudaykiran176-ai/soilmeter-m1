import type { ReactNode } from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type DashboardCardProps = {
  title: string;
  description?: string;
  value?: ReactNode;
  trend?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
};

export function DashboardCard({
  title,
  description,
  value,
  trend,
  icon,
  action,
  children,
  className,
}: DashboardCardProps) {
  return (
    <Card className={cn("h-full border-border shadow-sm", className)}>
      <CardHeader className="gap-1">
        <div className="min-w-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {(action || icon) && (
          <CardAction>
            {action ?? (
              <span
                aria-hidden="true"
                className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary"
              >
                {icon}
              </span>
            )}
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {value !== undefined && (
          <p className="text-3xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
        )}
        {trend && (
          <div className="text-sm text-muted-foreground">{trend}</div>
        )}
        {children}
      </CardContent>
    </Card>
  );
}
