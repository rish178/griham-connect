import {
  getBuilderById,
  getProjectScores,
  getPropertyBuilderId,
  getPropertyById,
  getRun,
  getRunSteps,
  markRunStatus,
  saveReport,
  updateStep,
} from "@grihamconnect/db";
import type { AnalysisEvent } from "@grihamconnect/types";
import { buildReport } from "../../../../../lib/analysisEngine";

export const dynamic = "force-dynamic";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ runId: string }> }
) {
  const { runId } = await params;
  const run = await getRun(runId);
  if (!run) {
    return new Response("Analysis run not found.", { status: 404 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: AnalysisEvent) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };

      try {
        send({ type: "analysis.started", runId });
        await markRunStatus(runId, "running");

        const steps = await getRunSteps(runId);
        for (const step of steps) {
          const running = await updateStep(runId, step.key, "running", 10);
          send({ type: "analysis.step.updated", runId, step: running });

          await sleep(500 + Math.random() * 500);

          const completed = await updateStep(runId, step.key, "completed", 100);
          send({ type: "analysis.step.updated", runId, step: completed });
        }

        const property = await getPropertyById(run.property_id);
        const scores = await getProjectScores(run.property_id);

        if (!property || !scores) {
          await markRunStatus(runId, "failed", {
            errorCode: "no_data",
            errorMessage: "No scoring data available for this property yet.",
          });
          send({
            type: "analysis.failed",
            runId,
            errorCode: "no_data",
            errorMessage:
              "We don't have enough verified data on this project yet to generate a report. Please try one of the sample projects.",
          });
          controller.close();
          return;
        }

        const builderId = await getPropertyBuilderId(run.property_id);
        const builder = builderId ? await getBuilderById(builderId).catch(() => null) : null;

        const report = buildReport({
          runId,
          property,
          builderName: builder?.name ?? null,
          scores,
        });

        await saveReport(property.id, runId, report);
        await markRunStatus(runId, "completed");

        send({ type: "analysis.completed", runId, report });
        controller.close();
      } catch {
        await markRunStatus(runId, "failed", {
          errorCode: "internal_error",
          errorMessage: "Unexpected error during analysis.",
        }).catch(() => {});
        send({
          type: "analysis.failed",
          runId,
          errorCode: "internal_error",
          errorMessage: "Something went wrong while analysing this property. Please try again.",
        });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
