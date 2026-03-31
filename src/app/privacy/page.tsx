import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How The Job Pit handles your data."
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <p className="text-sm text-red-300/70">
        <Link className="text-red-200 underline hover:text-red-100" href="/">
          &larr; Back to home
        </Link>
      </p>
      <h1 className="mt-6 text-3xl font-bold text-red-100">Privacy Policy</h1>
      <p className="mt-2 text-sm text-red-300/70">Last updated: April 1, 2026</p>

      <div className="mt-8 max-w-none space-y-6 text-sm leading-relaxed text-red-200/90">
        <p>
          This Privacy Policy describes how <strong>The Job Pit</strong> (&quot;we&quot;,
          &quot;our&quot;) handles information when you use this application. This project is
          intended for personal use and as a portfolio demonstration.
        </p>

        <h2 className="text-lg font-semibold">Information we collect</h2>
        <p>
          If you self-host or deploy this app, you may store job application details you enter
          (for example company, role, notes, and dates) in a database you control. We do not
          operate a centralized service unless you choose to deploy one.
        </p>

        <h2 className="text-lg font-semibold">How information is used</h2>
        <p>
          Data you enter is used to display and manage your job search pipeline within the app.
          Features are built for your own use; there is no advertising profile built from your
          data in this open-source project.
        </p>

        <h2 className="text-lg font-semibold">Cookies and analytics</h2>
        <p>
          This codebase does not require cookies for core functionality. If you add analytics
          or authentication providers (for example Vercel Analytics, NextAuth, or Clerk), their
          respective policies will apply to those features.
        </p>

        <h2 className="text-lg font-semibold">Data retention</h2>
        <p>
          Retention depends on your hosting and database. You can delete records in the app or
          remove your database instance at any time.
        </p>

        <h2 className="text-lg font-semibold">Contact</h2>
        <p>
          For questions about this project, contact the maintainers via your project repository
          or preferred channel.
        </p>
      </div>
    </main>
  );
}
