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
    a: "You can browse public pages (Community, About, Features, FAQ) without signing in. The dashboard, applications, and workspace tools require a free account."
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

      <p className="mt-10 border-t border-zinc-800/70 pt-8 text-sm text-zinc-500">
        More:{" "}
        <Link className="pit-link" href="/about">
          About
        </Link>
        {" · "}
        <Link className="pit-link" href="/features">
          Features
        </Link>
      </p>
    </MarketingPageShell>
  );
}
