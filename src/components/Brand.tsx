import { Link } from "@tanstack/react-router";

export function Brand({ to = "/" }: { to?: "/" | "/app" }) {
  return (
    <Link to={to} className="flex min-w-0 items-center gap-2.5" aria-label="Kaimaaral home">
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 shrink-0 text-foreground" aria-hidden="true">
        <path d="M5 4v16M8 12 18 4M8 12l10 8M12 12h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="truncate font-display text-lg font-semibold leading-none text-foreground">Kaimaaral</span>
    </Link>
  );
}
