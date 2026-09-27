import type { AnalysisStep as AnalysisStepData } from "@grihamconnect/types";
import {
  Check,
  Loader2,
  AlertCircle,
  Circle,
  X,
  Landmark,
  MapPinned,
  LineChart,
  Newspaper,
  Star,
} from "lucide-react";

export interface AnalysisStepProps {
  step: AnalysisStepData;
}

export function AnalysisStep({ step }: AnalysisStepProps) {
  return (
    <li className="flex items-start gap-3 py-2.5">
      <span className="mt-0.5 shrink-0" aria-hidden="true">
        {step.status === "completed" && <Check className="h-4 w-4 text-griham-green" />}
        {step.status === "running" && (
          <Loader2 className="h-4 w-4 animate-spin text-griham-green" />
        )}
        {step.status === "failed" && <AlertCircle className="h-4 w-4 text-danger" />}
        {step.status === "pending" && <Circle className="h-4 w-4 text-line" />}
      </span>
      <span className="flex flex-col gap-0.5">
        <span
          className={`text-sm ${
            step.status === "pending"
              ? "text-ink-soft"
              : step.status === "failed"
                ? "text-danger"
                : "text-ink"
          }`}
        >
          {step.label}
        </span>
        {step.description && (
          <span className="text-xs text-ink-soft">{step.description}</span>
        )}
      </span>
    </li>
  );
}

const SOURCE_BADGES = [
  { label: "RERA", icon: Landmark },
  { label: "Maps", icon: MapPinned },
  { label: "Market Data", icon: LineChart },
  { label: "News", icon: Newspaper },
  { label: "Reviews", icon: Star },
];

export interface AnalysisPipelineProps {
  propertyName: string;
  steps: AnalysisStepData[];
  onCancel?: () => void;
}

export function AnalysisPipeline({ propertyName, steps, onCancel }: AnalysisPipelineProps) {
  return (
    <div className="flex flex-col gap-3" role="status" aria-live="polite">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xl font-medium text-ink">Analysing {propertyName}…</p>
          <p className="text-xs text-ink-soft">This usually takes 20–30 seconds.</p>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex min-h-11 items-center gap-1 rounded-sm border border-line px-2 py-1.5 text-xs text-ink-soft hover:text-ink"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            Cancel
          </button>
        )}
      </div>
      <ul className="flex flex-col divide-y divide-line">
        {steps.map((step) => (
          <AnalysisStep key={step.key} step={step} />
        ))}
      </ul>
      <div className="flex flex-col gap-2 rounded-md bg-paper p-3">
        <p className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">
          Gathering data from multiple sources
        </p>
        <div className="flex flex-wrap gap-3">
          {SOURCE_BADGES.map(({ label, icon: Icon }) => (
            <span key={label} className="flex items-center gap-1 font-mono text-xs text-ink-soft">
              <Icon className="h-3.5 w-3.5 text-griham-green" aria-hidden="true" />
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
