import type { Metadata } from "next";
import { MarketingPageShell } from "@/components/marketing-page-shell";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How The Job Pit handles your data."
};

export default function PrivacyPage() {
  return (
    <MarketingPageShell
      eyebrow="Legal"
      title="Privacy Policy"
      subtitle="How The Job Pit handles your data."
      maxWidthClass="max-w-4xl"
    >
      <section className="pit-card p-8 shadow-pit md:p-10">
        <p className="text-sm text-zinc-500">Last updated: April 1, 2026</p>
        <div className="pit-marketing-prose mt-6 space-y-6">
          <p>
            This Privacy Policy describes how <strong>The Job Pit</strong> (&quot;we&quot;,
            &quot;our&quot;) handles information when you use this application. This project is
            intended for personal use and as a portfolio demonstration.
          </p>

          <h2>Information we collect</h2>
          <p>
            If you self-host or deploy this app, you may store job application details you enter
            (for example company, role, notes, and dates) in a database you control. We do not
            operate a centralized service unless you choose to deploy one.
          </p>

          <h2>How information is used</h2>
          <p>
            Data you enter is used to display and manage your job search pipeline within the app.
            Features are built for your own use; there is no advertising profile built from your
            data in this open-source project.
          </p>

          <h2>Cookies and analytics</h2>
          <p>
            This codebase does not require cookies for core functionality. If you add analytics or
            authentication providers (for example Vercel Analytics, NextAuth, or Clerk), their
            respective policies will apply to those features.
          </p>

          <h2>Data retention</h2>
          <p>
            Retention depends on your hosting and database. You can delete records in the app or
            remove your database instance at any time.
          </p>

          <h2>Contact</h2>
          <p>
            For questions about this project, contact the maintainers via your project repository
            or preferred channel.
          </p>
        </div>
      </section>
    </MarketingPageShell>
  );
}
