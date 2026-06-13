"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

function UserIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function UserMenu() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const onProfile = pathname === "/profile" || pathname.startsWith("/profile/");
  const onCommunity = pathname === "/community" || pathname.startsWith("/community/");
  const onAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
  const isAdmin = session?.user?.role === "ADMIN";

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", onDocClick);
      document.addEventListener("keydown", onKey);
    }
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const label = session?.user?.name?.trim() || session?.user?.email || "Account";

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
        onClick={() => setOpen((v) => !v)}
        className={`flex h-9 w-9 items-center justify-center rounded-lg border transition sm:h-10 sm:w-10 ${
          open || onProfile
            ? "border-teal-500/50 bg-teal-950/35 text-teal-200"
            : "border-zinc-600/80 bg-zinc-900/50 text-zinc-300 hover:border-zinc-500 hover:bg-zinc-800/80 hover:text-zinc-100"
        }`}
      >
        <UserIcon className="h-5 w-5" />
      </button>

      {open ? (
        <div
          className="absolute right-0 z-[60] mt-2 min-w-[13rem] overflow-hidden rounded-xl border border-zinc-700/90 bg-zinc-950/98 py-1 shadow-[0_16px_48px_rgba(0,0,0,0.55)] backdrop-blur-md"
          role="menu"
          aria-label="Account"
        >
          <div className="border-b border-zinc-800/90 px-3 py-2.5">
            <p className="truncate text-xs font-medium text-zinc-100">{label}</p>
            {session?.user?.email && session?.user?.name ? (
              <p className="truncate text-[11px] text-zinc-500">{session.user.email}</p>
            ) : null}
          </div>
          <Link
            role="menuitem"
            href="/profile"
            onClick={() => setOpen(false)}
            className={`block px-3 py-2.5 text-sm transition ${
              onProfile ? "bg-rose-500/10 text-rose-100" : "text-zinc-300 hover:bg-zinc-800/80"
            }`}
          >
            Profile
          </Link>
          <Link
            role="menuitem"
            href="/community"
            onClick={() => setOpen(false)}
            className={`block px-3 py-2.5 text-sm transition ${
              onCommunity ? "bg-teal-500/10 text-teal-100" : "text-zinc-300 hover:bg-zinc-800/80"
            }`}
          >
            Community
          </Link>
          {isAdmin ? (
            <Link
              role="menuitem"
              href="/admin"
              onClick={() => setOpen(false)}
              className={`block px-3 py-2.5 text-sm transition ${
                onAdmin ? "bg-rose-500/10 text-rose-100" : "text-zinc-300 hover:bg-zinc-800/80"
              }`}
            >
              Admin
            </Link>
          ) : null}
          <div className="my-1 border-t border-zinc-800/90" />
          <button
            type="button"
            role="menuitem"
            className="w-full px-3 py-2.5 text-left text-sm text-zinc-400 transition hover:bg-zinc-800/80 hover:text-zinc-200"
            onClick={() => {
              setOpen(false);
              void signOut({ callbackUrl: "/" });
            }}
          >
            Log out
          </button>
        </div>
      ) : null}
    </div>
  );
}
