import { useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { roleChangesQuery, type InputRow } from "@/lib/queries";
import { SourceBlock } from "./ItemSheet";

export function ReviewPanel({ roleId, companyId, inputs }: { roleId: string; companyId: string; inputs: InputRow[] }) {
  const qc = useQueryClient();
  const q = useQuery(roleChangesQuery(roleId));

  async function resolve(id: string, itemId: string | null, accept: boolean, title: string, body: string) {
    if (accept && itemId) {
      const { error } = await supabase.from("knowledge_items").update({ title, body, translations: {}, last_seen_at: new Date().toISOString() }).eq("id", itemId);
      if (error) return toast.error(error.message);
    }
    await supabase.from("change_requests").update({ status: accept ? "confirmed" : "rejected" }).eq("id", id);
    toast.success(accept ? "Map updated" : "Kept the old version");
    qc.invalidateQueries({ queryKey: ["role", roleId] });
    qc.invalidateQueries({ queryKey: ["company", companyId] });
  }

  const list = q.data ?? [];
  if (!list.length)
    return (
      <div className="paper-card p-8 text-center">
        <p className="font-display text-3xl">All up to date</p>
        <p className="mt-1 text-muted-foreground">When a new note contradicts the map, it will show up here for a one-tap check.</p>
      </div>
    );

  return (
    <div className="space-y-4">
      {list.map((c) => {
        const old = c.knowledge_items as { title: string; body: string } | null;
        const src = inputs.find((i) => i.id === c.source_input_id);
        return (
          <article key={c.id} className="paper-card p-5">
            <div className="flex items-center gap-2">
              <p className="font-display text-2xl">Did this change?</p>
              {c.is_sample && <Badge variant="outline" className="border-terracotta text-terracotta">Sample data</Badge>}
            </div>
            <p className="mt-1 text-muted-foreground">{c.reason}</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-border p-4 opacity-80">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Before</p>
                <p className="mt-1 font-medium line-through decoration-destructive/60">{old?.title}</p>
                <p className="text-sm text-muted-foreground">{old?.body}</p>
              </div>
              <div className="rounded-lg border-2 border-primary p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">Now</p>
                <p className="mt-1 font-medium">{c.proposed_title}</p>
                <p className="text-sm">{c.proposed_body}</p>
              </div>
            </div>
            {src && (
              <details className="mt-3">
                <summary className="cursor-pointer text-sm text-primary">See the source</summary>
                <div className="mt-2">
                  <SourceBlock input={src} />
                </div>
              </details>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button onClick={() => resolve(c.id, c.existing_item_id, true, c.proposed_title, c.proposed_body)}>
                <Check /> Confirm change
              </Button>
              <Button variant="outline" onClick={() => resolve(c.id, c.existing_item_id, false, "", "")}>
                <X /> Keep old
              </Button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
