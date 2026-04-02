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
      <div className="pit-card p-8 shadow-pit sm:p-12">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-500/90">
          Job search workspace
        </p>
        <h1 className="mt-4 bg-gradient-to-br from-zinc-50 via-rose-50 to-teal-100/80 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl">
          The Job Pit
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-zinc-400">
          Log applications, track every stage, prep interviews, and keep company intel in one
          place — built for your real search, not just a demo.
        </p>
        {loggedIn ? (
          <p className="mt-3 text-sm text-teal-400/90">
            You&apos;re signed in — your snapshot is below, or jump straight into the app.
          </p>
        ) : null}
        <ul className="mt-8 space-y-3 text-sm text-zinc-400">
          <li className="flex gap-2">
            <span className="text-rose-400" aria-hidden>
              ▸
            </span>
            Pipeline dashboard with status analytics
          </li>
          <li className="flex gap-2">
            <span className="text-teal-400" aria-hidden>
              ▸
            </span>
            Resume &amp; cover versions, interview prep, company contacts
          </li>
          <li className="flex gap-2">
            <span className="text-amber-400/90" aria-hidden>
              ▸
            </span>
            Dark UI with rose &amp; teal accents — easy on the eyes for long sessions
          </li>
        </ul>
        <div className="mt-10 flex flex-wrap gap-3">
          {loggedIn ? (
            <>
              <Link href="/dashboard" className="pit-btn-primary px-6 py-3">
                Open dashboard
              </Link>
              <Link href="/applications" className="pit-btn-secondary px-6 py-3">
                Manage applications
              </Link>
              <Link href="/lab" className="pit-btn-secondary px-6 py-3">
                Resume &amp; cover lab
              </Link>
            </>
          ) : (
            <>
              <Link href="/signup" className="pit-btn-primary px-6 py-3">
                Create account
              </Link>
              <Link href="/login" className="pit-btn-secondary px-6 py-3">
                Log in
              </Link>
            </>
          )}
        </div>
        {!loggedIn ? (
          <p className="mt-8 text-xs text-zinc-600">
            Free for personal use. By continuing you agree to our{" "}
            <Link className="pit-link" href="/terms">
              Terms
            </Link>{" "}
            and{" "}
            <Link className="pit-link" href="/privacy">
              Privacy Policy
            </Link>
            .
          </p>
        ) : null}
      </div>

      {loggedIn && preview ? (
        <section className="flex flex-col gap-6" aria-label="Your pipeline preview">
          <h2 className="text-lg font-semibold text-zinc-200">Your snapshot</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <article className="pit-card-sm border-l-2 border-l-rose-500/50 p-5">
              <h3 className="text-sm font-medium text-zinc-500">Total applications</h3>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-zinc-100">
                {preview.totalApplications}
              </p>
            </article>
            <article className="pit-card-sm border-l-2 border-l-teal-500/50 p-5">
              <h3 className="text-sm font-medium text-zinc-500">Active pipeline</h3>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-zinc-100">
                {preview.activePipeline}
              </p>
            </article>
            <article className="pit-card-sm border-l-2 border-l-amber-500/45 p-5">
              <h3 className="text-sm font-medium text-zinc-500">Follow ups due</h3>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-zinc-100">
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
