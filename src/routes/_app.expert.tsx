import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Star, CalendarCheck } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, ScoreBar, toneFor } from "@/components/interview-ui";
import {
  experts,
  expertFeedbackSample,
  expertInterviewTypes,
  expertLevels,
  progression,
} from "@/lib/coach-data";

export const Route = createFileRoute("/_app/expert")({
  head: () => ({
    meta: [
      { title: "Live Expert Interview — Mainframe Coach" },
      {
        name: "description",
        content:
          "Book a live mock interview with a senior mainframe professional as the final stage of your interview preparation.",
      },
      { property: "og:title", content: "Live Expert Interview — Mainframe Coach" },
      {
        property: "og:description",
        content: "Practise with real mainframe experts once your AI readiness score is high enough.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ExpertPage,
});

const steps = ["Interview type", "Level", "Expert", "Date & time", "Confirm"];

function ExpertPage() {
  const [step, setStep] = useState(0);
  const [type, setType] = useState<string | null>(null);
  const [level, setLevel] = useState<string | null>(null);
  const [expertId, setExpertId] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);

  const expert = experts.find((e) => e.id === expertId);
  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));

  return (
    <AppShell title="Live Expert Interview">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Live Expert Interview</h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
          The final stage: a real interview with a senior mainframe professional, followed by written feedback.
        </p>

        {/* Readiness progression */}
        <Card className="mt-6 p-5">
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                AI readiness
              </p>
              <p className="text-3xl font-bold tabular-nums text-foreground">
                {progression.readiness}
                <span className="text-base font-medium text-muted-foreground">%</span>
              </p>
              <p className="mt-1 text-[12px] font-medium text-success">{progression.recommendation}</p>
            </div>
            <div className="min-w-[240px] flex-1 space-y-2.5">
              {progression.breakdown.map((b) => (
                <div key={b.name}>
                  <div className="flex justify-between text-[11px] font-medium">
                    <span className="text-muted-foreground">{b.name}</span>
                    <span className="tabular-nums text-foreground">{b.value}%</span>
                  </div>
                  <div className="mt-1">
                    <ScoreBar value={b.value} tone={toneFor(b.value)} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Stepper */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {steps.map((s, i) => (
            <div
              key={s}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold ${
                i === step
                  ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                  : i < step
                    ? "text-success"
                    : "text-muted-foreground"
              }`}
            >
              {i < step ? <Check className="size-3.5" /> : <span className="tabular-nums">{i + 1}</span>} {s}
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="p-5 lg:col-span-2">
            {step === 0 && (
              <div className="flex flex-wrap gap-2">
                {expertInterviewTypes.map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setType(t);
                      next();
                    }}
                    className={`rounded-lg border px-3 py-2 text-[13px] font-medium transition-colors ${
                      type === t
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}

            {step === 1 && (
              <div className="flex flex-wrap gap-2">
                {expertLevels.map((l) => (
                  <button
                    key={l}
                    onClick={() => {
                      setLevel(l);
                      next();
                    }}
                    className={`rounded-lg border px-4 py-2.5 text-[13px] font-medium transition-colors ${
                      level === l
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                {experts.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => {
                      setExpertId(e.id);
                      next();
                    }}
                    className={`card-hover flex w-full items-start gap-4 rounded-xl border p-4 text-left ${
                      expertId === e.id ? "border-primary bg-primary/5" : "border-border"
                    }`}
                  >
                    <div className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-[12px] font-bold text-primary ring-1 ring-primary/20">
                      {e.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">{e.name}</p>
                        <span className="flex items-center gap-1 text-[11px] font-medium text-warning">
                          <Star className="size-3 fill-current" /> {e.rating}
                        </span>
                        <span className="text-[11px] text-muted-foreground">· {e.years} yrs · {e.interviews} interviews</span>
                      </div>
                      <p className="mt-1 text-[13px] text-muted-foreground">{e.bio}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {e.specialties.map((s) => (
                          <span key={s} className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {step === 3 && expert && (
              <div className="flex flex-wrap gap-2">
                {expert.slots.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setSlot(s);
                      next();
                    }}
                    className={`rounded-lg border px-3 py-2 text-[13px] font-medium transition-colors ${
                      slot === s
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {step === 4 && (
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <CalendarCheck className="size-4 text-success" /> Booking summary
                </p>
                <dl className="mt-4 space-y-2 text-[13px]">
                  {[
                    ["Interview type", type],
                    ["Level", level],
                    ["Expert", expert?.name],
                    ["Date & time", slot],
                    ["Format", "60 min video call + written feedback"],
                  ].map(([k, v]) => (
                    <div key={k as string} className="flex justify-between border-b border-border pb-2">
                      <dt className="text-muted-foreground">{k}</dt>
                      <dd className="font-medium text-foreground">{v ?? "—"}</dd>
                    </div>
                  ))}
                </dl>
                <button
                  onClick={() => setStep(0)}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                >
                  Confirm booking
                </button>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Sample flow — no payment is taken in this prototype.
                </p>
              </div>
            )}

            {step > 0 && (
              <button
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                className="mt-5 text-[12px] font-medium text-muted-foreground hover:text-foreground"
              >
                ← Back
              </button>
            )}
          </Card>

          <Card className="p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Sample expert feedback
            </p>
            <p className="mt-1 text-[12px] text-muted-foreground">
              {expertFeedbackSample.expert} · {expertFeedbackSample.date}
            </p>
            <div className="mt-4 space-y-2">
              {expertFeedbackSample.ratings.map((r) => (
                <div key={r.name} className="flex items-center justify-between text-[12px]">
                  <span className="text-muted-foreground">{r.name}</span>
                  <span className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`size-3 ${i < r.score ? "fill-current text-warning" : "text-muted"}`}
                      />
                    ))}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-success">Did well</p>
            <ul className="mt-1.5 space-y-1 text-[12px] text-muted-foreground">
              {expertFeedbackSample.didWell.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-warning">To improve</p>
            <ul className="mt-1.5 space-y-1 text-[12px] text-muted-foreground">
              {expertFeedbackSample.improve.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
