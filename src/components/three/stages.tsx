import { Scene3D, lazyScene } from "./scene-frame";
import type { CoachState } from "./holographic-coach";
import type { TopicMastery } from "@/lib/interview-data";

const Mainframe3DCore = lazyScene(() => import("./mainframe-core"));
const SkillUniverse3D = lazyScene(() => import("./skill-universe"));
const HolographicCoach = lazyScene(() => import("./holographic-coach"));
const VoiceVisualizer3D = lazyScene(() => import("./voice-visualizer"));

/** Static DOM stand-in used whenever WebGL / reduced-motion blocks a scene. */
function Fallback({ label }: { label?: string }) {
  return (
    <div className="holo-grid grid h-full w-full place-items-center rounded-2xl">
      <div className="size-24 rounded-full bg-primary/10 ring-1 ring-primary/25 sm:size-32" />
      {label && (
        <span className="sr-only">{label}</span>
      )}
    </div>
  );
}

export function MainframeCoreStage({ className = "" }: { className?: string }) {
  return (
    <Scene3D
      className={`holo-grid scene-fade relative ${className}`}
      minTier="reduced"
      fallback={<Fallback label="Mainframe core visual" />}
    >
      <Mainframe3DCore />
    </Scene3D>
  );
}

export function SkillUniverseStage({
  topics,
  onSelect,
  onHover,
  className = "",
}: {
  topics: TopicMastery[];
  onSelect?: (id: string) => void;
  onHover?: (v: { id: string; mastery: number; name: string } | null) => void;
  className?: string;
}) {
  return (
    <Scene3D
      className={`relative ${className}`}
      minTier="reduced"
      fallback={<Fallback label="Skill universe visual" />}
    >
      <SkillUniverse3D
        skills={topics.map((t) => ({ id: t.id, name: t.name, mastery: t.mastery }))}
        onSelect={(id) => onSelect?.(id)}
        onHover={(v) => onHover?.(v)}
      />
    </Scene3D>
  );
}

export function CoachStage({
  state,
  level,
  className = "",
}: {
  state: CoachState;
  level: number;
  className?: string;
}) {
  return (
    <Scene3D className={`relative ${className}`} fallback={<Fallback label="AI coach visual" />}>
      <HolographicCoach state={state} level={level} />
    </Scene3D>
  );
}

export function VoiceStage({
  level,
  active,
  className = "",
}: {
  level: number;
  active: boolean;
  className?: string;
}) {
  return (
    <Scene3D className={`relative ${className}`} fallback={<Fallback label="Voice activity visual" />}>
      <VoiceVisualizer3D level={level} active={active} />
    </Scene3D>
  );
}
