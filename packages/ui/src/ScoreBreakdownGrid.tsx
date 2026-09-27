import type { ScoreBreakdownEntry } from "@grihamconnect/types";

export interface ScoreBreakdownGridProps {
  breakdown: ScoreBreakdownEntry[];
}

/** Compact at-a-glance grid of the published methodology's factor scores. Numerals in IBM Plex Mono per the design system. */
export function ScoreBreakdownGrid({ breakdown }: ScoreBreakdownGridProps) {
  if (breakdown.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
      {breakdown.map((item) => (
        <div key={item.key} className="flex items-center justify-between gap-2 border-b border-line py-1.5">
          <span className="text-xs text-ink-soft">{item.label}</span>
          <span className="font-mono text-sm text-ink">{item.value}</span>
        </div>
      ))}
    </div>
  );
}
