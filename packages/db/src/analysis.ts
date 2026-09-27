import type { AnalysisStep, AnalysisStepStatus } from "@grihamconnect/types";
import { getServiceClient } from "./client";

export interface StepTemplate {
  stepKey: string;
  label: string;
  description: string | null;
  sortOrder: number;
}

/** The pipeline the UI renders is whatever's active here — never hardcoded. */
export async function getActiveStepTemplates(): Promise<StepTemplate[]> {
  const db = getServiceClient();
  const { data, error } = await db
    .from("analysis_step_templates")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => ({
    stepKey: row.step_key,
    label: row.label,
    description: row.description,
    sortOrder: row.sort_order,
  }));
}

export async function createAnalysisRun(params: {
  propertyId: string;
  cityId: string;
  requestText: string;
  steps: StepTemplate[];
}): Promise<string> {
  const db = getServiceClient();

  const { data: run, error: runError } = await db
    .from("analysis_runs")
    .insert({
      property_id: params.propertyId,
      city_id: params.cityId,
      request_text: params.requestText,
      status: "queued",
    })
    .select("id")
    .single();

  if (runError) throw runError;
  const runId = run.id as string;

  const { error: stepsError } = await db.from("analysis_steps").insert(
    params.steps.map((step) => ({
      run_id: runId,
      step_key: step.stepKey,
      label: step.label,
      description: step.description,
      status: "pending",
      progress: 0,
      sort_order: step.sortOrder,
    }))
  );
  if (stepsError) throw stepsError;

  return runId;
}

export async function markRunStatus(
  runId: string,
  status: "running" | "completed" | "failed",
  extra?: { errorCode?: string; errorMessage?: string }
) {
  const db = getServiceClient();
  const patch: Record<string, unknown> = { status };
  if (status === "running") patch.started_at = new Date().toISOString();
  if (status === "completed" || status === "failed") patch.completed_at = new Date().toISOString();
  if (extra?.errorCode) patch.error_code = extra.errorCode;
  if (extra?.errorMessage) patch.error_message = extra.errorMessage;

  const { error } = await db.from("analysis_runs").update(patch).eq("id", runId);
  if (error) throw error;
}

export async function updateStep(
  runId: string,
  stepKey: string,
  status: AnalysisStepStatus,
  progress: number
): Promise<AnalysisStep> {
  const db = getServiceClient();
  const patch: Record<string, unknown> = { status, progress };
  if (status === "running") patch.started_at = new Date().toISOString();
  if (status === "completed" || status === "failed") patch.completed_at = new Date().toISOString();

  const { data, error } = await db
    .from("analysis_steps")
    .update(patch)
    .eq("run_id", runId)
    .eq("step_key", stepKey)
    .select("*")
    .single();

  if (error) throw error;

  return {
    key: data.step_key,
    label: data.label,
    description: data.description,
    status: data.status,
    progress: data.progress,
    sortOrder: data.sort_order,
    errorMessage: data.error_message,
  };
}

export async function getRunSteps(runId: string): Promise<AnalysisStep[]> {
  const db = getServiceClient();
  const { data, error } = await db
    .from("analysis_steps")
    .select("*")
    .eq("run_id", runId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => ({
    key: row.step_key,
    label: row.label,
    description: row.description,
    status: row.status,
    progress: row.progress,
    sortOrder: row.sort_order,
    errorMessage: row.error_message,
  }));
}

export async function getRun(runId: string) {
  const db = getServiceClient();
  const { data, error } = await db.from("analysis_runs").select("*").eq("id", runId).maybeSingle();
  if (error) throw error;
  return data;
}
