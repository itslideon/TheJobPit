import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPageShell } from "@/components/marketing-page-shell";

export const metadata: Metadata = {
  title: "Features",
  description: "Explore what you can do in The Job Pit."
};

const features = [
  {
    title: "Application Tracker",
    description: "Capture role details, status, source links, notes, and important dates.",
    accent: "rose" as const
  },
  {
    title: "Dashboard Insights",
    description: "View totals, active pipeline, follow-ups due, and status mix at a glance.",
    accent: "teal" as const
  },
  {
    title: "Resume + Cover Lab",
    description: "Manage versions per application and keep tailored docs organized.",
    accent: "amber" as const
  },
  {
    title: "Interview Prep Hub",
    description: "Store STAR stories, question banks, and mock interview notes in one place.",
    accent: "rose" as const
  },
  {
    title: "Company Intel",
    description: "Track company context, contacts, referrals, and compensation notes.",
    accent: "teal" as const
  },
  {
    title: "Private by user",
    description: "Your data is scoped to your account with authenticated API access.",
    accent: "amber" as const
  }
];

const accentBar: Record<(typeof features)[number]["accent"], string> = {
  rose: "from-rose-500 to-rose-400/60",
  teal: "from-teal-500 to-teal-400/60",
  amber: "from-amber-500 to-amber-400/60"
};

export default function FeaturesPage() {
  return (
    <MarketingPageShell
      eyebrow="Product"
      title="Features"
      subtitle="Everything you need for discovery → interviews → offer, in one dark, calm workspace with rose and teal accents."
      maxWidthClass="max-w-5xl"
    >
      <section className="grid gap-4 sm:grid-cols-2">
        {features.map((feature) => (
          <article key={feature.title} className="pit-marketing-card">
            <div
              className={`mb-3 h-1 w-12 rounded-full bg-gradient-to-r ${accentBar[feature.accent]}`}
            />
            <h2 className="text-lg font-semibold text-zinc-100">{feature.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">{feature.description}</p>
          </article>
        ))}
      </section>

      <p className="mt-10 border-t border-zinc-800/70 pt-8 text-sm text-zinc-500">
        More:{" "}
        <Link href="/faq" className="pit-link">
          FAQ
        </Link>
        {" · "}
        <Link href="/about" className="pit-link">
          About
        </Link>
      </p>
    </MarketingPageShell>
  );
}
