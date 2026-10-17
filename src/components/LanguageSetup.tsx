import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Languages, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LANGUAGES, type LangCode } from "@/lib/knowledge";
import { useLang } from "@/lib/use-lang";
import { cn } from "@/lib/utils";

export const myLanguagePrefsQuery = () => ({
  queryKey: ["me", "language-prefs"],
  queryFn: async () => {
    const { data: s } = await supabase.auth.getSession();
    const uid = s.session?.user.id;
    if (!uid) return null;
    const { data } = await supabase.from("profiles").select("recording_languages, output_language, language_setup_done").eq("id", uid).maybeSingle();
    return { uid, ...(data ?? { recording_languages: [] as string[], output_language: null as string | null, language_setup_done: false }) };
  },
});

/** Header button + first-sign-in dialog asking which languages the user records in and reads in. */
export function LanguageSetup() {
  const qc = useQueryClient();
  const prefs = useQuery(myLanguagePrefsQuery());
  const [, setLang] = useLang();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [recording, setRecording] = useState<LangCode[]>([]);
  const [wantOutput, setWantOutput] = useState<boolean | null>(null);
  const [output, setOutput] = useState<LangCode | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (prefs.data && !prefs.data.language_setup_done) setOpen(true);
  }, [prefs.data]);

  // On a new device, start with the output language chosen at setup.
  useEffect(() => {
    const out = prefs.data?.output_language as LangCode | null | undefined;
    if (out && !localStorage.getItem("kaimaaral-lang")) setLang(out);
  }, [prefs.data, setLang]);

  useEffect(() => {
    if (!open || !prefs.data) return;
    setStep(1);
    setRecording((prefs.data.recording_languages ?? []) as LangCode[]);
    setWantOutput(prefs.data.language_setup_done ? !!prefs.data.output_language : null);
    setOutput((prefs.data.output_language as LangCode | null) ?? null);
  }, [open, prefs.data]);

  const toggle = (c: LangCode) => setRecording((r) => (r.includes(c) ? r.filter((x) => x !== c) : [...r, c]));

  async function save() {
    if (!prefs.data) return;
    setSaving(true);
    const out = wantOutput ? output : null;
    const { error } = await supabase
      .from("profiles")
      .update({ recording_languages: recording, output_language: out, language_setup_done: true })
      .eq("id", prefs.data.uid);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (out) setLang(out);
    toast.success("Language settings saved");
    qc.invalidateQueries({ queryKey: ["me", "language-prefs"] });
    setOpen(false);
  }

  const canNext = recording.length > 0;
  const canSave = wantOutput === false || (wantOutput === true && !!output);

  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="Language settings">
        <Languages />
      </Button>
      <Dialog open={open} onOpenChange={(o) => (prefs.data?.language_setup_done || !o ? setOpen(o) : null)}>
        <DialogContent className="sm:max-w-md">
          {step === 1 ? (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-3xl font-normal">Which languages will you record in?</DialogTitle>
                <DialogDescription>Pick all you speak at work — for example English and Hindi, or Malayalam and Hindi. Mixing them in one note is fine.</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-2" role="group" aria-label="Recording languages">
                {LANGUAGES.map((l) => {
                  const on = recording.includes(l.code);
                  return (
                    <button
                      key={l.code}
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggle(l.code)}
                      className={cn(
                        "flex items-center justify-between rounded-lg border-2 px-3 py-3 text-left transition-colors",
                        on ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
                      )}
                    >
                      <span>
                        <span className="block text-lg">{l.native}</span>
                        <span className="text-xs text-muted-foreground">{l.label}</span>
                      </span>
                      {on && <Check className="h-5 w-5 text-primary" />}
                    </button>
                  );
                })}
              </div>
              <DialogFooter>
                <Button disabled={!canNext} onClick={() => setStep(2)}>
                  Next
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-3xl font-normal">Do you want the output in a certain language?</DialogTitle>
                <DialogDescription>The map, answers and plans can be shown in one language for you. Your original recordings are always kept.</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Output language choice">
                {[
                  { v: true, label: "Yes, choose one" },
                  { v: false, label: "No, keep as is" },
                ].map((o) => (
                  <button
                    key={String(o.v)}
                    type="button"
                    role="radio"
                    aria-checked={wantOutput === o.v}
                    onClick={() => setWantOutput(o.v)}
                    className={cn("rounded-lg border-2 px-3 py-3", wantOutput === o.v ? "border-primary bg-primary/5" : "border-border hover:border-primary/50")}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
              {wantOutput && (
                <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Output language">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      role="radio"
                      aria-checked={output === l.code}
                      onClick={() => setOutput(l.code)}
                      className={cn("rounded-lg border-2 px-3 py-2 text-left", output === l.code ? "border-primary bg-primary/5" : "border-border hover:border-primary/50")}
                    >
                      <span className="block text-lg">{l.native}</span>
                      <span className="text-xs text-muted-foreground">{l.label}</span>
                    </button>
                  ))}
                </div>
              )}
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button disabled={!canSave || saving} onClick={save}>
                  Save
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
