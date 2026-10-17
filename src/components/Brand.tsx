import { Link } from "@tanstack/react-router";

export function Brand({ to = "/" }: { to?: "/" | "/app" }) {
  return (
    <Link to={to} className="flex items-baseline gap-2" aria-label="Kaimaaral home">
      <span className="font-display text-2xl leading-none text-primary">Kaimaaral</span>
      <span className="hidden text-xs text-muted-foreground sm:inline">കൈമാറൽ · handover</span>
    </Link>
  );
}
