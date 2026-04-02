import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPageShell } from "@/components/marketing-page-shell";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about The Job Pit."
};

const faqs = [
  {
    q: "Do I need an account to use the tracker?",
    a: "You can browse public pages (About, Features, FAQ) without signing in. The dashboard, applications, and workspace tools require a free account."
  },
  {
    q: "Can I track multiple applications at once?",
    a: "Yes. The app is built for active pipelines and shows summary metrics and charts so you can see status mix at a glance."
  },
  {
    q: "Where are my files stored?",
    a: "In local development, uploads live under public/uploads/documents. In production, point uploads at object storage for serverless-friendly hosting."
  },
  {
    q: "Is this mobile friendly?",
    a: "Core layouts are responsive, with stacked navigation and readable forms on smaller screens."
  }
];

export default function FaqPage() {
  return (
    <MarketingPageShell
      eyebrow="Help"
      title="FAQ"
      subtitle="Quick answers for visitors exploring the product before creating an account."
    >
      <section className="space-y-3">
        {faqs.map((item, i) => (
          <article key={item.q} className="pit-marketing-card">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Question {i + 1}
            </p>
            <h2 className="mt-2 text-lg font-semibold text-zinc-100">{item.q}</h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">{item.a}</p>
          </article>
        ))}
      </section>

      <div className="mt-10 flex flex-col gap-4 border-t border-zinc-800/70 pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-zinc-500">
          Still need something? Check{" "}
          <Link href="/privacy" className="pit-link">
            Privacy
          </Link>{" "}
          and{" "}
          <Link href="/terms" className="pit-link">
            Terms
          </Link>
          .
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/signup" className="pit-btn-primary px-5">
            Create account
          </Link>
          <Link href="/login" className="pit-btn-secondary px-5">
            Log in
          </Link>
        </div>
      </div>
    </MarketingPageShell>
  );
}
