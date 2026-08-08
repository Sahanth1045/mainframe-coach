import { createFileRoute } from "@tanstack/react-router";
import { Check, Lock, ArrowRight, GraduationCap } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, SectionLabel, ScoreBar, DifficultyBadge, PrimaryButton } from "@/components/interview-ui";
import { learningPaths } from "@/lib/interview-data";

export const Route = createFileRoute("/_app/learn")({
  head: () => ({
    meta: [
      { title: "Learn — Mainframe Interview Coach" },
      { name: "description", content: "Structured learning paths for mainframe technologies." },
    ],
  }),
  component: LearnPage,
});

function LearnPage() {
  return (
    <AppShell title="Learning Paths">
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Learning Paths</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Structured, interview-focused paths — not a textbook. Pick up where you left off.
            </p>
          </div>
          <PrimaryButton to="/interview">
            <GraduationCap className="size-4" /> Test what you've learned
          </PrimaryButton>
        </div>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {learningPaths.map((path) => {
            const completed = path.modules.filter((m) => m.done).length;
            const active = path.modules.find((m) => !m.done);
            return (
              <Card key={path.id} className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-foreground">{path.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{path.subtitle}</p>
                  </div>
                  <DifficultyBadge level={path.level} />
                </div>

                <div className="mt-5 flex items-center gap-3">
                  <div className="flex-1">
                    <ScoreBar value={path.progress} />
                  </div>
                  <span className="text-sm font-semibold tabular-nums text-foreground">{path.progress}%</span>
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {completed} of {path.modules.length} modules complete
                </p>

                <ul className="mt-5 space-y-2.5">
                  {path.modules.map((m) => (
                    <li key={m.name} className="flex items-center gap-3 text-sm">
                      {m.done ? (
                        <span className="grid size-5 shrink-0 place-items-center rounded-full bg-success/15 text-success">
                          <Check className="size-3" />
                        </span>
                      ) : (
                        <span className="grid size-5 shrink-0 place-items-center rounded-full border border-border text-muted-foreground">
                          <Lock className="size-2.5" />
                        </span>
                      )}
                      <span className={m.done ? "text-muted-foreground line-through decoration-muted-foreground/40" : "font-medium text-foreground"}>
                        {m.name}
                      </span>
                    </li>
                  ))}
                </ul>

                <button className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
                  {active ? `Continue: ${active.name}` : "Review path"} <ArrowRight className="size-4" />
                </button>
              </Card>
            );
          })}
        </section>

        <section className="space-y-4">
          <SectionLabel>Coach recommendation</SectionLabel>
          <Card className="flex flex-col gap-4 border-primary/20 bg-primary/5 p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-foreground">
              You're strongest in <span className="font-semibold">COBOL</span>. Deepening{" "}
              <span className="font-semibold">DB2 locking</span> next will have the biggest impact on your readiness.
            </p>
            <PrimaryButton to="/practice">Practice DB2</PrimaryButton>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}
