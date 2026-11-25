"use client";

import { signOut } from "next-auth/react";
import { useState, type ReactNode } from "react";
import { ChevronDown, Clock3, LogOut } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getTimeZoneOptions,
  useTimeZone,
} from "@/components/dashboard/time-zone-provider";

type DashboardUser = {
  name?: string | null;
  email?: string | null;
};

type DashboardShellProps = {
  children: ReactNode;
  user: DashboardUser;
};

function getInitials(name: string | null | undefined, email: string | null | undefined) {
  const label = name?.trim() || email?.trim() || "SoilMeter";
  const words = label.split(/[\s@._-]+/).filter(Boolean);

  return words
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
}

export function DashboardShell({ children, user }: DashboardShellProps) {
  const displayName = user.name?.trim() || "Account";
  const initials = getInitials(user.name, user.email);
  const [isTimeZoneDialogOpen, setIsTimeZoneDialogOpen] = useState(false);
  const { timeZone, setTimeZone } = useTimeZone();
  const timeZoneOptions = getTimeZoneOptions();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6 lg:px-8">
        <Logo href="/dashboard" compact />

        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className="h-10 gap-2 px-2 sm:px-3"
                aria-label="Open user profile menu"
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {initials}
                </span>
                <span className="hidden max-w-36 truncate text-sm font-medium sm:inline">
                  {displayName}
                </span>
                <ChevronDown aria-hidden="true" className="hidden size-4 sm:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="font-normal">
                <span className="block truncate text-sm font-medium text-foreground">
                  {displayName}
                </span>
                <span className="mt-1 block truncate text-xs text-muted-foreground">
                  {user.email || "Signed-in workspace member"}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => setIsTimeZoneDialogOpen(true)}
                className="cursor-pointer"
              >
                <Clock3 aria-hidden="true" />
                <span>Time zone</span>
                <span className="ml-auto max-w-36 truncate text-xs text-muted-foreground">
                  {timeZone}
                </span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => {
                  void signOut({ redirectTo: "/login" });
                }}
                className="cursor-pointer"
              >
                <LogOut aria-hidden="true" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <Dialog
        open={isTimeZoneDialogOpen}
        onOpenChange={setIsTimeZoneDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select time zone</DialogTitle>
            <DialogDescription>
              Dashboard timestamps use this time zone. Date filters continue to
              use UTC days.
            </DialogDescription>
          </DialogHeader>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Time zone
            <select
              value={timeZone}
              onChange={(event) => setTimeZone(event.target.value)}
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {timeZoneOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </DialogContent>
      </Dialog>

      <main className="mx-auto w-full max-w-[1600px] px-4 py-4 sm:px-6 lg:h-[calc(100dvh-4rem)] lg:min-h-0 lg:overflow-hidden lg:px-8">
        {children}
      </main>
    </div>
  );
}
