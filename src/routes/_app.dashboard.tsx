import { createFileRoute, Link } from "@tanstack/react-router";
import { Play, Target, GraduationCap, MessageSquareText, ArrowRight, Flame, ArrowUpRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import {
  Card,
  SectionLabel,
  ScoreBar,
  ReadinessGauge,
  PrimaryButton,
  GhostButton,
  Code,
} from "@/components/interview-ui";
import { MainframeCoreStage, SkillUniverseStage } from "@/components/three/stages";
import { user, readiness, topics, weakestTopic, learningPaths, interviewHistory } from "@/lib/interview-data";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Mainframe Interview Coach" },
      { name: "description", content: "Your interview readiness command center." },
    ],
  }),
  component: DashboardPage,
});

const hour = new Date().getHours();
const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

function DashboardPage() {
  const continuePath = learningPaths[0] ?? learningPaths.at(0)!;
  const lastInterview = interviewHistory[0] ?? interviewHistory.at(0)!;
  const topTopics = topics.slice(0, 5);

  return (
    <AppShell title="Dashboard">
      <div className="mx-auto max-w-6xl space-y-10 px-4 py-8 sm:px-6 lg:px-8">
        {/* Holographic hero */}
        <section className="relative overflow-hidden rounded-3xl border border-transparent glass-panel holo-glow">
          <MainframeCoreStage className="absolute inset-0 h-full w-full opacity-70" />
          <div className="relative grid grid-cols-[minmax(0,1fr)_auto] items-end gap-6 p-6 sm:flex sm:flex-wrap sm:justify-between sm:p-8">
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">{greeting}, {user.name}</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                You're <span className="text-primary">{readiness.overall}%</span> interview ready
              </h1>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                Readiness is up {readiness.trend}% this week. Focus on{" "}
                <span className="font-medium text-foreground">{weakestTopic.name}</span> to reach the senior benchmark.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <PrimaryButton to="/interview">
                <Play className="size-4" /> Start Mock Interview
              </PrimaryButton>
            </div>
          </div>
        </section>

        {/* Skill universe */}
        <section className="space-y-4">
          <SectionLabel>Skill Universe</SectionLabel>
          <Card glass className="overflow-hidden p-0">
            <SkillUniverseStage topics={topics} className="h-[300px] w-full sm:h-[380px]" />
          </Card>
        </section>


        {/* Readiness + weakness alert */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 p-6 sm:p-8">
            <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-6">
                <ReadinessGauge value={readiness.overall} />
                <div className="hidden space-y-3 sm:block">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {readiness.level}
                    </p>
                    <p className="mt-0.5 text-sm text-foreground">
                      {readiness.streakDays}-day learning streak
                    </p>
                  </div>
                  <div className="flex gap-4">
                    {[
                      { label: "Technical", value: readiness.technical },
                      { label: "Communication", value: readiness.communication },
                      { label: "Problem Solving", value: readiness.problemSolving },
                    ].map((s) => (
                      <div key={s.label}>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          {s.label}
                        </p>
                        <p className="text-lg font-semibold tabular-nums text-foreground">{s.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-success">
                <ArrowUpRight className="size-4" />
                <span className="text-xs font-semibold">+{readiness.trend}% this week</span>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-border pt-6 sm:grid-cols-3 md:grid-cols-5">
              {topTopics.map((t) => (
                <div key={t.id} className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                      {t.name}
                    </p>
                    <p className="text-xs font-semibold tabular-nums text-foreground">{t.mastery}%</p>
                  </div>
                  <ScoreBar value={t.mastery} />
                </div>
              ))}
            </div>
          </Card>

          {/* Weakness recommendation */}
          <Card className="flex flex-col bg-foreground p-6 text-background">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-md bg-primary/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary ring-1 ring-primary/30">
              <Target className="size-3" /> Weakest Area
            </span>
            <h3 className="mt-5 text-lg font-semibold">{weakestTopic.name}</h3>
            <p className="mt-2 text-sm leading-relaxed text-background/70">
              {weakestTopic.note} Your accuracy here is {weakestTopic.accuracy}%. A focused session will lift your
              overall readiness fastest.
            </p>
            <div className="mt-6 flex items-center gap-2 text-sm text-background/70">
              <Flame className="size-4 text-warning" />
              <span>Recommended next step</span>
            </div>
            <p className="mt-1 text-sm font-medium">
              Practice {weakestTopic.name} scenarios & error handling.
            </p>
            <Link
              to="/practice"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-background/90"
            >
              Practice {weakestTopic.name} <ArrowRight className="size-4" />
            </Link>
          </Card>
        </section>

        {/* Secondary actions */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SecondaryAction
            to="/practice"
            icon={<Target className="size-4" />}
            title="Practice Weak Areas"
            desc={`${weakestTopic.name} · ${weakestTopic.accuracy}% accuracy`}
          />
          <SecondaryAction
            to="/learn"
            icon={<GraduationCap className="size-4" />}
            title="Continue Learning"
            desc={`${continuePath.title} · ${continuePath.progress}% complete`}
          />
          <SecondaryAction
            to="/history"
            icon={<MessageSquareText className="size-4" />}
            title="Review Last Interview"
            desc={`${lastInterview.title} · ${lastInterview.score}/100`}
          />
        </section>

        {/* Recent performance */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <SectionLabel>Recent Performance</SectionLabel>
            <Link to="/history" className="text-xs font-medium text-primary hover:underline">
              View all
            </Link>
          </div>
          <Card className="divide-y divide-border">
            {interviewHistory.slice(0, 3).map((iv) => (
              <div key={iv.id} className="flex items-center justify-between gap-4 p-4 sm:p-5">
                <div className="min-w-0">
                  <h4 className="truncate text-sm font-semibold text-foreground">{iv.title}</h4>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {iv.date} · {iv.type} · {iv.questions} questions · {iv.focus}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  <span
                    className={`text-sm font-bold tabular-nums ${iv.score >= 75 ? "text-success" : iv.score >= 65 ? "text-warning" : "text-destructive"}`}
                  >
                    {iv.score}/100
                  </span>
                  <Link
                    to="/history"
                    className="hidden rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted sm:inline-flex"
                  >
                    View Feedback
                  </Link>
                </div>
              </div>
            ))}
          </Card>
        </section>

        {/* Tip strip */}
        <section className="flex flex-col gap-3 rounded-xl border border-border bg-primary/5 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <Code>?</Code>
            </div>
            <p className="text-sm text-foreground">
              <span className="font-semibold">Coach tip:</span> Senior interviewers expect you to reason from the abend
              code to a reproducible root cause — name the completion code and tie the offset to a data-division field.
            </p>
          </div>
          <PrimaryButton to="/interview" className="shrink-0">
            Start a Mock Interview
          </PrimaryButton>
        </section>
      </div>
    </AppShell>
  );
}

function SecondaryAction({
  to,
  icon,
  title,
  desc,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Link
      to={to}
      className="card-hover flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm"
    >
      <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{desc}</p>
      </div>
      <ArrowRight className="ml-auto size-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}
