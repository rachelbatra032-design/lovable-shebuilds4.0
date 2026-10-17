import { createFileRoute, Link } from "@tanstack/react-router";
import { Mic, Network, MessagesSquare, ShieldCheck, Languages, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Brand } from "@/components/Brand";
import hero from "@/assets/hero-notebook.jpg";

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
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Brand />
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link to="/readme">Read Me</Link>
          </Button>
          <Button asChild>
            <Link to="/app">Open app</Link>
          </Button>
        </nav>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-6 md:grid-cols-2 md:pt-12">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-terracotta">For Indian SMEs</p>
            <h1 className="mt-3 text-5xl leading-[1.05] sm:text-6xl">
              When Anitha leaves, <em className="text-primary">how she does the job</em> shouldn't leave with her.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">
              People speak short daily notes in their own language. Kaimaaral turns them into a living, searchable onboarding map for
              every role — ready for the next person.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/app">Try it with a sample company</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/readme">How it works</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground" lang="ml">
              "ഇന്ന് Rajan Traders-ന്റെ invoice approve ചെയ്തു…" → <span lang="en">Decision: payments above ₹50,000 need MD approval</span>
            </p>
          </div>
          <div className="paper-card overflow-hidden">
            <img src={hero} alt="A notebook with notes in Malayalam, Hindi and Tamil connected to icons for tasks, people and tools" className="h-full w-full object-cover" width={1280} height={960} />
          </div>
        </section>

        <section className="border-t border-border bg-paper">
          <div className="mx-auto grid max-w-6xl gap-6 px-5 py-14 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                  <f.icon className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <h2 className="text-2xl">{f.title}</h2>
                  <p className="mt-1 text-muted-foreground">{f.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-14">
          <h2 className="text-4xl">How it works</h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-4">
            {[
              ["Set up", "Add departments like Finance or Marketing, create role cards, invite people."],
              ["Capture", "Daily voice notes, files, WhatsApp exports, emails, KT or screen recordings."],
              ["Map", "AI pulls out tasks, decisions and the reasons behind them, contacts, tools and gotchas."],
              ["Hand over", "The successor gets the map, a week-by-week plan and a chat that knows the role."],
            ].map(([t, b], i) => (
              <li key={t} className="paper-card p-5">
                <span className="font-display text-3xl text-terracotta">{i + 1}</span>
                <h3 className="mt-1 text-2xl">{t}</h3>
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
