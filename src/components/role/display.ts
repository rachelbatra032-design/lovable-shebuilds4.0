import type { KnowledgeItem } from "@/lib/queries";
import type { LangCode } from "@/lib/knowledge";

export function displayItem(item: KnowledgeItem, lang: LangCode) {
  if (lang !== "en") {
    const t = (item.translations as Record<string, { title: string; body: string; cadence: string | null }> | null)?.[lang];
    if (t) return { title: t.title, body: t.body, cadence: t.cadence ?? item.cadence, translated: true };
  }
  return { title: item.title, body: item.body, cadence: item.cadence, translated: false };
}

export const LANG_LABEL: Record<string, string> = {
  en: "English",
  ml: "Malayalam",
  hi: "Hindi",
  ta: "Tamil",
  mixed: "Mixed",
  other: "Other",
};
