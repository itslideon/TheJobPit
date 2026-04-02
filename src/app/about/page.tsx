import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPageShell } from "@/components/marketing-page-shell";

export const metadata: Metadata = {
  title: "About",
  description: "What The Job Pit is and why it exists."
};

export default function AboutPage() {
  return (
    <MarketingPageShell
      eyebrow="The Job Pit"
      title="About"
      subtitle="A focused workspace for job seekers who want one place to organize applications, prep interviews, and track progress — without juggling five different tools."
    >
      <section className="pit-card p-8 shadow-pit md:p-10">
        <div className="pit-marketing-prose space-y-4">
          <p>
            The Job Pit is built for real job-search workflows: logging roles, moving stages,
            and remembering what you said to whom. It doubles as a portfolio-grade full-stack app
            using modern Next.js patterns.
          </p>
          <p>
            Whether you are a student, a new grad, or switching careers, the goal is the same:
            less spreadsheet chaos, more clarity on what is next.
          </p>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <article className="pit-marketing-card">
          <div className="mb-3 h-1 w-10 rounded-full bg-gradient-to-r from-rose-500 to-rose-400/70" />
          <h2 className="text-lg font-semibold text-zinc-100">Who it is for</h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            Students, new grads, and professionals who want a simple system for tracking job
            pipelines, deadlines, and interview prep notes.
          </p>
        </article>
        <article className="pit-marketing-card">
          <div className="mb-3 h-1 w-10 rounded-full bg-gradient-to-r from-teal-500 to-teal-400/70" />
          <h2 className="text-lg font-semibold text-zinc-100">How to start</h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            Create an account, add your first application, and use the dashboard snapshot to see
            how your pipeline evolves over time.
          </p>
        </article>
      </section>

      <p className="mt-10 border-t border-zinc-800/70 pt-8 text-sm text-zinc-500">
        Next:{" "}
        <Link className="pit-link" href="/features">
          Features
        </Link>
        {" · "}
        <Link className="pit-link" href="/faq">
          FAQ
        </Link>
      </p>
    </MarketingPageShell>
  );
}
