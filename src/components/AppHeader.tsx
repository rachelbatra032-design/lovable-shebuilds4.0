import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { BookOpen, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Brand } from "./Brand";
import { LanguageSetup } from "./LanguageSetup";
import { LANGUAGES, type LangCode } from "@/lib/knowledge";
import { useLang } from "@/lib/use-lang";
import { ThemeToggle } from "./ThemeProvider";

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
    <header className="sticky top-0 z-30 border-b border-border bg-card">
      <div className="mx-auto grid max-w-[1440px] grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-4 py-3 lg:px-6 sm:flex sm:justify-between sm:gap-3">
        <div className="flex min-w-0 items-center gap-6"><Brand to="/app" /><span className="editorial-label hidden border-l border-border pl-6 md:block">The handover workspace</span></div>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as LangCode)}
            aria-label="Reading language"
            className="h-11 w-[4.75rem] min-w-0 rounded-md border border-transparent bg-background px-1 text-sm hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring sm:h-9 sm:w-[8.5rem] sm:px-2"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.native}
              </option>
            ))}
          </select>
          <LanguageSetup />
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm" className="h-11 w-11 px-0 sm:h-9 sm:w-auto sm:px-3">
            <Link to="/readme" aria-label="Read Me" title="Read Me">
              <BookOpen className="sm:hidden" />
              <span className="hidden sm:inline">Read Me</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out">
            <LogOut />
          </Button>
        </div>
      </div>
    </header>
  );
}
