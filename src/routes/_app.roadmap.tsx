import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Check } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, ScoreBar, toneFor } from "@/components/interview-ui";
import { experienceProfile, interviewMemory, roadmap } from "@/lib/coach-data";

export const Route = createFileRoute("/_app/roadmap")({
  head: () => ({
    meta: [
      { title: "My Interview Roadmap — Mainframe Coach" },
      {
        name: "description",
        content:
          "A personalized 14-day mainframe interview plan built from your readiness data, plus your candidate experience profile.",
      },
      { property: "og:title", content: "My Interview Roadmap — Mainframe Coach" },
      {
        property: "og:description",
        content: "Your 14-day plan to become interview ready, generated from your interview performance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RoadmapPage,
});

const kindTone: Record<string, string> = {
  Learn: "bg-primary/10 text-primary ring-primary/20",
  Practice: "bg-muted text-muted-foreground ring-border",
  "AI Interview": "bg-success/10 text-success ring-success/20",
  Scenario: "bg-warning/10 text-warning ring-warning/20",
  Expert: "bg-accent text-accent-foreground ring-border",
};

function RoadmapPage() {
  const done = roadmap.filter((d) => d.done).length;

  return (
    <AppShell title="My Roadmap">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Your 14-day interview roadmap</h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
          Generated from your readiness scores and interview memory. {interviewMemory.headline}
        </p>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-2">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Plan</p>
              <p className="text-[12px] text-muted-foreground">
                {done} of {roadmap.length} days complete
              </p>
            </div>
            {roadmap.map((d) => (
              <Card key={d.day} className="flex items-start gap-4 p-4">
                <div
                  className={`grid size-9 shrink-0 place-items-center rounded-lg text-[12px] font-bold ${
                    d.done ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {d.done ? <Check className="size-4" /> : d.day}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{d.title}</p>
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ${kindTone[d.kind]}`}
                    >
                      {d.kind}
                    </span>
                  </div>
                  <p className="mt-1 text-[13px] text-muted-foreground">{d.detail}</p>
                </div>
                <span className="shrink-0 text-[11px] text-muted-foreground">Day {d.day}</span>
              </Card>
            ))}
          </div>

          <div className="space-y-4">
            <Card className="p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Candidate experience profile
              </p>
              <div className="mt-4 space-y-3.5">
                {experienceProfile.map((s) => (
                  <div key={s.name}>
                    <div className="flex justify-between text-[12px] font-medium">
                      <span className="text-foreground">{s.name}</span>
                      <span className="tabular-nums text-muted-foreground">{s.score}%</span>
                    </div>
                    <div className="mt-1.5">
                      <ScoreBar value={s.score} tone={toneFor(s.score)} />
                    </div>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {s.level} · {s.source}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <CalendarDays className="size-3.5 text-primary" /> Interview memory
              </p>
              <ul className="mt-3 space-y-2 text-[13px] text-muted-foreground">
                {interviewMemory.notes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
