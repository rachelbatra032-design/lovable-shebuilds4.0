import { describe, expect, it } from "vitest";
import { checkPlanCompleteness, PLAN_CRITERIA, type ProcedureChecks } from "./plan-completeness";

const body = "Tally > Reports > Purchase Register. Match invoice totals to the purchase order. Priya approves before payment. Save the payment receipt.";
function fixture() {
  const procedure_checks = Object.fromEntries(PLAN_CRITERIA.map((key) => [key, {
    status: "documented", detail: body, source_item_id: "invoice", source_quote: body,
  }])) as ProcedureChecks;
  return { phases: [{ tasks: [{ steps: [body], done_when: "Payment receipt saved", procedure_checks }] }] };
}
const sources = [{ id: "invoice", body }];
describe("Onboarding readiness", () => {
  for (const criterion of PLAN_CRITERIA) {
    it(`keeps a plan draft when ${criterion} is missing`, () => {
      const plan = fixture();
      plan.phases[0].tasks[0].procedure_checks[criterion].status = "missing";
      const result = checkPlanCompleteness(plan, sources);
      expect(result.status).toBe("draft");
      expect(result.gaps.map((g) => g.criterion)).toEqual([criterion]);
    });
  }
  it("marks ready only when all four checks pass", () => {
    expect(checkPlanCompleteness(fixture(), sources)).toEqual({ status: "ready", checked_tasks: 1, gaps: [] });
  });
  it("rejects invented source evidence", () => {
    const plan = fixture();
    plan.phases[0].tasks[0].procedure_checks.screen_paths.source_quote = "Tally > Imaginary screen";
    expect(checkPlanCompleteness(plan, sources).gaps.map((g) => g.criterion)).toContain("screen_paths");
  });
  it("permits non-applicable checks only with recorded evidence, never completion", () => {
    const plan = fixture();
    plan.phases[0].tasks[0].procedure_checks.screen_paths.status = "not_applicable";
    expect(checkPlanCompleteness(plan, sources).status).toBe("ready");
    plan.phases[0].tasks[0].procedure_checks.completion_criteria.status = "not_applicable";
    expect(checkPlanCompleteness(plan, sources).status).toBe("draft");
  });
  it("keeps legacy and empty plans draft", () => {
    expect(checkPlanCompleteness({}).status).toBe("draft");
    expect(checkPlanCompleteness({ phases: [{ tasks: [{ steps: [body], done_when: "Saved" }] }] }).gaps).toHaveLength(4);
  });
  it("requires executable steps and a completion result", () => {
    const plan = fixture();
    plan.phases[0].tasks[0].done_when = "";
    expect(checkPlanCompleteness(plan, sources).gaps.map((g) => g.criterion)).toContain("completion_criteria");
  });
});