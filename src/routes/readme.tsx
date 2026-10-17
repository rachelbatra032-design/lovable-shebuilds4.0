import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Brand } from "@/components/Brand";

export const Route = createFileRoute("/readme")({
  head: () => ({
    meta: [
      { title: "Read Me — how to review Kaimaaral" },
      { name: "description", content: "A 3-minute walkthrough of Kaimaaral: who it's for, what works, design choices and known limitations." },
      { property: "og:title", content: "Read Me — how to review Kaimaaral" },
      { property: "og:description", content: "A 3-minute walkthrough: usefulness, functionality, user experience and originality." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReadMe,
});

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-border py-6 sm:py-8">
      <p className="text-sm font-medium text-muted-foreground">{n}</p>
      <h2 className="mt-2 text-2xl sm:text-3xl">{title}</h2>
      <div className="mt-4 space-y-3 text-[1.02rem] leading-relaxed [&_li]:ml-5 [&_li]:list-disc [&_strong]:font-semibold">{children}</div>
    </section>
  );
}

function ReadMe() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-4xl items-center justify-between px-5 py-5">
        <Brand />
        <Button asChild>
          <Link to="/app">Open app</Link>
        </Button>
      </header>
      <main className="mx-auto max-w-4xl space-y-6 px-5 pb-20">
        <div className="py-6">
          <h1 className="text-5xl sm:text-6xl">Read Me</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Kaimaaral (കൈമാറൽ, Malayalam for "handover") captures how a role actually works, in the language people really speak,
            and turns it into an onboarding map for whoever comes next.
          </p>
        </div>

        <Section n="Start here" title="Review it in 3 minutes">
          <ol className="space-y-2 [&>li]:ml-5 [&>li]:list-decimal">
            <li>Sign in, choose your recording languages and optional reading language, then choose <strong>Load sample company</strong>. This creates your own private copy of the fictional "Kerala Spices Traders".</li>
            <li>Open <strong>Finance → Accounts Lead</strong> (Anitha, leaving soon). Note the completeness score.</li>
            <li>On the <strong>Map</strong> tab, switch between <strong>Read</strong> and <strong>Visual</strong>. Click any item to see its source: the original Malayalam voice note and its English meaning.</li>
            <li>Change the language at the top to <strong>മലയാളം / हिन्दी / தமிழ்</strong> — the map is translated on demand.</li>
            <li>Open <strong>Review</strong>: a WhatsApp chat says the packaging vendor changed. Tap <strong>Confirm change</strong> and the map updates itself.</li>
            <li>Open <strong>Ask</strong> and try "How do I pay a new vendor?" — the answer cites its sources.</li>
            <li>Open <strong>Capture</strong> and record a short voice note in any language (or type one). Watch it get transcribed and added to the map.</li>
            <li>Optional: <strong>Plan</strong> generates a 30–60–90-day handover plan with executable instructions and sources. Missing screen paths, decision criteria, approval rules or completion criteria are flagged; incomplete plans stay <strong>Draft</strong>.</li>
          </ol>
        </Section>

        <Section n="Criterion 1" title="Usefulness & understanding of the user">
          <p><strong>Category:</strong> Business Operations — preserving role knowledge and preparing successors for day-to-day work.</p>
          <p>
            <strong>Who:</strong> small and medium businesses in India (traders, exporters, clinics, agencies) with 10–200 staff, where one person
            often holds a whole function in their head, and where everyday work happens in Malayalam, Hindi or Tamil over WhatsApp and phone calls.
          </p>
          <p>
            <strong>Problem:</strong> when that person resigns, the knowledge leaves with them. Wikis like Confluence or Notion don't work here: nobody
            has time to write SOPs, they're English-only, and they go stale within weeks.
          </p>
          <ul>
            <li><strong>Voice in your own language</strong> → removes the writing barrier and the English barrier.</li>
            <li><strong>Organized by role, not by page</strong> → the successor inherits the position's knowledge, not a folder.</li>
            <li><strong>Decisions with the reasons behind them</strong> → captures judgment ("why ₹50,000 needs approval"), not just steps.</li>
            <li><strong>Completeness score</strong> → managers can spot single points of failure <em>before</em> someone leaves.</li>
          </ul>
        </Section>

        <Section n="Criterion 2" title="Functionality & execution">
          <ul>
            <li><strong>Real AI, end to end:</strong> voice notes are transcribed in their original language, then structured into 6 categories with source links, merged with existing knowledge, and checked for contradictions.</li>
            <li><strong>Inputs:</strong> voice notes, typed notes, PDF, Word, Excel/CSV, email and WhatsApp/Slack text exports, KT/screen recordings (audio is transcribed and screenshots become step-by-step guides).</li>
            <li><strong>Ask the role:</strong> answers only from the role map, cites items, and says so when the map doesn't know.</li>
            <li><strong>Workspace:</strong> departments, roles, email invites. Data is private to each company's members.</li>
            <li><strong>Sample vs. real:</strong> the sample company's starting logs and map are pre-written and labeled "Sample data". Everything you add is processed live by AI.</li>
            <li><strong>Errors:</strong> each input shows its status (transcribing → extracting → done / failed with a reason) and can be retried.</li>
          </ul>
        </Section>

        <Section n="Criterion 3" title="User experience & design">
          <ul>
            <li><strong>Built for phones first</strong> for daily logging: one big mic button, with no forms to fill in.</li>
            <li><strong>Read / Visual toggle</strong> for different learning styles.</li>
            <li><strong>Proper Indic fonts</strong> (Noto Sans Malayalam, Devanagari, Tamil) at a readable size, with the original language always one tap away.</li>
            <li>A minimal monochrome layout, consistent typography, high-contrast text and keyboard-accessible controls on phones and laptops.</li>
          </ul>
        </Section>

        <Section n="Criterion 4" title="Originality">
          <ul>
            <li>Built for regional languages first, where most tools in this space are English-only.</li>
            <li>The "role twin": knowledge belongs to the position and is handed to the successor.</li>
            <li>One-tap change confirmation keeps the map fresh without anyone rewriting docs.</li>
          </ul>
        </Section>

        <Section n="Good to know" title="Known limitations">
          <ul>
            <li>Recordings up to about 25 MB (roughly 10–15 minutes of audio). Longer KT sessions should be split.</li>
            <li>Transcription accuracy can vary with strong dialects, background noise or heavy code-mixing; the original transcript is always shown so you can check it.</li>
            <li>Scanned images inside documents and password-protected files aren't read. WhatsApp/Slack must be exported as text.</li>
            <li>Email invites are matched when the invited person signs up with the same email; no invite email is sent yet.</li>
            <li>All sample people, companies and figures are fictional.</li>
            <li>AI answers and translations need checking against their sources. A readiness check validates recorded evidence, not the correctness of your business procedures.</li>
            <li>A plan stays Draft when necessary details are not recorded. Capture the missing procedures, then make a new plan; the app does not invent them.</li>
          </ul>
        </Section>
      </main>
    </div>
  );
}
