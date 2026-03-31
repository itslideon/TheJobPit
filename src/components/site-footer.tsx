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
        className="border-b border-red-900/50 pb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-red-400/90"
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
      className="group -mx-2 flex items-center rounded-lg px-2 py-2 text-[15px] leading-snug text-red-100/90 antialiased transition-colors duration-150 hover:bg-red-950/50 hover:text-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600/80"
    >
      <span
        aria-hidden
        className="mr-2.5 inline-block h-1 w-1 shrink-0 rounded-full bg-red-600/40 transition-colors group-hover:bg-red-500"
      />
      {children}
    </Link>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-red-950/80 bg-black/90 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          <div className="max-w-xs">
            <Link
              href="/"
              className="text-base font-semibold tracking-tight text-red-50 transition hover:text-red-100"
            >
              The Job Pit
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-red-200/75 antialiased">
              Track applications, deadlines, and your hiring pipeline in one place.
            </p>
          </div>

          <FooterColumn id="footer-product" title="Product">
            <nav aria-labelledby="footer-product">
              <ul className="flex flex-col gap-0.5">
                <li>
                  <FooterLink href="/dashboard">Dashboard</FooterLink>
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
            <p className="text-[15px] leading-relaxed text-red-100/85 antialiased">
              Lideon &amp; Vicknesh
            </p>
          </FooterColumn>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-red-950/60 pt-8 text-xs text-red-400/70 antialiased sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {year} The Job Pit. All rights reserved.</p>
          <p className="text-red-500/55">
            This site is provided as-is for personal and portfolio use.
          </p>
        </div>
      </div>
    </footer>
  );
}
