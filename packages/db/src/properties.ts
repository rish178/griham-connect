import type { ProjectScores, PropertyAsset, PropertySummary } from "@grihamconnect/types";
import { getServiceClient } from "./client";

interface PropertyRow {
  id: string;
  slug: string;
  name: string;
  sector: string | null;
  configuration: string | null;
  price_from: number | null;
  price_to: number | null;
  currency: string;
  hero_image_url: string | null;
  status: string;
  is_sample: boolean;
  builder_id: string | null;
  description: string | null;
  cities: { slug: string } | { slug: string }[] | null;
}

function citySlugFromRow(row: PropertyRow): string {
  const cities = row.cities;
  if (!cities) return "";
  return Array.isArray(cities) ? (cities[0]?.slug ?? "") : cities.slug;
}

function toSummary(row: PropertyRow): PropertySummary {
  return {
    id: row.id,
    citySlug: citySlugFromRow(row),
    slug: row.slug,
    name: row.name,
    sector: row.sector,
    configuration: row.configuration,
    priceFrom: row.price_from,
    priceTo: row.price_to,
    currency: row.currency,
    heroImageUrl: row.hero_image_url,
    status: row.status as PropertySummary["status"],
    isSample: row.is_sample,
  };
}

/** Sample projects for a city's Property Health card — never hardcoded in JSX. */
export async function getSamplePropertiesForCity(citySlug: string): Promise<PropertySummary[]> {
  const db = getServiceClient();
  const { data, error } = await db
    .from("properties")
    .select("*, cities!inner(slug)")
    .eq("cities.slug", citySlug)
    .eq("status", "active")
    .eq("is_sample", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => toSummary(row as PropertyRow));
}

/**
 * Resolves a free-text "Verify <project>" request against ONE city only.
 * Never falls through to another city — a project that doesn't exist in the
 * selected city is reported as not found there, not silently found elsewhere.
 */
export async function findPropertyInCity(
  citySlug: string,
  query: string
): Promise<PropertySummary | null> {
  const db = getServiceClient();
  const cleaned = query.trim().toLowerCase();
  if (!cleaned) return null;

  const { data, error } = await db
    .from("properties")
    .select("*, cities!inner(slug)")
    .eq("cities.slug", citySlug)
    .eq("status", "active")
    .ilike("name", `%${cleaned}%`)
    .order("sort_order", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data ? toSummary(data as PropertyRow) : null;
}

export async function getPropertyById(propertyId: string): Promise<PropertySummary | null> {
  const db = getServiceClient();
  const { data, error } = await db
    .from("properties")
    .select("*, cities!inner(slug)")
    .eq("id", propertyId)
    .maybeSingle();

  if (error) throw error;
  return data ? toSummary(data as PropertyRow) : null;
}

/** Featured properties across all active cities, for the homepage — not hardcoded in JSX. */
export async function getFeaturedProperties(limit = 6): Promise<PropertySummary[]> {
  const db = getServiceClient();
  const { data, error } = await db
    .from("properties")
    .select("*, cities!inner(slug, is_active)")
    .eq("cities.is_active", true)
    .eq("status", "active")
    .eq("is_featured", true)
    .order("sort_order", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map((row) => toSummary(row as PropertyRow));
}

export async function getPropertyBuilderId(propertyId: string): Promise<string | null> {
  const db = getServiceClient();
  const { data, error } = await db
    .from("properties")
    .select("builder_id")
    .eq("id", propertyId)
    .maybeSingle();

  if (error) throw error;
  return data?.builder_id ?? null;
}

export async function getPropertyAssets(propertyId: string): Promise<PropertyAsset[]> {
  const db = getServiceClient();
  const { data, error } = await db
    .from("property_assets")
    .select("*")
    .eq("property_id", propertyId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    propertyId: row.property_id,
    assetType: row.asset_type,
    url: row.url,
    mobileUrl: row.mobile_url,
    altText: row.alt_text,
    sortOrder: row.sort_order,
  }));
}

export async function getProjectScores(propertyId: string): Promise<ProjectScores | null> {
  const db = getServiceClient();
  const { data, error } = await db
    .from("project_scores")
    .select("*")
    .eq("property_id", propertyId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    projectId: propertyId,
    builderScore: Number(data.builder_score),
    locationScore: Number(data.location_score),
    investmentScore: Number(data.investment_score),
    rentalScore: Number(data.rental_score),
    connectivityScore: Number(data.connectivity_score),
    constructionScore: Number(data.construction_score),
    livabilityScore: Number(data.livability_score),
    legalScore: Number(data.legal_score),
    priceFairnessScore: Number(data.price_fairness_score),
    scoreVersion: data.score_version,
  };
}

export async function getBuilderById(builderId: string) {
  const db = getServiceClient();
  const { data, error } = await db.from("builders").select("*").eq("id", builderId).maybeSingle();
  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id as string,
    name: data.name as string,
    projectsDelivered: data.projects_delivered as number,
    averageDelayMonths: Number(data.average_delay_months),
    reraCaseCount: data.rera_case_count as number,
    googleRating: Number(data.google_rating),
    yearsInBusiness: data.years_in_business as number,
    financialStabilityNote: data.financial_stability_note as string,
  };
}
