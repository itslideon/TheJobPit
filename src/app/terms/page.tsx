import type { Metadata } from "next";
import { MarketingPageShell } from "@/components/marketing-page-shell";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of use for The Job Pit."
};

export default function TermsPage() {
  return (
    <MarketingPageShell
      eyebrow="Legal"
      title="Terms of Service"
      subtitle="Terms of use for The Job Pit."
      maxWidthClass="max-w-4xl"
    >
      <section className="pit-card p-8 shadow-pit md:p-10">
        <p className="text-sm text-zinc-500">Last updated: April 1, 2026</p>
        <div className="pit-marketing-prose mt-6 space-y-6">
          <p>
            By accessing or using <strong>The Job Pit</strong>, you agree to these Terms of
            Service. If you do not agree, please do not use the application.
          </p>
          <section className="rounded-xl border border-zinc-800/90 bg-zinc-900/30 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-300/90">
              Use of the service
            </h2>
            <p className="mt-3">
              The app is intended for personal and educational use. You are responsible for the
              information you submit and for using the app in compliance with applicable laws and
              regulations.
            </p>
          </section>

          <section className="rounded-xl border border-zinc-800/90 bg-zinc-900/30 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-rose-300/90">
              Disclaimer
            </h2>
            <p className="mt-3">
              The software is provided &quot;as is&quot; and &quot;as available,&quot; without
              warranties of any kind. To the fullest extent permitted by law, we are not liable for
              any indirect, incidental, or consequential losses related to your use of the app,
              including data loss or missed opportunities.
            </p>
          </section>

          <section className="rounded-xl border border-zinc-800/90 bg-zinc-900/30 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-300/90">
              Changes
            </h2>
            <p className="mt-3">
              We may update these terms from time to time. Continued use of the app after updates
              are posted means you accept the revised terms.
            </p>
          </section>

          <section className="rounded-xl border border-zinc-800/90 bg-zinc-900/30 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-300/90">
              Contact
            </h2>
            <p className="mt-3">
              If you have questions about these terms, contact the maintainers through the project
              repository or listed contact channels.
            </p>
          </section>
        </div>
      </section>
    </MarketingPageShell>
  );
}
