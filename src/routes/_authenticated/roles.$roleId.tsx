import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, BookText, Network, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/AppHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Badge } from "@/components/ui/badge";
import { ScoreRing } from "@/components/ScoreRing";
import { roleChangesQuery, roleInputsQuery, roleItemsQuery, roleQuery, type KnowledgeItem } from "@/lib/queries";
import { completeness, KINDS, KIND_COLOR_VAR, KIND_LABEL, type Kind } from "@/lib/knowledge";
import { useLang } from "@/lib/use-lang";
import { translateItems, type OnboardingPlan } from "@/lib/roles.functions";
import { displayItem } from "@/components/role/display";
import { ItemSheet } from "@/components/role/ItemSheet";
import { CapturePanel } from "@/components/role/CapturePanel";
import { ReviewPanel } from "@/components/role/ReviewPanel";
import { AskPanel } from "@/components/role/AskPanel";
import { PlanPanel } from "@/components/role/PlanPanel";

const MapGraph = lazy(() => import("@/components/role/MapGraph"));

export const Route = createFileRoute("/_authenticated/roles/$roleId")({
  head: () => ({
    meta: [
      { title: "Role map — Kaimaaral" },
      { name: "description", content: "How this role works: tasks, decisions, people, tools and edge cases." },
      { property: "og:title", content: "Role map — Kaimaaral" },
      { property: "og:description", content: "How this role works: tasks, decisions, people, tools and edge cases." },
    ],
  }),
  component: RolePage,
});

function RolePage() {
  const { roleId } = Route.useParams();
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
  const needsTranslation = lang !== "en" && list.some((i) => !(i.translations as Record<string, unknown>)?.[lang]);

  useEffect(() => {
    const key = `${roleId}-${lang}-${list.length}`;
    if (!needsTranslation || tried.current.has(key)) return;
    tried.current.add(key);
    setTranslating(true);
    translate({ data: { roleId, language: lang as "ml" | "hi" | "ta" } })
      .then((r) => {
        if (!r.ok) toast.error(r.error);
        qc.invalidateQueries({ queryKey: ["role", roleId, "items"] });
      })
      .finally(() => setTranslating(false));
  }, [needsTranslation, lang, roleId, list.length, translate, qc]);

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
        <div className="mt-3 flex flex-wrap items-center gap-5">
          <ScoreRing value={score} size={76} />
          <div className="min-w-0 flex-1">
            <p className="text-sm uppercase tracking-widest text-muted-foreground">{dept}</p>
            <h1 className="text-4xl sm:text-5xl">{r.title}</h1>
            <p className="text-muted-foreground">
              {r.holder_name ?? "No holder"}
              {r.status === "leaving" && <> · <span className="text-terracotta">leaving soon</span></>}
              {r.successor_name && <> · next: {r.successor_name}</>}
              {" · "}
              {score}% documented, based on the last 30 days
            </p>
          </div>
          {co?.is_sample && <Badge variant="outline" className="border-terracotta text-terracotta">Sample data</Badge>}
        </div>

        <Tabs value={tab} onValueChange={setTab} className="mt-6">
          <TabsList className="h-auto w-full flex-wrap justify-start gap-1 bg-secondary p-1 sm:w-auto">
            <TabsTrigger value="map">Map</TabsTrigger>
            <TabsTrigger value="capture">Capture</TabsTrigger>
            <TabsTrigger value="review">
              Review {pending > 0 && <span className="ml-1 rounded-full bg-terracotta px-1.5 text-xs text-terracotta-foreground">{pending}</span>}
            </TabsTrigger>
            <TabsTrigger value="ask">Ask</TabsTrigger>
            <TabsTrigger value="plan">Plan</TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="mt-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <ToggleGroup type="single" value={mode} onValueChange={(v) => v && setMode(v as "read" | "visual")} className="rounded-lg border border-border bg-paper p-1" aria-label="View mode">
                <ToggleGroupItem value="read" className="gap-1.5 px-3">
                  <BookText className="h-4 w-4" /> Read
                </ToggleGroupItem>
                <ToggleGroupItem value="visual" className="gap-1.5 px-3">
                  <Network className="h-4 w-4" /> Visual
                </ToggleGroupItem>
              </ToggleGroup>
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
                                  <span className="font-medium">{d.title}</span>
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
              <Suspense fallback={<div className="paper-card h-[70vh] animate-pulse" />}>
                <MapGraph roleTitle={r.title} items={list} links={items.data?.links ?? []} display={display} onSelect={setSelected} />
              </Suspense>
            )}
          </TabsContent>

          <TabsContent value="capture" className="mt-5">
            <CapturePanel companyId={r.company_id} roleId={roleId} inputs={inputs.data ?? []} />
          </TabsContent>
          <TabsContent value="review" className="mt-5">
            <ReviewPanel roleId={roleId} companyId={r.company_id} inputs={inputs.data ?? []} />
          </TabsContent>
          <TabsContent value="ask" className="mt-5">
            <AskPanel roleId={roleId} roleTitle={r.title} items={list} lang={lang} onOpenItem={setSelected} />
          </TabsContent>
          <TabsContent value="plan" className="mt-5">
            <PlanPanel roleId={roleId} plan={(r.onboarding_plan as OnboardingPlan | null) ?? null} onOpenItem={setSelected} />
          </TabsContent>
        </Tabs>
      </main>
      <ItemSheet item={selectedItem} inputs={inputs.data ?? []} lang={lang} open={!!selected} onOpenChange={(o) => !o && setSelected(null)} />
    </div>
  );
}
