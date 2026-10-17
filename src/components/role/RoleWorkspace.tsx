import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, BookText, Network, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/AppHeader";
import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { ScoreRing } from "@/components/ScoreRing";
import { roleChangesQuery, roleInputsQuery, roleItemsQuery, roleQuery, type KnowledgeItem } from "@/lib/queries";
import { completeness, KINDS, KIND_COLOR_VAR, KIND_LABEL, type Kind } from "@/lib/knowledge";
import { useLang } from "@/lib/use-lang";
import { translateItems, type OnboardingPlan } from "@/lib/roles.functions";
import { displayItem } from "./display";
import { ItemSheet } from "./ItemSheet";
import { CapturePanel } from "./CapturePanel";
import { ReviewPanel } from "./ReviewPanel";
import { AskPanel } from "./AskPanel";
import { PlanPanel } from "./PlanPanel";

const TABS = [
  { value: "map", label: "Map" },
  { value: "capture", label: "Capture" },
  { value: "review", label: "Review" },
  { value: "ask", label: "Ask" },
  { value: "plan", label: "Plan" },
] as const;

const MapGraph = lazy(() => import("./MapGraph"));

export function RoleWorkspace({ roleId }: { roleId: string }) {
  const [lang] = useLang();
  const qc = useQueryClient();
  const role = useQuery(roleQuery(roleId));
  const items = useQuery({ ...roleItemsQuery(roleId), refetchInterval: (q) => undefined });
  const inputs = useQuery({
    ...roleInputsQuery(roleId),
    refetchInterval: (q) => (q.state.data?.some((i) => ["queued", "transcribing", "extracting"].includes(i.status)) ? 3000 : false),
  });
  const changes = useQuery(roleChangesQuery(roleId));
  const [tab, setTab] = useState("map");
  const [mode, setMode] = useState<"read" | "visual">("read");
  const [selected, setSelected] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);
  const translate = useServerFn(translateItems);
  const tried = useRef(new Set<string>());

  const list = items.data?.items ?? [];
  const untranslated = lang === "en" ? 0 : list.filter((i) => !(i.translations as Record<string, unknown>)?.[lang]).length;
  const needsTranslation = untranslated > 0;

  useEffect(() => {
    const key = `${roleId}-${lang}-${untranslated}`;
    if (!needsTranslation || tried.current.has(key)) return;
    tried.current.add(key);
    setTranslating(true);
    translate({ data: { roleId, language: lang as "ml" | "hi" | "ta" } })
      .then((r) => {
        if (!r.ok) {
          toast.error(r.error);
          tried.current.delete(key); // allow a retry on the next render
        } else if (r.remaining > 0) {
          tried.current.delete(key); // more items to translate — run again
        }
        qc.invalidateQueries({ queryKey: ["role", roleId, "items"] });
      })
      .finally(() => setTranslating(false));
  }, [needsTranslation, lang, roleId, untranslated, translate, qc]);

  const display = useCallback((i: KnowledgeItem) => displayItem(i, lang), [lang]);

  const score = useMemo(
    () =>
      completeness({
        items: list,
        inputDates: (inputs.data ?? []).map((i) => i.created_at),
        pendingChanges: changes.data?.length ?? 0,
      }),
    [list, inputs.data, changes.data],
  );

  if (role.isLoading) return <div className="min-h-screen"><AppHeader /><p className="p-6 text-muted-foreground">Loading…</p></div>;
  if (!role.data) return <div className="min-h-screen"><AppHeader /><p className="p-6">Role not found.</p></div>;
  const r = role.data;
  const dept = (r.departments as { name: string } | null)?.name;
  const co = r.companies as { name: string; is_sample: boolean } | null;
  const pending = changes.data?.length ?? 0;
  const selectedItem = list.find((i) => i.id === selected) ?? null;

  return (
    <div className="min-h-screen pb-16">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-5">
        <Link to="/app" search={{ c: r.company_id }} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> {co?.name}
        </Link>
        <div className="mt-3 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 sm:flex sm:gap-5">
          <div className="shrink-0"><ScoreRing value={score} size={76} /></div>
          <div className="min-w-0 flex-1">
            <p className="text-sm uppercase tracking-widest text-muted-foreground">{dept}</p>
            <h1 className="text-2xl sm:text-4xl">{r.title}</h1>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {r.holder_name ?? "No holder"}
              {r.status === "leaving" && <> · <span className="text-terracotta">leaving soon</span></>}
              {r.successor_name && <> · next: {r.successor_name}</>}
              {" · "}
              {score}% documented, based on the last 30 days
            </p>
          </div>
          {co?.is_sample && <Badge variant="outline" className="col-start-2 w-fit shrink-0 border-terracotta text-terracotta">Sample data</Badge>}
        </div>

        <div className="mt-6">
          <div role="tablist" aria-label="Role sections" className="grid w-full grid-cols-5 gap-1 rounded-lg bg-secondary p-1 sm:inline-flex sm:w-auto">
            {TABS.map((t) => (
              <button
                key={t.value}
                type="button"
                role="tab"
                id={`tab-${t.value}`}
                aria-selected={tab === t.value}
                aria-controls={`panel-${t.value}`}
                onClick={() => setTab(t.value)}
                className={cn(
                  "inline-flex min-h-11 min-w-0 items-center justify-center rounded-md px-1 py-1.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring sm:min-h-9 sm:px-3 sm:text-sm",
                  tab === t.value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t.label}
                {t.value === "review" && pending > 0 && <span className="ml-1 rounded-full bg-terracotta px-1.5 text-xs text-terracotta-foreground">{pending}</span>}
              </button>
            ))}
          </div>

          <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="mt-5">
            {tab === "map" && (
              <>
                <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:flex sm:justify-between sm:gap-3">
                  <div role="group" aria-label="View mode" className="inline-flex gap-1 rounded-lg border border-border bg-paper p-1">
                    {(
                      [
                        { v: "read", label: "Read", Icon: BookText },
                        { v: "visual", label: "Visual", Icon: Network },
                      ] as const
                    ).map(({ v, label, Icon }) => (
                      <button
                        key={v}
                        type="button"
                        aria-pressed={mode === v}
                        onClick={() => setMode(v)}
                        className={cn(
                          "inline-flex min-h-11 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring sm:min-h-9",
                          mode === v ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <Icon className="h-4 w-4" /> {label}
                      </button>
                    ))}
                  </div>
                  {translating && (
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" /> Translating…
                    </span>
                  )}
                </div>
                {list.length === 0 ? (
                  <div className="paper-card p-8 text-center">
                    <p className="font-display text-3xl">This map is empty</p>
                    <p className="mt-1 text-muted-foreground">Record a voice note or upload a file in Capture — the AI will start building the map.</p>
                  </div>
                ) : mode === "read" ? (
                  <div className="grid gap-5 md:grid-cols-2">
                    {KINDS.filter((k) => list.some((i) => i.kind === k)).map((k) => (
                      <section key={k} className="paper-card p-5" style={{ borderTop: `4px solid ${KIND_COLOR_VAR[k as Kind]}` }}>
                        <h2 className="text-2xl">{KIND_LABEL[k as Kind]}</h2>
                        <ul className="mt-3 divide-y divide-border">
                          {list
                            .filter((i) => i.kind === k)
                            .map((i) => {
                              const d = display(i);
                              return (
                                <li key={i.id}>
                                  <button onClick={() => setSelected(i.id)} className="w-full py-3 text-left hover:text-primary focus-visible:outline-2 focus-visible:outline-ring">
                                    <span className="flex items-start justify-between gap-2">
                                      <span className="min-w-0 font-medium">{d.title}</span>
                                      {d.cadence && <Badge variant="secondary" className="shrink-0">{d.cadence}</Badge>}
                                    </span>
                                    <span className="mt-0.5 line-clamp-2 block text-sm text-muted-foreground">{d.body}</span>
                                  </button>
                                </li>
                              );
                            })}
                        </ul>
                      </section>
                    ))}
                  </div>
                ) : (
                  <Suspense fallback={<div className="paper-card h-[60dvh] min-h-[320px] animate-pulse sm:h-[70dvh] sm:min-h-[480px]" />}>
                    <MapGraph roleTitle={r.title} items={list} links={items.data?.links ?? []} display={display} onSelect={setSelected} />
                  </Suspense>
                )}
              </>
            )}
            {tab === "capture" && <CapturePanel companyId={r.company_id} roleId={roleId} inputs={inputs.data ?? []} />}
            {tab === "review" && <ReviewPanel roleId={roleId} companyId={r.company_id} inputs={inputs.data ?? []} />}
            {tab === "ask" && <AskPanel roleId={roleId} roleTitle={r.title} items={list} lang={lang} onOpenItem={setSelected} />}
            {tab === "plan" && <PlanPanel roleId={roleId} lang={lang} sourceItems={list} plan={(r.onboarding_plan as OnboardingPlan | null) ?? null} onOpenItem={setSelected} />}
          </div>
        </div>
      </main>
      <ItemSheet item={selectedItem} inputs={inputs.data ?? []} lang={lang} open={!!selected} onOpenChange={(o) => !o && setSelected(null)} />
    </div>
  );
}
