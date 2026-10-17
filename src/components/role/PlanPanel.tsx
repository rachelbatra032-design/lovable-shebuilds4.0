import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { generatePlan, type OnboardingPlan } from "@/lib/roles.functions";

export function PlanPanel({ roleId, plan, onOpenItem }: { roleId: string; plan: OnboardingPlan | null; onOpenItem: (id: string) => void }) {
  const gen = useServerFn(generatePlan);
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);

  async function make() {
    setBusy(true);
    try {
      const r = await gen({ data: { roleId } });
      if (r.ok) {
        toast.success("Onboarding plan ready");
        qc.invalidateQueries({ queryKey: ["role", roleId] });
      } else toast.error(r.error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="paper-card flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <p className="font-display text-3xl">Onboarding plan</p>
          <p className="text-muted-foreground">{plan ? plan.summary : "Turn this role's map into a Week 1 / Week 2 / Month 1 plan for the next person."}</p>
        </div>
        <Button onClick={make} disabled={busy}>
          {busy ? <Loader2 className="animate-spin" /> : <CalendarCheck />} {plan ? "Regenerate" : "Generate plan"}
        </Button>
      </div>
      {plan && (
        <div className="grid gap-4 md:grid-cols-3">
          {plan.weeks.map((w, wi) => (
            <section key={wi} className="paper-card p-5">
              <h3 className="text-3xl text-terracotta">{w.label}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{w.focus}</p>
              <ul className="mt-4 space-y-3">
                {w.tasks.map((t, ti) => (
                  <li key={ti} className="flex items-start gap-2">
                    <Checkbox id={`p-${wi}-${ti}`} className="mt-1" />
                    <label htmlFor={`p-${wi}-${ti}`} className="flex-1">
                      {t.task}
                      {t.item_id && (
                        <button type="button" className="ml-1 text-xs text-primary underline" onClick={() => onOpenItem(t.item_id!)}>
                          source
                        </button>
                      )}
                    </label>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
