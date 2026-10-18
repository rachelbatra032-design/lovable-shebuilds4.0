export type ItemTranslation = { title: string; body: string; cadence: string | null };

export function isItemTranslation(value: unknown): value is ItemTranslation {
  if (!value || typeof value !== "object") return false;
  const t = value as Record<string, unknown>;
  return typeof t['title'] === "string" && t['title'].trim().length > 0 && typeof t['body'] === "string" && t['body'].trim().length > 0 && (t['cadence'] === null || typeof t['cadence'] === "string");
}