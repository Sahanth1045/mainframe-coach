import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

export type CoachState = "idle" | "speaking" | "listening" | "analyzing" | "ready";

const STATE_COLOR: Record<CoachState, string> = {
  idle: "#0f9c9c",
  ready: "#0f9c9c",
  speaking: "#2a9d8f",
  listening: "#22d3ee",
  analyzing: "#7fd6c8",
};

function Orb({ state, level }: { state: CoachState; level: number }) {
  const inner = useRef<THREE.Mesh>(null);
  const shell = useRef<THREE.Mesh>(null);
  const wire = useRef<THREE.LineSegments>(null);
  const color = useMemo(() => new THREE.Color(STATE_COLOR[state]), [state]);

  useFrame((s, dt) => {
    const t = s.clock.elapsedTime;
    const speak = state === "speaking";
    const listen = state === "listening";
    const analyze = state === "analyzing";

    if (inner.current) {
      const pulse = speak
        ? 1 + Math.sin(t * 9) * 0.08
        : listen
          ? 1 + level * 0.22 + Math.sin(t * 3) * 0.02
          : 1 + Math.sin(t * 1.4) * 0.03;
      inner.current.scale.setScalar(pulse);
      const m = inner.current.material as THREE.MeshStandardMaterial;
      m.color.lerp(color, Math.min(1, dt * 4));
      m.emissive.lerp(color, Math.min(1, dt * 4));
      m.emissiveIntensity = speak ? 1.1 : listen ? 0.9 : analyze ? 0.8 : 0.5;
    }
    if (shell.current) {
      shell.current.rotation.y += dt * (analyze ? 0.9 : 0.18);
      shell.current.rotation.x += dt * (analyze ? 0.35 : 0.06);
      const m = shell.current.material as THREE.MeshBasicMaterial;
      m.color.lerp(color, Math.min(1, dt * 4));
    }
    if (wire.current) {
      wire.current.rotation.y -= dt * (analyze ? 1.2 : 0.24);
      const m = wire.current.material as THREE.LineBasicMaterial;
      m.color.lerp(color, Math.min(1, dt * 4));
      m.opacity = 0.25 + (Math.sin(t * (speak ? 6 : 1.6)) * 0.5 + 0.5) * 0.35;
    }
  });

  return (
    <group>
      <mesh ref={inner}>
        <icosahedronGeometry args={[0.72, 3]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          metalness={0.5}
          roughness={0.25}
          transparent
          opacity={0.55}
        />
      </mesh>
      <mesh ref={shell}>
        <icosahedronGeometry args={[1.02, 1]} />
        <meshBasicMaterial color={color} transparent opacity={0.08} />
      </mesh>
      <lineSegments ref={wire}>
        <edgesGeometry args={[new THREE.IcosahedronGeometry(1.05, 1)]} />
        <lineBasicMaterial color={color} transparent opacity={0.4} />
      </lineSegments>
      {[1.35, 1.62].map((r, i) => (
        <mesh key={r} rotation={[Math.PI / 2 + i * 0.5, i * 0.4, 0]}>
          <torusGeometry args={[r, 0.006, 6, 84]} />
          <meshBasicMaterial color={color} transparent opacity={0.32} />
        </mesh>
      ))}
    </group>
  );
}

export default function HolographicCoach({
  state = "idle",
  level = 0,
}: {
  state?: CoachState;
  level?: number;
}) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 4.2], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.7} />
      <pointLight position={[2, 2, 3]} intensity={12} color="#12a594" distance={12} />
      <pointLight position={[-2, -1, 2]} intensity={9} color="#22d3ee" distance={12} />
      <Orb state={state} level={level} />
    </Canvas>
  );
}
