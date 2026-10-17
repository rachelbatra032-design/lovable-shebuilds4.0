import { describe, expect, it } from "vitest";
import { completeness } from "./knowledge";

const now = new Date("2026-10-17T12:00:00Z");
const day = (n: number) => new Date(now.getTime() - n * 86400000);
const allKinds = ["responsibility", "recurring_task", "decision", "contact", "tool", "edge_case"].map((kind) => ({
  kind,
  source_input_id: "x",
}));

describe("completeness index", () => {
  it("is 100 when all 6 categories are covered, 12+ active days in 30, all sourced, nothing pending", () => {
    const dates = Array.from({ length: 12 }, (_, i) => day(i));
    expect(completeness({ items: allKinds, inputDates: dates, pendingChanges: 0, now })).toBe(100);
  });

  it("only counts activity from the last 30 days", () => {
    const old = Array.from({ length: 12 }, (_, i) => day(31 + i));
    expect(completeness({ items: allKinds, inputDates: old, pendingChanges: 0, now })).toBe(65);
  });

  it("subtracts 3 points per unconfirmed change", () => {
    const dates = Array.from({ length: 12 }, (_, i) => day(i));
    expect(completeness({ items: allKinds, inputDates: dates, pendingChanges: 2, now })).toBe(94);
  });

  it("is 0 for an empty role", () => {
    expect(completeness({ items: [], inputDates: [], pendingChanges: 0, now })).toBe(0);
  });
});
