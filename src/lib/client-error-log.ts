import { supabase } from "@/integrations/supabase/client";

/**
 * Browser-side runtime error logging. Records the page, the last thing the
 * user clicked/typed into, and the stack trace into the client_errors table.
 * Call installClientErrorLogging() once from a useEffect in the root route.
 */

const MAX_PER_SESSION = 20;
let installed = false;
let sent = 0;
let lastAction: string | null = null;
const seen = new Set<string>();

export function describeAction(target: EventTarget | null, kind: string): string | null {
  if (!(target instanceof Element)) return null;
  const el = target.closest("button, a, [role=tab], [role=button], input, select, textarea, label") ?? target;
  const label =
    el.getAttribute("aria-label") ||
    (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement ? el.placeholder || el.name : "") ||
    (el.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 60);
  const tag = el.getAttribute("role") || el.tagName.toLowerCase();
  return `${kind} ${tag}${label ? ` "${label}"` : ""}`;
}

export function logClientError(err: unknown, source: string) {
  const e = err instanceof Error ? err : new Error(typeof err === "string" ? err : JSON.stringify(err ?? "Unknown error"));
  const key = `${e.message}|${location.pathname}`;
  if (seen.has(key) || sent >= MAX_PER_SESSION) return;
  seen.add(key);
  sent++;
  const row = {
    page: location.pathname + location.search,
    last_action: lastAction,
    message: e.message.slice(0, 1000),
    stack: (e.stack ?? "").slice(0, 8000),
    source,
    user_agent: navigator.userAgent.slice(0, 300),
  };
  void supabase.auth
    .getSession()
    .then(({ data }) => supabase.from("client_errors").insert({ ...row, user_id: data.session?.user.id ?? null }))
    .catch(() => {});
}

export function installClientErrorLogging() {
  if (installed || typeof window === "undefined") return;
  installed = true;
  const onAction = (kind: string) => (ev: Event) => {
    const a = describeAction(ev.target, kind);
    if (a) lastAction = a;
  };
  window.addEventListener("click", onAction("click"), true);
  window.addEventListener("change", onAction("change"), true);
  window.addEventListener("error", (ev) => logClientError(ev.error ?? ev.message, "window.error"));
  window.addEventListener("unhandledrejection", (ev) => logClientError(ev.reason, "unhandledrejection"));
}
