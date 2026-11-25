"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Menu, Sprout, X } from "lucide-react";

type MarketingHeaderProps = {
  user: { name: string } | null;
};

export function MarketingHeader({ user }: MarketingHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const initial = user?.name.trim().charAt(0).toUpperCase();
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="relative z-20 border-b border-[#e7ece4] bg-[#fafbf7]">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12">
        <Link
          href="/"
          className="flex items-center gap-2.5"
          aria-label="SoilMeter M1 home"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-[#1f513b] text-white">
            <Sprout size={20} strokeWidth={1.8} />
          </span>
          <span className="text-[17px] font-semibold tracking-[-0.04em]">
            soilmeter<span className="text-[#72a17a]">.</span>
          </span>
        </Link>

        <nav
          className="hidden items-center gap-9 md:flex"
          aria-label="Main navigation"
        >
          <a
            className="text-sm text-[#52685a] transition hover:text-[#183b2c]"
            href="#how-it-works"
          >
            How it works
          </a>
          <a
            className="text-sm text-[#52685a] transition hover:text-[#183b2c]"
            href="#features"
          >
            Features
          </a>
          <a
            className="text-sm text-[#52685a] transition hover:text-[#183b2c]"
            href="#demo"
          >
            Live demo
          </a>
        </nav>

        <div className="hidden items-center gap-5 md:flex">
          {user ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2.5 rounded-full border border-[#dfe8de] bg-white py-1.5 pl-1.5 pr-4 text-sm font-medium text-[#315744] transition hover:border-[#c5d8c5] hover:bg-[#f5f8f2]"
              aria-label={`Open dashboard for ${user.name}`}
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-[#1f513b] text-sm font-semibold text-white">
                {initial}
              </span>
              <span className="max-w-36 truncate">{user.name}</span>
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-[#52685a] transition hover:text-[#183b2c]"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="inline-flex h-10 items-center gap-2 rounded-full bg-[#1f513b] px-5 text-sm font-medium text-white transition hover:bg-[#17412f]"
              >
                Get started <ArrowUpRight size={15} />
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-full border border-[#dfe8de] text-[#1f513b] md:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {menuOpen && (
        <nav
          className="absolute inset-x-0 top-full flex flex-col gap-1 border-b border-[#e7ece4] bg-[#fafbf7] px-5 py-4 shadow-lg md:hidden"
          aria-label="Mobile navigation"
        >
          <a
            className="rounded-lg px-3 py-3 text-sm hover:bg-[#eef3ec]"
            href="#how-it-works"
            onClick={closeMenu}
          >
            How it works
          </a>
          <a
            className="rounded-lg px-3 py-3 text-sm hover:bg-[#eef3ec]"
            href="#features"
            onClick={closeMenu}
          >
            Features
          </a>
          <a
            className="rounded-lg px-3 py-3 text-sm hover:bg-[#eef3ec]"
            href="#demo"
            onClick={closeMenu}
          >
            Live demo
          </a>
          {user ? (
            <Link
              className="mt-2 flex items-center gap-3 border-t border-[#e7ece4] px-3 pt-4 text-sm font-medium text-[#315744]"
              href="/dashboard"
              onClick={closeMenu}
            >
              <span className="flex size-9 items-center justify-center rounded-full bg-[#1f513b] font-semibold text-white">
                {initial}
              </span>
              {user.name}
            </Link>
          ) : (
            <div className="mt-2 flex gap-3 border-t border-[#e7ece4] pt-4">
              <Link
                className="flex-1 rounded-full border border-[#dfe8de] py-3 text-center text-sm font-medium"
                href="/login"
                onClick={closeMenu}
              >
                Log in
              </Link>
              <Link
                className="flex-1 rounded-full bg-[#1f513b] py-3 text-center text-sm font-medium text-white"
                href="/register"
                onClick={closeMenu}
              >
                Get started
              </Link>
            </div>
          )}
        </nav>
      )}
    </header>
  );
}
