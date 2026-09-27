import type { PropertyReport, PropertySummary } from "@grihamconnect/types";
import { CheckCircle2 } from "lucide-react";
import { HealthScore } from "./HealthScore";
import { ScoreBreakdownGrid } from "./ScoreBreakdownGrid";
import { ReportTabs } from "./ReportTabs";
import { ShareButton } from "./ShareButton";

export interface ReportPreviewProps {
  report: PropertyReport;
  property: PropertySummary;
  activeSectionId?: string;
  onActiveSectionChange?: (id: string) => void;
}

export function ReportPreview({
  report,
  property,
  activeSectionId,
  onActiveSectionChange,
}: ReportPreviewProps) {
  const priceLabel =
    property.priceFrom && property.priceTo
      ? `₹${(property.priceFrom / 10000000).toFixed(1)}Cr – ₹${(property.priceTo / 10000000).toFixed(1)}Cr`
      : "Price on request";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <p className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wide text-griham-green">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            Property analysis completed
          </p>
          <p className="text-sm text-ink-soft">Here&apos;s your complete property health report.</p>
        </div>
        <ShareButton />
      </div>

      <div className="relative overflow-hidden rounded-lg">
        <div className="aspect-video w-full bg-griham-green-soft">
          {property.heroImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={property.heroImageUrl}
              alt={`${property.name} exterior`}
              className="h-full w-full object-cover"
            />
          )}
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <h2 className="text-xl font-medium text-white">{property.name}</h2>
          {property.sector && <p className="text-sm text-white/85">{property.sector}</p>}
        </div>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-ink-soft">
        {property.configuration && <span>{property.configuration}</span>}
        <span>{priceLabel}</span>
      </div>

      <HealthScore score={report.score.value} riskLevel={report.riskLevel} />
      <ScoreBreakdownGrid breakdown={report.breakdown} />
      <ReportTabs
        sections={report.sections}
        activeId={activeSectionId}
        onActiveChange={onActiveSectionChange}
      />
    </div>
  );
}
