import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Mic, MessageCircle, ClipboardCheck, ListChecks, Check, Circle, ShieldCheck, Languages } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Brand, HandoverSymbol } from "@/components/Brand";
import { ThemeToggle } from "@/components/ThemeProvider";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/readme")({
  head: () => ({ meta: [
    { title: "Read Me: a first look at Kaimaaral" },
    { name: "description", content: "A visual guide to reviewing Kaimaaral: explore private sample data, recorded evidence, role answers and source-backed onboarding." },
    { property: "og:title", content: "Read Me: a first look at Kaimaaral" },
    { property: "og:description", content: "Review usefulness, functionality, design and originality through a private sample handover." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: ReadMe,
});

const SECTIONS = [
  ["start", "Start with the sample"], ["criterion-1", "Usefulness"], ["criterion-2", "Functionality"],
  ["criterion-3", "Experience and design"], ["criterion-4", "Originality"], ["limitations", "Testing and limits"],
];
const WALKTHROUGH = [
  { icon: BookOpen, title: "Inspect the evidence", panel: "Map", text: "Open a recorded item. Read its original quote and source. Switch to Visual to see how the role's responsibilities connect." },
  { icon: MessageCircle, title: "Ask a real work question", panel: "Ask", text: "Ask who approves a vendor payment above ₹50,000. Compare the answer with its cited sources." },
  { icon: Mic, title: "Add a little context", panel: "Capture", text: "Type a fictional procedure under Note, email or chat. Choose Add to map, wait for Added to map, then find the result on Map." },
  { icon: ClipboardCheck, title: "Review a proposed change", panel: "Review", text: "Inspect any pending change before confirming it. An empty list means there are no changes waiting for your decision." },
  { icon: ListChecks, title: "Check the handover plan", panel: "Plan", text: "Generate or open the plan. Inspect the instructions and sources. Missing screen paths, decision rules, approvals or completion checks keep it in Draft." },
];

function ReadMe() {
  const [visited, setVisited] = useState<number[]>([]);
  return <div className="min-h-screen">
    <header className="sticky top-0 z-30 border-b border-border bg-card"><div className="mx-auto grid max-w-[1280px] grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-5 py-4 sm:px-8">
      <Brand /><div className="flex items-center gap-1"><ThemeToggle /><Button asChild><Link to="/app">Open app <ArrowRight /></Link></Button></div>
    </div></header>
    <div className="mx-auto max-w-[1280px] lg:grid lg:grid-cols-[224px_minmax(0,1fr)]">
      <aside className="hidden border-r border-border bg-sidebar px-4 py-8 lg:sticky lg:top-[73px] lg:block lg:h-[calc(100dvh-73px)]">
        <p className="editorial-label px-3">Read Me</p><nav aria-label="Read Me sections" className="mt-5 grid gap-1">
          {SECTIONS.map(([id,label],i)=><Button key={id} asChild variant="ghost" className="h-auto min-h-11 justify-start whitespace-normal px-3 py-3 text-left"><a href={`#${id}`}><span className="shrink-0 whitespace-nowrap text-xs tabular-nums text-muted-foreground">0{i+1}</span>{label}</a></Button>)}
        </nav>
        <div className="mt-8 border-t border-border px-3 pt-5"><ShieldCheck className="h-5 w-5 text-muted-foreground" /><p className="mt-3 text-sm">Your account. Your sample copy.</p><p className="mt-2 text-xs leading-relaxed text-muted-foreground">No shared password or company documents needed.</p></div>
      </aside>
      <main className="min-w-0 px-5 pb-20 sm:px-8 lg:px-12">
        <div className="py-10 sm:py-14"><HandoverSymbol className="mb-6 h-12 w-20" /><p className="editorial-label">A first look at Kaimaaral</p><h1 className="mt-3 text-4xl sm:text-5xl">Read Me</h1><p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">When someone leaves, their judgment should not leave with them. Kaimaaral turns recorded work into knowledge the next person can use.</p><p className="mt-3 text-sm text-muted-foreground">കൈമാറൽ means handover in Malayalam.</p></div>
        <section id="start" className="scroll-mt-24 border-t border-border py-8">
          <p className="editorial-label">Start here</p><h2 className="mt-3 text-3xl">Your own sample handover</h2>
          <ol className="mt-6 grid gap-5 sm:grid-cols-3">{[
            ["Sign in", "Create your own account or sign in. Confirm your email if requested, then choose your recording and reading languages."],
            ["Load the sample", "Choose Load sample company. Already have a workspace? Open New workspace and choose the sample option."],
            ["Open the role", "In Kerala Spices Traders, open Finance, then Accounts Lead. Choose Guided walkthrough for an eight-step tour of the handover and why each part matters. All starting people, figures and records are fictional."],
          ].map(([title,text],i)=><li key={title} className="min-w-0 border-l border-border pl-4"><span className="text-xs tabular-nums text-muted-foreground">0{i+1}</span><h3 className="mt-3 text-xl">{title}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p></li>)}</ol>
          <div className="mt-8 border-t border-border pt-6"><div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-xl">Follow the knowledge</h3><span className="text-xs text-muted-foreground">{visited.length} of {WALKTHROUGH.length} reviewed</span></div><Progress className="mt-3 h-1.5" value={visited.length / WALKTHROUGH.length * 100} aria-label="Sample walkthrough reviewed" />
          <ol className="mt-5 divide-y divide-border">{WALKTHROUGH.map((step,i)=><li key={step.panel} className="grid grid-cols-[40px_minmax(0,1fr)_44px] items-start gap-3 py-5"><step.icon className="mt-1 h-5 w-5 text-muted-foreground" /><div><p className="editorial-label">{step.panel}</p><h3 className="mt-2 text-xl">{step.title}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p></div><Button variant="ghost" size="icon" aria-label={`Mark ${step.panel} reviewed`} aria-pressed={visited.includes(i)} title={`Mark ${step.panel} reviewed`} onClick={()=>setVisited(v=>v.includes(i)?v.filter(n=>n!==i):[...v,i])}>{visited.includes(i)?<Check />:<Circle className="text-muted-foreground" />}</Button></li>)}</ol></div>
        </section>
        <section id="criterion-1" className="scroll-mt-24 border-t border-border py-8"><p className="editorial-label">01 · Usefulness</p><h2 className="mt-3 text-3xl">Preserve the judgment, not just the job title</h2><p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">Built for small and medium businesses in India, where an experienced employee may hold the approval rules, supplier history and exceptions in their head. Capturing daily work reduces the need to write a manual from scratch.</p><div className="mt-6 grid gap-5 sm:grid-cols-2"><div className="border-l border-border pl-4"><p className="editorial-label">The recorded rule</p><p className="mt-3 text-lg">Payments above ₹50,000 need the managing director's approval.</p></div><div className="border-l border-border pl-4"><p className="editorial-label">The context behind it</p><p className="mt-3 text-lg">Check the invoice GST number against Tally before approval.</p></div></div><p className="mt-4 text-xs text-muted-foreground">Examples from the fictional sample company. Category: Business Operations.</p></section>
        <section id="criterion-2" className="scroll-mt-24 border-t border-border py-8"><p className="editorial-label">02 · Functionality</p><h2 className="mt-3 text-3xl">From recorded work to a usable handover</h2><div className="mt-6 grid gap-5 sm:grid-cols-3">{[["Capture", "Voice, text, documents and session recordings supply the evidence."],["Understand", "AI organizes tasks, decisions, contacts and exceptions, with source links. Conflicts wait for human review."],["Hand over", "Successors ask questions and read source-backed plans. Agents can build a draft and check its missing details."]].map(([title,text],i)=><div key={title} className="border-t border-border pt-4"><span className="text-xs text-muted-foreground">0{i+1}</span><h3 className="mt-3 text-xl">{title}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p></div>)}</div><p className="mt-6 text-sm text-muted-foreground">The status bar measures documented knowledge. Plan readiness is a separate evidence check, not a promise that every procedure is correct.</p></section>
        <section id="criterion-3" className="scroll-mt-24 border-t border-border py-8"><p className="editorial-label">03 · Experience and design</p><h2 className="mt-3 text-3xl">Record naturally. Read in your language.</h2><div className="mt-6 flex flex-wrap items-center gap-3 border-y border-border py-4"><Languages className="h-5 w-5" />{["English","മലയാളം","हिन्दी","தமிழ்"].map(l=><span key={l} className="text-sm">{l}</span>)}</div><p className="mt-4 leading-relaxed text-muted-foreground">Original recordings and quotes remain available alongside translated reading views. Phone navigation stays within reach; laptop navigation leaves room for the evidence. Light and dark modes share the same clear layout.</p></section>
        <section id="criterion-4" className="scroll-mt-24 border-t border-border py-8"><p className="editorial-label">04 · Originality</p><h2 className="mt-3 text-3xl">Knowledge follows the role</h2><p className="mt-4 leading-relaxed text-muted-foreground">The map belongs to the position, not the outgoing employee's personal folder. Regional-language capture, original evidence and human-reviewed updates keep the focus on how the work really happens.</p></section>
        <section id="limitations" className="scroll-mt-24 border-t border-border py-8"><p className="editorial-label">Testing and limits</p><h2 className="mt-3 text-3xl">What is checked. What still needs care.</h2><div className="mt-6 grid gap-6 sm:grid-cols-2"><div><h3 className="text-xl">Verified in the preview</h3><ul className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground"><li>34 automated tests passed in the latest full check.</li><li>Sample capture, text upload, cited answers, translated maps and tracked agent runs completed.</li><li>Phone and laptop navigation, saved dark mode and sign-out protection were checked.</li><li>Browser voice recording with spoken test audio completed transcription and extraction. Incomplete plans stayed Draft.</li></ul></div><div><h3 className="text-xl">Not a blanket guarantee</h3><ul className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground"><li>Physical microphones, screen-sharing permissions and social sign-in depend on the device and account.</li><li>Email sign-in and public signup are enabled, with email confirmation required. A complete new-account journey still needs a real inbox.</li><li>Translations and AI output should be checked against their original evidence.</li><li>A full security review and published-link check remain release steps.</li></ul></div></div><div className="mt-6 border-t border-border pt-5"><h3 className="text-xl">Practical limits</h3><ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground"><li>Uploads are limited to 25 MB per file. Split long recordings.</li><li>Scanned or password-protected documents may not yield usable text. Export chats as text.</li><li>Invitations match the invited email address; invitation emails are not sent yet.</li><li>Missing procedures stay flagged. Capture the evidence, then regenerate the plan.</li><li>Agent tasks run while the page stays open; they are not durable background jobs.</li></ul></div></section>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border py-8"><p className="text-lg">Start with the sample. Leave with the evidence.</p><Button asChild><Link to="/app">Open app <ArrowRight /></Link></Button></div>
      </main>
    </div>
  </div>;
}
