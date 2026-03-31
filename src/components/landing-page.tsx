import Link from "next/link";
import { PipelineChart } from "@/components/pipeline-chart";

export type LandingPreview = {
  totalApplications: number;
  activePipeline: number;
  followUpsDue: number;
  chartData: { name: string; value: number; color: string }[];
};

type LandingPageProps = {
  preview?: LandingPreview;
};

export function LandingPage({ preview }: LandingPageProps) {
  const loggedIn = !!preview;

  return (
    <main className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-5xl flex-col justify-center gap-12 px-6 py-16">
      <div className="rounded-2xl border border-red-950/80 bg-black/60 p-8 shadow-[0_0_60px_rgba(220,38,38,0.08)] sm:p-12">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-500/90">
          Job search workspace
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-red-50 sm:text-5xl">
          The Job Pit
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-red-200/85">
          Log applications, track every stage, prep interviews, and keep company intel in one
          place — built for your real search, not just a demo.
        </p>
        {loggedIn ? (
          <p className="mt-3 text-sm text-red-400/90">
            You&apos;re signed in — your snapshot is below, or jump straight into the app.
          </p>
        ) : null}
        <ul className="mt-8 space-y-3 text-sm text-red-200/75">
          <li className="flex gap-2">
            <span className="text-red-500">▸</span>
            Pipeline dashboard with status analytics
          </li>
          <li className="flex gap-2">
            <span className="text-red-500">▸</span>
            Resume &amp; cover versions, interview prep, company contacts
          </li>
          <li className="flex gap-2">
            <span className="text-red-500">▸</span>
            Black &amp; red UI tuned for long sessions
          </li>
        </ul>
        <div className="mt-10 flex flex-wrap gap-3">
          {loggedIn ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-red-950/40 transition hover:bg-red-500"
              >
                Open dashboard
              </Link>
              <Link
                href="/applications"
                className="rounded-lg border border-red-800 px-6 py-3 text-sm font-semibold text-red-100 transition hover:bg-red-950/50"
              >
                Manage applications
              </Link>
              <Link
                href="/lab"
                className="rounded-lg border border-red-800 px-6 py-3 text-sm font-semibold text-red-100 transition hover:bg-red-950/50"
              >
                Resume &amp; cover lab
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/signup"
                className="rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-red-950/40 transition hover:bg-red-500"
              >
                Create account
              </Link>
              <Link
                href="/login"
                className="rounded-lg border border-red-800 px-6 py-3 text-sm font-semibold text-red-100 transition hover:bg-red-950/50"
              >
                Log in
              </Link>
            </>
          )}
        </div>
        {!loggedIn ? (
          <p className="mt-8 text-xs text-red-400/60">
            Free for personal use. By continuing you agree to our{" "}
            <Link className="underline hover:text-red-300" href="/terms">
              Terms
            </Link>{" "}
            and{" "}
            <Link className="underline hover:text-red-300" href="/privacy">
              Privacy Policy
            </Link>
            .
          </p>
        ) : null}
      </div>

      {loggedIn && preview ? (
        <section className="flex flex-col gap-6" aria-label="Your pipeline preview">
          <h2 className="text-lg font-semibold text-red-100">Your snapshot</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <article className="rounded-xl border border-red-950 bg-black/70 p-5">
              <h3 className="text-sm font-medium text-red-300/70">Total applications</h3>
              <p className="mt-2 text-3xl font-semibold text-red-100">
                {preview.totalApplications}
              </p>
            </article>
            <article className="rounded-xl border border-red-950 bg-black/70 p-5">
              <h3 className="text-sm font-medium text-red-300/70">Active pipeline</h3>
              <p className="mt-2 text-3xl font-semibold text-red-100">
                {preview.activePipeline}
              </p>
            </article>
            <article className="rounded-xl border border-red-950 bg-black/70 p-5">
              <h3 className="text-sm font-medium text-red-300/70">Follow ups due</h3>
              <p className="mt-2 text-3xl font-semibold text-red-100">
                {preview.followUpsDue}
              </p>
            </article>
          </div>
          <PipelineChart data={preview.chartData} />
        </section>
      ) : null}
    </main>
  );
}
