import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { auth } from "@/auth";
import { userIsAdmin } from "@/lib/admin";

const nav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/community", label: "Community" }
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/admin");

  const isAdmin = await userIsAdmin(session.user.id);
  if (!isAdmin) redirect("/dashboard");

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <header className="pit-card p-6 shadow-pit">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-300/85">
          Operations
        </p>
        <h1 className="mt-2 text-3xl font-bold text-zinc-50">Admin console</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Inspect users, review public community posts, and monitor basic platform stats.
        </p>
        <nav className="mt-5 flex flex-wrap gap-2">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg border border-zinc-700/80 bg-zinc-900/50 px-3 py-1.5 text-sm text-zinc-300 transition hover:border-teal-500/40 hover:text-zinc-100"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/dashboard"
            className="rounded-lg border border-dashed border-zinc-700 px-3 py-1.5 text-sm text-zinc-500 transition hover:text-zinc-300"
          >
            Back to dashboard
          </Link>
        </nav>
      </header>
      <div className="mt-8">{children}</div>
    </main>
  );
}
