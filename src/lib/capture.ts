import { supabase } from "@/integrations/supabase/client";

export type CaptureKind = "voice" | "text" | "file" | "chat" | "recording";

function extFor(mime: string, name?: string) {
  const fromName = name?.split(".").pop();
  if (fromName && fromName.length <= 5 && name?.includes(".")) return fromName.toLowerCase();
  if (mime.includes("mp4")) return "mp4";
  if (mime.includes("webm")) return "webm";
  if (mime.includes("ogg")) return "ogg";
  if (mime.includes("wav")) return "wav";
  if (mime.includes("mpeg")) return "mp3";
  if (mime.includes("pdf")) return "pdf";
  return "bin";
}

/** Creates the input row, uploads media and returns the new input id (processing is triggered separately). */
export async function createInput(opts: {
  companyId: string;
  roleId: string;
  kind: CaptureKind;
  title: string;
  text?: string;
  file?: Blob;
  fileName?: string;
  frames?: Blob[];
}) {
  const { data: u } = await supabase.auth.getUser();
  const { data: row, error } = await supabase
    .from("inputs")
    .insert({
      company_id: opts.companyId,
      role_id: opts.roleId,
      created_by: u.user?.id ?? null,
      kind: opts.kind,
      title: opts.title,
      original_text: opts.text ?? null,
      mime_type: opts.file?.type ?? null,
    })
    .select("id")
    .single();
  if (error) throw error;
  const base = `${opts.companyId}/${opts.roleId}/${row.id}`;
  const patch: { storage_path?: string; frames?: string[] } = {};
  if (opts.file) {
    const path = `${base}.${extFor(opts.file.type, opts.fileName)}`;
    const up = await supabase.storage.from("inputs").upload(path, opts.file, opts.file.type ? { contentType: opts.file.type } : {});
    if (up.error) throw up.error;
    patch.storage_path = path;
  }
  if (opts.frames?.length) {
    const paths: string[] = [];
    for (let i = 0; i < opts.frames.length; i++) {
      const p = `${base}-frame-${i}.jpg`;
      const up = await supabase.storage.from("inputs").upload(p, opts.frames[i]!, { contentType: "image/jpeg" });
      if (!up.error) paths.push(p);
    }
    patch.frames = paths;
  }
  if (Object.keys(patch).length) await supabase.from("inputs").update(patch).eq("id", row.id);
  return row.id;
}

const TEXT_EXT = ["txt", "csv", "md", "eml", "json", "tsv", "log", "html", "htm"];

/** Returns extracted text, or null when the file should be sent as-is (PDF). */
export async function extractText(file: File): Promise<string | null> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (file.type === "application/pdf" || ext === "pdf") return null;
  if (TEXT_EXT.includes(ext) || file.type.startsWith("text/")) return await file.text();
  if (ext === "docx") {
    const mammoth = await import("mammoth");
    const res = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    return res.value;
  }
  if (["xlsx", "xls", "ods"].includes(ext)) {
    const XLSX = await import("xlsx");
    const wb = XLSX.read(await file.arrayBuffer());
    return wb.SheetNames.map((n: string) => `# Sheet: ${n}\n${XLSX.utils.sheet_to_csv(wb.Sheets[n]!)}`).join("\n\n").slice(0, 60000);
  }
  throw new Error("Unsupported file type. Try PDF, Word, Excel, CSV or a text export.");
}

/** Grabs evenly spaced JPEG screenshots from a video file. */
export async function extractFrames(file: Blob, count = 6): Promise<Blob[]> {
  const url = URL.createObjectURL(file);
  try {
    const video = document.createElement("video");
    video.src = url;
    video.muted = true;
    video.playsInline = true;
    await new Promise<void>((res, rej) => {
      video.onloadedmetadata = () => res();
      video.onerror = () => rej(new Error("Could not read video"));
    });
    // Some recordings report Infinity duration until seeked.
    if (!Number.isFinite(video.duration)) {
      video.currentTime = 1e9;
      await new Promise((r) => (video.ontimeupdate = r));
    }
    const duration = Number.isFinite(video.duration) ? video.duration : 0;
    if (!duration) return [];
    const canvas = document.createElement("canvas");
    const scale = Math.min(1, 1024 / (video.videoWidth || 1024));
    canvas.width = Math.round((video.videoWidth || 1024) * scale);
    canvas.height = Math.round((video.videoHeight || 576) * scale);
    const ctx = canvas.getContext("2d")!;
    const frames: Blob[] = [];
    for (let i = 0; i < count; i++) {
      video.currentTime = (duration * (i + 0.5)) / count;
      await new Promise((r) => (video.onseeked = r));
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.7));
      if (blob) frames.push(blob);
    }
    return frames;
  } catch {
    return [];
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function signedUrl(path: string) {
  const { data } = await supabase.storage.from("inputs").createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}
