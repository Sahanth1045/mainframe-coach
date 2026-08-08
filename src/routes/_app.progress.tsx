import { createFileRoute } from "@tanstack/react-router";
import { TrendingUp, ArrowUpRight } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { AppShell } from "@/components/app-shell";
import { Card, SectionLabel, ScoreBar, toneFor } from "@/components/interview-ui";
import { readiness, topics, readinessTrend, scoreTrend, interviewHistory } from "@/lib/interview-data";

export const Route = createFileRoute("/_app/progress")({
  head: () => ({
    meta: [
      { title: "Progress — Mainframe Interview Coach" },
      { name: "description", content: "Performance analytics and improvement tracking." },
    ],
  }),
  component: ProgressPage,
});

function ProgressPage() {
  const sorted = [...topics].sort((a, b) => b.mastery - a.mastery);
  const strongest = sorted[0]!;
  const weakest = sorted[sorted.length - 1]!;
  const totalQuestions = topics.reduce((s, t) => s + t.completed, 0);
  const avgAccuracy = Math.round(topics.reduce((s, t) => s + t.accuracy, 0) / topics.length);

  return (
    <AppShell title="Progress">
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Progress</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Your interview readiness trend and topic mastery over time.
          </p>
        </div>

        {/* Top metrics */}
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "Readiness", value: `${readiness.overall}%`, delta: `+${readiness.trend}%`, tone: "success" },
            { label: "Avg accuracy", value: `${avgAccuracy}%`, delta: "+3%", tone: "success" },
            { label: "Questions attempted", value: totalQuestions, delta: "+24", tone: "success" },
            { label: "Learning streak", value: `${readiness.streakDays} days`, delta: "active", tone: "primary" },
          ].map((m) => (
            <Card key={m.label} className="p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{m.label}</p>
              <p className="mt-1.5 text-2xl font-bold tabular-nums text-foreground">{m.value}</p>
              <p className={`mt-1 inline-flex items-center gap-1 text-xs font-semibold ${m.tone === "success" ? "text-success" : "text-primary"}`}>
                <ArrowUpRight className="size-3.5" /> {m.delta}
              </p>
            </Card>
          ))}
        </section>

        {/* Readiness trend */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <SectionLabel>Interview Readiness Trend</SectionLabel>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-success">
                <TrendingUp className="size-3.5" /> +10% over 6 weeks
              </span>
            </div>
            <div className="mt-6 h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={readinessTrend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="readinessGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[40, 100]} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Area type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2.5} fill="url(#readinessGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6">
            <SectionLabel>Interview Scores</SectionLabel>
            <div className="mt-6 h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={scoreTrend} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Line type="monotone" dataKey="score" stroke="var(--success)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--success)" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </section>

        {/* Topic mastery */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="p-6">
            <SectionLabel>Topic Mastery</SectionLabel>
            <div className="mt-5 space-y-4">
              {sorted.map((t) => (
                <div key={t.id}>
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="font-medium text-foreground">{t.name}</span>
                    <span className="tabular-nums text-muted-foreground">{t.mastery}%</span>
                  </div>
                  <div className="mt-1.5">
                    <ScoreBar value={t.mastery} tone={toneFor(t.mastery)} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="border-success/20 bg-success/5 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-success">Strongest topic</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{strongest.name} — {strongest.mastery}%</p>
              <p className="mt-1 text-xs text-muted-foreground">{strongest.note}</p>
            </Card>
            <Card className="border-destructive/20 bg-destructive/5 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-destructive">Weakest topic</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{weakest.name} — {weakest.mastery}%</p>
              <p className="mt-1 text-xs text-muted-foreground">{weakest.note}</p>
            </Card>
            <Card className="p-5">
              <SectionLabel>Recent interviews</SectionLabel>
              <div className="mt-4 space-y-3">
                {interviewHistory.slice(0, 3).map((iv) => (
                  <div key={iv.id} className="flex items-center justify-between text-sm">
                    <span className="truncate text-foreground">{iv.title}</span>
                    <span className={`shrink-0 font-semibold tabular-nums ${iv.score >= 75 ? "text-success" : iv.score >= 65 ? "text-warning" : "text-destructive"}`}>
                      {iv.score}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
