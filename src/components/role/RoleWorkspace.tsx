import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, ArrowRight, BookText, Network, Loader2, Mic, MessageCircle, ListChecks, ClipboardCheck, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/AppHeader";
import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScoreRing } from "@/components/ScoreRing";
import { roleChangesQuery, roleInputsQuery, roleItemsQuery, roleQuery, type KnowledgeItem } from "@/lib/queries";
import { completeness, KINDS, KIND_LABEL, type Kind } from "@/lib/knowledge";
import { useLang } from "@/lib/use-lang";
import { translateItems, type OnboardingPlan } from "@/lib/roles.functions";
import { displayItem } from "./display";
import { ItemSheet } from "./ItemSheet";
import { CapturePanel } from "./CapturePanel";
import { ReviewPanel } from "./ReviewPanel";
import { AskPanel } from "./AskPanel";
import { PlanPanel } from "./PlanPanel";
import { AgentsPanel } from "./AgentsPanel";
import { isItemTranslation } from "@/lib/translation";

const TABS = [
  { value: "map", label: "Map", icon: BookText },
  { value: "capture", label: "Capture", icon: Mic },
  { value: "review", label: "Review", icon: ClipboardCheck },
  { value: "ask", label: "Ask", icon: MessageCircle },
  { value: "plan", label: "Plan", icon: ListChecks },
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
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [translationRetry, setTranslationRetry] = useState(0);
  const translationInFlight = useRef(false);
  const blockedTranslations = useRef(new Set<string>());
  const translate = useServerFn(translateItems);
  const tried = useRef(new Set<string>());
  const panelRef = useRef<HTMLDivElement>(null);

  function switchPanel(value: string) {
    setTab(value);
    if (window.matchMedia("(max-width: 639px)").matches) {
      requestAnimationFrame(() => panelRef.current?.scrollIntoView({ block: "start" }));
    }
  }

  const list = items.data?.items ?? [];
  const untranslated = lang === "en" ? 0 : list.filter((i) => !isItemTranslation((i.translations as Record<string, unknown>)?.[lang])).length;
  const needsTranslation = untranslated > 0;

  useEffect(() => {
    const key = `${roleId}-${lang}-${translationRetry}-${untranslated}`;
    if (!needsTranslation || tried.current.has(key) || translationInFlight.current || blockedTranslations.current.has(`${roleId}-${lang}`)) return;
    tried.current.add(key);
    translationInFlight.current = true;
    setTranslationError(null);
    setTranslating(true);
    translate({ data: { roleId, language: lang as "ml" | "hi" | "ta" } })
      .then((r) => {
        if (!r.ok) {
          blockedTranslations.current.add(`${roleId}-${lang}`);
          toast.error(r.error);
          setTranslationError(r.error);
        } else if (r.remaining > 0 && r.translated > 0) {
          tried.current.delete(key); // more items to translate: run again
        }
        return qc.invalidateQueries({ queryKey: ["role", roleId, "items"] });
      })
      .catch((error: unknown) => {
        blockedTranslations.current.add(`${roleId}-${lang}`);
        const message = error instanceof Error ? error.message : "Translation failed. Please retry.";
        setTranslationError(message);
        toast.error(message);
      })
      .finally(() => { translationInFlight.current = false; setTranslating(false); });
  }, [needsTranslation, lang, roleId, untranslated, translationRetry, translating, translate, qc]);

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
    <div className="min-h-screen pb-[calc(6rem+env(safe-area-inset-bottom))] sm:pb-16">
      <AppHeader />
      <div className="workspace-shell mx-auto max-w-[1440px] lg:grid lg:grid-cols-[224px_minmax(0,1fr)]">
        <aside className="workspace-rail lg:sticky lg:top-[65px] lg:h-[calc(100dvh-65px)] lg:overflow-y-auto lg:border-r lg:border-border lg:bg-sidebar lg:px-4 lg:py-7">
          <div className="hidden lg:block">
            <Button asChild variant="outline" className="w-full justify-start bg-card"><Link to="/app" search={{ c: r.company_id }}><ArrowLeft /> All roles</Link></Button>
            <div className="mt-7 border-t border-border pt-6">
              <p className="editorial-label">Current handover</p>
              <p className="mt-3 text-lg font-semibold leading-snug">{r.title}</p>
              <p className="mt-2 text-xs text-muted-foreground">{dept}</p>
            </div>
          </div>
          <div className="lg:mt-6">          <div role="tablist" aria-label="Role sections" className="mobile-workspace-nav fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 gap-1 border-t border-border bg-background px-2 pt-1 pb-[calc(0.25rem+env(safe-area-inset-bottom))] sm:static sm:flex sm:w-full sm:border-t-0 sm:border-b sm:px-0 sm:py-0 lg:grid lg:grid-cols-1 lg:gap-1 lg:border-0">
            {TABS.map((t) => (
              <Button
                key={t.value}
                type="button"
                role="tab"
                id={`tab-${t.value}`}
                aria-selected={tab === t.value}
                aria-controls={`panel-${t.value}`}
                variant="ghost"
                onClick={() => switchPanel(t.value)}
                className={cn(
                  "relative h-14 min-w-0 flex-col gap-1 rounded-md border-b-2 px-1 py-2 text-[11px] font-medium sm:h-11 sm:flex-row sm:rounded-none sm:px-5 sm:text-sm lg:justify-start lg:gap-3 lg:rounded-md lg:border-0 lg:px-3",
                  tab === t.value ? "border-transparent bg-muted text-foreground sm:border-foreground sm:bg-transparent lg:bg-sidebar-accent" : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                <t.icon className="h-4 w-4 sm:hidden lg:block" aria-hidden="true" />
                {t.label}
                {t.value === "review" && pending > 0 && <span className="absolute top-1 right-2 rounded-full bg-primary px-1 text-[10px] text-primary-foreground sm:static sm:ml-1">{pending}</span>}
              </Button>
            ))}
          </div></div>
          <div className="mt-8 hidden border-t border-border pt-5 lg:block">
            <div className="flex items-center gap-3"><ScoreRing value={score} size={40} /><div><p className="text-xs font-medium">Documented</p><p className="mt-1 text-xs text-muted-foreground">{list.length} recorded items</p></div></div>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{co?.name}</p>
          </div>
        </aside>
        <main className="min-w-0 px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
        <Link to="/app" search={{ c: r.company_id }} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> {co?.name}
        </Link>
        <div className="mt-6 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 border-b border-border pb-6">
          <div className="min-w-0 flex-1">
            <p className="mb-3 text-xs font-medium uppercase text-muted-foreground">{dept} / {r.title}</p>
            <h1 className="text-3xl font-medium sm:text-4xl">{tab === "map" ? "Role knowledge" : tab === "capture" ? "Capture the context" : tab === "review" ? "Review changes" : tab === "ask" ? "Ask the role" : "Onboarding"}</h1>
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-3 text-sm">
              <div><p className="text-xs text-muted-foreground">{r.status === "leaving" ? "Handing over" : "Role-holder"}</p><p className="mt-1 font-medium">{r.holder_name ?? "No holder"}</p></div>
              {r.successor_name && <><ArrowRight className="h-5 w-5 text-muted-foreground" aria-hidden="true" /><div><p className="text-xs text-muted-foreground">Taking over</p><p className="mt-1 font-medium">{r.successor_name}</p></div></>}
            </div>
          </div>
          <div className="flex flex-col items-center gap-2 lg:hidden"><ScoreRing value={score} size={64} /><span className="text-xs text-muted-foreground">Documented</span></div>
          <div className="col-span-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {co?.is_sample && <Badge variant="outline">Sample data</Badge>}
            <span>{list.length} recorded items · Based on the last 30 days</span>
            <AgentsPanel roleId={roleId} companyId={r.company_id} language={lang} items={list} plan={(r.onboarding_plan as OnboardingPlan | null) ?? null} />
          </div>
        </div>

        <div className="mt-6">
          {translationError && needsTranslation && <div role="alert" className="mb-4 flex flex-wrap items-center gap-3 text-sm"><span>{translationError}</span><Button variant="outline" size="sm" onClick={() => { blockedTranslations.current.delete(`${roleId}-${lang}`); setTranslationRetry(n => n + 1); }}>Retry translation</Button></div>}


          <div ref={panelRef} role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="mt-5 scroll-mt-24">
            {tab === "map" && (
              <>
                <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:flex sm:justify-between sm:gap-3">
                  <div role="group" aria-label="View mode" className="inline-flex gap-1 rounded-md border border-border bg-card p-1">
                    {(
                      [
                        { v: "read", label: "Read", Icon: BookText },
                        { v: "visual", label: "Visual", Icon: Network },
                      ] as const
                    ).map(({ v, label, Icon }) => (
                      <Button
                        variant="ghost"
                        key={v}
                        type="button"
                        aria-pressed={mode === v}
                        onClick={() => setMode(v)}
                        className={cn(
                          "inline-flex min-h-11 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring sm:min-h-9",
                          mode === v ? "bg-sidebar-accent text-foreground" : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <Icon className="h-4 w-4" /> {label}
                      </Button>
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
                    <p className="mt-1 text-muted-foreground">Record a voice note or upload a file in Capture: the AI will start building the map.</p>
                  </div>
                ) : mode === "read" ? (
                  <div className="grid gap-8 xl:grid-cols-2">
                    {KINDS.filter((k) => list.some((i) => i.kind === k)).map((k, sectionIndex) => (
                      <section key={k} className={cn("min-w-0 border-t border-border py-5", k === "decision" && "xl:col-span-2")}>
                        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                          <div className="flex min-w-0 items-baseline gap-3"><span className="text-xs tabular-nums text-muted-foreground">{String(sectionIndex + 1).padStart(2, "0")}</span><h2 className="min-w-0 text-xl sm:text-2xl">{KIND_LABEL[k as Kind]}</h2></div>
                          <span className="text-xs tabular-nums text-muted-foreground">{list.filter((i) => i.kind === k).length}</span>
                        </div>
                        <ul className="mt-3 divide-y divide-border">
                          {list
                            .filter((i) => i.kind === k)
                            .map((i) => {
                              const d = display(i);
                              return (
                                <li key={i.id}>
                                  <Button variant="ghost" onClick={() => setSelected(i.id)} className="h-auto w-full flex-col items-stretch gap-1 whitespace-normal px-0 py-4 text-left hover:bg-transparent focus-visible:outline-2 focus-visible:outline-ring">
                                    <span className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                                      <span className="min-w-0 font-medium">{d.title}</span>
                                      <ChevronRight className="mt-0.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                                    </span>
                                    {d.cadence && <span className="text-xs font-normal text-muted-foreground">{d.cadence}</span>}
                                    {k === "decision" ? (
                                      <span className="block max-w-3xl text-sm font-normal leading-relaxed text-foreground">{d.body.split(/(?<=[.!?।])\s+/)[0]}</span>
                                    ) : <span className="line-clamp-2 block text-sm font-normal leading-relaxed text-muted-foreground">{d.body}</span>}
                                  </Button>
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
      </div>
      <ItemSheet item={selectedItem} inputs={inputs.data ?? []} lang={lang} open={!!selected} onOpenChange={(o) => !o && setSelected(null)} />
    </div>
  );
}
