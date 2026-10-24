import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brand } from "@/components/Brand";
import { ThemeToggle } from "@/components/ThemeProvider";

export const Route = createFileRoute("/auth")({
  validateSearch: z.object({ redirect: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Sign in: Kaimaaral" },
      { name: "description", content: "Sign in to capture and explore your team's role knowledge." },
      { property: "og:title", content: "Sign in: Kaimaaral" },
      { property: "og:description", content: "Sign in to capture and explore your team's role knowledge." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function safePath(p?: string) {
  return p && p.startsWith("/") && !p.startsWith("//") ? p : "/app";
}

function AuthPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: safePath(redirect), replace: true });
    });
    const { data } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate({ to: safePath(redirect), replace: true });
    });
    return () => data.subscription.unsubscribe();
  }, [navigate, redirect]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/app", data: { full_name: name } },
        });
        if (error) throw error;
        if (!data.session) setSent(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not sign in");
    } finally {
      setBusy(false);
    }
  }

  async function oauth(provider: "google" | "lovable") {
    const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin + "/auth" });
    if (result.error) toast.error(result.error.message ?? "Sign-in failed");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center px-5 py-6 sm:px-8">
        <Brand />
        <ThemeToggle />
      </div>
      <div className="mx-auto flex max-w-sm flex-col px-5 pb-10 pt-10 sm:pt-16">
        <div>
          <h1 className="text-3xl">{mode === "signup" ? "Create your account" : "Welcome back"}</h1>
          <p className="mt-2 text-muted-foreground">
            {mode === "signup" ? "Free to try. You can load a sample company right after." : "Sign in to your team's role maps."}
          </p>

          {sent ? (
            <div className="mt-6 rounded-lg bg-secondary p-4 text-sm">
              Check <strong>{email}</strong> for a confirmation link, then come back here. Tip: Google sign-in skips this step.
            </div>
          ) : (
            <>
              <div className="mt-6 grid gap-2">
                <Button type="button" variant="outline" className="h-11" onClick={() => oauth("google")}>
                  Continue with Google
                </Button>
                <Button type="button" variant="outline" className="h-11" onClick={() => oauth("lovable")}>
                  Continue with Lovable
                </Button>
              </div>
              <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
                <div className="h-px flex-1 bg-border" /> or with email <div className="h-px flex-1 bg-border" />
              </div>
              <form onSubmit={submit} className="grid gap-4">
                {mode === "signup" && (
                  <div className="grid gap-1.5">
                    <Label htmlFor="name">Your name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Anitha Menon" />
                  </div>
                )}
                <div className="grid gap-1.5">
                  <Label htmlFor="email">Work email</Label>
                  <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "signup" ? "new-password" : "current-password"} />
                </div>
                <Button type="submit" disabled={busy} className="h-11">
                  {busy ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
                </Button>
              </form>
            </>
          )}
          <Button
            type="button"
            variant="ghost"
            className="mt-5 w-full whitespace-normal text-center text-sm text-muted-foreground"
            onClick={() => {
              setMode(mode === "signup" ? "signin" : "signup");
              setSent(false);
            }}
          >
            {mode === "signup" ? "Already have an account? Sign in" : "New here? Create an account"}
          </Button>
        </div>
      </div>
    </div>
  );
}
