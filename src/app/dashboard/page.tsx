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
      <section className="rounded-xl border border-red-950 bg-black/70 p-6 shadow-[0_0_40px_rgba(220,38,38,0.12)]">
        <h1 className="text-3xl font-bold tracking-tight text-red-100">Dashboard</h1>
        <p className="mt-3 max-w-3xl text-red-200/80">
          Track every application, monitor interview progress, and stay on top of deadlines
          with a single view.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            className="rounded-md bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
            href="/applications"
          >
            Manage Applications
          </Link>
          <Link
            className="rounded-md border border-red-800 px-4 py-2 text-sm font-medium text-red-200 hover:bg-red-950/50"
            href="/lab"
          >
            Resume &amp; cover lab
          </Link>
          <Link
            className="rounded-md border border-red-800 px-4 py-2 text-sm font-medium text-red-200 hover:bg-red-950/50"
            href="/interview"
          >
            Interview prep
          </Link>
          <Link
            className="rounded-md border border-red-800 px-4 py-2 text-sm font-medium text-red-200 hover:bg-red-950/50"
            href="/companies"
          >
            Company intel
          </Link>
          <Link
            className="rounded-md border border-red-800 px-4 py-2 text-sm font-medium text-red-200 hover:bg-red-950/50"
            href="/api/applications"
          >
            View API JSON
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-xl border border-red-950 bg-black/70 p-5">
          <h2 className="text-sm font-medium text-red-300/70">Total applications</h2>
          <p className="mt-2 text-3xl font-semibold text-red-100">{metrics.totalApplications}</p>
        </article>
        <article className="rounded-xl border border-red-950 bg-black/70 p-5">
          <h2 className="text-sm font-medium text-red-300/70">Active pipeline</h2>
          <p className="mt-2 text-3xl font-semibold text-red-100">{metrics.activePipeline}</p>
        </article>
        <article className="rounded-xl border border-red-950 bg-black/70 p-5">
          <h2 className="text-sm font-medium text-red-300/70">Follow ups due</h2>
          <p className="mt-2 text-3xl font-semibold text-red-100">{metrics.followUpsDue}</p>
        </article>
      </section>

      <PipelineChart data={chartData} />
    </main>
  );
}
