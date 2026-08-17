import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronRight,
  Sparkles,
  Check,
  Volume2,
  VolumeX,
  PhoneOff,
  SkipForward,
  FileText,
  Upload,
  Brain,
  ArrowUpRight,
  TrendingUp,
  Lightbulb,
  AlertTriangle,
  Play,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, Code, ScoreBar, toneFor } from "@/components/interview-ui";
import { AnswerComposer, VoiceStatePill, type VoiceState } from "@/components/voice-ui";
import { CoachStage, VoiceStage } from "@/components/three/stages";
import { useDictation, useNarration, useSpeechSupport } from "@/hooks/use-voice";
import { user } from "@/lib/interview-data";
import {
  interviewModes,
  interviewTracks,
  interviewMemory,
  resumeExtract,
  resumeQuestions,
  type BankQuestion,
  type Difficulty,
  type ModeId,
} from "@/lib/coach-data";
import {
  adaptDifficulty,
  aggregate,
  bridgeFor,
  buildQueue,
  evaluateAnswer,
  followUpFor,
  modeBehaviour,
  type AnswerEvaluation,
  type Turn,
} from "@/lib/interview-engine";

export const Route = createFileRoute("/_app/interview")({
  head: () => ({
    meta: [
      { title: "AI Real-Time Interview — Mainframe Coach" },
      {
        name: "description",
        content:
          "Answer by voice or text in a realistic AI mainframe interview that adapts difficulty, asks follow-ups and evaluates your answers instantly.",
      },
      { property: "og:title", content: "AI Real-Time Interview — Mainframe Coach" },
      {
        property: "og:description",
        content: "Voice or text mock interviews with adaptive follow-ups and instant technical feedback.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InterviewPage,
});

type Phase = "setup" | "live" | "report";

function resumeToQuestions(): BankQuestion[] {
  return resumeQuestions.map((r, i) => ({
    id: `resume-${i}`,
    topic: "Experience",
    category: "From your resume",
    difficulty: "Core" as Difficulty,
    prompt: r.prompt,
    expects: ["because", "impact", "measured", "root cause", "design", "risk"],
    deeper: r.followUp,
    simpler: `Let's ground it — walk me through the ${r.source.toLowerCase()} at a high level first.`,
    modelAnswer:
      "A strong answer names the concrete problem, the evidence you used, the change you made, the measured impact and the risk you mitigated — in that order.",
  }));
}

function InterviewPage() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [modeId, setModeId] = useState<ModeId>("coaching");
  const [trackId, setTrackId] = useState<string>("full");
  const [useResume, setUseResume] = useState(false);
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [narrate, setNarrate] = useState(true);

  const [queue, setQueue] = useState<BankQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [followUpDone, setFollowUpDone] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("Core");
  const [evals, setEvals] = useState<AnswerEvaluation[]>([]);
  const [answered, setAnswered] = useState<{ question: BankQuestion; evaluation: AnswerEvaluation }[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [composerMode, setComposerMode] = useState<"voice" | "text">("voice");
  const [draft, setDraft] = useState("");

  const support = useSpeechSupport();
  const dictation = useDictation();
  const narration = useNarration(narrate);
  const bottomRef = useRef<HTMLDivElement>(null);

  const behaviour = modeBehaviour[modeId];
  const current = queue[index];
  const total = queue.length;

  // Voice transcript flows into the draft answer.
  useEffect(() => {
    if (dictation.transcript) setDraft(dictation.transcript);
  }, [dictation.transcript]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns.length, analyzing]);

  const voiceState: VoiceState = analyzing
    ? "analyzing"
    : dictation.listening
      ? "listening"
      : narration.speaking
        ? "speaking"
        : "ready";

  const say = useCallback(
    (text: string, extra?: Partial<Turn>) => {
      setTurns((prev) => [...prev, { id: `ai-${prev.length}-${Date.now()}`, role: "ai", text, ...extra }]);
      narration.speak(text);
    },
    [narration],
  );

  const start = () => {
    const base = buildQueue(trackId, interviewMemory.revisitTopics);
    const withResume = useResume && resumeUploaded ? [...resumeToQuestions().slice(0, 2), ...base] : base;
    const q = withResume.slice(0, 6);
    setQueue(q);
    setIndex(0);
    setEvals([]);
    setAnswered([]);
    setFollowUpDone(false);
    setDifficulty(q[0]?.difficulty ?? "Core");
    setDraft("");
    dictation.reset();
    setPhase("live");
    const opener =
      modeId === "realistic"
        ? `Thanks for joining. I'm your interviewer for this ${interviewTracks.find((t) => t.id === trackId)?.name} session. Let's begin.`
        : `Welcome. I'll give you feedback as we go. Let's start.`;
    setTurns([{ id: "opener", role: "ai", text: opener, label: "Introduction" }]);
    setTimeout(() => {
      if (q[0]) say(q[0].prompt, { label: `Question 1 · ${q[0].category}` });
    }, 500);
  };

  const submit = (viaVoice: boolean) => {
    const text = draft.trim();
    if (!text || !current) return;
    const evaluation = evaluateAnswer(current, text);

    setTurns((prev) => [
      ...prev,
      { id: `me-${prev.length}`, role: "candidate", text, viaVoice, evaluation },
    ]);
    setEvals((prev) => [...prev, evaluation]);
    setAnswered((prev) => [...prev, { question: current, evaluation }]);
    setDraft("");
    dictation.reset();
    if (dictation.listening) dictation.stop();
    setAnalyzing(true);

    setTimeout(() => {
      setAnalyzing(false);
      const nextDifficulty = adaptDifficulty(difficulty, evaluation.verdict);
      setDifficulty(nextDifficulty);

      if (!followUpDone) {
        setFollowUpDone(true);
        say(followUpFor(current, evaluation), { label: "Follow-up", isFollowUp: true });
        return;
      }

      const nextIdx = index + 1;
      if (nextIdx >= queue.length) {
        say("That's everything I wanted to cover. Let me put your evaluation together.");
        setTimeout(() => setPhase("report"), 900);
        return;
      }
      setIndex(nextIdx);
      setFollowUpDone(false);
      const nq = queue[nextIdx]!;
      say(`${bridgeFor(evaluation.verdict)} ${nq.prompt}`, {
        label: `Question ${nextIdx + 1} · ${nq.category}`,
      });
    }, 1200);
  };

  const skip = () => {
    if (!current) return;
    const nextIdx = index + 1;
    setDraft("");
    dictation.reset();
    if (nextIdx >= queue.length) {
      setPhase("report");
      return;
    }
    setIndex(nextIdx);
    setFollowUpDone(false);
    const nq = queue[nextIdx]!;
    say(`No problem, let's move on. ${nq.prompt}`, { label: `Question ${nextIdx + 1} · ${nq.category}` });
  };

  const endInterview = () => {
    narration.cancel();
    if (dictation.listening) dictation.stop();
    setPhase(answered.length > 0 ? "report" : "setup");
  };

  const liveScores = useMemo(() => aggregate(evals), [evals]);

  return (
    <AppShell title="AI Real-Time Interview">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {phase === "setup" && (
          <SetupView
            modeId={modeId}
            setModeId={setModeId}
            trackId={trackId}
            setTrackId={setTrackId}
            useResume={useResume}
            setUseResume={setUseResume}
            resumeUploaded={resumeUploaded}
            setResumeUploaded={setResumeUploaded}
            narrate={narrate}
            setNarrate={setNarrate}
            speakerSupported={support.speaker}
            micSupported={support.mic}
            onStart={start}
          />
        )}

        {phase === "live" && (
          <>
            <div className="mb-6 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-base font-semibold text-foreground">
                      {interviewTracks.find((t) => t.id === trackId)?.name} Interview
                    </h1>
                    <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary ring-1 ring-primary/20">
                      {interviewModes.find((m) => m.id === modeId)?.name} mode
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Adaptive difficulty:{" "}
                    <span className="font-semibold text-foreground">{difficulty}</span> · Answer by voice or text
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-5">
                  <div className="text-right">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Question</p>
                    <p className="text-sm font-semibold tabular-nums text-foreground">
                      {Math.min(index + 1, total)} <span className="text-muted-foreground">of {total}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setNarrate((n) => !n);
                      narration.cancel();
                    }}
                    className="grid size-8 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label={narrate ? "Mute interviewer voice" : "Unmute interviewer voice"}
                    title={narrate ? "Mute interviewer voice" : "Unmute interviewer voice"}
                  >
                    {narrate ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
                  </button>
                </div>
              </div>
              <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="score-bar h-full rounded-full bg-primary"
                  style={{ width: `${total ? ((index + (followUpDone ? 0.5 : 0)) / total) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <Card glass className="holo-grid relative overflow-hidden p-0">
                  <CoachStage
                    state={voiceState}
                    level={dictation.level}
                    className="h-40 w-full sm:h-52"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-3">
                    <VoiceStatePill state={voiceState} level={dictation.level} />
                  </div>
                </Card>


                <Card className="space-y-6 p-5 sm:p-6">
                  {turns.map((turn) =>
                    turn.role === "ai" ? (
                      <div key={turn.id} className="flex gap-4">
                        <div className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-[11px] font-bold text-primary ring-1 ring-primary/20">
                          AI
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-xs font-semibold text-foreground">AI Interviewer</p>
                            {turn.label && (
                              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                {turn.label}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-[15px] leading-relaxed text-foreground">{turn.text}</p>
                        </div>
                      </div>
                    ) : (
                      <div key={turn.id} className="flex gap-4">
                        <div className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-[11px] font-bold text-muted-foreground">
                          {user.initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-semibold text-foreground">You</p>
                            {turn.viaVoice && (
                              <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                                Spoken · transcribed
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-[15px] leading-relaxed text-foreground">{turn.text}</p>

                          {turn.evaluation && behaviour.shortFeedback && (
                            <p className="mt-2 text-[13px] text-muted-foreground">
                              <span className="font-semibold text-foreground">Quick note:</span>{" "}
                              {turn.evaluation.short}
                            </p>
                          )}

                          {turn.evaluation && behaviour.correctionsDuring && (
                            <InlineFeedback evaluation={turn.evaluation} />
                          )}
                        </div>
                      </div>
                    ),
                  )}

                  {analyzing && (
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Sparkles className="size-4 animate-pulse text-primary" />
                      Analyzing your answer — technical accuracy, reasoning and clarity…
                    </div>
                  )}
                  <div ref={bottomRef} />
                </Card>

                {dictation.listening && (
                  <Card glass className="overflow-hidden p-0">
                    <VoiceStage level={dictation.level} active className="h-28 w-full" />
                  </Card>
                )}

                <AnswerComposer

                  mode={composerMode}
                  onModeChange={setComposerMode}
                  value={draft}
                  onChange={setDraft}
                  interim={dictation.interim}
                  listening={dictation.listening}
                  level={dictation.level}
                  voiceSupported={support.mic}
                  voiceError={dictation.error}
                  busy={analyzing}
                  onStart={() => {
                    narration.cancel();
                    dictation.start();
                  }}
                  onStop={dictation.stop}
                  onRetry={() => {
                    dictation.reset();
                    setDraft("");
                  }}
                  onSubmit={() => submit(composerMode === "voice")}
                  placeholder="Explain your approach — the evidence you'd gather, the root cause and the fix…"
                />

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={skip}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <SkipForward className="size-4" /> Skip question
                  </button>
                  <button
                    onClick={endInterview}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/5"
                  >
                    <PhoneOff className="size-4" /> End interview
                  </button>
                </div>
              </div>

              {/* Performance panel — preserved from V1 */}
              <div className="space-y-4">
                <Card className="p-5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`size-1.5 rounded-full ${analyzing ? "animate-pulse bg-primary" : "bg-success"}`}
                    />
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {analyzing ? "AI evaluation active" : evals.length ? "Live performance" : "Awaiting your answer"}
                    </p>
                  </div>
                  <div className="mt-4 space-y-3">
                    {["Technical accuracy", "Problem-solving", "Communication", "Mainframe depth"].map((dim) => {
                      const last = evals[evals.length - 1];
                      const v = last?.dimensions.find((d) => d.name === dim)?.score;
                      return (
                        <div key={dim}>
                          <div className="flex justify-between text-[11px] font-medium">
                            <span className="text-muted-foreground">{dim}</span>
                            <span className="text-foreground tabular-nums">
                              {analyzing ? "…" : v !== undefined ? `${v}%` : "—"}
                            </span>
                          </div>
                          <div className="mt-1.5">
                            <ScoreBar value={analyzing ? 33 : (v ?? 0)} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {liveScores && (
                    <p className="mt-4 text-[11px] text-muted-foreground">
                      Running average across {evals.length} answer{evals.length === 1 ? "" : "s"}:{" "}
                      <span className="font-semibold text-foreground">{liveScores.overall}%</span>
                    </p>
                  )}
                </Card>

                <Card className="p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Adaptive engine
                  </p>
                  <ul className="mt-3 space-y-2 text-[13px] text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="mt-0.5 size-4 shrink-0 text-primary" />
                      Difficulty is now <span className="font-semibold text-foreground">{difficulty}</span> based on your
                      last answer.
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="mt-0.5 size-4 shrink-0 text-primary" />
                      {followUpDone
                        ? "Follow-up already asked — next answer moves to a new topic."
                        : "A targeted follow-up will probe the weakest part of your answer."}
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="mt-0.5 size-4 shrink-0 text-primary" />
                      Revisiting from memory: {interviewMemory.revisitTopics.join(", ")}.
                    </li>
                  </ul>
                </Card>

                {current && (
                  <Card className="p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      What a strong answer includes
                    </p>
                    <ul className="mt-3 flex flex-wrap gap-1.5">
                      {current.expects.slice(0, 6).map((e) => (
                        <li
                          key={e}
                          className="rounded-md bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground"
                        >
                          {e}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                      <span className="font-semibold text-foreground">Tip:</span> reason from the evidence — name the
                      completion code (e.g. <Code>S0C7</Code>) and tie it to a concrete field or resource.
                    </p>
                  </Card>
                )}
              </div>
            </div>
          </>
        )}

        {phase === "report" && (
          <ReportView
            answered={answered}
            modeName={interviewModes.find((m) => m.id === modeId)?.name ?? ""}
            trackName={interviewTracks.find((t) => t.id === trackId)?.name ?? ""}
            onRestart={() => setPhase("setup")}
          />
        )}
      </div>
    </AppShell>
  );
}

function InlineFeedback({ evaluation }: { evaluation: AnswerEvaluation }) {
  const tone =
    evaluation.verdict === "strong"
      ? "border-success/20 bg-success/5"
      : evaluation.verdict === "partial"
        ? "border-warning/20 bg-warning/5"
        : "border-destructive/20 bg-destructive/5";
  return (
    <div className={`mt-3 rounded-xl border p-4 ${tone}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Instant feedback</p>
        <span className="text-sm font-bold tabular-nums text-foreground">{evaluation.score}/10</span>
      </div>
      <p className="mt-2 text-[13px] text-foreground">
        <span className="font-semibold">Did well: </span>
        {evaluation.didWell}
      </p>
      {evaluation.missed.length > 0 && (
        <p className="mt-1.5 text-[13px] text-foreground">
          <span className="font-semibold">Missed: </span>
          {evaluation.missed.slice(0, 4).join(", ")}
        </p>
      )}
      <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
        <span className="font-semibold text-foreground">Correction: </span>
        {evaluation.correction}
      </p>
    </div>
  );
}

function SetupView({
  modeId,
  setModeId,
  trackId,
  setTrackId,
  useResume,
  setUseResume,
  resumeUploaded,
  setResumeUploaded,
  narrate,
  setNarrate,
  speakerSupported,
  micSupported,
  onStart,
}: {
  modeId: ModeId;
  setModeId: (m: ModeId) => void;
  trackId: string;
  setTrackId: (t: string) => void;
  useResume: boolean;
  setUseResume: (v: boolean) => void;
  resumeUploaded: boolean;
  setResumeUploaded: (v: boolean) => void;
  narrate: boolean;
  setNarrate: (v: boolean) => void;
  speakerSupported: boolean;
  micSupported: boolean;
  onStart: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Start an AI interview</h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
          A real-time interviewer asks the questions, listens to your spoken or typed answers, adapts the difficulty and
          evaluates technical accuracy, problem-solving and communication.
        </p>
      </div>

      {/* Interview memory */}
      <Card className="p-5">
        <div className="flex items-start gap-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
            <Brain className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Interview memory
            </p>
            <p className="mt-1.5 text-sm text-foreground">{interviewMemory.headline}</p>
            <ul className="mt-3 space-y-1.5">
              {interviewMemory.notes.map((n) => (
                <li key={n} className="flex items-start gap-2 text-[13px] text-muted-foreground">
                  <ChevronRight className="mt-0.5 size-3.5 shrink-0 text-primary" />
                  {n}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {/* Modes */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Interview mode</p>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {interviewModes.map((m) => {
            const active = m.id === modeId;
            return (
              <button
                key={m.id}
                onClick={() => setModeId(m.id)}
                className={`card-hover rounded-2xl border p-5 text-left ${
                  active ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border bg-card"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">{m.name}</p>
                  {active && <Check className="size-4 text-primary" />}
                </div>
                <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-primary">{m.tagline}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{m.description}</p>
                <ul className="mt-3 space-y-1">
                  {m.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <span className="size-1 rounded-full bg-primary/60" /> {b}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Interview track</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {interviewTracks.map((t) => (
              <button
                key={t.id}
                onClick={() => setTrackId(t.id)}
                className={`rounded-lg border px-3 py-2 text-[13px] font-medium transition-colors ${
                  t.id === trackId
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
          <p className="mt-3 text-[12px] text-muted-foreground">
            Covers: {interviewTracks.find((t) => t.id === trackId)?.topics.join(" · ")}
          </p>

          <div className="mt-6 border-t border-border pt-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Personalize from your resume
            </p>
            {!resumeUploaded ? (
              <div className="mt-3 rounded-xl border border-dashed border-border bg-muted/20 p-5 text-center">
                <Upload className="mx-auto size-5 text-muted-foreground" />
                <p className="mt-2 text-sm font-medium text-foreground">Upload your resume</p>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  The interviewer will ask about your actual projects, technologies and responsibilities.
                </p>
                <button
                  onClick={() => {
                    setResumeUploaded(true);
                    setUseResume(true);
                  }}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <FileText className="size-4" /> Choose file (sample)
                </button>
              </div>
            ) : (
              <div className="mt-3 rounded-xl border border-border bg-muted/20 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <FileText className="size-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">{resumeExtract.fileName}</span>
                    <span className="text-[11px] text-muted-foreground">· {resumeExtract.years} yrs experience</span>
                  </div>
                  <label className="flex cursor-pointer items-center gap-2 text-[12px] font-medium text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={useResume}
                      onChange={(e) => setUseResume(e.target.checked)}
                      className="size-3.5 accent-[var(--primary)]"
                    />
                    Use resume questions
                  </label>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {resumeExtract.technologies.map((t) => (
                    <span key={t} className="rounded-md bg-card px-2 py-1 text-[11px] font-medium text-muted-foreground">
                      {t}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-[12px] text-muted-foreground">
                  Example generated question: “{resumeQuestions[0]?.prompt}”
                </p>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Voice experience</p>
          <div className="mt-4 space-y-3 text-[13px]">
            <label className="flex items-center justify-between gap-3">
              <span className="text-foreground">Interviewer speaks questions</span>
              <input
                type="checkbox"
                checked={narrate}
                onChange={(e) => setNarrate(e.target.checked)}
                className="size-4 accent-[var(--primary)]"
              />
            </label>
            <p className="text-[12px] text-muted-foreground">
              {speakerSupported
                ? "Questions are read aloud; you can mute at any time during the interview."
                : "Speech output isn't available in this browser — questions will be text only."}
            </p>
            <div className="border-t border-border pt-3">
              <p className="text-foreground">Microphone answers</p>
              <p className="mt-1 text-[12px] text-muted-foreground">
                {micSupported
                  ? "Supported — you can answer by voice with a live transcript, or type instead."
                  : "Not supported in this browser — you can still type every answer."}
              </p>
            </div>
          </div>
          <button
            onClick={onStart}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98]"
          >
            <Play className="size-4" /> Start interview
          </button>
          <p className="mt-3 text-center text-[11px] text-muted-foreground">
            6 questions · adaptive follow-ups · ~20 min
          </p>
        </Card>
      </div>
    </div>
  );
}

function ReportView({
  answered,
  modeName,
  trackName,
  onRestart,
}: {
  answered: { question: BankQuestion; evaluation: AnswerEvaluation }[];
  modeName: string;
  trackName: string;
  onRestart: () => void;
}) {
  const scores = aggregate(answered.map((a) => a.evaluation));
  const weakest = [...answered].sort((a, b) => a.evaluation.score - b.evaluation.score)[0];

  if (!scores) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-muted-foreground">No answers were recorded in this session.</p>
        <button
          onClick={onRestart}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Start again
        </button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Post-interview report
          </p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
            {trackName} · {modeName} mode
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {answered.length} answers evaluated across technical accuracy, problem-solving and communication.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onRestart}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Interview again
          </button>
          <Link
            to="/roadmap"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            Improve weak areas <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </div>

      <Card className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Overall</p>
            <p className="text-4xl font-bold tabular-nums tracking-tight text-foreground">
              {scores.overall}
              <span className="text-lg font-medium text-muted-foreground">%</span>
            </p>
          </div>
          <div className="min-w-[240px] flex-1 space-y-3">
            {scores.dimensions.map((d) => (
              <div key={d.name}>
                <div className="flex justify-between text-[12px] font-medium">
                  <span className="text-muted-foreground">{d.name}</span>
                  <span className="tabular-nums text-foreground">{d.score}%</span>
                </div>
                <div className="mt-1.5">
                  <ScoreBar value={d.score} tone={toneFor(d.score)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Answer-by-answer corrections
        </p>
        {answered.map(({ question, evaluation }, i) => (
          <Card key={`${question.id}-${i}`} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {question.topic} · {question.category}
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">{question.prompt}</p>
              </div>
              <span className="rounded-lg bg-muted px-2.5 py-1 text-sm font-bold tabular-nums text-foreground">
                {evaluation.score}/10
              </span>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-success/20 bg-success/5 p-4">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-success">
                  <Check className="size-3.5" /> What you did well
                </p>
                <p className="mt-2 text-[13px] text-foreground">{evaluation.didWell}</p>
              </div>
              <div className="rounded-xl border border-warning/20 bg-warning/5 p-4">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-warning">
                  <AlertTriangle className="size-3.5" /> What you missed
                </p>
                <p className="mt-2 text-[13px] text-foreground">
                  {evaluation.missed.length ? evaluation.missed.join(", ") : "Nothing significant."}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-border bg-muted/25 p-4">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                <Lightbulb className="size-3.5 text-primary" /> Improved senior-level answer
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-foreground">{question.modelAnswer}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          <TrendingUp className="size-3.5 text-primary" /> Recommended next steps
        </p>
        <ul className="mt-3 space-y-2 text-[13px] text-foreground">
          {weakest && (
            <li className="flex items-start gap-2">
              <ChevronRight className="mt-0.5 size-4 shrink-0 text-primary" />
              Revisit <span className="font-semibold">{weakest.question.topic}</span> — your weakest answer this
              session ({weakest.evaluation.score}/10).
            </li>
          )}
          <li className="flex items-start gap-2">
            <ChevronRight className="mt-0.5 size-4 shrink-0 text-primary" />
            Run a Production Scenario Lab incident to practise the same reasoning under pressure.
          </li>
          <li className="flex items-start gap-2">
            <ChevronRight className="mt-0.5 size-4 shrink-0 text-primary" />
            Repeat this interview in Realistic mode once your weak topics are above 80%.
          </li>
        </ul>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            to="/scenarios"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Open Scenario Lab
          </Link>
          <Link
            to="/practice"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Practise weak topics
          </Link>
          <Link
            to="/expert"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Book a live expert
          </Link>
        </div>
      </Card>
    </div>
  );
}
