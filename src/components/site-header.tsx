"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/applications", label: "Applications" },
  { href: "/lab", label: "Resume Lab" },
  { href: "/interview", label: "Interview" },
  { href: "/companies", label: "Companies" }
] as const;

const publicNavItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/features", label: "Features" },
  { href: "/faq", label: "FAQ" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" }
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const { status } = useSession();

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/85 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="pit-logo-shimmer shrink-0 text-lg font-bold tracking-tight transition hover:opacity-95"
        >
          The Job Pit
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-1 sm:gap-2">
          {status === "authenticated" ? (
            <>
              <nav aria-label="Main" className="flex flex-wrap items-center gap-1 sm:gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                      isActive(item.href)
                        ? "bg-rose-500/15 text-rose-50 ring-1 ring-rose-400/25"
                        : "text-zinc-400 hover:bg-zinc-800/70 hover:text-zinc-100"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <button
                type="button"
                onClick={() => void signOut({ callbackUrl: "/" })}
                className="rounded-lg border border-zinc-600 px-3 py-2 text-sm font-medium text-zinc-400 transition hover:border-zinc-500 hover:bg-zinc-800/60 hover:text-zinc-200"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <nav aria-label="Public" className="flex flex-wrap items-center gap-1 sm:gap-2">
                {publicNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                      isActive(item.href)
                        ? "bg-teal-500/15 text-teal-100 ring-1 ring-teal-400/25"
                        : "text-zinc-400 hover:bg-zinc-800/70 hover:text-zinc-100"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 transition hover:bg-zinc-800/70 hover:text-zinc-100"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-gradient-to-r from-rose-600 to-rose-500 px-3 py-2 text-sm font-semibold text-white shadow-md shadow-rose-950/40 transition hover:from-rose-500 hover:to-rose-400"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
