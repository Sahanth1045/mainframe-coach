import { type ReactNode } from "react";
import { Link } from "@tanstack/react-router";

// ---- Inline code ----
export function Code({ children }: { children: ReactNode }) {
  return (
    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-primary">
      {children}
    </code>
  );
}

// ---- Section label ----
export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
      {children}
    </h2>
  );
}

// ---- Score bar ----
type Tone = "primary" | "success" | "warning" | "danger";
const toneColor: Record<Tone, string> = {
  primary: "var(--primary)",
  success: "var(--success)",
  warning: "var(--warning)",
  danger: "var(--destructive)",
};
export function toneFor(value: number): Tone {
  if (value >= 75) return "success";
  if (value >= 65) return "primary";
  if (value >= 55) return "warning";
  return "danger";
}

export function ScoreBar({ value, tone }: { value: number; tone?: Tone }) {
  const t = tone ?? toneFor(value);
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="score-bar h-full rounded-full"
        style={{ width: `${value}%`, background: toneColor[t] }}
      />
    </div>
  );
}

// ---- Difficulty badge ----
export function DifficultyBadge({ level }: { level: string }) {
  const map: Record<string, string> = {
    Beginner: "bg-success/10 text-success ring-success/20",
    Intermediate: "bg-primary/10 text-primary ring-primary/20",
    Advanced: "bg-warning/10 text-warning ring-warning/20",
  };
  return (
    <span
      className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ${map[level] ?? map["Intermediate"]}`}
    >
      {level}
    </span>
  );
}

// ---- Chip ----
export function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">
      {children}
    </span>
  );
}

// ---- Buttons ----
export function PrimaryButton({
  children,
  to,
  onClick,
  type,
  className = "",
}: {
  children: ReactNode;
  to?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
}) {
  const cls = `inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md active:scale-[0.98] ${className}`;
  if (to)
    return (
      <Link to={to} className={cls}>
        {children}
      </Link>
    );
  return (
    <button type={type ?? "button"} onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  to,
  onClick,
  className = "",
}: {
  children: ReactNode;
  to?: string;
  onClick?: () => void;
  className?: string;
}) {
  const cls = `inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted ${className}`;
  if (to)
    return (
      <Link to={to} className={cls}>
        {children}
      </Link>
    );
  return (
    <button type="button" onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

// ---- Readiness gauge (thin SVG arc) ----
export function ReadinessGauge({ value, size = 132 }: { value: number; size?: number }) {
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (value / 100) * c;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          style={{ transition: "stroke-dasharray 700ms cubic-bezier(0.16,1,0.3,1)" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold tracking-tight tabular-nums text-foreground">
          {value}
          <span className="text-lg font-medium text-muted-foreground">%</span>
        </span>
        <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Ready
        </span>
      </div>
    </div>
  );
}

// ---- Empty state ----
export function EmptyState({
  title,
  description,
  cta,
}: {
  title: string;
  description: string;
  cta?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>
      {cta && <div className="mt-6">{cta}</div>}
    </div>
  );
}

// ---- Card wrapper ----
export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-border bg-card shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}
