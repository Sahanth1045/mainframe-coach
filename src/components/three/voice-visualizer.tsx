import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/** Circular 3D bar visualizer reacting to mic level / AI speech. */
function Bars({
  level,
  active,
  color,
  count = 48,
}: {
  level: number;
  active: boolean;
  color: string;
  count?: number;
}) {
  const group = useRef<THREE.Group>(null);
  const bars = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        angle: (i / count) * Math.PI * 2,
        seed: Math.random() * 6.28,
      })),
    [count],
  );
  const three = useMemo(() => new THREE.Color(color), [color]);

  useFrame((s, dt) => {
    if (!group.current) return;
    group.current.rotation.y += dt * 0.15;
    const t = s.clock.elapsedTime;
    group.current.children.forEach((child, i) => {
      const b = bars[i]!;
      const wave = Math.sin(t * 5 + b.seed) * 0.5 + 0.5;
      const h = active ? 0.12 + wave * (0.25 + level * 1.5) : 0.06 + wave * 0.05;
      child.scale.y += (h - child.scale.y) * Math.min(1, dt * 10);
      child.position.y = child.scale.y / 2;
    });
  });

  return (
    <group ref={group}>
      {bars.map((b, i) => (
        <mesh
          key={i}
          position={[Math.cos(b.angle) * 1.25, 0.05, Math.sin(b.angle) * 1.25]}
          rotation={[0, -b.angle, 0]}
        >
          <boxGeometry args={[0.05, 1, 0.05]} />
          <meshStandardMaterial
            color={three}
            emissive={three}
            emissiveIntensity={active ? 0.9 : 0.3}
            transparent
            opacity={0.85}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function VoiceVisualizer3D({
  level = 0,
  active = false,
  color = "#22d3ee",
}: {
  level?: number;
  active?: boolean;
  color?: string;
}) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 1.1, 3.1], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.8} />
      <pointLight position={[0, 2, 2]} intensity={10} color={color} distance={10} />
      <Bars level={level} active={active} color={color} />
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.18, 1.2, 80]} />
        <meshBasicMaterial color={color} transparent opacity={0.35} />
      </mesh>
    </Canvas>
  );
}
