import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PipelineChart } from "@/components/pipeline-chart";

const statusConfig = {
  WISHLIST: { label: "Wishlist", color: "#818cf8" },
  APPLIED: { label: "Applied", color: "#38bdf8" },
  INTERVIEW: { label: "Interview", color: "#fbbf24" },
  OFFER: { label: "Offer", color: "#22c55e" },
  REJECTED: { label: "Rejected", color: "#ef4444" },
  WITHDRAWN: { label: "Withdrawn", color: "#94a3b8" }
} as const;

export default async function HomePage() {
  const applications = await prisma.application.findMany({
    orderBy: [{ updatedAt: "desc" }]
  });

  const chartData = Object.entries(statusConfig).map(([status, meta]) => ({
    name: meta.label,
    value: applications.filter((application) => application.status === status).length,
    color: meta.color
  }));

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-10">
      <section className="rounded-xl border border-slate-800 bg-slate-950/70 p-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-100">The Job Pit</h1>
        <p className="mt-3 max-w-3xl text-slate-300">
          Track every application, monitor interview progress, and stay on top of deadlines
          with a single dashboard.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            className="rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-400"
            href="/api/applications"
          >
            View API JSON
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-xl border border-slate-800 bg-slate-950/70 p-5">
          <h2 className="text-sm font-medium text-slate-400">Total applications</h2>
          <p className="mt-2 text-3xl font-semibold text-slate-100">{applications.length}</p>
        </article>
        <article className="rounded-xl border border-slate-800 bg-slate-950/70 p-5">
          <h2 className="text-sm font-medium text-slate-400">Active pipeline</h2>
          <p className="mt-2 text-3xl font-semibold text-slate-100">
            {
              applications.filter((application) =>
                ["WISHLIST", "APPLIED", "INTERVIEW", "OFFER"].includes(application.status)
              ).length
            }
          </p>
        </article>
        <article className="rounded-xl border border-slate-800 bg-slate-950/70 p-5">
          <h2 className="text-sm font-medium text-slate-400">Follow ups due</h2>
          <p className="mt-2 text-3xl font-semibold text-slate-100">
            {
              applications.filter(
                (application) =>
                  application.followUpAt && application.followUpAt.getTime() < Date.now()
              ).length
            }
          </p>
        </article>
      </section>

      <PipelineChart data={chartData} />
    </main>
  );
}
