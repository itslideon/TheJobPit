import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { PipelineChart } from "@/components/pipeline-chart";
import { redirect } from "next/navigation";
import { buildPipelineChartData, computePipelineMetrics } from "@/lib/pipeline-insights";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const applications = await prisma.application.findMany({
    where: { userId: session.user.id },
    orderBy: [{ updatedAt: "desc" }]
  });

  const chartData = buildPipelineChartData(applications);
  const metrics = computePipelineMetrics(applications);

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-10">
      <section className="pit-card p-6 shadow-pit">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-50">Dashboard</h1>
        <p className="mt-3 max-w-3xl text-zinc-400">
          Track every application, monitor interview progress, and stay on top of deadlines
          with a single view.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link className="pit-btn-primary" href="/applications">
            Manage Applications
          </Link>
          <Link className="pit-btn-secondary" href="/lab">
            Resume &amp; cover lab
          </Link>
          <Link className="pit-btn-secondary" href="/interview">
            Interview prep
          </Link>
          <Link className="pit-btn-secondary" href="/companies">
            Company intel
          </Link>
          <Link
            className="rounded-lg border border-dashed border-zinc-600 px-4 py-2 text-sm font-medium text-zinc-500 transition hover:border-teal-500/40 hover:text-zinc-300"
            href="/api/applications"
          >
            View API JSON
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="pit-card-sm border-l-2 border-l-rose-500/50 p-5">
          <h2 className="text-sm font-medium text-zinc-500">Total applications</h2>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-zinc-100">
            {metrics.totalApplications}
          </p>
        </article>
        <article className="pit-card-sm border-l-2 border-l-teal-500/50 p-5">
          <h2 className="text-sm font-medium text-zinc-500">Active pipeline</h2>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-zinc-100">
            {metrics.activePipeline}
          </p>
        </article>
        <article className="pit-card-sm border-l-2 border-l-amber-500/45 p-5">
          <h2 className="text-sm font-medium text-zinc-500">Follow ups due</h2>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-zinc-100">
            {metrics.followUpsDue}
          </p>
        </article>
      </section>

      <PipelineChart data={chartData} />
    </main>
  );
}
