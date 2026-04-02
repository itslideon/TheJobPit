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
            By accessing or using <strong>The Job Pit</strong>, you agree to these terms. If you
            do not agree, do not use the application.
          </p>

          <h2>Use of the service</h2>
          <p>
            The app is provided for personal and educational purposes. You are responsible for the
            accuracy of information you enter and for complying with applicable laws when storing
            or processing data.
          </p>

          <h2>Disclaimer</h2>
          <p>
            The software is provided &quot;as is&quot;, without warranty of any kind. We are not
            liable for any loss or damage arising from your use of the app, including data loss or
            missed opportunities.
          </p>

          <h2>Changes</h2>
          <p>
            These terms may be updated from time to time. Continued use after changes constitutes
            acceptance of the revised terms.
          </p>

          <h2>Contact</h2>
          <p>
            For questions, reach out through the project repository or contact channels listed by
            the project maintainers.
          </p>
        </div>
      </section>
    </MarketingPageShell>
  );
}
