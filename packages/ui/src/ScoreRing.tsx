export interface ScoreRingProps {
  score: number;
  max?: number;
  size?: number;
  label?: string;
}

function colorForScore(score: number, max: number): string {
  const pct = (score / max) * 100;
  if (pct >= 75) return "var(--success)";
  if (pct >= 50) return "var(--warning)";
  return "var(--danger)";
}

/** Segmented progress ring for the Property Health Score. Numerals use IBM Plex Mono per the design system. */
export function ScoreRing({ score, max = 100, size = 96, label }: ScoreRingProps) {
  const radius = size / 2 - 8;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(score, max));
  const offset = circumference * (1 - clamped / max);
  const color = colorForScore(clamped, max);

  return (
    <div
      role="img"
      aria-label={`${label ?? "Property Health Score"}: ${clamped} out of ${max}`}
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--line)"
          strokeWidth={8}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease-out" }}
        />
      </svg>
      <span
        className="absolute font-mono font-medium text-ink"
        style={{ fontSize: size * 0.26 }}
        aria-hidden="true"
      >
        {clamped}
      </span>
    </div>
  );
}
