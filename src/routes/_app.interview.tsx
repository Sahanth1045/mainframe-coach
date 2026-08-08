import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Send, SkipForward, PhoneOff, Clock, ChevronRight, Sparkles, Check } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, Code, DifficultyBadge } from "@/components/interview-ui";
import { interviewMeta, interviewTurns, currentQuestion, interviewExpectations, user } from "@/lib/interview-data";

export const Route = createFileRoute("/_app/interview")({
  head: () => ({
    meta: [
      { title: "AI Mock Interview — Mainframe Interview Coach" },
      { name: "description", content: "Realistic AI-powered mainframe mock interview." },
    ],
  }),
  component: InterviewPage,
});

function InterviewPage() {
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [question] = useState(4);
  const [evaluating, setEvaluating] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const progress = (question / interviewMeta.totalQuestions) * 100;
  const charCount = answer.length;

  const handleSubmit = () => {
    if (!answer.trim()) return;
    setSubmitting(true);
    setEvaluating(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setEvaluating(false);
    }, 1100);
  };

  return (
    <AppShell title="AI Mock Interview">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Interview header */}
        <div className="mb-6 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base font-semibold text-foreground">{interviewMeta.type}</h1>
                <span className="text-muted-foreground">·</span>
                <span className="text-sm text-muted-foreground">{interviewMeta.title}</span>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <DifficultyBadge level={interviewMeta.difficulty} />
                <span className="text-xs text-muted-foreground">Topic: {interviewMeta.topic}</span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="font-mono text-[11px] text-muted-foreground">{interviewMeta.sessionId}</span>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-5">
              <div className="text-right">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Question</p>
                <p className="text-sm font-semibold tabular-nums text-foreground">
                  {question} <span className="text-muted-foreground">of {interviewMeta.totalQuestions}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Time left</p>
                <p className="flex items-center gap-1 text-sm font-semibold tabular-nums text-foreground">
                  <Clock className="size-3.5 text-muted-foreground" /> {interviewMeta.minutesRemaining} min
                </p>
              </div>
            </div>
          </div>
          {/* progress bar */}
          <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="score-bar h-full rounded-full bg-primary"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Conversation + composer */}
          <div className="space-y-6 lg:col-span-2">
            {/* Conversation */}
            <Card className="space-y-6 p-5 sm:p-6">
              {interviewTurns.map((turn, i) =>
                turn.role === "ai" ? (
                  <div key={i} className="flex gap-4">
                    <div className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-[11px] font-bold text-primary ring-1 ring-primary/20">
                      AI
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-foreground">AI Interviewer</p>
                        <span className="text-[11px] text-muted-foreground">{turn.timeAgo}</span>
                      </div>
                      <p className="mt-1 text-[15px] leading-relaxed text-foreground">{turn.text}</p>
                    </div>
                  </div>
                ) : (
                  <div key={i} className="flex gap-4">
                    <div className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-[11px] font-bold text-muted-foreground">
                      {user.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-foreground">You</p>
                        <span className="text-[11px] text-muted-foreground">{turn.timeAgo}</span>
                      </div>
                      <p className="mt-1 text-[15px] leading-relaxed text-foreground">{turn.text}</p>
                    </div>
                  </div>
                )
              )}

              {/* Current question */}
              <div className="flex gap-4 border-t border-border pt-6">
                <div className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-[11px] font-bold text-primary ring-1 ring-primary/20">
                  AI
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-warning/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-warning ring-1 ring-warning/20">
                      {currentQuestion.category}
                    </span>
                    <span className="text-xs font-semibold text-foreground">Follow-up · Question {question}</span>
                  </div>
                  <p className="mt-2 text-[15px] leading-relaxed text-foreground">{currentQuestion.prompt}</p>
                </div>
              </div>
            </Card>

            {/* Composer */}
            <Card className="p-5 sm:p-6">
              <label htmlFor="answer" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Your answer
              </label>
              <textarea
                id="answer"
                ref={textareaRef}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Detail your debugging steps — SYSUDUMP analysis, data-division checks, the root cause and your fix…"
                className="mt-3 min-h-[200px] w-full resize-y rounded-xl border border-border bg-muted/30 p-4 text-[15px] leading-relaxed text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/15"
              />
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-xs text-muted-foreground">
                  {charCount} characters {charCount > 0 && "· " + (charCount > 80 ? "good detail" : "add more detail for a stronger answer")}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <button className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                    <SkipForward className="size-4" /> Skip
                  </button>
                  <button className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/5">
                    <PhoneOff className="size-4" /> End interview
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!answer.trim() || submitting}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting ? (
                      <><Sparkles className="size-4 animate-pulse" /> Evaluating…</>
                    ) : (
                      <><Send className="size-4" /> Submit Answer</>
                    )}
                  </button>
                </div>
              </div>

              {submitted && (
                <div className="mt-4 flex items-start gap-3 rounded-xl border border-success/20 bg-success/5 p-4">
                  <Check className="mt-0.5 size-4 shrink-0 text-success" />
                  <div className="text-sm">
                    <p className="font-semibold text-foreground">Answer submitted — the AI is assessing your response.</p>
                    <p className="mt-0.5 text-muted-foreground">
                      When the interview ends, you'll get a full breakdown across technical, problem-solving and
                      communication.{" "}
                      <Link to="/interview/feedback" className="font-medium text-primary hover:underline">
                        See an example feedback report →
                      </Link>
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Evaluative rail */}
          <div className="space-y-4">
            <Card className="p-5">
              <div className="flex items-center gap-2">
                <span className={`size-1.5 rounded-full ${evaluating ? "bg-primary animate-pulse" : "bg-success"}`} />
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {evaluating ? "AI evaluation active" : "Awaiting your answer"}
                </p>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                The interviewer evaluates technical accuracy, problem-solving structure and communication clarity as
                you respond — then asks a targeted follow-up.
              </p>
              <div className="mt-4 space-y-3">
                {["Technical accuracy", "Problem-solving", "Communication", "Mainframe depth"].map((dim) => (
                  <div key={dim}>
                    <div className="flex justify-between text-[11px] font-medium">
                      <span className="text-muted-foreground">{dim}</span>
                      <span className="text-foreground">{evaluating ? "…" : "—"}</span>
                    </div>
                    <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full bg-primary/40 transition-all ${evaluating ? "w-1/3 animate-pulse" : "w-0"}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                What a strong answer includes
              </p>
              <ul className="mt-3 space-y-2.5">
                {interviewExpectations.map((e) => (
                  <li key={e} className="flex items-start gap-2 text-sm text-foreground">
                    <ChevronRight className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{e}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="bg-muted/30 p-5">
              <p className="text-xs leading-relaxed text-muted-foreground">
                <span className="font-semibold text-foreground">Tip:</span> A senior interviewer expects you to reason
                from the abend code <Code>S0C7</Code> to a concrete root cause — name the completion code and tie the
                offset back to a data-division field.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
