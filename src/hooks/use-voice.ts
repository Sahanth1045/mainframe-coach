import { useCallback, useEffect, useRef, useState } from "react";

// Browser Web Speech API wrappers. Voice is optional everywhere — when the
// browser has no support the UI falls back to typing.

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: any) => void) | null;
  onerror: ((e: any) => void) | null;
  onend: (() => void) | null;
};

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as any;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function useSpeechSupport() {
  const [support, setSupport] = useState({ mic: false, speaker: false });
  useEffect(() => {
    setSupport({
      mic: getRecognitionCtor() !== null,
      speaker: typeof window !== "undefined" && "speechSynthesis" in window,
    });
  }, []);
  return support;
}

/** Microphone dictation with live interim transcript. */
export function useDictation() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [level, setLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const audioRef = useRef<{ ctx: AudioContext; stream: MediaStream; raf: number } | null>(null);

  const stopMeter = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    cancelAnimationFrame(a.raf);
    a.stream.getTracks().forEach((t) => t.stop());
    void a.ctx.close();
    audioRef.current = null;
    setLevel(0);
  }, []);

  const startMeter = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new AudioContext();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      src.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i]! - 128) / 128;
          sum += v * v;
        }
        setLevel(Math.min(1, Math.sqrt(sum / data.length) * 3.2));
        const raf = requestAnimationFrame(tick);
        if (audioRef.current) audioRef.current.raf = raf;
      };
      audioRef.current = { ctx, stream, raf: requestAnimationFrame(tick) };
    } catch {
      // Metering is cosmetic — dictation can still work without it.
    }
  }, []);

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      setError("Voice input isn't supported in this browser — type your answer instead.");
      return;
    }
    setError(null);
    const rec = new Ctor();
    rec.lang = "en-US";
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e: any) => {
      let finalText = "";
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalText += r[0].transcript;
        else interimText += r[0].transcript;
      }
      if (finalText) setTranscript((prev) => (prev ? `${prev} ${finalText.trim()}` : finalText.trim()));
      setInterim(interimText);
    };
    rec.onerror = (e: any) => {
      if (e?.error === "not-allowed") setError("Microphone permission was blocked. Enable it or type your answer.");
      else if (e?.error !== "aborted") setError("Voice input stopped unexpectedly. You can retry or type instead.");
    };
    rec.onend = () => {
      setListening(false);
      setInterim("");
      stopMeter();
    };
    recRef.current = rec;
    rec.start();
    setListening(true);
    void startMeter();
  }, [startMeter, stopMeter]);

  const stop = useCallback(() => {
    recRef.current?.stop();
    setListening(false);
    stopMeter();
  }, [stopMeter]);

  const reset = useCallback(() => {
    setTranscript("");
    setInterim("");
    setError(null);
  }, []);

  useEffect(() => () => {
    recRef.current?.abort();
    stopMeter();
  }, [stopMeter]);

  return { listening, transcript, interim, level, error, start, stop, reset, setTranscript };
}

/** Reads interviewer questions aloud. */
export function useNarration(enabled: boolean) {
  const [speaking, setSpeaking] = useState(false);

  const speak = useCallback(
    (text: string) => {
      if (!enabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.98;
      u.pitch = 1;
      u.onstart = () => setSpeaking(true);
      u.onend = () => setSpeaking(false);
      u.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(u);
    },
    [enabled],
  );

  const cancel = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  useEffect(() => () => cancel(), [cancel]);

  return { speaking, speak, cancel };
}
