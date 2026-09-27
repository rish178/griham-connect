import type { PropertyReport } from "@grihamconnect/types";
import { getServiceClient } from "./client";

export async function saveReport(propertyId: string, runId: string, report: PropertyReport) {
  const db = getServiceClient();
  const { error } = await db.from("reports").insert({
    property_id: propertyId,
    run_id: runId,
    version: report.schemaVersion,
    gc_score: report.score.value,
    risk_level: report.riskLevel,
    summary_title: report.summary.title,
    summary_text: report.summary.text,
    breakdown_json: report.breakdown,
    sections_json: report.sections,
  });
  if (error) throw error;
}

export async function getReportByRunId(runId: string): Promise<PropertyReport | null> {
  const db = getServiceClient();
  const { data, error } = await db
    .from("reports")
    .select("*, properties!inner(id, slug, name)")
    .eq("run_id", runId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const property = Array.isArray(data.properties) ? data.properties[0] : data.properties;

  return {
    schemaVersion: 1,
    runId,
    property: { id: property.id, slug: property.slug, name: property.name },
    score: { value: data.gc_score, max: 100 },
    riskLevel: data.risk_level,
    summary: { title: data.summary_title, text: data.summary_text },
    breakdown: data.breakdown_json ?? [],
    sections: data.sections_json,
  };
}
