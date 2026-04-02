import Link from "next/link";
import type { ReactNode } from "react";

function FooterColumn({
  id,
  title,
  children
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <h3
        id={id}
        className="border-b border-zinc-800/80 pb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-teal-500/85"
      >
        {title}
      </h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group -mx-2 flex items-center rounded-lg px-2 py-2 text-[15px] leading-snug text-zinc-300 antialiased transition-colors duration-150 hover:bg-zinc-800/60 hover:text-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500/60"
    >
      <span
        aria-hidden
        className="mr-2.5 inline-block h-1 w-1 shrink-0 rounded-full bg-rose-500/50 transition-colors group-hover:bg-teal-400/80"
      />
      {children}
    </Link>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-zinc-800/80 bg-zinc-950/90 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          <div className="max-w-xs">
            <Link
              href="/"
              className="bg-gradient-to-r from-rose-100 to-teal-100/90 bg-clip-text text-base font-semibold tracking-tight text-transparent transition hover:from-rose-50 hover:to-teal-50"
            >
              The Job Pit
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-zinc-500 antialiased">
              Track applications, deadlines, and your hiring pipeline in one place.
            </p>
          </div>

          <FooterColumn id="footer-product" title="Product">
            <nav aria-labelledby="footer-product">
              <ul className="grid grid-cols-1 gap-x-4 gap-y-0.5 sm:grid-cols-2">
                <li>
                  <FooterLink href="/about">About</FooterLink>
                </li>
                <li>
                  <FooterLink href="/features">Features</FooterLink>
                </li>
                <li>
                  <FooterLink href="/faq">FAQ</FooterLink>
                </li>
                <li>
                  <FooterLink href="/dashboard">Dashboard</FooterLink>
                </li>
                <li>
                  <FooterLink href="/profile">Profile</FooterLink>
                </li>
                <li>
                  <FooterLink href="/applications">Applications</FooterLink>
                </li>
                <li>
                  <FooterLink href="/lab">Resume &amp; cover lab</FooterLink>
                </li>
                <li>
                  <FooterLink href="/interview">Interview prep</FooterLink>
                </li>
                <li>
                  <FooterLink href="/community">Community</FooterLink>
                </li>
                <li>
                  <FooterLink href="/companies">Company intel</FooterLink>
                </li>
              </ul>
            </nav>
          </FooterColumn>

          <FooterColumn id="footer-legal" title="Legal">
            <nav aria-labelledby="footer-legal">
              <ul className="flex flex-col gap-0.5">
                <li>
                  <FooterLink href="/privacy">Privacy Policy</FooterLink>
                </li>
                <li>
                  <FooterLink href="/terms">Terms of Service</FooterLink>
                </li>
              </ul>
            </nav>
          </FooterColumn>

          <FooterColumn id="footer-creators" title="Creators">
            <p className="text-[15px] leading-relaxed text-zinc-400 antialiased">
              Lideon, Vicknesh &amp; Aaron
            </p>
          </FooterColumn>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-zinc-800/70 pt-8 text-xs text-zinc-600 antialiased sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {year} The Job Pit. All rights reserved.</p>
          <p className="text-zinc-600/90">
            This site is provided as-is for personal and portfolio use.
          </p>
        </div>
      </div>
    </footer>
  );
}
