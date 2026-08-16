import {
  Suspense,
  lazy,
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";

/** Cheap, cached WebGL capability probe. */
let webglSupport: boolean | null = null;
export function supportsWebGL() {
  if (typeof window === "undefined") return false;
  if (webglSupport !== null) return webglSupport;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ??
      (canvas.getContext("webgl") as WebGLRenderingContext | null);
    webglSupport = !!gl;
  } catch {
    webglSupport = false;
  }
  return webglSupport;
}

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

/** desktop → full, tablet → reduced, mobile → simplified. */
export type SceneTier = "full" | "reduced" | "simple";
export function useSceneTier(): SceneTier {
  const [tier, setTier] = useState<SceneTier>("simple");
  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      const cores = navigator.hardwareConcurrency ?? 4;
      if (w >= 1024 && cores >= 4) return "full" as const;
      if (w >= 640) return "reduced" as const;
      return "simple" as const;
    };
    setTier(compute());
    const on = () => setTier(compute());
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return tier;
}

/**
 * Mounts children only once visible + hydrated, and only when WebGL is usable.
 * Falls back to `fallback` (a normal React/DOM visual) otherwise.
 */
export function Scene3D({
  children,
  fallback,
  className = "",
  minTier = "simple",
}: {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
  minTier?: SceneTier;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [ok, setOk] = useState<boolean | null>(null);
  const tier = useSceneTier();
  const reduced = usePrefersReducedMotion();

  useEffect(() => setOk(supportsWebGL()), []);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const tierRank: Record<SceneTier, number> = { simple: 0, reduced: 1, full: 2 };
  const allowed = ok !== false && tierRank[tier] >= tierRank[minTier] && !reduced;

  return (
    <div ref={ref} className={className}>
      {allowed && visible ? (
        <Suspense fallback={fallback ?? null}>{children}</Suspense>
      ) : (
        (fallback ?? null)
      )}
    </div>
  );
}

/** Lazy-load a scene module so three.js stays out of the initial bundle. */
export function lazyScene<P extends object>(loader: () => Promise<{ default: ComponentType<P> }>) {
  return lazy(loader);
}
