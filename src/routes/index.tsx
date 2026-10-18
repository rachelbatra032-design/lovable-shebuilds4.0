import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Mic, Network, MessagesSquare, ShieldCheck, Languages, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Brand } from "@/components/Brand";
import { ThemeToggle } from "@/components/ThemeProvider";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kaimaaral — keep role knowledge when people leave" },
      { name: "description", content: "Staff speak 60-second voice notes in Malayalam, Hindi, Tamil or English. AI turns them into a living onboarding map for every role." },
      { property: "og:title", content: "Kaimaaral — keep role knowledge when people leave" },
      { property: "og:description", content: "Voice-first, regional-language role mapping and handover for Indian SMEs." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: Mic, title: "Speak, don't write", body: "A 60-second voice note at the end of the day. No SOPs to maintain." },
  { icon: Languages, title: "Your own language", body: "Malayalam, Hindi, Tamil, English — and Manglish or Hinglish too." },
  { icon: Network, title: "Read or see it", body: "Switch between structured sections and a visual map of how the role works." },
  { icon: ShieldCheck, title: "Stays current", body: "When something changes, confirm it with one tap. Every point links to its source." },
  { icon: MessagesSquare, title: "Ask the role", body: "New hires ask questions and get answers with sources, in the language they choose." },
  { icon: Gauge, title: "Spot risky roles", body: "A completeness score shows which roles would hurt most if someone left tomorrow." },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-4 py-5 sm:flex sm:justify-between sm:px-5">
        <Brand />
        <nav className="flex shrink-0 items-center gap-1 sm:gap-2">
          <ThemeToggle />
          <Button asChild variant="ghost">
            <Link to="/readme">Read Me</Link>
          </Button>
          <Button asChild>
            <Link to="/app">Open app</Link>
          </Button>
        </nav>
      </header>

      <main>
        <section className="mx-auto max-w-4xl px-5 pb-12 pt-8 text-center sm:pb-16 sm:pt-14" aria-labelledby="home-title">
          <HandoverSymbol className="mx-auto mb-5 h-14 w-[84px] text-foreground sm:mb-8 sm:h-24 sm:w-40" label="Handover: knowledge passed from one person to the next" />
          <h1 id="home-title" className="text-4xl font-semibold leading-none sm:text-6xl lg:text-8xl">Kaimaaral</h1>
          <p className="mx-auto mt-5 max-w-xl text-2xl font-medium leading-tight text-foreground sm:mt-8 sm:text-3xl">
            Keep the knowledge.<br />Hand over the role.
          </p>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            Voice notes, files and everyday decisions — connected into one source-backed role map, in your language.
          </p>
          <div className="mt-6 flex w-full justify-center px-2 sm:mt-8 sm:w-auto sm:px-0">
            <Button asChild size="lg" className="h-auto min-h-12 w-full gap-3 whitespace-normal px-6 py-3 text-center text-base sm:w-auto sm:gap-4">
              <Link to="/app">Open your workspace <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" /></Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground sm:mt-5">English · हिन्दी · മലയാളം · தமிழ்</p>
        </section>

        <section className="border-t border-border bg-paper">
          <div className="mx-auto grid max-w-6xl gap-6 px-5 py-14 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center text-muted-foreground">
                  <f.icon className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <h2 className="text-lg">{f.title}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-14">
          <h2 className="text-2xl">How it works</h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-4">
            {[
              ["Set up", "Add departments like Finance or Marketing, create role cards, invite people."],
              ["Capture", "Daily voice notes, files, WhatsApp exports, emails, KT or screen recordings."],
              ["Map", "AI pulls out tasks, decisions and the reasons behind them, contacts, tools and gotchas."],
              ["Hand over", "The successor gets the map, a week-by-week plan and a chat that knows the role."],
            ].map(([t, b], i) => (
              <li key={t} className="border-t border-border py-5">
                <span className="text-sm text-muted-foreground">{i + 1}</span>
                <h3 className="mt-2 text-lg">{t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{b}</p>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        Kaimaaral · built for SheBuilds 2026 · <Link to="/readme" className="underline">Read Me</Link>
      </footer>
    </div>
  );
}
