import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

export interface SkillNodeData {
  id: string;
  name: string;
  mastery: number;
}

const VIOLET = new THREE.Color("#7c5cff");
const CYAN = new THREE.Color("#22d3ee");
const AMBER = new THREE.Color("#f5a524");

function colorFor(mastery: number) {
  if (mastery >= 75) return CYAN;
  if (mastery >= 62) return VIOLET;
  return AMBER;
}

function Core() {
  const ref = useRef<THREE.Group>(null);
  useFrame((s, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += dt * 0.12;
    ref.current.scale.setScalar(1 + Math.sin(s.clock.elapsedTime * 0.9) * 0.02);
  });
  return (
    <group ref={ref}>
      <mesh>
        <icosahedronGeometry args={[0.62, 1]} />
        <meshStandardMaterial
          color="#161f34"
          metalness={0.9}
          roughness={0.25}
          emissive="#4c1d95"
          emissiveIntensity={0.5}
        />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[new THREE.IcosahedronGeometry(0.66, 1)]} />
        <lineBasicMaterial color="#8b5cf6" transparent opacity={0.7} />
      </lineSegments>
    </group>
  );
}

function Link({ to, color }: { to: THREE.Vector3; color: THREE.Color }) {
  const ref = useRef<THREE.Line>(null);
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setFromPoints([new THREE.Vector3(0, 0, 0), to]);
    return g;
  }, [to]);
  const material = useMemo(
    () => new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.28 }),
    [color],
  );
  useFrame((s) => {
    if (!ref.current) return;
    const m = ref.current.material as THREE.LineBasicMaterial;
    m.opacity = 0.18 + (Math.sin(s.clock.elapsedTime * 1.2 + to.x * 2) * 0.5 + 0.5) * 0.28;
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <primitive object={new THREE.Line(geometry, material)} ref={ref as any} />;
}

function Pulse({ to, color }: { to: THREE.Vector3; color: THREE.Color }) {
  const ref = useRef<THREE.Mesh>(null);
  const offset = useMemo(() => Math.random(), []);
  useFrame((s) => {
    if (!ref.current) return;
    const t = (s.clock.elapsedTime * 0.35 + offset) % 1;
    ref.current.position.copy(to).multiplyScalar(t);
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.035, 8, 8]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

function SkillNode({
  data,
  position,
  onSelect,
  onHover,
}: {
  data: SkillNodeData;
  position: THREE.Vector3;
  onSelect: (id: string) => void;
  onHover: (v: { id: string; mastery: number; name: string } | null) => void;
}) {
  const ref = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const color = colorFor(data.mastery);
  const base = 0.14 + (data.mastery / 100) * 0.18;
  const weak = data.mastery < 62;

  useFrame((s, dt) => {
    if (!ref.current) return;
    const t = s.clock.elapsedTime;
    ref.current.position.set(
      position.x,
      position.y + Math.sin(t * 0.7 + position.x * 2) * 0.06,
      position.z,
    );
    const target = hovered ? 1.45 : 1;
    const cur = ref.current.scale.x;
    ref.current.scale.setScalar(cur + (target - cur) * Math.min(1, dt * 8));
  });

  return (
    <group
      ref={ref}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        onHover({ id: data.id, mastery: data.mastery, name: data.name });
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        onHover(null);
        document.body.style.cursor = "";
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(data.id);
      }}
    >
      <mesh>
        <sphereGeometry args={[base, 20, 20]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={weak ? 0.35 : 0.9}
          metalness={0.4}
          roughness={weak ? 0.7 : 0.2}
          transparent
          opacity={weak ? 0.7 : 1}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[base * 1.7, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={hovered ? 0.16 : 0.07} />
      </mesh>
      {weak && (
        <lineSegments>
          <edgesGeometry args={[new THREE.SphereGeometry(base * 1.9, 8, 6)]} />
          <lineBasicMaterial color={color} transparent opacity={0.35} />
        </lineSegments>
      )}
    </group>
  );
}

function Orbit({ drag }: { drag: boolean }) {
  const { camera, pointer } = useThree();
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    const ax = drag ? pointer.x * 0.9 : 0;
    const ay = drag ? pointer.y * 0.5 : 0;
    const angle = t * 0.06 + ax;
    const radius = 5.2;
    camera.position.x += (Math.sin(angle) * radius - camera.position.x) * 0.05;
    camera.position.z += (Math.cos(angle) * radius - camera.position.z) * 0.05;
    camera.position.y += (0.9 + ay - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function SkillUniverse3D({
  skills,
  onSelect,
  onHover,
}: {
  skills: SkillNodeData[];
  onSelect: (id: string) => void;
  onHover: (v: { id: string; mastery: number; name: string } | null) => void;
}) {
  const layout = useMemo(() => {
    const n = skills.length;
    return skills.map((s, i) => {
      const angle = (i / n) * Math.PI * 2;
      const r = 2.05 + (1 - s.mastery / 100) * 0.75;
      const y = Math.sin(i * 1.7) * 0.55;
      return { s, p: new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r) };
    });
  }, [skills]);

  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0.9, 5.2], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.65} />
      <pointLight position={[0, 0, 0]} intensity={12} color="#8b5cf6" distance={9} />
      <pointLight position={[4, 3, 3]} intensity={10} color="#22d3ee" distance={14} />
      <Orbit drag />
      <Core />
      {layout.map(({ s, p }) => (
        <group key={s.id}>
          <Link to={p} color={colorFor(s.mastery)} />
          <Pulse to={p} color={colorFor(s.mastery)} />
          <SkillNode data={s} position={p} onSelect={onSelect} onHover={onHover} />
        </group>
      ))}
    </Canvas>
  );
}
