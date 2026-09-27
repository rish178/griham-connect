import type { RiskLevel } from "@grihamconnect/types";
import { CheckCircle2, AlertTriangle, ShieldAlert } from "lucide-react";
import { ScoreRing } from "./ScoreRing";

const VERDICT: Record<RiskLevel, { label: string; description: string; icon: typeof CheckCircle2; className: string }> = {
  Low: {
    label: "Strong Buy",
    description: "A well-positioned project with strong fundamentals and good long-term potential.",
    icon: CheckCircle2,
    className: "bg-griham-green-soft text-griham-green",
  },
  Moderate: {
    label: "Consider Carefully",
    description: "Solid overall, but a few factors are worth investigating before you commit.",
    icon: AlertTriangle,
    className: "bg-warning-soft text-warning",
  },
  High: {
    label: "Proceed with Caution",
    description: "Meaningful risk signals here — get independent verification before deciding.",
    icon: ShieldAlert,
    className: "bg-danger-soft text-danger",
  },
};

export interface HealthScoreProps {
  score: number;
  riskLevel: RiskLevel;
}

export function HealthScore({ score, riskLevel }: HealthScoreProps) {
  const verdict = VERDICT[riskLevel];
  const Icon = verdict.icon;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="flex flex-col items-center gap-1">
        <ScoreRing score={score} size={88} label="Property Health Score" />
        <span className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">
          Property Health Score
        </span>
      </div>
      <div className={`flex flex-1 flex-col gap-1.5 rounded-md p-3 ${verdict.className}`}>
        <span className="flex items-center gap-1.5 text-sm font-medium">
          <Icon className="h-4 w-4" aria-hidden="true" />
          {verdict.label}
        </span>
        <p className="text-sm">{verdict.description}</p>
      </div>
    </div>
  );
}
