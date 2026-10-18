import { Link } from "@tanstack/react-router";

export function HandoverSymbol({
  className,
  label,
}: {
  className?: string;
  label?: string;
}) {
  const a11y = label
    ? { role: "img" as const, "aria-label": label }
    : { "aria-hidden": true as const };
  return (
    <svg viewBox="0 0 160 96" fill="none" className={className} {...a11y}>
      <path d="M38 16H18v64h20M122 16h20v64h-20" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M38 48h80m-20-20 20 20-20 20" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m68 35 13 13-13 13-13-13 13-13Z" fill="currentColor" />
    </svg>
  );
}

export function Brand({ to = "/" }: { to?: "/" | "/app" }) {
  return (
    <Link to={to} className="flex min-w-0 items-center gap-2.5" aria-label="Kaimaaral home">
      <HandoverSymbol className="h-5 w-8 shrink-0 text-foreground" />
      <span className="truncate font-display text-lg font-semibold leading-none text-foreground">Kaimaaral</span>
    </Link>
  );
}
