"use client";

import { useId, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export type NavigationItem = {
  label: string;
  href: string;
  icon?: LucideIcon;
};

export type ResponsiveNavProps = {
  items: NavigationItem[];
  actions?: ReactNode;
  className?: string;
};

export function ResponsiveNav({
  items,
  actions,
  className,
}: ResponsiveNavProps) {
  const pathname = usePathname();
  const mobileMenuId = useId();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  const linkClassName = (active: boolean) =>
    cn(
      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      active
        ? "bg-primary/10 text-primary"
        : "text-muted-foreground hover:bg-muted hover:text-foreground",
    );

  const renderLinks = (onNavigate?: () => void) =>
    items.map((item) => {
      const active = isActive(item.href);
      const Icon = item.icon;

      return (
        <Link
          key={item.href}
          href={item.href}
          aria-current={active ? "page" : undefined}
          className={linkClassName(active)}
          onClick={onNavigate}
        >
          {Icon && <Icon aria-hidden="true" className="size-4" />}
          {item.label}
        </Link>
      );
    });

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b border-border bg-card shadow-sm",
        className,
      )}
    >
      <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-1 md:flex"
        >
          {renderLinks()}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {actions}
          <ThemeToggle />
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isOpen}
          aria-controls={mobileMenuId}
          onClick={() => setIsOpen((open) => !open)}
        >
          {isOpen ? (
            <X aria-hidden="true" />
          ) : (
            <Menu aria-hidden="true" />
          )}
        </Button>
      </div>

      {isOpen && (
        <div
          id={mobileMenuId}
          className="border-t border-border bg-card px-4 py-3 md:hidden sm:px-6"
        >
          <nav
            aria-label="Mobile navigation"
            className="flex flex-col gap-1"
          >
            {renderLinks(() => setIsOpen(false))}
          </nav>
          <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
            {actions}
            <span className="text-sm text-muted-foreground">Appearance</span>
            <ThemeToggle />
          </div>
        </div>
      )}
    </header>
  );
}
