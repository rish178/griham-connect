export interface Project {
  id: string;
  slug: string;
  name: string;
  builderId: string;
  city: string;
  sector: string;
  possessionDate: string | null;
  price: number;
  latitude: number;
  longitude: number;
}

export interface Builder {
  id: string;
  name: string;
  projectsDelivered: number;
  averageDelayMonths: number;
  reraCaseCount: number;
  googleRating: number;
  yearsInBusiness: number;
  financialStabilityNote: string;
}

export interface ProjectScores {
  projectId: string;
  builderScore: number;
  locationScore: number;
  investmentScore: number;
  rentalScore: number;
  connectivityScore: number;
  constructionScore: number;
  livabilityScore: number;
  legalScore: number;
  priceFairnessScore: number;
  scoreVersion: string; // ties to the published methodology version
}

export type RiskLevel = "Low" | "Moderate" | "High";

export interface Report {
  projectId: string;
  gcScore: number;
  riskLevel: RiskLevel;
  pros: string[];
  cons: string[];
  recommendedFor: string[]; // who should buy
  notRecommendedFor: string[]; // who should wait
  alternativeProjectSlugs: string[];
  explanation: string | null; // LLM-generated, cached
  lastReviewed: string;
}

export interface Lead {
  id: string;
  projectSlug: string;
  name: string;
  phone: string;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  savedReportIds: string[];
}

// --- Content domain (human-managed marketing content) ----------------------

export interface HeroStat {
  value: string;
  label: string;
}

export interface HeroCampaign {
  id: string;
  name: string;
  eyebrow: string | null;
  headline: string;
  description: string | null;
  accentText: string | null;
  stats: HeroStat[];
  desktopImageUrl: string | null;
  mobileImageUrl: string | null;
  imagePosition: string;
  overlayStrength: number;
  theme: string;
  ctaLabel: string | null;
  ctaAction: string | null;
  priority: number;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
}

export interface City {
  id: string;
  slug: string;
  name: string;
  displayName: string;
  shortDescription: string | null;
  imageUrl: string | null;
  icon: string | null;
  isActive: boolean;
  sortOrder: number;
}

export type ToolComponentType =
  | "property_health"
  | "location_intelligence"
  | "price_analysis"
  | "builder_intelligence"
  | "property_comparison"
  | "risk_insights"
  | "property_report";

export interface Tool {
  id: string;
  key: string;
  name: string;
  description: string | null;
  icon: string | null;
  componentType: ToolComponentType;
  isActive: boolean;
  sortOrder: number;
  configuration: Record<string, unknown>;
}

// --- Property/product domain -------------------------------------------

export type PropertyAssetType =
  | "hero"
  | "gallery"
  | "floor_plan"
  | "amenity"
  | "master_plan"
  | "video"
  | "thumbnail";

export interface PropertyAsset {
  id: string;
  propertyId: string;
  assetType: PropertyAssetType;
  url: string;
  mobileUrl: string | null;
  altText: string | null;
  sortOrder: number;
}

export type PropertyStatus = "active" | "inactive" | "draft";

export interface PropertySummary {
  id: string;
  citySlug: string;
  slug: string;
  name: string;
  sector: string | null;
  configuration: string | null;
  priceFrom: number | null;
  priceTo: number | null;
  currency: string;
  heroImageUrl: string | null;
  status: PropertyStatus;
  isSample: boolean;
}

export interface PropertyDetail extends PropertySummary {
  builderId: string | null;
  description: string | null;
  assets: PropertyAsset[];
}

// --- Analysis pipeline (dynamic; the backend defines the steps) --------

export type AnalysisRunStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export type AnalysisStepStatus = "pending" | "running" | "completed" | "failed";

export interface AnalysisStep {
  key: string;
  label: string;
  description: string | null;
  status: AnalysisStepStatus;
  progress: number;
  sortOrder: number;
  errorMessage: string | null;
}

export interface AnalysisRun {
  id: string;
  propertyId: string;
  citySlug: string;
  requestText: string;
  status: AnalysisRunStatus;
  errorCode: string | null;
  errorMessage: string | null;
  steps: AnalysisStep[];
}

/** SSE event shapes the analysis stream emits, per the architecture skill. */
export type AnalysisEvent =
  | { type: "analysis.started"; runId: string }
  | { type: "analysis.step.updated"; runId: string; step: AnalysisStep }
  | { type: "analysis.completed"; runId: string; report: PropertyReport }
  | { type: "analysis.failed"; runId: string; errorCode: string; errorMessage: string };

// --- Structured report (never arbitrary HTML/components) ----------------

export const REPORT_SECTION_TYPES = [
  "overview",
  "location",
  "price",
  "builder",
  "amenities",
  "risk",
  "comparison",
  "sources",
] as const;

export type ReportSectionType = (typeof REPORT_SECTION_TYPES)[number];

interface ReportSectionBase {
  id: string;
  type: ReportSectionType;
  title: string;
}

export interface OverviewSection extends ReportSectionBase {
  type: "overview";
  content: string;
}

export interface ScoredSection extends ReportSectionBase {
  type: "location" | "price" | "builder" | "amenities";
  score: number | null;
  content: string;
}

export interface RiskSection extends ReportSectionBase {
  type: "risk";
  items: string[];
}

export interface ComparisonItem {
  propertySlug: string;
  name: string;
  gcScore: number;
  priceFrom: number | null;
}

export interface ComparisonSection extends ReportSectionBase {
  type: "comparison";
  items: ComparisonItem[];
}

export interface ReportSource {
  type: string;
  title: string;
  url: string | null;
  retrievedAt: string | null;
  confidence: "low" | "medium" | "high";
}

export interface SourcesSection extends ReportSectionBase {
  type: "sources";
  sources: ReportSource[];
}

export type ReportSection =
  | OverviewSection
  | ScoredSection
  | RiskSection
  | ComparisonSection
  | SourcesSection;

export interface ScoreBreakdownEntry {
  key: string;
  label: string;
  value: number;
}

/** Versioned, schema-validated — this is what the analysis engine returns, never raw HTML. */
export interface PropertyReport {
  schemaVersion: 1;
  runId: string;
  property: {
    id: string;
    slug: string;
    name: string;
  };
  score: {
    value: number;
    max: 100;
  };
  riskLevel: RiskLevel;
  summary: {
    title: string;
    text: string;
  };
  /** Full published-methodology breakdown (see @grihamconnect/scoring), for the at-a-glance score grid. */
  breakdown: ScoreBreakdownEntry[];
  sections: ReportSection[];
}

// --- Tool-card output (conversational, not dashboard widgets) -----------

export interface ToolCardAction {
  label: string;
  type: "open_tool" | "external_link";
  target?: string;
}

export interface ToolCard {
  tool: ToolComponentType;
  title: string;
  summary: string;
  action: ToolCardAction | null;
}
