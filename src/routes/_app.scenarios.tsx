import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, ChevronRight, Clock, Terminal } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, DifficultyBadge } from "@/components/interview-ui";
import { scenarios, type Scenario } from "@/lib/coach-data";

export const Route = createFileRoute("/_app/scenarios")({
  head: () => ({
    meta: [
      { title: "Production Scenario Lab — Mainframe Coach" },
      {
        name: "description",
        content:
          "Troubleshoot real mainframe production incidents — S0C7 abends, DB2 -911 deadlocks, CICS failures — step by step with AI guidance.",
      },
      { property: "og:title", content: "Production Scenario Lab — Mainframe Coach" },
      {
        property: "og:description",
        content: "Practise real on-call mainframe incidents and build production troubleshooting instincts.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ScenarioLabPage,
});

function ScenarioLabPage() {
  const [active, setActive] = useState<Scenario | null>(null);
  const [revealed, setRevealed] = useState<string[]>([]);
  const [showCause, setShowCause] = useState(false);

  const open = (s: Scenario) => {
    setActive(s);
    setRevealed([]);
    setShowCause(false);
  };

  return (
    <AppShell title="Production Scenario Lab">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {!active ? (
          <>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Production Scenario Lab</h1>
            <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
              Real production incidents, one evidence step at a time. You decide what to look at — the lab reveals the
              log, dump or catalog output and evaluates your reasoning.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              {scenarios.map((s) => (
                <button
                  key={s.id}
                  onClick={() => open(s)}
                  className="card-hover rounded-2xl border border-border bg-card p-5 text-left"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded bg-destructive/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-destructive ring-1 ring-destructive/20">
                      {s.code}
                    </span>
                    <DifficultyBadge level={s.difficulty === "Senior" ? "Advanced" : s.difficulty} />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-foreground">{s.title}</p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{s.summary}</p>
                  <div className="mt-4 flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="size-3.5" /> {s.minutes} min
                    </span>
                    <span>· {s.category}</span>
                    <span className="ml-auto flex items-center gap-1 font-semibold text-primary">
                      Start <ChevronRight className="size-3.5" />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-6">
            <button
              onClick={() => setActive(null)}
              className="text-[12px] font-medium text-muted-foreground hover:text-foreground"
            >
              ← All scenarios
            </button>

            <Card className="p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded bg-destructive/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-destructive ring-1 ring-destructive/20">
                  {active.code}
                </span>
                <h1 className="text-base font-semibold text-foreground">{active.title}</h1>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{active.brief}</p>
              <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-6">
                {Object.entries(active.incident).map(([k, v]) => (
                  <div key={k} className="rounded-lg border border-border bg-muted/25 p-2.5">
                    <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{k}</dt>
                    <dd className="mt-0.5 font-mono text-[12px] text-foreground">{v}</dd>
                  </div>
                ))}
              </dl>
            </Card>

            <div className="space-y-4">
              {active.steps.map((step, i) => {
                const isOpen = revealed.includes(step.id);
                const unlocked = i === 0 || revealed.includes(active.steps[i - 1]!.id);
                return (
                  <Card key={step.id} className="p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-medium text-foreground">
                        <span className="mr-2 font-mono text-[11px] text-muted-foreground">Step {i + 1}</span>
                        {step.label}
                      </p>
                      {!isOpen && (
                        <button
                          onClick={() => setRevealed((r) => [...r, step.id])}
                          disabled={!unlocked}
                          className="rounded-lg bg-primary px-3 py-1.5 text-[12px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
                        >
                          Request evidence
                        </button>
                      )}
                    </div>
                    {isOpen && (
                      <div className="mt-4">
                        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          <Terminal className="size-3.5 text-primary" /> {step.evidenceTitle}
                        </p>
                        <pre className="mt-2 overflow-x-auto rounded-xl border border-border bg-muted/40 p-4 font-mono text-[12px] leading-relaxed text-foreground">
                          {step.evidence}
                        </pre>
                        <p className="mt-3 text-[13px] text-muted-foreground">
                          <span className="font-semibold text-foreground">What this tells you: </span>
                          {step.insight}
                        </p>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>

            <Card className="p-5">
              {!showCause ? (
                <button
                  onClick={() => setShowCause(true)}
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  Reveal root cause & expected resolution
                </button>
              ) : (
                <>
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-warning">
                    <AlertTriangle className="size-3.5" /> Root cause
                  </p>
                  <p className="mt-2 text-[13px] leading-relaxed text-foreground">{active.rootCause}</p>
                  <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    This scenario evaluates
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {active.evaluates.map((e) => (
                      <span key={e} className="rounded-md bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">
                        {e}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}
