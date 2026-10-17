import { createParser } from "eventsource-parser";

const GATEWAY = "https://ai.gateway.lovable.dev";
export const CHAT_MODEL = "openai/gpt-6-astra";
export const STT_MODEL = "openai/gpt-transcribe";

export class AiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function apiKey() {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new AiError(401, "AI is not configured for this app.");
  return key;
}

async function readError(res: Response) {
  const text = await res.text().catch(() => "");
  try {
    const j = JSON.parse(text);
    return j?.error?.message || j?.message || text || res.statusText;
  } catch {
    return text || res.statusText;
  }
}

function friendly(status: number, msg: string) {
  if (status === 402) return `AI credits are used up. ${msg}`;
  if (status === 429) return "The AI is busy right now. Please try again in a minute.";
  return msg;
}

async function consumeSSE(res: Response, onEvent: (event: string | undefined, data: string) => void) {
  if (!res.body) throw new AiError(502, "Empty AI response.");
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  const parser = createParser({ onEvent: (e) => onEvent(e.event, e.data) });
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    parser.feed(decoder.decode(value, { stream: true }));
  }
}

/** Streams a Responses call and returns the final output text. */
export async function respond(opts: {
  instructions: string;
  input: unknown[];
  schema?: { name: string; schema: Record<string, unknown> };
  effort?: "low" | "medium";
}): Promise<string> {
  const res = await fetch(`${GATEWAY}/v1/responses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey(),
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: CHAT_MODEL,
      instructions: opts.instructions,
      input: opts.input,
      stream: true,
      store: false,
      reasoning: { effort: opts.effort ?? "low", summary: "auto" },
      include: ["reasoning.encrypted_content"],
      ...(opts.schema
        ? { text: { format: { type: "json_schema", name: opts.schema.name, strict: true, schema: opts.schema.schema } } }
        : {}),
    }),
  });
  if (!res.ok) {
    const msg = await readError(res);
    throw new AiError(res.status, friendly(res.status, msg));
  }
  let text = "";
  let doneText: string | null = null;
  let failure: string | null = null;
  await consumeSSE(res, (_event, data) => {
    if (data === "[DONE]") return;
    let j: any;
    try {
      j = JSON.parse(data);
    } catch {
      return;
    }
    if (j.type === "response.output_text.delta") text += j.delta ?? "";
    else if (j.type === "response.output_text.done") doneText = (doneText ?? "") + (j.text ?? "");
    else if (j.type === "response.failed" || j.type === "error")
      failure = j.response?.error?.message || j.error?.message || j.message || "AI request failed.";
    else if (j.type === "response.refusal.done") failure = "The AI declined to process this input.";
  });
  if (failure) throw new AiError(502, failure);
  const out = (doneText ?? text).trim();
  if (!out) throw new AiError(502, "The AI returned an empty answer.");
  return out;
}

export async function respondJSON<T>(opts: Parameters<typeof respond>[0] & { schema: { name: string; schema: Record<string, unknown> } }): Promise<T> {
  const out = await respond(opts);
  try {
    return JSON.parse(out) as T;
  } catch {
    throw new AiError(502, "The AI returned an unreadable answer.");
  }
}

/** Transcribe audio in its original language. */
export async function transcribe(blob: Blob, filename: string): Promise<string> {
  if (!blob.size) throw new AiError(400, "The recording is empty.");
  if (blob.size > 25 * 1024 * 1024) throw new AiError(400, "Recording is too large (max 25 MB).");
  const form = new FormData();
  form.append("model", STT_MODEL);
  form.append("file", blob, filename);
  form.append("response_format", "json");
  form.append("stream", "true");
  form.append("prompt", "Workplace voice note from an Indian SME employee. May be Malayalam, Hindi, Tamil, English or code-mixed (Manglish, Hinglish). Transcribe in the original script and language.");
  const res = await fetch(`${GATEWAY}/v1/audio/transcriptions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey()}` },
    body: form,
  });
  if (!res.ok) {
    const msg = await readError(res);
    throw new AiError(res.status, friendly(res.status, msg));
  }
  let text = "";
  let final: string | null = null;
  let failure: string | null = null;
  await consumeSSE(res, (_e, data) => {
    let j: any;
    try {
      j = JSON.parse(data);
    } catch {
      return;
    }
    if (j.type === "transcript.text.delta") text += j.delta ?? "";
    else if (j.type === "transcript.text.done") final = j.text ?? "";
    else if (j.type === "error") failure = j.error?.message || j.message || "Transcription failed.";
  });
  if (failure) throw new AiError(502, failure);
  const out = (final ?? text).trim();
  if (!out) throw new AiError(422, "No speech was detected in the recording.");
  return out;
}
