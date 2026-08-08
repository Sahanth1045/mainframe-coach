import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, X, Sparkles, MessageSquareText, Target, TrendingUp } from "lucide-react";
import { Code } from "@/components/interview-ui";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mainframe Interview Coach — AI interview prep for mainframe developers" },
      {
        name: "description",
        content:
          "Become interview-ready for your next mainframe job. Practice realistic mainframe interviews with an AI interviewer that evaluates your technical knowledge, reasoning and communication.",
      },
      { property: "og:title", content: "Mainframe Interview Coach" },
      {
        property: "og:description",
        content:
          "AI-powered mock interviews, personalized feedback and topic-level analysis for mainframe developers.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: LandingPage,
});

const traditional = [
  "Random questions with no structure",
  "No personalized feedback",
  "Hard to know what to study",
  "No realistic interview practice",
];
const platform = [
  "AI-powered realistic interviews",
  "Personalized, actionable feedback",
  "Topic-level strength analysis",
  "Progress tracking over time",
  "Targeted practice on weak areas",
  "Senior-level scenario questions",
];

function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Sparkles className="size-4" />
            </div>
            <span className="text-sm font-semibold tracking-tight">Mainframe Coach</span>
          </div>
          <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            <a href="#why" className="hover:text-foreground">Why us</a>
            <a href="#preview" className="hover:text-foreground">Product</a>
            <a href="#topics" className="hover:text-foreground">Topics</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/dashboard"
              className="hidden rounded-lg px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted sm:inline-flex"
            >
              Explore the Platform
            </Link>
            <Link
              to="/interview"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98]"
            >
              Start Your Interview
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
              <span className="size-1.5 rounded-full bg-primary" /> Built for mainframe developers
            </span>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Become interview-ready for your next mainframe job.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-pretty text-muted-foreground">
              Practice realistic mainframe interviews with an AI interviewer that evaluates your technical knowledge,
              reasoning and communication — then tells you exactly what to fix.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/interview"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md active:scale-[0.98]"
              >
                Start Your Interview <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Explore the Platform
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Product preview */}
      <section id="preview" className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              The interview experience
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              A real interviewer, not a quiz.
            </h2>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
            <div className="flex items-center justify-between border-b border-border bg-muted/40 px-5 py-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="size-2.5 rounded-full bg-destructive/40" />
                  <span className="size-2.5 rounded-full bg-warning/40" />
                  <span className="size-2.5 rounded-full bg-success/40" />
                </div>
                <span className="ml-3 text-xs font-medium text-muted-foreground">
                  Mock Interview · Senior Mainframe Developer
                </span>
              </div>
              <span className="text-xs font-medium text-muted-foreground">Question 4 of 15 · 32 min</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3">
              <div className="space-y-6 p-6 lg:col-span-2 lg:border-r lg:border-border">
                <div className="flex gap-4">
                  <div className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-[11px] font-bold text-primary ring-1 ring-primary/20">
                    AI
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">AI Interviewer</p>
                    <p className="mt-1 text-[15px] leading-relaxed text-foreground">
                      A production batch job is failing with <Code>S0C7</Code>. Walk me through how you would
                      investigate it.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-[11px] font-bold text-muted-foreground">
                    SK
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">You</p>
                    <p className="mt-1 text-[15px] leading-relaxed text-foreground">
                      I'd pull the SYSUDUMP, map the failing offset back through the PMAP to the COBOL statement, then
                      inspect the COMP-3 field for non-numeric data and trace the input source…
                    </p>
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-4 text-primary" />
                    <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                      Live AI Evaluation
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-foreground">
                    <span className="font-semibold">Strong answer.</span> Technical accuracy: 88%.
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Missing: mention validation of numeric fields and the relevant data definitions.
                  </p>
                </div>
              </div>

              <div className="space-y-4 bg-muted/20 p-6">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  What the interviewer expects
                </p>
                <ul className="space-y-2.5 text-sm text-foreground">
                  {["SYSUDUMP / CEEDUMP analysis", "Packed-decimal (COMP-3) validation", "OFFSET → COBOL statement mapping", "Trace the corrupt data source"].map((e) => (
                    <li key={e} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-success" />
                      <span>{e}</span>
                    </li>
                  ))}
                </ul>
                <div className="rounded-lg border border-dashed border-border p-3">
                  <p className="text-xs text-muted-foreground">
                    After you answer, the AI follows up — exactly like a senior engineer taking notes across the table.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why this platform */}
      <section id="why" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Why this platform?</h2>
          <p className="mt-3 text-muted-foreground">
            Traditional prep leaves you guessing. Mainframe Interview Coach shows you exactly where you stand.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-muted-foreground">Traditional preparation</h3>
            <ul className="mt-4 space-y-3">
              {traditional.map((t) => (
                <li key={t} className="flex items-start gap-3 text-sm text-foreground">
                  <X className="mt-0.5 size-4 shrink-0 text-destructive" />
                  <span className="text-muted-foreground">{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-primary">Mainframe Interview Coach</h3>
            <ul className="mt-4 space-y-3">
              {platform.map((t) => (
                <li key={t} className="flex items-start gap-3 text-sm text-foreground">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Topics */}
      <section id="topics" className="border-t border-border bg-card/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Covers the full mainframe stack</h2>
            <p className="mt-3 text-muted-foreground">
              From COBOL fundamentals to production debugging and modernization scenarios.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2.5">
            {["COBOL", "JCL", "DB2", "CICS", "VSAM", "IMS", "MQ", "Abends", "Debugging", "Architecture", "Batch processing", "Production support", "Modernization"].map((t) => (
              <span key={t} className="rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground shadow-sm">
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-foreground p-8 text-center text-background sm:p-12">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Start your first mock interview today.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-background/70">
            It takes 30 minutes and establishes your baseline. The coach handles the rest.
          </p>
          <Link
            to="/interview"
            className="mt-7 inline-flex items-center gap-2 rounded-lg bg-background px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-background/90"
          >
            Start Your Interview <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="size-4 text-primary" />
            Mainframe Interview Coach
          </div>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><MessageSquareText className="size-3.5" /> Mock Interviews</span>
            <span className="inline-flex items-center gap-1.5"><Target className="size-3.5" /> Targeted Practice</span>
            <span className="inline-flex items-center gap-1.5"><TrendingUp className="size-3.5" /> Progress Tracking</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
