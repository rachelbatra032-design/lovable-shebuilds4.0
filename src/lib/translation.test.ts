import { describe, it, expect } from "vitest";
import { isItemTranslation } from "./translation";
import { displayItem } from "@/components/role/display";
import type { KnowledgeItem } from "./queries";

describe("reading translations", () => {
  const item = { title: "Vendor payment", body: "Pay ₹25,000 in Tally after approval.", cadence: "Monthly", translations: {}, original_quote: "ഒറിജിനൽ" } as KnowledgeItem;
  it("rejects empty and malformed cached translations", () => {
    for (const value of [null, {}, { title: "", body: "text", cadence: null }, { title: "title", body: 5, cadence: null }]) expect(isItemTranslation(value)).toBe(false);
  });
  it.each([
    ["ml", "വെണ്ടർ പേയ്‌മെന്റ്", "അംഗീകാരത്തിന് ശേഷം ₹25,000 Tally ൽ അടയ്ക്കുക."],
    ["hi", "विक्रेता भुगतान", "अनुमोदन के बाद Tally में ₹25,000 का भुगतान करें।"],
    ["ta", "விற்பனையாளர் கட்டணம்", "ஒப்புதலுக்குப் பிறகு Tally இல் ₹25,000 செலுத்தவும்."],
  ] as const)("renders %s without changing the original quote", (language, title, body) => {
    const translated = { ...item, translations: { [language]: { title, body, cadence: null } } };
    expect(displayItem(translated, language)).toEqual({ title, body, cadence: null, translated: true });
    expect(translated.original_quote).toBe("ഒറിജിനൽ");
  });
  it("falls back to English for an incomplete translation", () => {
    expect(displayItem({ ...item, translations: { ml: { title: "" } } }, "ml")).toEqual({ title: item.title, body: item.body, cadence: item.cadence, translated: false });
  });
});