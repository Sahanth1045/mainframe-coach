import { Mic, Square, RotateCcw, Send, Keyboard, Volume2, Loader2, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export type VoiceState = "ready" | "speaking" | "listening" | "analyzing";

const stateCopy: Record<VoiceState, { label: string; hint: string }> = {
  ready: { label: "Ready", hint: "The interviewer is waiting for your answer." },
  speaking: { label: "AI speaking", hint: "The interviewer is asking the question." },
  listening: { label: "Listening", hint: "Recording your answer — speak naturally." },
  analyzing: { label: "Analyzing", hint: "Evaluating technical accuracy and communication." },
};

/** Subtle bar waveform — reacts to mic level, idles as a calm pulse. */
export function Waveform({
  active,
  level = 0,
  bars = 28,
  className = "",
}: {
  active: boolean;
  level?: number;
  bars?: number;
  className?: string;
}) {
  const [tick, setTick] = useState(0);
  const raf = useRef(0);

  useEffect(() => {
    if (!active) return;
    let last = 0;
    const loop = (t: number) => {
      if (t - last > 70) {
        setTick((n) => n + 1);
        last = t;
      }
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [active]);

  return (
    <div className={`flex h-8 items-center gap-[3px] ${className}`} aria-hidden="true">
      {Array.from({ length: bars }).map((_, i) => {
        const wave = Math.sin((i / bars) * Math.PI * 3 + tick * 0.55);
        const amp = active ? 0.28 + Math.max(level, 0.12) * 0.9 : 0.08;
        const h = Math.max(3, Math.abs(wave) * amp * 32 + (active ? 3 : 2));
        return (
          <span
            key={i}
            className="w-[3px] rounded-full bg-primary/70 transition-[height] duration-150 ease-out"
            style={{ height: `${h}px`, opacity: active ? 0.55 + Math.abs(wave) * 0.45 : 0.3 }}
          />
        );
      })}
    </div>
  );
}

export function VoiceStatePill({ state, level = 0 }: { state: VoiceState; level?: number }) {
  const copy = stateCopy[state];
  const tone =
    state === "listening"
      ? "text-primary"
      : state === "analyzing"
        ? "text-warning"
        : state === "speaking"
          ? "text-foreground"
          : "text-muted-foreground";
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
        {state === "analyzing" ? (
          <Loader2 className="size-4 animate-spin text-warning" />
        ) : state === "listening" ? (
          <Mic className="size-4 text-primary" />
        ) : state === "speaking" ? (
          <Volume2 className="size-4 text-foreground" />
        ) : (
          <Check className="size-4 text-muted-foreground" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-xs font-semibold ${tone}`}>{copy.label}</p>
        <p className="truncate text-[11px] text-muted-foreground">{copy.hint}</p>
      </div>
      <Waveform active={state === "listening" || state === "speaking"} level={state === "listening" ? level : 0.35} bars={18} />
    </div>
  );
}

export function AnswerComposer({
  mode,
  onModeChange,
  value,
  onChange,
  interim,
  listening,
  level,
  voiceSupported,
  voiceError,
  busy,
  onStart,
  onStop,
  onRetry,
  onSubmit,
  placeholder,
}: {
  mode: "voice" | "text";
  onModeChange: (m: "voice" | "text") => void;
  value: string;
  onChange: (v: string) => void;
  interim: string;
  listening: boolean;
  level: number;
  voiceSupported: boolean;
  voiceError: string | null;
  busy: boolean;
  onStart: () => void;
  onStop: () => void;
  onRetry: () => void;
  onSubmit: () => void;
  placeholder: string;
}) {
  const canSubmit = value.trim().length > 0 && !busy && !listening;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5">
          <button
            onClick={() => onModeChange("voice")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-semibold transition-colors ${
              mode === "voice" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Mic className="size-3.5" /> Answer with voice
          </button>
          <button
            onClick={() => onModeChange("text")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-semibold transition-colors ${
              mode === "text" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Keyboard className="size-3.5" /> Type answer
          </button>
        </div>
        <span className="text-[11px] text-muted-foreground">
          {value.trim().split(/\s+/).filter(Boolean).length} words
        </span>
      </div>

      {mode === "voice" ? (
        <div className="mt-4">
          <div className="rounded-xl border border-border bg-muted/25 p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {listening ? "Recording your answer" : value ? "Transcript ready" : "Tap record and answer out loud"}
                </p>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  {listening
                    ? "Pause naturally — the transcript updates as you speak."
                    : "Your speech is transcribed into the conversation as your answer."}
                </p>
              </div>
              <Waveform active={listening} level={level} />
            </div>

            <div className="mt-4 min-h-[96px] rounded-lg border border-border bg-card p-3 text-[14px] leading-relaxed">
              {value || interim ? (
                <p className="text-foreground">
                  {value}
                  {interim && <span className="text-muted-foreground"> {interim}</span>}
                </p>
              ) : (
                <p className="text-muted-foreground/70">Your live transcript will appear here.</p>
              )}
            </div>
          </div>

          {!voiceSupported && (
            <p className="mt-3 text-[12px] text-warning">
              Voice input isn't available in this browser — switch to “Type answer”.
            </p>
          )}
          {voiceError && <p className="mt-3 text-[12px] text-destructive">{voiceError}</p>}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {listening ? (
              <button
                onClick={onStop}
                className="inline-flex items-center gap-2 rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground transition-colors hover:opacity-90"
              >
                <Square className="size-3.5" /> Stop recording
              </button>
            ) : (
              <button
                onClick={onStart}
                disabled={!voiceSupported || busy}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Mic className="size-4" /> {value ? "Continue recording" : "Record answer"}
              </button>
            )}
            <button
              onClick={onRetry}
              disabled={!value && !interim}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
            >
              <RotateCcw className="size-3.5" /> Retry
            </button>
            <button
              onClick={onSubmit}
              disabled={!canSubmit}
              className="ml-auto inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send className="size-4" /> Submit answer
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="min-h-[180px] w-full resize-y rounded-xl border border-border bg-muted/30 p-4 text-[15px] leading-relaxed text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/15"
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              onClick={onRetry}
              disabled={!value}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
            >
              <RotateCcw className="size-3.5" /> Clear
            </button>
            <button
              onClick={onSubmit}
              disabled={!canSubmit}
              className="ml-auto inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="size-4" /> Submit answer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
