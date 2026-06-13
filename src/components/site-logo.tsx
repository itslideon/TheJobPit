type SiteLogoProps = {
  className?: string;
  showWordmark?: boolean;
  iconClassName?: string;
};

/** Arena pit mark + optional shimmer wordmark */
export function SiteLogo({ className, showWordmark = true, iconClassName }: SiteLogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <svg
        className={`h-8 w-8 shrink-0 sm:h-9 sm:w-9 ${iconClassName ?? ""}`}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <linearGradient id="pit-grad" x1="8" y1="6" x2="32" y2="34" gradientUnits="userSpaceOnUse">
            <stop stopColor="#f43f5e" />
            <stop offset="0.55" stopColor="#e11d48" />
            <stop offset="1" stopColor="#14b8a6" />
          </linearGradient>
        </defs>
        <path
          d="M20 4L34 12v16L20 36 6 28V12L20 4z"
          stroke="url(#pit-grad)"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path
          d="M20 11v14M14 17l6 4 6-4"
          stroke="url(#pit-grad)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="20" cy="28" r="2" fill="#14b8a6" />
      </svg>
      {showWordmark ? (
        <span className="pit-logo-shimmer text-lg font-bold tracking-tight sm:text-xl">
          The Job Pit
        </span>
      ) : null}
    </span>
  );
}
