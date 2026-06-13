"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { UserMenu } from "@/components/user-menu";
import { SiteLogo } from "@/components/site-logo";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/applications", label: "Applications" },
  { href: "/lab", label: "Resume Lab" },
  { href: "/interview", label: "Interview" },
  { href: "/companies", label: "Companies" },
  { href: "/community", label: "Community" }
] as const;

const publicNavItems = [
  { href: "/", label: "Home" },
  { href: "/community", label: "Community" },
  { href: "/about", label: "About" },
  { href: "/features", label: "Features" },
  { href: "/faq", label: "FAQ" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" }
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const { status } = useSession();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    if (href === "/community") return pathname === "/community" || pathname.startsWith("/community/");
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/85 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-6">
        <Link href="/" className="shrink-0 transition hover:opacity-95">
          <SiteLogo />
        </Link>
        {status === "authenticated" ? (
          <div className="flex min-w-0 flex-1 items-center justify-end pl-2">
            <nav
              aria-label="Main"
              className="flex max-w-full flex-wrap items-center justify-end gap-x-1.5 gap-y-2 sm:gap-x-2"
            >
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-2.5 py-2 text-sm font-medium transition sm:px-3 ${
                    isActive(item.href)
                      ? "bg-rose-500/15 text-rose-50 ring-1 ring-rose-400/25"
                      : "text-zinc-400 hover:bg-zinc-800/70 hover:text-zinc-100"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="ml-3 flex shrink-0 items-center border-l border-zinc-800/80 pl-3 sm:ml-5 sm:pl-4 sm:pr-0.5">
              <UserMenu />
            </div>
          </div>
        ) : (
          <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-x-1.5 gap-y-2 sm:gap-x-2">
            <nav aria-label="Public" className="flex flex-wrap items-center justify-end gap-x-1.5 sm:gap-x-2">
              {publicNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-2.5 py-2 text-sm font-medium transition sm:px-3 ${
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
              className="rounded-lg px-2.5 py-2 text-sm font-medium text-zinc-400 transition hover:bg-zinc-800/70 hover:text-zinc-100 sm:px-3"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-gradient-to-r from-rose-600 to-rose-500 px-2.5 py-2 text-sm font-semibold text-white shadow-md shadow-rose-950/40 transition hover:from-rose-500 hover:to-rose-400 sm:px-3"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
