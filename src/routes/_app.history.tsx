import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, SectionLabel, ScoreBar, PrimaryButton, EmptyState } from "@/components/interview-ui";
import { interviewHistory, scoreTrend } from "@/lib/interview-data";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export const Route = createFileRoute("/_app/history")({
  head: () => ({
    meta: [
      { title: "Interview History — Mainframe Interview Coach" },
      { name: "description", content: "Previous mock interviews, scores and feedback." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  return (
    <AppShell title="Interview History">
      <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Interview History</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {interviewHistory.length} interviews · compare performance over time
            </p>
          </div>
          <PrimaryButton to="/interview">Start New Interview</PrimaryButton>
        </div>

        {/* Score over time */}
        <section className="space-y-4">
          <SectionLabel>Score Over Time</SectionLabel>
          <Card className="p-6">
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={scoreTrend} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
                  />
                  <Line type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--primary)" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </section>

        {/* History list */}
        <section className="space-y-4">
          <SectionLabel>Previous Interviews</SectionLabel>
          <Card className="divide-y divide-border">
            {interviewHistory.map((iv) => (
              <div key={iv.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-foreground">{iv.title}</h4>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {iv.date} · {iv.type} · {iv.questions} questions · {iv.focus}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  <div className="w-24">
                    <ScoreBar value={iv.score} />
                    <span className="mt-1 block text-xs font-semibold tabular-nums text-foreground">{iv.score}/100</span>
                  </div>
                  <Link
                    to="/interview/feedback"
                    className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    View Feedback <ChevronRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </Card>
        </section>

        <EmptyState
          title="Compare any two interviews"
          description="Select two sessions to see exactly which topics improved and which slipped — coming soon."
          cta={<PrimaryButton to="/progress">View Progress Analytics</PrimaryButton>}
        />
      </div>
    </AppShell>
  );
}
