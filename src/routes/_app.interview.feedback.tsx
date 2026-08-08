import { createFileRoute } from "@tanstack/react-router";
import { Check, AlertCircle, Sparkles, Target, ArrowRight, Quote } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, SectionLabel, ScoreBar, PrimaryButton, GhostButton, toneFor, Code } from "@/components/interview-ui";
import { feedback, interviewMeta } from "@/lib/interview-data";

export const Route = createFileRoute("/_app/interview/feedback")({
  head: () => ({
    meta: [
      { title: "Interview Feedback — Mainframe Interview Coach" },
      { name: "description", content: "Detailed AI feedback on your mock interview." },
    ],
  }),
  component: FeedbackPage,
});

function FeedbackPage() {
  return (
    <AppShell title="Interview Feedback">
      <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-md bg-success/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-success ring-1 ring-success/20">
              <Check className="size-3.5" /> Interview Complete
            </span>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Senior Mainframe Mock Interview
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {feedback.date} · {interviewMeta.type} · {interviewMeta.totalQuestions} questions · Session {interviewMeta.sessionId}
            </p>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold tracking-tight tabular-nums text-foreground">{feedback.overall}</span>
            <span className="text-xl font-medium text-muted-foreground">/ 100</span>
          </div>
        </div>

        {/* Score dimensions */}
        <section className="space-y-4">
          <SectionLabel>Score Breakdown</SectionLabel>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {feedback.dimensions.map((d) => (
              <Card key={d.name} className="p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{d.name}</p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{d.score}</p>
                <div className="mt-3">
                  <ScoreBar value={d.score} />
                </div>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{d.note}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Did well / missed */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="border-success/20 bg-success/5 p-6">
            <div className="flex items-center gap-2">
              <Check className="size-4 text-success" />
              <h3 className="text-sm font-semibold uppercase tracking-wide text-success">What you did well</h3>
            </div>
            <ul className="mt-4 space-y-3">
              {feedback.didWell.map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-sm text-foreground">
                  <Check className="mt-0.5 size-4 shrink-0 text-success" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="border-warning/20 bg-warning/5 p-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="size-4 text-warning" />
              <h3 className="text-sm font-semibold uppercase tracking-wide text-warning">What you missed</h3>
            </div>
            <ul className="mt-4 space-y-3">
              {feedback.missed.map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-sm text-foreground">
                  <AlertCircle className="mt-0.5 size-4 shrink-0 text-warning" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </Card>
        </section>

        {/* Improved answer */}
        <section className="space-y-4">
          <SectionLabel>Model Answer</SectionLabel>
          <Card className="p-6">
            <p className="text-sm text-foreground">{feedback.improvedAnswer.intro}</p>
            <ol className="mt-4 space-y-3">
              {feedback.improvedAnswer.points.map((p, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-foreground">
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                    {i + 1}
                  </span>
                  <span>{p}</span>
                </li>
              ))}
            </ol>
          </Card>
        </section>

        {/* Interviewer feedback */}
        <section className="space-y-4">
          <SectionLabel>Interviewer Feedback</SectionLabel>
          <Card className="flex gap-4 p-6">
            <Quote className="size-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm leading-relaxed text-foreground">{feedback.interviewerNote}</p>
              <p className="mt-3 text-xs font-medium text-muted-foreground">— AI Interviewer · Senior Mainframe Developer</p>
            </div>
          </Card>
        </section>

        {/* Practice next */}
        <section className="space-y-4">
          <SectionLabel>Recommended Practice Next</SectionLabel>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {feedback.practiceNext.map((p) => (
              <Card key={p.topic} className="card-hover p-5">
                <div className="flex items-center gap-2 text-primary">
                  <Target className="size-4" />
                  <p className="text-sm font-semibold text-foreground">{p.topic}</p>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{p.count} questions · targeted to your gaps</p>
                <button className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
                  Practice {p.topic} <ArrowRight className="size-3.5" />
                </button>
              </Card>
            ))}
          </div>
        </section>

        {/* Actions */}
        <section className="flex flex-col gap-3 rounded-xl border border-border bg-primary/5 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Sparkles className="size-5 shrink-0 text-primary" />
            <p className="text-sm text-foreground">
              <span className="font-semibold">You're 68% interview ready.</span> Practicing the weak areas above should
              lift you toward the <Code>75%</Code> senior benchmark.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <GhostButton to="/practice">Practice Weak Areas</GhostButton>
            <PrimaryButton to="/interview">Start Another Interview</PrimaryButton>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
