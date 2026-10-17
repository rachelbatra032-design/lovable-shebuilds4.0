import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { KIND_COLOR_VAR, KIND_SINGULAR, type Kind, type LangCode } from "@/lib/knowledge";
import type { InputRow, KnowledgeItem } from "@/lib/queries";
import { signedUrl } from "@/lib/capture";
import { displayItem, LANG_LABEL } from "./display";
import { formatDistanceToNow } from "date-fns";

export function SourceBlock({ input }: { input: InputRow }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    if (input.storage_path) signedUrl(input.storage_path).then((u) => alive && setUrl(u));
    return () => {
      alive = false;
    };
  }, [input.storage_path]);
  const isAudio = input.kind === "voice";
  const isVideo = input.kind === "recording";
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="font-medium">{input.title || input.kind}</span>
        {input.language && <Badge variant="secondary">{LANG_LABEL[input.language] ?? input.language}</Badge>}
        {input.is_sample && <Badge variant="outline" className="border-terracotta text-terracotta">Sample data</Badge>}
        <span className="text-muted-foreground">{formatDistanceToNow(new Date(input.created_at), { addSuffix: true })}</span>
      </div>
      {url && isAudio && <audio controls src={url} className="mt-3 w-full" />}
      {url && isVideo && <video controls src={url} className="mt-3 w-full rounded-md" />}
      {url && input.kind === "file" && (
        <a href={url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-primary underline">
          Open original file
        </a>
      )}
      {input.original_text && (
        <blockquote className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap border-l-2 border-terracotta pl-3 text-[1.02rem]">{input.original_text}</blockquote>
      )}
      {input.english_text && input.language !== "en" && (
        <p className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap text-sm text-muted-foreground">
          <span className="font-medium">English: </span>
          {input.english_text}
        </p>
      )}
    </div>
  );
}

function GuideMedia({ media }: { media: (string | null)[] }) {
  const [urls, setUrls] = useState<(string | null)[]>([]);
  useEffect(() => {
    Promise.all(media.map((m) => (m ? signedUrl(m) : Promise.resolve(null)))).then(setUrls);
  }, [media]);
  return urls;
}

export function ItemSheet({
  item,
  inputs,
  lang,
  open,
  onOpenChange,
}: {
  item: KnowledgeItem | null;
  inputs: InputRow[];
  lang: LangCode;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const media = (item?.media as (string | null)[] | null) ?? [];
  const urls = GuideMedia({ media });
  if (!item) return null;
  const d = displayItem(item, lang);
  const source = inputs.find((i) => i.id === item.source_input_id);
  const steps = item.kind === "guide" ? d.body.split("\n").filter(Boolean) : null;
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: KIND_COLOR_VAR[item.kind as Kind] }}>
            {KIND_SINGULAR[item.kind as Kind]}
          </span>
          <SheetTitle className="font-display text-3xl font-normal leading-tight">{d.title}</SheetTitle>
          <SheetDescription className="sr-only">Details and source</SheetDescription>
        </SheetHeader>
        <div className="space-y-5 px-4 pb-8">
          {d.cadence && <Badge variant="secondary">{d.cadence}</Badge>}
          {steps ? (
            <ol className="space-y-4">
              {steps.map((s, i) => (
                <li key={i} className="space-y-2">
                  <p>{s}</p>
                  {urls[i] && <img src={urls[i]!} alt={`Screenshot for step ${i + 1}`} className="rounded-md border border-border" loading="lazy" />}
                </li>
              ))}
            </ol>
          ) : (
            <p className="whitespace-pre-wrap text-[1.05rem] leading-relaxed">{d.body}</p>
          )}
          {item.original_quote && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">In their words</p>
              <blockquote className="mt-1 border-l-2 border-terracotta pl-3 text-[1.05rem]">"{item.original_quote}"</blockquote>
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            Mentioned {item.mentions}× · last seen {formatDistanceToNow(new Date(item.last_seen_at), { addSuffix: true })}
          </p>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Source</p>
            {source ? <SourceBlock input={source} /> : <p className="text-sm text-muted-foreground">No source recorded.</p>}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
