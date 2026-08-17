import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const VIOLET = "#0f9c9c";
const BLUE = "#2a9d8f";
const CYAN = "#22d3ee";

/** Sparse drifting data particles — reused across scenes. */
export function FloatingDataParticles({
  count = 140,
  radius = 5,
  color = CYAN,
  size = 0.035,
}: {
  count?: number;
  radius?: number;
  color?: string;
  size?: number;
}) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = radius * (0.35 + Math.random() * 0.65);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = (Math.random() - 0.5) * radius * 0.9;
      arr[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    return arr;
  }, [count, radius]);

  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += dt * 0.03;
    const p = ref.current.geometry.attributes["position"] as THREE.BufferAttribute;
    const a = p.array as Float32Array;
    for (let i = 1; i < a.length; i += 3) {
      const next = (a[i] ?? 0) + dt * 0.09;
      a[i] = next > radius * 0.5 ? -radius * 0.5 : next;
    }
    p.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={size}
        transparent
        opacity={0.65}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function Ring({
  radius,
  speed,
  tilt,
  color,
  opacity = 0.55,
}: {
  radius: number;
  speed: number;
  tilt: number;
  color: string;
  opacity?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.z += dt * speed;
  });
  return (
    <mesh ref={ref} rotation={[tilt, 0, 0]}>
      <torusGeometry args={[radius, 0.012, 8, 96]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} />
    </mesh>
  );
}

function ServerStack() {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.position.y = Math.sin(t * 0.5) * 0.07;
    group.current.rotation.y = Math.sin(t * 0.12) * 0.18;
  });

  const slots = [-0.62, -0.31, 0, 0.31, 0.62];

  return (
    <group ref={group}>
      {/* main cabinet */}
      <mesh castShadow>
        <boxGeometry args={[1.15, 1.85, 0.85]} />
        <meshStandardMaterial
          color="#101827"
          metalness={0.85}
          roughness={0.32}
          emissive={VIOLET}
          emissiveIntensity={0.06}
        />
      </mesh>
      {/* glowing edge frame */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(1.16, 1.86, 0.86)]} />
        <lineBasicMaterial color={CYAN} transparent opacity={0.5} />
      </lineSegments>
      {/* drive bays / status lines */}
      {slots.map((y, i) => (
        <mesh key={y} position={[0, y, 0.435]}>
          <planeGeometry args={[0.86, 0.1]} />
          <meshBasicMaterial color={i % 2 === 0 ? BLUE : VIOLET} transparent opacity={0.42} />
        </mesh>
      ))}
      {slots.map((y, i) => (
        <mesh key={`led-${y}`} position={[0.36, y, 0.442]}>
          <circleGeometry args={[0.022, 12]} />
          <meshBasicMaterial color={i === 2 ? "#34d399" : CYAN} />
        </mesh>
      ))}
      {/* side cabinets */}
      {[-0.95, 0.95].map((x) => (
        <group key={x} position={[x, -0.18, -0.1]}>
          <mesh>
            <boxGeometry args={[0.55, 1.4, 0.62]} />
            <meshStandardMaterial color="#0d1420" metalness={0.8} roughness={0.4} />
          </mesh>
          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(0.56, 1.41, 0.63)]} />
            <lineBasicMaterial color={VIOLET} transparent opacity={0.38} />
          </lineSegments>
        </group>
      ))}
    </group>
  );
}

function Platform() {
  return (
    <group position={[0, -1.15, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.5, 64]} />
        <meshStandardMaterial color="#0a0f1a" metalness={0.6} roughness={0.5} />
      </mesh>
      {[1.55, 2.05, 2.45].map((r, i) => (
        <mesh key={r} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005 + i * 0.002, 0]}>
          <ringGeometry args={[r - 0.008, r, 96]} />
          <meshBasicMaterial color={i === 1 ? CYAN : VIOLET} transparent opacity={0.4} />
        </mesh>
      ))}
    </group>
  );
}

function Parallax({ strength = 0.35 }: { strength?: number }) {
  const { camera, pointer } = useThree();
  useFrame(() => {
    camera.position.x += (pointer.x * strength - camera.position.x) * 0.04;
    camera.position.y += (0.35 + pointer.y * strength * 0.6 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function Mainframe3DCore({ particles = 120 }: { particles?: number }) {
  return (
    <Canvas
      dpr={[1, 1.6]}
      camera={{ position: [0, 0.35, 5.4], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[3, 3, 4]} intensity={22} color={VIOLET} distance={14} />
      <pointLight position={[-3.5, 1, 2]} intensity={16} color={CYAN} distance={14} />
      <Parallax />
      <ServerStack />
      <Platform />
      <group rotation={[0, 0, 0]}>
        <Ring radius={2.15} speed={0.08} tilt={Math.PI / 2.1} color={CYAN} />
        <Ring radius={2.6} speed={-0.05} tilt={Math.PI / 2.4} color={VIOLET} opacity={0.4} />
      </group>
      <FloatingDataParticles count={particles} radius={5} />
    </Canvas>
  );
}
