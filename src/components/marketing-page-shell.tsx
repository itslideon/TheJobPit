import Link from "next/link";
import type { ReactNode } from "react";

type MarketingPageShellProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  maxWidthClass?: string;
  children: ReactNode;
};

export function MarketingPageShell({
  title,
  subtitle,
  eyebrow,
  maxWidthClass = "max-w-4xl",
  children
}: MarketingPageShellProps) {
  return (
    <main className={`mx-auto ${maxWidthClass} px-6 py-10 md:py-14`}>
      {/* Site header already links About / Features / FAQ — only back link here */}
      <nav className="border-b border-zinc-800/60 pb-6" aria-label="Page">
        <Link href="/" className="pit-nav-back group">
          <span
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800/80 text-zinc-400 transition group-hover:bg-teal-950/40 group-hover:text-teal-300"
            aria-hidden
          >
            ←
          </span>
          <span>Back to home</span>
        </Link>
      </nav>

      <header className="pit-marketing-hero mt-8">
        {eyebrow ? (
          <p className="pit-marketing-eyebrow">{eyebrow}</p>
        ) : null}
        <h1 className="pit-marketing-title">{title}</h1>
        {subtitle ? <p className="pit-marketing-lead mt-4 max-w-3xl">{subtitle}</p> : null}
      </header>

      <div className="mt-8">{children}</div>
    </main>
  );
}
