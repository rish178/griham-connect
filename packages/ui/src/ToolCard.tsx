import type { ToolComponentType } from "@grihamconnect/types";
import {
  MapPin,
  IndianRupee,
  Building2,
  GitCompare,
  FileText,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

const TOOL_ICONS: Record<ToolComponentType, typeof MapPin> = {
  property_health: ShieldCheck,
  location_intelligence: MapPin,
  price_analysis: IndianRupee,
  builder_intelligence: Building2,
  property_comparison: GitCompare,
  risk_insights: AlertTriangle,
  property_report: FileText,
};

export interface ToolCardProps {
  componentType: ToolComponentType;
  title: string;
  summary: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function ToolCard({ componentType, title, summary, actionLabel, onAction }: ToolCardProps) {
  const Icon = TOOL_ICONS[componentType] ?? ShieldCheck;

  return (
    <article className="flex flex-col gap-3 rounded-lg border border-line bg-white p-4">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-griham-green" aria-hidden="true" />
        <h3 className="font-medium text-base text-ink">{title}</h3>
      </div>
      <p className="text-sm text-ink-soft">{summary}</p>
      {actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className="flex min-h-11 w-fit items-center gap-1 text-sm font-medium text-griham-green hover:underline"
        >
          {actionLabel}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </article>
  );
}
