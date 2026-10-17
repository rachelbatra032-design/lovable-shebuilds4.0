import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, CalendarCheck, Users, Eye, Hand, BookOpen, ClipboardCheck, AlertTriangle, CalendarDays, Printer, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { generatePlan, type OnboardingPlan, type PlanTaskType } from "@/lib/roles.functions";
import type { LangCode } from "@/lib/knowledge";
import { cn } from "@/lib/utils";

const TYPE_META: Record<PlanTaskType, { label: string; Icon: typeof Users }> = {
  meet: { label: "Meet", Icon: Users },
  learn: { label: "Learn", Icon: BookOpen },
  shadow: { label: "Watch", Icon: Eye },
  do: { label: "Do", Icon: Hand },
  review: { label: "Review", Icon: ClipboardCheck },
};

function useDone(roleId: string) {
  const key = `kaimaaral-plan-done-${roleId}`;
  const [done, setDone] = useState<Record<string, boolean>>({});
  useEffect(() => {
    try {
      setDone(JSON.parse(localStorage.getItem(key) ?? "{}"));
    } catch {
      setDone({});
    }
  }, [key]);
  const toggle = (id: string, v: boolean) =>
    setDone((d) => {
      const n = { ...d, [id]: v };
      localStorage.setItem(key, JSON.stringify(n));
      return n;
    });
  return [done, toggle] as const;
}

function SourceLink({ id, onOpenItem }: { id: string | null; onOpenItem: (id: string) => void }) {
  if (!id) return null;
  return (
    <button type="button" className="ml-1 text-xs text-primary underline underline-offset-2" onClick={() => onOpenItem(id)}>
      source
    </button>
  );
}

export function PlanPanel({ roleId, plan, lang = "en", onOpenItem }: { roleId: string; plan: OnboardingPlan | null; lang?: LangCode; onOpenItem: (id: string) => void }) {
  const gen = useServerFn(generatePlan);
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [done, toggle] = useDone(roleId);

  async function make() {
    setBusy(true);
    try {
      const r = await gen({ data: { roleId, language: lang } });
      if (r.ok) {
        toast.success("Onboarding plan ready");
        qc.invalidateQueries({ queryKey: ["role", roleId] });
      } else toast.error(r.error);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not make the plan");
    } finally {
      setBusy(false);
    }
  }

  const isV2 = !!plan?.phases?.length;
  const allTasks = isV2 ? plan!.phases!.flatMap((p, pi) => p.tasks.map((_, ti) => `${pi}-${ti}`)) : [];
  const doneCount = allTasks.filter((k) => done[k]).length;
  const pct = allTasks.length ? Math.round((doneCount / allTasks.length) * 100) : 0;

  return (
    <div className="space-y-5">
      <div className="paper-card flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="min-w-0 flex-1">
          <p className="font-display text-3xl">Onboarding plan</p>
          <p className="text-muted-foreground">
            {plan ? plan.summary : "Turn this role's map into a step-by-step plan: get set up, watch and learn, do it together, then own it."}
          </p>
          {isV2 && (
            <div className="mt-3 flex items-center gap-3" aria-label={`${doneCount} of ${allTasks.length} steps done`}>
              <div className="h-2 w-48 overflow-hidden rounded-full bg-secondary">
                <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-sm text-muted-foreground">
                {doneCount} of {allTasks.length} done
              </span>
            </div>
          )}
        </div>
        <div className="flex gap-2 print:hidden">
          {isV2 && (
            <Button variant="outline" onClick={() => window.print()}>
              <Printer /> Print
            </Button>
          )}
          <Button onClick={make} disabled={busy}>
            {busy ? <Loader2 className="animate-spin" /> : <CalendarCheck />} {plan ? "Make a new plan" : "Make the plan"}
          </Button>
        </div>
      </div>

      {busy && <p className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Reading the role map and building the plan… this takes about half a minute.</p>}

      {plan && !isV2 && (
        <div className="paper-card p-5">
          <p>This plan was made with an older, simpler format. Tap <strong>Make a new plan</strong> for the clearer step-by-step version.</p>
        </div>
      )}

      {isV2 && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <section className="paper-card p-5">
              <h3 className="flex items-center gap-2 text-2xl"><CalendarDays className="h-5 w-5 text-primary" /> Key dates</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {plan!.key_dates!.map((d, i) => (
                  <li key={i}>
                    <span className="font-semibold">{d.when}</span> — {d.what}
                    <SourceLink id={d.item_id} onOpenItem={onOpenItem} />
                  </li>
                ))}
                {!plan!.key_dates!.length && <li className="text-muted-foreground">None recorded yet.</li>}
              </ul>
            </section>
            <section className="paper-card p-5">
              <h3 className="flex items-center gap-2 text-2xl"><Users className="h-5 w-5 text-primary" /> People to meet</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {plan!.key_contacts!.map((c, i) => (
                  <li key={i}>
                    <span className="font-semibold">{c.name}</span> — {c.why}
                    <SourceLink id={c.item_id} onOpenItem={onOpenItem} />
                  </li>
                ))}
                {!plan!.key_contacts!.length && <li className="text-muted-foreground">None recorded yet.</li>}
              </ul>
            </section>
            <section className="paper-card p-5">
              <h3 className="flex items-center gap-2 text-2xl"><AlertTriangle className="h-5 w-5 text-terracotta" /> Watch out for</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {plan!.watch_outs!.map((w, i) => (
                  <li key={i}>
                    {w.text}
                    <SourceLink id={w.item_id} onOpenItem={onOpenItem} />
                  </li>
                ))}
                {!plan!.watch_outs!.length && <li className="text-muted-foreground">None recorded yet.</li>}
              </ul>
            </section>
          </div>

          <ol className="relative space-y-5 border-l-2 border-border pl-6">
            {plan!.phases!.map((p, pi) => {
              const keys = p.tasks.map((_, ti) => `${pi}-${ti}`);
              const phaseDone = keys.every((k) => done[k]);
              return (
                <li key={pi} className="relative">
                  <span
                    className={cn(
                      "absolute -left-[2.1rem] top-5 flex h-7 w-7 items-center justify-center rounded-full border-2 text-sm font-semibold",
                      phaseDone ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background",
                    )}
                    aria-hidden
                  >
                    {pi + 1}
                  </span>
                  <section className="paper-card p-5">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="text-3xl">{p.label}</h3>
                      <span className="rounded-full bg-secondary px-3 py-0.5 text-sm font-medium">{p.timeframe}</span>
                    </div>
                    <p className="mt-1 text-muted-foreground">{p.goal}</p>
                    <ul className="mt-4 divide-y divide-border">
                      {p.tasks.map((t, ti) => {
                        const k = `${pi}-${ti}`;
                        const meta = TYPE_META[t.type] ?? TYPE_META.do;
                        return (
                          <li key={ti} className="flex items-start gap-3 py-3">
                            <Checkbox id={`plan-${k}`} className="mt-1" checked={!!done[k]} onCheckedChange={(v) => toggle(k, v === true)} />
                            <div className="min-w-0 flex-1">
                              <label htmlFor={`plan-${k}`} className={cn("block", done[k] && "text-muted-foreground line-through")}>
                                {t.task}
                              </label>
                              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                <span className="inline-flex items-center gap-1 font-medium text-foreground/80">
                                  <meta.Icon className="h-3.5 w-3.5" /> {meta.label}
                                </span>
                                {t.when && <span>{t.when}</span>}
                                {t.with_person && <span>with {t.with_person}</span>}
                                <SourceLink id={t.item_id} onOpenItem={onOpenItem} />
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                    <p className="mt-3 flex items-start gap-2 rounded-lg bg-secondary p-3 text-sm">
                      <Flag className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {p.checkpoint}
                    </p>
                  </section>
                </li>
              );
            })}
          </ol>
        </>
      )}
    </div>
  );
}
