import { useRef, useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { askRole } from "@/lib/roles.functions";
import type { KnowledgeItem } from "@/lib/queries";
import type { LangCode } from "@/lib/knowledge";
import { displayItem } from "./display";

type Msg = { role: "user" | "assistant"; text: string; cited?: string[]; checklist?: string[]; error?: boolean };

const SUGGESTIONS = ["How do I pay a new vendor?", "What do I need to do before the 10th of every month?", "Who should I call if something goes wrong with the bank?"];

function Markdownish({ text }: { text: string }) {
  return (
    <div className="space-y-2 leading-relaxed">
      {text.split(/\n{2,}/).map((block, i) => {
        const lines = block.split("\n");
        if (lines.every((l) => /^\s*([-*]|\d+\.)\s/.test(l)))
          return (
            <ul key={i} className="ml-5 list-disc space-y-1">
              {lines.map((l, j) => (
                <li key={j}>{l.replace(/^\s*([-*]|\d+\.)\s/, "").replace(/\*\*/g, "")}</li>
              ))}
            </ul>
          );
        return (
          <p key={i} className="whitespace-pre-wrap">
            {block.replace(/\*\*/g, "")}
          </p>
        );
      })}
    </div>
  );
}

export function AskPanel({ roleId, roleTitle, items, lang, onOpenItem }: { roleId: string; roleTitle: string; items: KnowledgeItem[]; lang: LangCode; onOpenItem: (id: string) => void }) {
  const ask = useServerFn(askRole);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [msgs]);

  async function send(question: string) {
    if (!question.trim() || busy) return;
    const history = msgs.filter((m) => !m.error).slice(-8).map((m) => ({ role: m.role, text: m.text }));
    setMsgs((m) => [...m, { role: "user", text: question }]);
    setQ("");
    setBusy(true);
    try {
      const res = await ask({ data: { roleId, question, language: lang, history } });
      if (res.ok) setMsgs((m) => [...m, { role: "assistant", text: res.answer, cited: res.cited_ids, checklist: res.checklist }]);
      else setMsgs((m) => [...m, { role: "assistant", text: res.error, error: true }]);
    } catch (e) {
      setMsgs((m) => [...m, { role: "assistant", text: e instanceof Error ? e.message : "Something went wrong", error: true }]);
    } finally {
      setBusy(false);
    }
  }

  const byId = new Map(items.map((i) => [i.id, i]));

  return (
    <div className="mx-auto flex h-[65dvh] min-h-[360px] max-h-[800px] max-w-3xl flex-col">
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-4 sm:p-5" aria-live="polite">
        {msgs.length === 0 && (
          <div className="py-10 text-center sm:py-16">
            <p className="font-display text-2xl sm:text-3xl">Ask the {roleTitle}</p>
            <p className="mt-2 text-sm text-muted-foreground">Grounded in this role’s recorded knowledge.</p>
            <div className="mt-6 grid gap-1 text-left sm:mx-auto sm:max-w-lg">
              {SUGGESTIONS.map((s) => (
                <Button key={s} variant="ghost" size="sm" className="h-auto justify-start whitespace-normal py-3 text-left text-muted-foreground" onClick={() => send(s)}>
                  {s}
                </Button>
              ))}
            </div>
          </div>
        )}
        {msgs.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="ml-auto w-fit max-w-[85%] rounded-lg bg-secondary px-4 py-2.5 text-foreground">
              {m.text}
            </div>
          ) : (
            <div key={i} className="max-w-[95%]">
              {m.error ? (
                <p className="rounded-md bg-destructive/10 p-3 text-destructive">{m.text}</p>
              ) : (
                <>
                  <Markdownish text={m.text} />
                  {!!m.checklist?.length && (
                    <ul className="mt-3 space-y-2 rounded-lg bg-secondary p-3">
                      {m.checklist.map((c, j) => (
                        <li key={j} className="flex items-start gap-2">
                          <Checkbox id={`c-${i}-${j}`} className="mt-1" />
                          <label htmlFor={`c-${i}-${j}`}>{c}</label>
                        </li>
                      ))}
                    </ul>
                  )}
                  {!!m.cited?.length && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="text-xs uppercase tracking-widest text-muted-foreground">Sources</span>
                      {m.cited.map((id) => {
                        const it = byId.get(id);
                        return it ? (
                          <button key={id} onClick={() => onOpenItem(id)} className="max-w-full rounded-full border border-border bg-background px-2.5 py-0.5 text-left text-xs hover:border-primary">
                            {displayItem(it, lang).title}
                          </button>
                        ) : null;
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          ),
        )}
        {busy && (
          <p className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Looking through the role map…
          </p>
        )}
        <div ref={endRef} />
      </div>
      <form
        className="grid shrink-0 grid-cols-[minmax(0,1fr)_auto] items-end gap-2 rounded-lg border border-border bg-muted p-3"
        onSubmit={(e) => {
          e.preventDefault();
          send(q);
        }}
      >
        <Textarea
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(q);
            }
          }}
          placeholder="Ask anything about this role…"
          className="min-h-11 flex-1 resize-none border-0 bg-transparent text-base shadow-none focus-visible:ring-0"
          rows={1}
          aria-label="Your question"
        />
        <Button type="submit" size="icon" disabled={busy || !q.trim()} aria-label="Send">
          <ArrowUp />
        </Button>
      </form>
    </div>
  );
}
