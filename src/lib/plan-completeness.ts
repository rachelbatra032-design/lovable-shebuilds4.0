export const PLAN_CRITERIA = ["screen_paths", "decision_criteria", "approval_rules", "completion_criteria"] as const;
export type PlanCriterion = (typeof PLAN_CRITERIA)[number];
export const CRITERION_LABEL: Record<PlanCriterion, string> = {
  screen_paths: "Screen paths",
  decision_criteria: "Decision criteria",
  approval_rules: "Approval rules",
  completion_criteria: "Completion criteria",
};
export type ProcedureCheck = {
  status: "documented" | "missing" | "not_applicable";
  detail: string;
  source_item_id: string | null;
  source_quote: string | null;
};
export type ProcedureChecks = Record<PlanCriterion, ProcedureCheck>;
export type PlanGap = { phase: number; task: number; criterion: PlanCriterion; detail: string };
export type PlanCompleteness = { status: "ready" | "draft"; checked_tasks: number; gaps: PlanGap[] };
type AuditablePlan = {
  phases?: { tasks: { steps?: string[]; done_when?: string; procedure_checks?: ProcedureChecks }[] }[];
};
type Source = { id: string; body: string };

/** Fail closed; readiness is computed here, never accepted from an AI readiness claim. */
export function checkPlanCompleteness(plan: AuditablePlan, sources?: Source[]): PlanCompleteness {
  const gaps: PlanGap[] = [];
  let checked_tasks = 0;
  plan.phases?.forEach((phase, pi) => phase.tasks.forEach((task, ti) => {
    checked_tasks++;
    for (const criterion of PLAN_CRITERIA) {
      const check = task.procedure_checks?.[criterion];
      let detail = check?.detail?.trim() || `${CRITERION_LABEL[criterion]} not recorded.`;
      const quote = check?.source_quote?.trim();
      const source = sources?.find((s) => s.id === check?.source_item_id);
      const evidence = Boolean(check?.source_item_id && quote && (!sources || source?.body.includes(quote)));
      let valid = Boolean(check && check.detail?.trim() && evidence && (
        check.status === "documented" || (check.status === "not_applicable" && criterion !== "completion_criteria")
      ));
      if (criterion === "completion_criteria" && (!task.done_when?.trim() || !task.steps?.some((s) => s.trim()))) {
        valid = false;
        detail = "Executable steps and an observable completion result are missing.";
      } else if (check?.status !== "missing" && check && !evidence) {
        detail = `${CRITERION_LABEL[criterion]} has no verified supporting source.`;
      } else if (criterion === "completion_criteria" && check?.status === "not_applicable") {
        detail = "Every task needs observable completion criteria.";
      }
      if (!valid) gaps.push({ phase: pi, task: ti, criterion, detail });
    }
  }));
  return { status: checked_tasks > 0 && gaps.length === 0 ? "ready" : "draft", checked_tasks, gaps };
}