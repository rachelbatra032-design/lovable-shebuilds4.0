import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Brand } from "./Brand";
import { LANGUAGES, type LangCode } from "@/lib/knowledge";
import { useLang } from "@/lib/use-lang";

export function AppHeader() {
  const [lang, setLang] = useLang();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Brand to="/app" />
        <div className="flex items-center gap-1 sm:gap-2">
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as LangCode)}
            aria-label="Reading language"
            className="h-9 w-[8.5rem] rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-2 focus-visible:outline-ring"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.native}
              </option>
            ))}
          </select>
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link to="/readme">Read Me</Link>
          </Button>
          <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out">
            <LogOut />
          </Button>
        </div>
      </div>
    </header>
  );
}
