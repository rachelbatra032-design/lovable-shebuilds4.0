import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Mic, Network, MessagesSquare, ShieldCheck, Languages, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Brand, HandoverSymbol } from "@/components/Brand";
import { ThemeToggle } from "@/components/ThemeProvider";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kaimaaral: keep role knowledge when people leave" },
      { name: "description", content: "Capture everyday decisions in Malayalam, Hindi, Tamil or English. Keep source-backed role knowledge ready for the next person." },
      { property: "og:title", content: "Kaimaaral: keep role knowledge when people leave" },
      { property: "og:description", content: "Voice-first, regional-language role mapping and handover for Indian SMEs." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: Mic, title: "Speak, don't write", body: "A 60-second voice note at the end of the day. No SOPs to maintain." },
  { icon: Languages, title: "Your own language", body: "Malayalam, Hindi, Tamil and English. Manglish or Hinglish too." },
  { icon: Network, title: "Read or see it", body: "Structured sections or a visual map of how the role works." },
  { icon: ShieldCheck, title: "Keep the source", body: "Every point links to its source. Changes wait for your confirmation." },
  { icon: MessagesSquare, title: "Ask the role", body: "Practical answers with sources, in the language the successor chooses." },
  { icon: Gauge, title: "See what's missing", body: "A completeness score makes gaps visible before someone leaves." },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto grid max-w-5xl grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-5 py-5 sm:py-7">
        <Brand />
        <nav className="flex shrink-0 items-center gap-1 sm:gap-3" aria-label="Main navigation">
          <ThemeToggle />
          <Button asChild variant="ghost" className="px-2 sm:px-3"><Link to="/readme">Read Me</Link></Button>
          <Button asChild className="px-3 sm:px-4"><Link to="/app">Open app</Link></Button>
        </nav>
      </header>
      <main>
        <section className="mx-auto max-w-5xl px-5 pb-12 pt-8 sm:pb-16 sm:pt-12" aria-labelledby="home-title">
          <div className="mb-6 flex items-center gap-4 sm:mb-7">
            <HandoverSymbol className="h-8 w-14 shrink-0 text-foreground" label="Knowledge passed from one person to the next" />
            <p className="editorial-label">For the person who comes next.</p>
          </div>
          <h1 id="home-title" className="text-5xl font-medium leading-none sm:text-7xl lg:text-8xl">Kaimaaral<span className="text-muted-foreground">.</span></h1>
          <p className="mt-5 max-w-3xl text-3xl font-medium leading-tight sm:text-4xl lg:text-5xl">The role changes hands.<br /><span className="text-muted-foreground">The knowledge stays.</span></p>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">The decisions, workarounds and everyday details that never make it into a document. Capture them in your own language, ready for whoever takes over.</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg" className="h-auto min-h-12 whitespace-normal py-3 text-center"><Link to="/app">Open your workspace <ArrowRight aria-hidden="true" /></Link></Button>
            <Button asChild variant="outline" size="lg" className="h-auto min-h-12 py-3"><Link to="/readme">Start with the sample</Link></Button>
          </div>
          <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground"><Check className="h-4 w-4 shrink-0" aria-hidden="true" /> Your own account. Your private sample. No company files needed.</p>
          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border pt-4 text-sm text-muted-foreground sm:mt-12">
            <span className="editorial-label">In the words you use at work</span>
            <span>English · हिन्दी · മലയാളം · தமிழ்</span>
          </div>
        </section>

        <section className="border-y border-border bg-card">
          <div className="mx-auto max-w-5xl px-5 py-12 sm:py-16">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="text-3xl font-medium sm:text-4xl">What you leave behind matters.</h2>
              <p className="editorial-label">From what you know to what they need</p>
            </div>
            <div className="mt-9 grid gap-8 md:grid-cols-3 md:gap-7">
              <div>
                <p className="editorial-label">01 · What you remember</p>
                <blockquote className="editorial-quote mt-5">“Check the GST number in Tally before approving. Anything above ₹50,000 needs Suresh's approval.”</blockquote>
                <p className="mt-3 text-xs text-muted-foreground">Anitha, Accounts Lead · Sample data</p>
              </div>
              <div className="border-t border-border pt-5 md:border-t-0 md:pt-0">
                <p className="editorial-label">02 · What the map keeps</p>
                <ul className="mt-5 space-y-4 text-sm leading-relaxed">
                  <li className="flex gap-3"><Network className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" /> The decision and the reason behind it</li>
                  <li className="flex gap-3"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" /> Who approves, and when</li>
                  <li className="flex gap-3"><Mic className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" /> The original note, always linked</li>
                </ul>
              </div>
              <div className="border-t border-border pt-5 md:border-t-0 md:pt-0">
                <p className="editorial-label">03 · What they receive</p>
                <ul className="mt-5 space-y-3 text-sm">{["A map of the real role", "Answers backed by sources", "Actionable onboarding steps", "Missing details clearly flagged"].map(text => <li key={text} className="flex items-start gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0" />{text}</li>)}</ul>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-5 py-12 sm:py-16">
          <p className="editorial-label">A thoughtful way to hand it over</p>
          <h2 className="mt-3 text-3xl font-medium sm:text-4xl">Less writing. More understanding.</h2>
          <ol className="mt-8 grid gap-7 md:grid-cols-3">
            {[["Capture", "Voice notes, files, messages and everyday decisions. Start with what you already have."], ["Connect", "The AI connects tasks, judgment, people and tools into a source-backed role map."], ["Hand over", "The next person gets practical answers and a plan that makes missing knowledge visible."]].map(([title, body], i) => <li key={title} className="border-t border-border pt-5"><span className="text-xs tabular-nums text-muted-foreground">0{i + 1}</span><h3 className="mt-3 text-2xl font-medium">{title}</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p></li>)}
          </ol>
        </section>

        <section className="border-t border-border bg-card">
          <div className="mx-auto max-w-5xl px-5 py-12 sm:py-16">
            <p className="editorial-label">The whole picture, together</p>
            <h2 className="mt-3 text-3xl font-medium sm:text-4xl">Not just a folder of documents.</h2>
            <div className="mt-8 grid gap-x-10 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">{features.map(({ icon: Icon, title, body }) => <div key={title} className="border-t border-border pt-5"><Icon className="mb-4 h-5 w-5 text-muted-foreground" aria-hidden="true" /><h3 className="text-lg font-medium">{title}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p></div>)}</div>
          </div>
        </section>
        <section className="mx-auto max-w-5xl px-5 py-12 sm:py-16">
          <h2 className="max-w-2xl text-3xl font-medium leading-tight sm:text-4xl">Leave the role easier to pick up<br className="hidden sm:block" /> than you found it.</h2>
          <Button asChild className="mt-6 h-12 px-5"><Link to="/app">Open your workspace <ArrowRight /></Link></Button>
        </section>
      </main>
      <footer className="border-t border-border"><div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-6 text-xs text-muted-foreground"><span>Kaimaaral · built for SheBuilds 2026</span><Link to="/readme" className="underline underline-offset-4">Read Me</Link></div></footer>
    </div>
  );
}
