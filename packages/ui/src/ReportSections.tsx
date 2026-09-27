import type {
  ComparisonSection as ComparisonSectionData,
  OverviewSection as OverviewSectionData,
  ReportSection,
  RiskSection as RiskSectionData,
  ScoredSection as ScoredSectionData,
  SourcesSection as SourcesSectionData,
} from "@grihamconnect/types";
import { MapPin, IndianRupee, Building2, Sparkles, ShieldCheck, GitCompare, FileText } from "lucide-react";
import type { ComponentType, ReactNode } from "react";

function SectionShell({
  sectionId,
  icon: Icon,
  title,
  score,
  children,
}: {
  sectionId: string;
  icon: ComponentType<{ className?: string }>;
  title: string;
  score?: number | null;
  children: ReactNode;
}) {
  return (
    <section
      id={`report-section-${sectionId}`}
      className="flex scroll-mt-4 flex-col gap-2 rounded-lg border border-line bg-white p-4"
    >
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-griham-green" aria-hidden="true" />
          <h3 className="font-medium text-base text-ink">{title}</h3>
        </div>
        {typeof score === "number" && (
          <span className="font-mono text-sm text-ink-soft">{score}/100</span>
        )}
      </header>
      {children}
    </section>
  );
}

function OverviewSectionView({ type, title, content }: OverviewSectionData) {
  return (
    <SectionShell sectionId={type} icon={ShieldCheck} title={title}>
      <p className="text-sm text-ink-soft">{content}</p>
    </SectionShell>
  );
}

function LocationSectionView({ type, title, score, content }: ScoredSectionData) {
  return (
    <SectionShell sectionId={type} icon={MapPin} title={title} score={score}>
      <p className="text-sm text-ink-soft">{content}</p>
    </SectionShell>
  );
}

function PriceSectionView({ type, title, score, content }: ScoredSectionData) {
  return (
    <SectionShell sectionId={type} icon={IndianRupee} title={title} score={score}>
      <p className="text-sm text-ink-soft">{content}</p>
    </SectionShell>
  );
}

function BuilderSectionView({ type, title, score, content }: ScoredSectionData) {
  return (
    <SectionShell sectionId={type} icon={Building2} title={title} score={score}>
      <p className="text-sm text-ink-soft">{content}</p>
    </SectionShell>
  );
}

function AmenitiesSectionView({ type, title, score, content }: ScoredSectionData) {
  return (
    <SectionShell sectionId={type} icon={Sparkles} title={title} score={score}>
      <p className="text-sm text-ink-soft">{content}</p>
    </SectionShell>
  );
}

function RiskSectionView({ type, title, items }: RiskSectionData) {
  return (
    <SectionShell sectionId={type} icon={ShieldCheck} title={title}>
      <ul className="flex flex-col gap-1.5">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-ink-soft before:mr-2 before:text-warning before:content-['•']">
            {item}
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}

function ComparisonSectionView({ type, title, items }: ComparisonSectionData) {
  return (
    <SectionShell sectionId={type} icon={GitCompare} title={title}>
      <ul className="flex flex-col divide-y divide-line">
        {items.map((item) => (
          <li key={item.propertySlug} className="flex items-center justify-between py-1.5 text-sm">
            <span className="text-ink">{item.name}</span>
            <span className="font-mono text-ink-soft">{item.gcScore}/100</span>
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}

function SourcesSectionView({ type, title, sources }: SourcesSectionData) {
  return (
    <SectionShell sectionId={type} icon={FileText} title={title}>
      <ul className="flex flex-col gap-1">
        {sources.map((source, i) => (
          <li key={i} className="text-xs text-ink-soft">
            <span className="font-mono uppercase">{source.type}</span> — {source.title}
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}

/**
 * Allowlisted registry: the AI/backend can only ever select one of these
 * known section types. Unknown types are dropped, never executed — see
 * ReportRenderer below.
 */
export const REPORT_COMPONENTS = {
  overview: OverviewSectionView,
  location: LocationSectionView,
  price: PriceSectionView,
  builder: BuilderSectionView,
  amenities: AmenitiesSectionView,
  risk: RiskSectionView,
  comparison: ComparisonSectionView,
  sources: SourcesSectionView,
} as const;

export function ReportRenderer({ sections }: { sections: ReportSection[] }) {
  return (
    <div className="flex flex-col gap-3">
      {sections.map((section) => {
        // Allowlist lookup by a validated discriminant — the cast below is
        // the deliberate, single point where that safety is asserted; it
        // never falls through to executing an arbitrary/unknown component.
        const Component = REPORT_COMPONENTS[section.type] as unknown as
          | ComponentType<Record<string, unknown>>
          | undefined;
        if (!Component) return null;
        return <Component key={section.id} {...section} />;
      })}
    </div>
  );
}
