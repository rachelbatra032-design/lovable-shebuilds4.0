import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Bot, Play, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { generatePlan, type OnboardingPlan } from "@/lib/roles.functions";
import { checkPlanCompleteness } from "@/lib/plan-completeness";
import { trackAgentTask, type AgentTask } from "@/lib/agent-task";
import type { KnowledgeItem } from "@/lib/queries";

export function AgentsPanel({ roleId, companyId, language, items, plan }: { roleId: string; companyId: string; language: string; items: KnowledgeItem[]; plan: OnboardingPlan | null }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<AgentTask | null>(null);
  const generate = useServerFn(generatePlan);
  const qc = useQueryClient();
  const runs = useQuery({
    queryKey: ["agent-runs", roleId],
    enabled: open,
    queryFn: async () => {
      const { data, error } = await supabase.from("agent_runs").select("*").eq("role_id", roleId).order("created_at", { ascending: false }).limit(20);
      if (error) throw error;
      return data ?? [];
    },
  });

  async function run(task: AgentTask) {
    setBusy(task);
    try {
      const summary = await trackAgentTask(task, {
        start: async () => {
          const { data: auth } = await supabase.auth.getUser();
          if (!auth.user) throw new Error("Sign in to run an agent.");
          const { data, error } = await supabase.from("agent_runs").insert({ company_id: companyId, role_id: roleId, created_by: auth.user.id, task }).select("id").single();
          if (error || !data) throw new Error(error?.message ?? "Could not start agent.");
          void qc.invalidateQueries({ queryKey: ["agent-runs", roleId] });
          return data.id;
        },
        execute: async () => {
          if (task === "plan") {
            const result = await generate({ data: { roleId, language } });
            if (!result.ok) throw new Error(result.error);
            return `Plan generated · ${result.plan.completeness?.status === "ready" ? "procedural checks passed" : "Draft — missing details need review"}. Review it in Plan before handover.`;
          }
          const result = checkPlanCompleteness(plan ?? {}, items);
          return `${result.checked_tasks} steps checked · ${result.gaps.length} missing details · ${result.status === "ready" ? "Ready" : "Draft"}.`;
        },
        finish: async (id, status, summary) => {
          const { error } = await supabase.from("agent_runs").update({ status, summary, finished_at: new Date().toISOString() }).eq("id", id);
          if (error) throw error;
        },
      });
      toast.success(summary);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Agent task failed.");
    } finally {
      setBusy(null);
      void qc.invalidateQueries({ queryKey: ["agent-runs", roleId] });
      void qc.invalidateQueries({ queryKey: ["role", roleId] });
    }
  }

  return <>
    <Button variant="outline" size="sm" onClick={() => setOpen(true)}><Bot /> Agents</Button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto">
        <DialogTitle>Handover agents</DialogTitle>
        <DialogDescription>Lovable AI connected · Runs stay in this workspace. Changes to recorded knowledge still need human approval.</DialogDescription>
        <div className="divide-y divide-border">
          {([{ task: "plan", name: "Plan builder", detail: "AI · Source-backed onboarding draft" }, { task: "audit", name: "Readiness checker", detail: "Rule-based · Screen paths, decisions, approvals and completion" }] as const).map(agent => <div key={agent.task} className="flex items-center justify-between gap-3 py-4">
            <div className="min-w-0"><h3 className="font-medium">{agent.name}</h3><p className="text-sm text-muted-foreground">{agent.detail}</p></div>
            <Button variant="outline" size="sm" disabled={busy !== null || (agent.task === "audit" && !plan)} onClick={() => run(agent.task)}>{busy === agent.task ? <Loader2 className="animate-spin" /> : <Play />} Run</Button>
          </div>)}
        </div>
        <h3 className="border-t border-border pt-4 font-medium">Run history</h3>
        {runs.isLoading && <p className="text-sm text-muted-foreground">Loading runs…</p>}
        {runs.error && <p role="alert" className="text-sm text-destructive">Could not load run history.</p>}
        {runs.data?.length === 0 && <p className="text-sm text-muted-foreground">No runs yet.</p>}
        <ul className="divide-y divide-border">{runs.data?.map(run => <li key={run.id} className="py-3 text-sm">
          <div className="flex flex-wrap justify-between gap-2"><span className="font-medium">{run.task === "plan" ? "Plan builder" : "Readiness checker"}</span><span className="text-muted-foreground">{run.status}</span></div>
          <p className="mt-1 text-muted-foreground">{run.summary ?? "Started — keep this page open until the result returns."}</p>
          <time className="mt-2 block text-xs text-muted-foreground">{new Date(run.created_at).toLocaleString()}</time>
        </li>)}</ul>
      </DialogContent>
    </Dialog>
  </>;
}