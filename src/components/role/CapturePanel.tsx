import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Mic, Square, Upload, MonitorUp, Send, RotateCw, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { createInput, extractFrames, extractText, type CaptureKind } from "@/lib/capture";
import { processInput } from "@/lib/roles.functions";
import type { InputRow } from "@/lib/queries";
import { formatDistanceToNow } from "date-fns";
import { LANG_LABEL } from "./display";

const STATUS: Record<string, string> = {
  queued: "Queued",
  transcribing: "Transcribing",
  extracting: "Adding to map",
  done: "Added to map",
  failed: "Failed",
};

function pickMime(video = false) {
  const opts = video ? ["video/webm;codecs=vp9,opus", "video/webm", "video/mp4"] : ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"];
  return opts.find((m) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(m)) ?? "";
}

export function CapturePanel({ companyId, roleId, inputs }: { companyId: string; roleId: string; inputs: InputRow[] }) {
  const qc = useQueryClient();
  const process = useServerFn(processInput);
  const [recording, setRecording] = useState<null | "voice" | "screen">(null);
  const [seconds, setSeconds] = useState(0);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const streams = useRef<MediaStream[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!recording) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [recording]);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["role", roleId] });
    qc.invalidateQueries({ queryKey: ["company", companyId] });
  };

  async function run(opts: Parameters<typeof createInput>[0]) {
    setBusy(true);
    try {
      const id = await createInput(opts);
      refresh();
      toast("Saved. Reading it now…");
      const res = await process({ data: { inputId: id } });
      if (res.ok) toast.success(`Added ${res.added} item${res.added === 1 ? "" : "s"} to the map${res.conflicts ? ` · ${res.conflicts} change to review` : ""}`);
      else toast.error(res.error);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save");
    } finally {
      setBusy(false);
      refresh();
    }
  }

  async function retry(id: string) {
    toast("Retrying…");
    const res = await process({ data: { inputId: id } });
    if (res.ok) toast.success("Added to the map");
    else toast.error(res.error);
    refresh();
  }

  async function start(kind: "voice" | "screen") {
    try {
      let stream: MediaStream;
      if (kind === "voice") {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streams.current = [stream];
      } else {
        const display = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        let mic: MediaStream | null = null;
        try {
          mic = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch {
          /* narration optional */
        }
        streams.current = [display, ...(mic ? [mic] : [])];
        const ctx = new AudioContext();
        const dest = ctx.createMediaStreamDestination();
        for (const s of streams.current) if (s.getAudioTracks().length) ctx.createMediaStreamSource(s).connect(dest);
        stream = new MediaStream([...display.getVideoTracks(), ...dest.stream.getAudioTracks()]);
        const vt = display.getVideoTracks()[0];
        if (vt) vt.onended = () => stop();
      }
      const mime = pickMime(kind === "screen");
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunks.current = [];
      rec.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
      rec.onstop = async () => {
        streams.current.forEach((s) => s.getTracks().forEach((t) => t.stop()));
        const type = (rec.mimeType || mime || (kind === "voice" ? "audio/webm" : "video/webm")).split(";")[0] ?? "audio/webm";
        const blob = new Blob(chunks.current, { type: kind === "voice" ? type.replace("video/", "audio/") : type });
        if (kind === "voice") {
          await run({ companyId, roleId, kind: "voice", title: `Voice note · ${new Date().toLocaleDateString()}`, file: blob });
        } else {
          const frames = await extractFrames(blob);
          await run({ companyId, roleId, kind: "recording", title: `Screen recording · ${new Date().toLocaleDateString()}`, file: blob, frames });
        }
      };
      rec.start(1000);
      recRef.current = rec;
      setSeconds(0);
      setRecording(kind);
    } catch {
      toast.error(kind === "voice" ? "Microphone access is needed to record." : "Screen recording was cancelled or isn't supported in this browser.");
    }
  }

  function stop() {
    recRef.current?.state === "recording" && recRef.current.stop();
    setRecording(null);
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (f.size > 25 * 1024 * 1024) return toast.error("That file is over 25 MB. Please split it into shorter parts.");
    try {
      if (f.type.startsWith("audio/")) return run({ companyId, roleId, kind: "voice", title: f.name, file: f, fileName: f.name });
      if (f.type.startsWith("video/")) {
        const frames = await extractFrames(f);
        return run({ companyId, roleId, kind: "recording", title: f.name, file: f, fileName: f.name, frames });
      }
      const text = await extractText(f);
      const isChat = /whatsapp|chat|slack/i.test(f.name);
      if (text === null) return run({ companyId, roleId, kind: "file", title: f.name, file: f, fileName: f.name });
      return run({ companyId, roleId, kind: isChat ? "chat" : "file", title: f.name, text, file: f, fileName: f.name });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not read that file");
    }
  }

  const mmss = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <section className="flex flex-col items-center border-b border-border px-4 py-6 text-center sm:py-8">
          <h2 className="text-2xl">What did you decide today, and why?</h2>
          <p className="mt-2 text-sm text-muted-foreground">Malayalam · Hindi · Tamil · English</p>
          <div className="mt-6">
            {recording === "voice" ? (
              <Button size="mic" className="mic-pulse shadow-none" onClick={stop} aria-label="Stop recording">
                <Square />
              </Button>
            ) : (
              <Button size="mic" className="shadow-none" onClick={() => start("voice")} disabled={busy || !!recording} aria-label="Record a voice note">
                {busy ? <Loader2 className="animate-spin" /> : <Mic />}
              </Button>
            )}
          </div>
          <p className="mt-3 h-5 text-sm text-muted-foreground" aria-live="polite">
            {recording === "voice" ? `Recording… ${mmss}  · tap to finish` : busy ? "Processing…" : "Tap to record"}
          </p>
        </section>

        <form
          className="py-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!note.trim()) return;
            run({ companyId, roleId, kind: "text", title: "Typed note", text: note.trim() });
            setNote("");
          }}
        >
          <label htmlFor="note" className="text-sm font-semibold">
            Note, email or chat
          </label>
          <Textarea id="note" className="mt-3 min-h-32 bg-muted text-base shadow-none" value={note} onChange={(e) => setNote(e.target.value)} placeholder="ഇന്ന് GST file ചെയ്തു… / आज vendor को payment किया… / Today I…" />
          <div className="mt-3 flex justify-end">
            <Button type="submit" disabled={busy || !note.trim()}>
              <Send /> Add to map
            </Button>
          </div>
        </form>

        <div className="grid gap-3 sm:grid-cols-2">
          <Button variant="outline" className="h-auto min-w-0 flex-col items-start gap-2 whitespace-normal p-4 text-left shadow-none" onClick={() => fileRef.current?.click()} disabled={busy}>
            <span className="flex items-center gap-2 font-semibold">
              <Upload /> Upload a file
            </span>
            <span className="whitespace-normal text-xs text-muted-foreground">PDF, Word, Excel, CSV, email or WhatsApp export, audio</span>
          </Button>
          <input ref={fileRef} aria-label="Upload document or audio" type="file" className="hidden" accept=".pdf,.docx,.xlsx,.xls,.csv,.txt,.md,.eml,.json,audio/*" onChange={onFile} />
          {recording === "screen" ? (
            <Button className="h-auto min-w-0 flex-col items-start gap-2 whitespace-normal p-4 text-left shadow-none" onClick={stop}>
              <span className="flex items-center gap-2 font-semibold">
                <Square /> Stop screen recording · {mmss}
              </span>
              <span className="text-xs">Explain each step out loud as you go</span>
            </Button>
          ) : (
            <Button variant="outline" className="h-auto min-w-0 flex-col items-start gap-2 whitespace-normal p-4 text-left shadow-none" onClick={() => start("screen")} disabled={busy || !!recording}>
              <span className="flex items-center gap-2 font-semibold">
                <MonitorUp /> Record screen + voice
              </span>
              <span className="whitespace-normal text-xs text-muted-foreground">Becomes a step-by-step guide with screenshots</span>
            </Button>
          )}
          <Button variant="link" className="h-auto justify-start whitespace-normal text-left sm:col-span-2" onClick={() => videoRef.current?.click()} disabled={busy}>
            Upload a KT session video instead (max 25 MB)
          </Button>
          <input ref={videoRef} aria-label="Upload session video" type="file" className="hidden" accept="video/*" onChange={onFile} />
        </div>
      </div>

      <section className="min-w-0">
        <h2 className="text-xl">Capture history</h2>
        <ul className="mt-3 divide-y divide-border">
          {inputs.length === 0 && <li className="text-muted-foreground">Nothing yet. Record your first voice note.</li>}
          {inputs.map((i) => (
            <li key={i.id} className="py-4">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                <span className="min-w-0 font-medium">{i.title || i.kind}</span>
                <span className="flex shrink-0 flex-col items-end gap-1">
                {i.language && <Badge variant="secondary">{LANG_LABEL[i.language] ?? i.language}</Badge>}
                {i.is_sample && <Badge variant="outline" className="border-terracotta text-terracotta">Sample data</Badge>}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                {i.status === "done" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : i.status === "failed" ? <AlertCircle className="h-4 w-4 shrink-0 text-destructive" /> : <Loader2 className="h-4 w-4 shrink-0 animate-spin" />}
                {STATUS[i.status]} · {formatDistanceToNow(new Date(i.created_at), { addSuffix: true })}
              </div>
              {i.original_text && <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-[0.98rem]">{i.original_text}</p>}
              {i.status === "failed" && (
                <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-md bg-destructive/10 p-2 text-sm text-destructive">
                  <span className="min-w-0">{i.error}</span>
                  <Button size="sm" variant="outline" onClick={() => retry(i.id)}>
                    <RotateCw /> Retry
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
