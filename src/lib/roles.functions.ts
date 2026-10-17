import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { KINDS } from "./knowledge";
import { buildSample } from "./sample-data";

const LANG_NAME: Record<string, string> = { en: "English", ml: "Malayalam", hi: "Hindi", ta: "Tamil" };

function toBase64(buf: ArrayBuffer) {
  const bytes = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

function errMessage(e: unknown) {
  return e instanceof Error ? e.message : "Something went wrong.";
}

const extractionSchema = {
  type: "object",
  additionalProperties: false,
  required: ["detected_language", "original_text", "english_text", "items", "conflicts", "guide_title", "guide_steps"],
  properties: {
    detected_language: { type: "string", enum: ["en", "ml", "hi", "ta", "mixed", "other"] },
    original_text: { type: "string" },
    english_text: { type: "string" },
    items: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["kind", "title", "body", "original_quote", "cadence", "merge_with_id", "related_to"],
        properties: {
          kind: { type: "string", enum: KINDS.filter((k) => k !== "guide") },
          title: { type: "string" },
          body: { type: "string" },
          original_quote: { type: ["string", "null"] },
          cadence: { type: ["string", "null"] },
          merge_with_id: { type: ["string", "null"] },
          related_to: { type: "array", items: { type: "string" } },
        },
      },
    },
    conflicts: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["existing_item_id", "proposed_title", "proposed_body", "reason"],
        properties: {
          existing_item_id: { type: "string" },
          proposed_title: { type: "string" },
          proposed_body: { type: "string" },
          reason: { type: "string" },
        },
      },
    },
    guide_title: { type: ["string", "null"] },
    guide_steps: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["step", "frame_index"],
        properties: { step: { type: "string" }, frame_index: { type: ["integer", "null"] } },
      },
    },
  },
};

type Extraction = {
  detected_language: string;
  original_text: string;
  english_text: string;
  items: {
    kind: string;
    title: string;
    body: string;
    original_quote: string | null;
    cadence: string | null;
    merge_with_id: string | null;
    related_to: string[];
  }[];
  conflicts: { existing_item_id: string; proposed_title: string; proposed_body: string; reason: string }[];
  guide_title: string | null;
  guide_steps: { step: string; frame_index: number | null }[];
};

const EXTRACT_INSTRUCTIONS = `You map how a specific job role actually works inside an Indian SME, so the knowledge survives when the person leaves.
You receive one new input (voice transcript, typed note, document, chat export, email, or a screen/KT recording transcript with screenshots) plus the role's existing knowledge map.
Inputs may be in Malayalam, Hindi, Tamil, English, or code-mixed (Manglish/Hinglish). Understand them natively.

Return:
- detected_language, original_text (the input text as given, cleaned up but in its original language and script; for documents give a short faithful excerpt), english_text (faithful English translation/summary).
- items: concrete, reusable knowledge in ENGLISH. Kinds: responsibility, recurring_task (set cadence like "Monthly, before 10th"), decision (capture the judgment AND the reason why in body), contact (person/vendor/customer and when to contact them), tool, edge_case (exceptions, gotchas).
  * original_quote: the exact supporting phrase from the input in its original language, or null.
  * If an item is the same as an existing one, set merge_with_id to that existing id and keep wording short. Otherwise null.
  * related_to: ids of existing items or titles of other new items it connects to (e.g. a task uses a tool, a decision involves a contact).
  * Prefer 3-10 high-signal items. Skip chit-chat. Never invent facts not in the input.
- conflicts: ONLY when the input clearly contradicts an existing item (e.g. vendor switched, threshold changed). Give the existing id, the proposed updated title/body, and a one-line reason.
- guide_title/guide_steps: only for recordings or step-by-step procedures; numbered actionable steps, with frame_index pointing to the matching screenshot (0-based) when screenshots are given. Otherwise null and [].`;

export const processInput = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { inputId: string }) => z.object({ inputId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { respondJSON, transcribe } = await import("./ai.server");
    const { data: input, error } = await supabase.from("inputs").select("*").eq("id", data.inputId).single();
    if (error || !input) throw new Error("Input not found.");
    const setStatus = (patch: Record<string, unknown>) => supabase.from("inputs").update(patch as never).eq("id", input.id);

    try {
      let text = input.original_text ?? "";
      const content: Record<string, unknown>[] = [];

      if (input.storage_path && (input.kind === "voice" || input.kind === "recording")) {
        await setStatus({ status: "transcribing", error: null });
        const { data: blob, error: dlErr } = await supabase.storage.from("inputs").download(input.storage_path);
        if (dlErr || !blob) throw new Error("Could not read the recording.");
        const mime = input.mime_type || blob.type || "audio/webm";
        const ext = mime.includes("mp4") ? "mp4" : mime.includes("mpeg") ? "mp3" : mime.includes("wav") ? "wav" : mime.includes("ogg") ? "ogg" : mime.includes("m4a") ? "m4a" : "webm";
        const typed = new Blob([await blob.arrayBuffer()], { type: mime });
        const transcript = await transcribe(typed, `input.${ext}`);
        text = text ? `${text}\n\n${transcript}` : transcript;
        await setStatus({ original_text: text });
      }

      await setStatus({ status: "extracting", error: null });

      if (input.storage_path && input.kind === "file" && (input.mime_type ?? "").includes("pdf")) {
        const { data: blob } = await supabase.storage.from("inputs").download(input.storage_path);
        if (!blob) throw new Error("Could not read the PDF.");
        content.push({
          type: "input_file",
          filename: input.title || "document.pdf",
          file_data: `data:application/pdf;base64,${toBase64(await blob.arrayBuffer())}`,
        });
      }

      const frames: string[] = Array.isArray(input.frames) ? (input.frames as string[]) : [];
      for (const path of frames.slice(0, 8)) {
        const { data: blob } = await supabase.storage.from("inputs").download(path);
        if (blob) content.push({ type: "input_image", image_url: `data:image/jpeg;base64,${toBase64(await blob.arrayBuffer())}` });
      }

      if (!text.trim() && content.length === 0) throw new Error("This input has no readable content.");

      const { data: role } = await supabase.from("roles").select("title").eq("id", input.role_id).single();
      const { data: existing } = await supabase
        .from("knowledge_items")
        .select("id, kind, title, body")
        .eq("role_id", input.role_id)
        .eq("status", "active")
        .limit(200);

      const result = await respondJSON<Extraction>({
        instructions: EXTRACT_INSTRUCTIONS,
        schema: { name: "role_extraction", schema: extractionSchema },
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: `Role: ${role?.title ?? "Unknown"}\nInput type: ${input.kind}${input.title ? ` (${input.title})` : ""}\n\nEXISTING MAP:\n${JSON.stringify(existing ?? [])}\n\nNEW INPUT:\n${text.slice(0, 60000) || "(see attached file/screenshots)"}`,
              },
              ...content,
            ],
          },
        ],
      });

      const existingIds = new Set((existing ?? []).map((e) => e.id));
      const titleToId = new Map<string, string>();
      const now = new Date().toISOString();
      const created: { id: string; related: string[] }[] = [];

      for (const it of result.items) {
        if (it.merge_with_id && existingIds.has(it.merge_with_id)) {
          const { data: cur } = await supabase.from("knowledge_items").select("mentions").eq("id", it.merge_with_id).single();
          await supabase
            .from("knowledge_items")
            .update({ mentions: (cur?.mentions ?? 1) + 1, last_seen_at: now })
            .eq("id", it.merge_with_id);
          titleToId.set(it.title.toLowerCase(), it.merge_with_id);
          continue;
        }
        const { data: row } = await supabase
          .from("knowledge_items")
          .insert({
            company_id: input.company_id,
            role_id: input.role_id,
            kind: it.kind,
            title: it.title,
            body: it.body,
            original_quote: it.original_quote,
            cadence: it.cadence,
            source_input_id: input.id,
          })
          .select("id")
          .single();
        if (row) {
          titleToId.set(it.title.toLowerCase(), row.id);
          created.push({ id: row.id, related: it.related_to });
        }
      }

      if (result.guide_steps.length) {
        const media = result.guide_steps.map((s) => (s.frame_index != null ? frames[s.frame_index] ?? null : null));
        const body = result.guide_steps.map((s, i) => `${i + 1}. ${s.step}`).join("\n");
        await supabase.from("knowledge_items").insert({
          company_id: input.company_id,
          role_id: input.role_id,
          kind: "guide",
          title: result.guide_title || input.title || "Recorded procedure",
          body,
          source_input_id: input.id,
          media,
        });
      }

      const links: { company_id: string; role_id: string; from_item: string; to_item: string }[] = [];
      for (const c of created) {
        for (const r of c.related) {
          const target = existingIds.has(r) ? r : titleToId.get(r.toLowerCase());
          if (target && target !== c.id) links.push({ company_id: input.company_id, role_id: input.role_id, from_item: c.id, to_item: target });
        }
      }
      if (links.length) await supabase.from("knowledge_links").insert(links);

      const conflicts = result.conflicts.filter((c) => existingIds.has(c.existing_item_id));
      if (conflicts.length) {
        await supabase.from("change_requests").insert(
          conflicts.map((c) => ({
            company_id: input.company_id,
            role_id: input.role_id,
            existing_item_id: c.existing_item_id,
            proposed_title: c.proposed_title,
            proposed_body: c.proposed_body,
            reason: c.reason,
            source_input_id: input.id,
          })),
        );
      }

      await setStatus({
        status: "done",
        original_text: result.original_text || text,
        english_text: result.english_text,
        language: result.detected_language,
      });
      return { ok: true as const, added: created.length, conflicts: conflicts.length };
    } catch (e) {
      const message = errMessage(e);
      await setStatus({ status: "failed", error: message });
      return { ok: false as const, error: message };
    }
  });

export const askRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { roleId: string; question: string; language: string; history: { role: "user" | "assistant"; text: string }[] }) =>
    z
      .object({
        roleId: z.string().uuid(),
        question: z.string().min(1).max(2000),
        language: z.enum(["en", "ml", "hi", "ta"]),
        history: z.array(z.object({ role: z.enum(["user", "assistant"]), text: z.string().max(6000) })).max(12),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { respondJSON } = await import("./ai.server");
    const { supabase } = context;
    const { data: role } = await supabase.from("roles").select("title, holder_name").eq("id", data.roleId).single();
    if (!role) throw new Error("Role not found.");
    const { data: items } = await supabase
      .from("knowledge_items")
      .select("id, kind, title, body, cadence, original_quote")
      .eq("role_id", data.roleId)
      .eq("status", "active")
      .limit(300);
    try {
      const out = await respondJSON<{ answer: string; cited_ids: string[]; checklist: string[] }>({
        instructions: `You are "Ask the role": you answer a new hire's questions about the role "${role.title}"${role.holder_name ? ` (previously done by ${role.holder_name})` : ""}, using ONLY the role knowledge map provided.
Answer in ${LANG_NAME[data.language]} (use its native script). Keep names, amounts and tool names as-is.
Give exact, practical steps when relevant (markdown, short). Cite the ids of every item you used in cited_ids.
If the map does not cover the question, say so plainly and suggest asking the role-holder to record a note about it. Never invent facts.
checklist: 0-6 short action items the new hire can tick off (in the same language), or [] if not useful.`,
        schema: {
          name: "role_answer",
          schema: {
            type: "object",
            additionalProperties: false,
            required: ["answer", "cited_ids", "checklist"],
            properties: {
              answer: { type: "string" },
              cited_ids: { type: "array", items: { type: "string" } },
              checklist: { type: "array", items: { type: "string" } },
            },
          },
        },
        input: [
          { role: "user", content: [{ type: "input_text", text: `ROLE MAP:\n${JSON.stringify(items ?? [])}` }] },
          ...data.history.map((h) =>
            h.role === "user"
              ? { role: "user", content: [{ type: "input_text", text: h.text }] }
              : { role: "assistant", content: [{ type: "output_text", text: h.text }] },
          ),
          { role: "user", content: [{ type: "input_text", text: data.question }] },
        ],
      });
      const valid = new Set((items ?? []).map((i) => i.id));
      return { ok: true as const, ...out, cited_ids: out.cited_ids.filter((id) => valid.has(id)) };
    } catch (e) {
      return { ok: false as const, error: errMessage(e) };
    }
  });

export const translateItems = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { roleId: string; language: string }) =>
    z.object({ roleId: z.string().uuid(), language: z.enum(["ml", "hi", "ta"]) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { respondJSON } = await import("./ai.server");
    const { supabase } = context;
    const { data: items } = await supabase
      .from("knowledge_items")
      .select("id, title, body, cadence, translations")
      .eq("role_id", data.roleId);
    const todo = (items ?? []).filter((i) => !(i.translations as Record<string, unknown> | null)?.[data.language]).slice(0, 60);
    if (!todo.length) return { ok: true as const, translated: 0 };
    try {
      const out = await respondJSON<{ items: { id: string; title: string; body: string; cadence: string | null }[] }>({
        instructions: `Translate workplace knowledge items from English into natural, everyday ${LANG_NAME[data.language]} as an SME employee would speak it (native script). Keep names, amounts, product and software names (Tally, GST, etc.) unchanged. Keep markdown/numbering.`,
        schema: {
          name: "translations",
          schema: {
            type: "object",
            additionalProperties: false,
            required: ["items"],
            properties: {
              items: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["id", "title", "body", "cadence"],
                  properties: { id: { type: "string" }, title: { type: "string" }, body: { type: "string" }, cadence: { type: ["string", "null"] } },
                },
              },
            },
          },
        },
        input: [{ role: "user", content: [{ type: "input_text", text: JSON.stringify(todo.map(({ id, title, body, cadence }) => ({ id, title, body, cadence }))) }] }],
      });
      const byId = new Map(todo.map((t) => [t.id, t]));
      for (const t of out.items) {
        const orig = byId.get(t.id);
        if (!orig) continue;
        const translations = { ...((orig.translations as Record<string, unknown>) ?? {}), [data.language]: { title: t.title, body: t.body, cadence: t.cadence } };
        await supabase.from("knowledge_items").update({ translations }).eq("id", t.id);
      }
      return { ok: true as const, translated: out.items.length };
    } catch (e) {
      return { ok: false as const, error: errMessage(e) };
    }
  });

export type OnboardingPlan = {
  summary: string;
  weeks: { label: string; focus: string; tasks: { task: string; item_id: string | null }[] }[];
};

export const generatePlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { roleId: string }) => z.object({ roleId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { respondJSON } = await import("./ai.server");
    const { supabase } = context;
    const { data: role } = await supabase.from("roles").select("title").eq("id", data.roleId).single();
    const { data: items } = await supabase
      .from("knowledge_items")
      .select("id, kind, title, body, cadence")
      .eq("role_id", data.roleId)
      .eq("status", "active");
    if (!items?.length) return { ok: false as const, error: "Add a few logs first — the plan is built from the role map." };
    try {
      const plan = await respondJSON<OnboardingPlan>({
        instructions: `Create a realistic onboarding plan for a successor taking over the role "${role?.title}" at an Indian SME, using ONLY the role map. Three phases: "Week 1", "Week 2", "Month 1". Each with a one-line focus and 3-7 concrete tasks (meet contacts, shadow recurring tasks before their due dates, learn decisions/thresholds, practise tools, review edge cases). Link item_id to the map item a task comes from, or null. English, short.`,
        schema: {
          name: "onboarding_plan",
          schema: {
            type: "object",
            additionalProperties: false,
            required: ["summary", "weeks"],
            properties: {
              summary: { type: "string" },
              weeks: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["label", "focus", "tasks"],
                  properties: {
                    label: { type: "string" },
                    focus: { type: "string" },
                    tasks: {
                      type: "array",
                      items: {
                        type: "object",
                        additionalProperties: false,
                        required: ["task", "item_id"],
                        properties: { task: { type: "string" }, item_id: { type: ["string", "null"] } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        input: [{ role: "user", content: [{ type: "input_text", text: JSON.stringify(items) }] }],
      });
      await supabase.from("roles").update({ onboarding_plan: plan as never }).eq("id", data.roleId);
      return { ok: true as const, plan };
    } catch (e) {
      return { ok: false as const, error: errMessage(e) };
    }
  });

export const createSampleWorkspace = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const sample = buildSample();
    const { data: company, error } = await supabase
      .from("companies")
      .insert({ name: sample.company, created_by: userId, is_sample: true })
      .select("id")
      .single();
    if (error || !company) throw new Error(error?.message ?? "Could not create workspace");
    const cid = company.id;
    await supabase.from("company_members").insert({ company_id: cid, user_id: userId, member_role: "admin" });

    for (const dept of sample.departments) {
      const { data: d } = await supabase.from("departments").insert({ company_id: cid, name: dept.name }).select("id").single();
      if (!d) continue;
      for (const r of dept.roles) {
        const { data: role } = await supabase
          .from("roles")
          .insert({
            company_id: cid,
            department_id: d.id,
            title: r.title,
            holder_name: r.holder,
            successor_name: r.successor ?? null,
            status: r.status,
          })
          .select("id")
          .single();
        if (!role) continue;
        const inputIds: string[] = [];
        for (const inp of r.inputs) {
          const { data: row } = await supabase
            .from("inputs")
            .insert({
              company_id: cid,
              role_id: role.id,
              created_by: userId,
              kind: inp.kind,
              title: inp.title,
              language: inp.language,
              original_text: inp.original,
              english_text: inp.english,
              status: "done",
              is_sample: true,
              created_at: new Date(Date.now() - inp.daysAgo * 86400000).toISOString(),
            })
            .select("id")
            .single();
          inputIds.push(row?.id ?? "");
        }
        const itemIds: string[] = [];
        for (const it of r.items) {
          const { data: row } = await supabase
            .from("knowledge_items")
            .insert({
              company_id: cid,
              role_id: role.id,
              kind: it.kind,
              title: it.title,
              body: it.body,
              cadence: it.cadence ?? null,
              original_quote: it.quote ?? null,
              source_input_id: inputIds[it.src] || null,
              mentions: it.mentions ?? 1,
              is_sample: true,
            })
            .select("id")
            .single();
          itemIds.push(row?.id ?? "");
        }
        const links = r.links
          .filter(([a, b]) => itemIds[a] && itemIds[b])
          .map(([a, b]) => ({ company_id: cid, role_id: role.id, from_item: itemIds[a], to_item: itemIds[b] }));
        if (links.length) await supabase.from("knowledge_links").insert(links);
        for (const ch of r.changes) {
          await supabase.from("change_requests").insert({
            company_id: cid,
            role_id: role.id,
            existing_item_id: itemIds[ch.item],
            proposed_title: ch.title,
            proposed_body: ch.body,
            reason: ch.reason,
            source_input_id: inputIds[ch.src] || null,
            is_sample: true,
          });
        }
      }
    }
    return { companyId: cid };
  });
