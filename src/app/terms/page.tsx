import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of use for The Job Pit."
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <p className="text-sm text-red-300/70">
        <Link className="text-red-200 underline hover:text-red-100" href="/">
          &larr; Back to home
        </Link>
      </p>
      <h1 className="mt-6 text-3xl font-bold text-red-100">Terms of Service</h1>
      <p className="mt-2 text-sm text-red-300/70">Last updated: April 1, 2026</p>

      <div className="mt-8 max-w-none space-y-6 text-sm leading-relaxed text-red-200/90">
        <p>
          By accessing or using <strong>The Job Pit</strong>, you agree to these terms. If you
          do not agree, do not use the application.
        </p>

        <h2 className="text-lg font-semibold">Use of the service</h2>
        <p>
          The app is provided for personal and educational purposes. You are responsible for the
          accuracy of information you enter and for complying with applicable laws when storing
          or processing data.
        </p>

        <h2 className="text-lg font-semibold">Disclaimer</h2>
        <p>
          The software is provided &quot;as is&quot;, without warranty of any kind. We are not
          liable for any loss or damage arising from your use of the app, including data loss
          or missed opportunities.
        </p>

        <h2 className="text-lg font-semibold">Changes</h2>
        <p>
          These terms may be updated from time to time. Continued use after changes constitutes
          acceptance of the revised terms.
        </p>

        <h2 className="text-lg font-semibold">Contact</h2>
        <p>
          For questions, reach out through the project repository or contact channels listed by
          the project maintainers.
        </p>
      </div>
    </main>
  );
}
