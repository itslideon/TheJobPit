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

export function SiteHeader() {
  const pathname = usePathname();
  const { status } = useSession();

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-50 border-b border-red-950/80 bg-black/90 shadow-[0_4px_24px_rgba(0,0,0,0.45)] backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="shrink-0 text-lg font-bold tracking-tight text-red-100 transition hover:text-red-50"
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
                    className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                      isActive(item.href)
                        ? "bg-red-950/70 text-red-50 ring-1 ring-red-800/80"
                        : "text-red-200/90 hover:bg-red-950/40 hover:text-red-50"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <button
                type="button"
                onClick={() => void signOut({ callbackUrl: "/" })}
                className="rounded-md border border-red-800 px-3 py-2 text-sm font-medium text-red-300/90 hover:bg-red-950/40 hover:text-red-50"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md px-3 py-2 text-sm font-medium text-red-200/90 hover:bg-red-950/40 hover:text-red-50"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-red-700 px-3 py-2 text-sm font-medium text-white hover:bg-red-600"
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
