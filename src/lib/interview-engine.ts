// MOCK adaptive interview engine.
// This is deterministic local logic used to prototype the AI interview experience.
// No AI model is connected — swap `evaluateAnswer` / `nextQuestion` for real
// gateway calls when the backend lands.

import {
  difficultyOrder,
  interviewTracks,
  questionBank,
  type BankQuestion,
  type Difficulty,
  type ModeId,
} from "./coach-data";

export interface AnswerEvaluation {
  score: number; // 0-10
  verdict: "strong" | "partial" | "weak";
  dimensions: { name: string; score: number }[];
  hit: string[];
  missed: string[];
  didWell: string;
  correction: string;
  short: string;
}

export interface Turn {
  id: string;
  role: "ai" | "candidate";
  text: string;
  /** Marks an answer that arrived through the microphone. */
  viaVoice?: boolean;
  label?: string;
  evaluation?: AnswerEvaluation;
  isFollowUp?: boolean;
}

const dims = ["Technical accuracy", "Problem-solving", "Communication", "Mainframe depth"] as const;

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

export function buildQueue(trackId: string, revisitTopics: string[] = []): BankQuestion[] {
  const track = interviewTracks.find((t) => t.id === trackId) ?? interviewTracks[0]!;
  const inTrack = questionBank.filter((q) => track.topics.includes(q.topic));
  const pool = inTrack.length > 0 ? inTrack : questionBank;
  // Interview memory: weak topics are pulled to the front.
  const revisit = pool.filter((q) => revisitTopics.includes(q.topic));
  const rest = pool.filter((q) => !revisitTopics.includes(q.topic));
  const byDifficulty = (a: BankQuestion, b: BankQuestion) =>
    difficultyOrder.indexOf(a.difficulty) - difficultyOrder.indexOf(b.difficulty);
  return [...revisit.sort(byDifficulty), ...rest.sort(byDifficulty)];
}

/** Deterministic keyword-coverage scoring — stands in for real AI evaluation. */
export function evaluateAnswer(question: BankQuestion, answer: string): AnswerEvaluation {
  const text = answer.toLowerCase();
  const hit = question.expects.filter((k) => text.includes(k.toLowerCase()));
  const missed = question.expects.filter((k) => !hit.includes(k));
  const coverage = question.expects.length ? hit.length / question.expects.length : 0;

  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const depth = clamp(Math.round((words / 90) * 100), 0, 100);
  const structure = /(first|then|next|finally|because|after that|step)/.test(text) ? 88 : 68;

  const technical = clamp(Math.round(coverage * 100));
  const problemSolving = clamp(Math.round(coverage * 70 + structure * 0.3));
  const communication = clamp(Math.round(structure * 0.7 + Math.min(depth, 100) * 0.3));
  const mainframeDepth = clamp(Math.round(coverage * 80 + depth * 0.2));

  const score = Math.round(((technical + problemSolving + communication + mainframeDepth) / 4 / 10) * 10) / 10;
  const verdict: AnswerEvaluation["verdict"] = coverage >= 0.55 ? "strong" : coverage >= 0.3 ? "partial" : "weak";

  return {
    score: Math.round(score),
    verdict,
    dimensions: [
      { name: dims[0], score: technical },
      { name: dims[1], score: problemSolving },
      { name: dims[2], score: communication },
      { name: dims[3], score: mainframeDepth },
    ],
    hit,
    missed,
    didWell:
      hit.length > 0
        ? `You covered ${hit.slice(0, 3).join(", ")}${hit.length > 3 ? ` and ${hit.length - 3} more` : ""}.`
        : "You engaged with the scenario and offered a starting point.",
    correction: question.modelAnswer,
    short:
      verdict === "strong"
        ? "Solid — good technical grounding."
        : verdict === "partial"
          ? `Reasonable, but you missed ${missed.slice(0, 2).join(" and ")}.`
          : `Thin answer — the key points are ${question.expects.slice(0, 3).join(", ")}.`,
  };
}

export function adaptDifficulty(current: Difficulty, verdict: AnswerEvaluation["verdict"]): Difficulty {
  const i = difficultyOrder.indexOf(current);
  if (verdict === "strong") return difficultyOrder[Math.min(i + 1, difficultyOrder.length - 1)]!;
  if (verdict === "weak") return difficultyOrder[Math.max(i - 1, 0)]!;
  return current;
}

/** The interviewer's next utterance: a follow-up on the same question, or a hand-off. */
export function followUpFor(question: BankQuestion, evaluation: AnswerEvaluation): string {
  if (evaluation.verdict === "strong") return question.deeper;
  if (evaluation.verdict === "weak") return question.simpler;
  return `Let's tighten that up. ${question.deeper}`;
}

export function bridgeFor(verdict: AnswerEvaluation["verdict"]): string {
  if (verdict === "strong") return "Good. Let's move to a different area.";
  if (verdict === "weak") return "Alright, let's come back to that later. Moving on.";
  return "Okay, noted. Next topic.";
}

export function aggregate(evals: AnswerEvaluation[]) {
  if (evals.length === 0) return null;
  const avg = (name: string) =>
    Math.round(
      evals.reduce((s, e) => s + (e.dimensions.find((d) => d.name === name)?.score ?? 0), 0) / evals.length,
    );
  const technical = avg(dims[0]);
  const problemSolving = avg(dims[1]);
  const communication = avg(dims[2]);
  const mainframeDepth = avg(dims[3]);
  const performance = Math.round((technical + problemSolving + communication + mainframeDepth) / 4);
  return {
    overall: performance,
    dimensions: [
      { name: "Technical Knowledge", score: technical },
      { name: "Problem Solving", score: problemSolving },
      { name: "Communication", score: communication },
      { name: "Mainframe Depth", score: mainframeDepth },
      { name: "Interview Performance", score: performance },
    ],
  };
}

export const modeBehaviour: Record<ModeId, { correctionsDuring: boolean; shortFeedback: boolean }> = {
  realistic: { correctionsDuring: false, shortFeedback: false },
  coaching: { correctionsDuring: true, shortFeedback: false },
  practice: { correctionsDuring: false, shortFeedback: true },
};
