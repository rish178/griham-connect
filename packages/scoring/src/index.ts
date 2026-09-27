import type { ProjectScores, RiskLevel } from "@grihamconnect/types";

/**
 * Published methodology — the 7 factors that make up the GC Score, and their
 * fixed weights. These must be documented publicly (see apps/web's
 * "How We Evaluate Projects" page) and never change silently; the score's
 * credibility depends on the same inputs always producing the same result.
 */
export const SCORE_WEIGHTS = {
  builderScore: 0.25,
  legalScore: 0.25,
  locationScore: 0.14,
  constructionScore: 0.14,
  priceFairnessScore: 0.09,
  connectivityScore: 0.08,
  rentalScore: 0.05,
} as const;

export const SCORE_VERSION = "2.3";

export const SCORE_LABELS: Record<keyof typeof SCORE_WEIGHTS, string> = {
  builderScore: "Builder Track Record",
  legalScore: "Legal & RERA Compliance",
  locationScore: "Location",
  constructionScore: "Construction Quality",
  priceFairnessScore: "Price Fairness",
  connectivityScore: "Connectivity",
  rentalScore: "Rental Yield",
};

export const SCORE_DESCRIPTIONS: Record<keyof typeof SCORE_WEIGHTS, string> = {
  builderScore:
    "Years in business, delivery track record, delay history, customer reviews, RERA compliance, financial stability.",
  legalScore: "RERA registration status, litigation history, title and approval clarity.",
  locationScore: "Micro-market quality: schools, hospitals, offices, everyday convenience.",
  constructionScore: "Build quality signals and adherence to the stated construction timeline.",
  priceFairnessScore: "Price per sq. ft. against comparable projects in the same corridor.",
  connectivityScore: "Distance to metro, highways, airport access, public transport.",
  rentalScore: "Realistic rental demand and yield potential for the unit type.",
};

export function calculateGcScore(scores: ProjectScores): number {
  const s = scores;
  const weighted =
    s.builderScore * SCORE_WEIGHTS.builderScore +
    s.legalScore * SCORE_WEIGHTS.legalScore +
    s.locationScore * SCORE_WEIGHTS.locationScore +
    s.constructionScore * SCORE_WEIGHTS.constructionScore +
    s.priceFairnessScore * SCORE_WEIGHTS.priceFairnessScore +
    s.connectivityScore * SCORE_WEIGHTS.connectivityScore +
    s.rentalScore * SCORE_WEIGHTS.rentalScore;
  return Math.round(weighted);
}

export interface ScoreBreakdownItem {
  key: keyof typeof SCORE_WEIGHTS;
  label: string;
  description: string;
  value: number;
  weight: number;
}

/** Ordered highest-weighted factor first, matching the published methodology. */
export function getScoreBreakdown(scores: ProjectScores): ScoreBreakdownItem[] {
  return (Object.keys(SCORE_WEIGHTS) as (keyof typeof SCORE_WEIGHTS)[])
    .sort((a, b) => SCORE_WEIGHTS[b] - SCORE_WEIGHTS[a])
    .map((key) => ({
      key,
      label: SCORE_LABELS[key],
      description: SCORE_DESCRIPTIONS[key],
      value: scores[key],
      weight: SCORE_WEIGHTS[key],
    }));
}

/**
 * Deliberately simple and deterministic, never a subjective call. Legal and
 * Builder are the two factors most correlated with real buyer risk (RERA
 * cases, delivery delays) — a weak score in either overrides an otherwise
 * fine GC Score rather than being averaged away by the other five factors.
 */
export function deriveRiskLevel(scores: ProjectScores): RiskLevel {
  if (scores.legalScore < 60 || scores.builderScore < 50) return "High";
  if (scores.legalScore < 80 || scores.builderScore < 70) return "Moderate";
  return "Low";
}
