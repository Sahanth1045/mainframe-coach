import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, AlertCircle, Target } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, SectionLabel, ScoreBar, DifficultyBadge, PrimaryButton, EmptyState, toneFor } from "@/components/interview-ui";
import { topics, weakestTopic } from "@/lib/interview-data";

export const Route = createFileRoute("/_app/practice")({
  head: () => ({
    meta: [
      { title: "Practice — Mainframe Interview Coach" },
      { name: "description", content: "Topic-based interview questions and exercises." },
    ],
  }),
  component: PracticePage,
});

const strengthStyle: Record<string, string> = {
  Strong: "text-success",
  Proficient: "text-primary",
  Developing: "text-warning",
  "Needs work": "text-destructive",
};
const strengthIcon: Record<string, React.ElementType> = {
  Strong: CheckCircle2,
  Proficient: CheckCircle2,
  Developing: AlertCircle,
  "Needs work": AlertCircle,
};

function PracticePage() {
  return (
    <AppShell title="Practice">
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Practice Hub</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Topic-based interview questions and exercises. Start where you're weakest.
            </p>
          </div>
          <PrimaryButton to="/interview">
            <Target className="size-4" /> Start a Mock Interview
          </PrimaryButton>
        </div>

        {/* Weak area highlight */}
        <Card className="flex flex-col gap-4 border-primary/20 bg-primary/5 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <Target className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Recommended: practice {weakestTopic.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {weakestTopic.accuracy}% accuracy · {weakestTopic.completed}/{weakestTopic.total} questions · {weakestTopic.note}
              </p>
            </div>
          </div>
          <button className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
            Practice {weakestTopic.name} <ArrowRight className="size-4" />
          </button>
        </Card>

        {/* Topic grid */}
        <section className="space-y-4">
          <SectionLabel>All Topics</SectionLabel>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topics.map((t) => {
              const Icon = strengthIcon[t.strength];
              const tone = toneFor(t.mastery);
              return (
                <Card key={t.id} className="card-hover p-5">
                  <div className="flex items-start justify-between">
                    <span className="rounded bg-muted px-2 py-1 font-mono text-xs font-bold text-foreground">{t.id}</span>
                    <DifficultyBadge level={t.difficulty} />
                  </div>
                  <div className="mt-4 flex items-baseline justify-between">
                    <p className="text-2xl font-bold tabular-nums text-foreground">{t.mastery}%</p>
                    <span className={`flex items-center gap-1 text-xs font-semibold ${strengthStyle[t.strength]}`}>
                      <Icon className="size-3.5" /> {t.strength}
                    </span>
                  </div>
                  <div className="mt-3">
                    <ScoreBar value={t.mastery} tone={tone} />
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {t.completed} / {t.total} questions · {t.accuracy}% accuracy
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{t.note}</p>
                  <button className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
                    Practice {t.name} <ArrowRight className="size-3.5" />
                  </button>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Recent attempts placeholder */}
        <section className="space-y-4">
          <SectionLabel>Recommended for you</SectionLabel>
          <EmptyState
            title="Targeted practice sets are queued for your weak areas"
            description="Practice DB2 locking, CICS transactions and S0C7 debugging next — generated from your last interview feedback."
            cta={<PrimaryButton to="/practice">Generate Practice Set</PrimaryButton>}
          />
        </section>
      </div>
    </AppShell>
  );
}
