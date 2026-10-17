export const KINDS = [
  "responsibility",
  "recurring_task",
  "decision",
  "contact",
  "tool",
  "edge_case",
  "guide",
] as const;
export type Kind = (typeof KINDS)[number];

export const KIND_LABEL: Record<Kind, string> = {
  responsibility: "Responsibilities",
  recurring_task: "Recurring tasks & calendar",
  decision: "Key decisions & judgment",
  contact: "People & contacts",
  tool: "Tools & systems",
  edge_case: "Edge cases & gotchas",
  guide: "Step-by-step guides",
};

export const KIND_SINGULAR: Record<Kind, string> = {
  responsibility: "Responsibility",
  recurring_task: "Recurring task",
  decision: "Decision",
  contact: "Contact",
  tool: "Tool",
  edge_case: "Edge case",
  guide: "Guide",
};

export const KIND_COLOR_VAR: Record<Kind, string> = {
  responsibility: "var(--kind-responsibility)",
  recurring_task: "var(--kind-task)",
  decision: "var(--kind-decision)",
  contact: "var(--kind-contact)",
  tool: "var(--kind-tool)",
  edge_case: "var(--kind-edge)",
  guide: "var(--kind-guide)",
};

export const LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "ml", label: "Malayalam", native: "മലയാളം" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
] as const;
export type LangCode = (typeof LANGUAGES)[number]["code"];

/** The six categories a complete role map must cover (guides are a bonus). */
export const CORE_KINDS: Kind[] = ["responsibility", "recurring_task", "decision", "contact", "tool", "edge_case"];

export type CompletenessInput = {
  items: { kind: string; source_input_id: string | null }[];
  inputDates: (string | Date)[];
  pendingChanges: number;
  now?: Date;
};

/**
 * Completeness index (0-100), based on the last 30 days of activity:
 * - 50 pts: share of the 6 core categories that have at least one item
 * - 35 pts: distinct days with a log in the last 30 days, full marks at 12 days
 * - 15 pts: share of items that link back to a source
 * - minus 3 pts per unconfirmed change
 */
export function completeness({ items, inputDates, pendingChanges, now = new Date() }: CompletenessInput): number {
  const kinds = new Set(items.map((i) => i.kind));
  const coverage = CORE_KINDS.filter((k) => kinds.has(k)).length / CORE_KINDS.length;
  const cutoff = now.getTime() - 30 * 24 * 3600 * 1000;
  const days = new Set(
    inputDates
      .map((d) => new Date(d))
      .filter((d) => d.getTime() >= cutoff && d.getTime() <= now.getTime())
      .map((d) => d.toISOString().slice(0, 10)),
  );
  const activity = Math.min(days.size / 12, 1);
  const sourced = items.length ? items.filter((i) => i.source_input_id).length / items.length : 0;
  const score = coverage * 50 + activity * 35 + sourced * 15 - pendingChanges * 3;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function riskLabel(score: number) {
  if (score >= 75) return { label: "Well covered", tone: "success" as const };
  if (score >= 45) return { label: "Gaps", tone: "warn" as const };
  return { label: "At risk", tone: "danger" as const };
}
