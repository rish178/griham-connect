import {
  calculateGcScore,
  deriveRiskLevel,
  getScoreBreakdown,
} from "@grihamconnect/scoring";
import type {
  ProjectScores,
  PropertyReport,
  PropertySummary,
  ReportSection,
} from "@grihamconnect/types";

/**
 * Milestone-1 stand-in for the FastAPI/LangGraph analysis engine described in
 * the architecture skill. It produces the same structured, versioned report
 * shape a real AI backend would — deterministic scoring math (real, from
 * @grihamconnect/scoring) plus templated copy (not an LLM call yet). Swapping
 * this for a real backend later means replacing this function; nothing
 * downstream (API contract, SSE events, report renderer) needs to change.
 */
export function buildReport(params: {
  runId: string;
  property: PropertySummary;
  builderName: string | null;
  scores: ProjectScores;
}): PropertyReport {
  const { runId, property, builderName, scores } = params;
  const gcScore = calculateGcScore(scores);
  const riskLevel = deriveRiskLevel(scores);
  const breakdown = getScoreBreakdown(scores);
  const byKey = Object.fromEntries(breakdown.map((b) => [b.key, b]));

  const priceLine =
    property.priceFrom && property.priceTo
      ? `₹${(property.priceFrom / 10000000).toFixed(1)}Cr – ₹${(property.priceTo / 10000000).toFixed(1)}Cr`
      : "Price on request";

  const sections: ReportSection[] = [
    {
      id: "overview",
      type: "overview",
      title: "Our take",
      content: `${property.name} scores ${gcScore}/100 on the Property Health Score, putting it in the "${riskLevel.toLowerCase()} risk" band. ${
        riskLevel === "Low"
          ? "The strongest signals are legal compliance and builder track record — the two factors most correlated with real buyer risk."
          : riskLevel === "Moderate"
            ? "Legal or builder signals need a closer look before you commit — see Things to Consider below."
            : "Legal or builder signals are weak enough that we'd recommend independent verification before proceeding."
      } This is a sample analysis run on demo data — treat the specifics as illustrative, not a real due-diligence result.`,
    },
    {
      id: "location",
      type: "location",
      title: "Location",
      score: byKey.locationScore?.value ?? null,
      content: `${property.sector ?? "This micro-market"} scores ${byKey.locationScore?.value ?? "—"}/100 on location quality — schools, hospitals, offices and everyday convenience — and ${byKey.connectivityScore?.value ?? "—"}/100 on connectivity to transit and highways.`,
    },
    {
      id: "price",
      type: "price",
      title: "Price",
      score: byKey.priceFairnessScore?.value ?? null,
      content: `${priceLine} for ${property.configuration ?? "the listed configurations"}. Price fairness scores ${byKey.priceFairnessScore?.value ?? "—"}/100 against comparable projects in the same corridor.`,
    },
    {
      id: "builder",
      type: "builder",
      title: "Builder",
      score: byKey.builderScore?.value ?? null,
      content: `${builderName ?? "The developer"} scores ${byKey.builderScore?.value ?? "—"}/100 on track record — delivery history, delays, RERA cases and financial stability.`,
    },
    {
      id: "amenities",
      type: "amenities",
      title: "Amenities",
      score: byKey.constructionScore?.value ?? null,
      content: `Construction quality and specification adherence score ${byKey.constructionScore?.value ?? "—"}/100 based on available project documentation.`,
    },
    {
      id: "risk",
      type: "risk",
      title: "Risks",
      items: [
        byKey.legalScore && byKey.legalScore.value < 80
          ? "Legal & RERA compliance scored below our comfort threshold — verify registration status directly with RERA before proceeding."
          : "Legal & RERA compliance looks solid, but always verify registration status directly with RERA before signing anything.",
        byKey.rentalScore && byKey.rentalScore.value < 70
          ? "Rental yield potential is on the lower side for this configuration — factor that in if this is an investment purchase."
          : "Rental demand looks reasonable for this configuration, but yields vary by exact unit and floor.",
        "This report uses sample/demo data — the real property may score differently once live data is connected.",
      ],
    },
  ];

  return {
    schemaVersion: 1,
    runId,
    property: { id: property.id, slug: property.slug, name: property.name },
    score: { value: gcScore, max: 100 },
    riskLevel,
    summary: {
      title: "Property Health",
      text: `${property.name} has a Property Health Score of ${gcScore}/100 (${riskLevel.toLowerCase()} risk).`,
    },
    breakdown: breakdown.map((b) => ({ key: b.key, label: b.label, value: b.value })),
    sections,
  };
}
