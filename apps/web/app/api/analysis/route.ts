import {
  createAnalysisRun,
  findPropertyInCity,
  getActiveStepTemplates,
  getCityBySlug,
  getPropertyById,
} from "@grihamconnect/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  citySlug: z.string().min(1),
  requestText: z.string().min(1).max(200),
  propertyId: z.string().uuid().optional(),
});

/** Strips conversational wrapper text so "Verify the Signature Global Sarvam project." resolves to "Signature Global Sarvam". */
function extractProjectQuery(requestText: string): string {
  return requestText
    .replace(/^verify\s+(the\s+)?/i, "")
    .replace(/\s+project\.?$/i, "")
    .trim();
}

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request", message: "Invalid request." }, { status: 400 });
  }
  const { citySlug, requestText, propertyId } = parsed.data;

  const city = await getCityBySlug(citySlug);
  if (!city) {
    return NextResponse.json(
      { error: "city_not_found", message: "That city isn't available yet." },
      { status: 404 }
    );
  }

  const property = propertyId
    ? await getPropertyById(propertyId)
    : await findPropertyInCity(citySlug, extractProjectQuery(requestText));

  if (!property || property.citySlug !== citySlug) {
    return NextResponse.json(
      {
        error: "property_not_found",
        message: `We couldn't find "${extractProjectQuery(requestText)}" in ${city.displayName}. Try one of the sample projects below.`,
      },
      { status: 404 }
    );
  }

  const stepTemplates = await getActiveStepTemplates();
  if (stepTemplates.length === 0) {
    return NextResponse.json(
      { error: "pipeline_unavailable", message: "Analysis is temporarily unavailable. Please try again shortly." },
      { status: 503 }
    );
  }

  const runId = await createAnalysisRun({
    propertyId: property.id,
    cityId: city.id,
    requestText,
    steps: stepTemplates,
  });

  return NextResponse.json({
    runId,
    property,
    steps: stepTemplates.map((s) => ({
      key: s.stepKey,
      label: s.label,
      description: s.description,
      status: "pending" as const,
      progress: 0,
      sortOrder: s.sortOrder,
      errorMessage: null,
    })),
  });
}
