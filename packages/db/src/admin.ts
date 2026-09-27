import type { City, HeroCampaign, Tool } from "@grihamconnect/types";
import { getServiceClient } from "./client";

function mapCity(row: Record<string, unknown>): City {
  return {
    id: row.id as string,
    slug: row.slug as string,
    name: row.name as string,
    displayName: row.display_name as string,
    shortDescription: row.short_description as string | null,
    imageUrl: row.image_url as string | null,
    icon: row.icon as string | null,
    isActive: row.is_active as boolean,
    sortOrder: row.sort_order as number,
  };
}

function mapHeroCampaign(row: Record<string, unknown>): HeroCampaign {
  return {
    id: row.id as string,
    name: row.name as string,
    eyebrow: row.eyebrow as string | null,
    headline: row.headline as string,
    description: row.description as string | null,
    accentText: row.accent_text as string | null,
    stats: (row.stats_json as HeroCampaign["stats"]) ?? [],
    desktopImageUrl: row.desktop_image_url as string | null,
    mobileImageUrl: row.mobile_image_url as string | null,
    imagePosition: row.image_position as string,
    overlayStrength: Number(row.overlay_strength),
    theme: row.theme as string,
    ctaLabel: row.cta_label as string | null,
    ctaAction: row.cta_action as string | null,
    priority: row.priority as number,
    isActive: row.is_active as boolean,
    startsAt: row.starts_at as string | null,
    endsAt: row.ends_at as string | null,
  };
}

function mapTool(row: Record<string, unknown>): Tool {
  return {
    id: row.id as string,
    key: row.key as string,
    name: row.name as string,
    description: row.description as string | null,
    icon: row.icon as string | null,
    componentType: row.component_type as Tool["componentType"],
    isActive: row.is_active as boolean,
    sortOrder: row.sort_order as number,
    configuration: (row.configuration_json as Record<string, unknown>) ?? {},
  };
}

// --- Cities ---------------------------------------------------------------

export async function getAllCitiesAdmin(): Promise<City[]> {
  const db = getServiceClient();
  const { data, error } = await db.from("cities").select("*").order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapCity);
}

export async function updateCity(
  id: string,
  patch: Partial<{ isActive: boolean; sortOrder: number }>
) {
  const db = getServiceClient();
  const dbPatch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.isActive !== undefined) dbPatch.is_active = patch.isActive;
  if (patch.sortOrder !== undefined) dbPatch.sort_order = patch.sortOrder;

  const { error } = await db.from("cities").update(dbPatch).eq("id", id);
  if (error) throw error;
}

// --- Hero campaign ---------------------------------------------------------

/** The single campaign an admin edits — highest priority, regardless of active/date filters (unlike getActiveHeroCampaign). */
export async function getPrimaryHeroCampaign(): Promise<HeroCampaign | null> {
  const db = getServiceClient();
  const { data, error } = await db
    .from("hero_campaigns")
    .select("*")
    .order("priority", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data ? mapHeroCampaign(data) : null;
}

export async function updateHeroCampaign(
  id: string,
  patch: Partial<{
    eyebrow: string | null;
    headline: string;
    description: string | null;
    accentText: string | null;
    stats: HeroCampaign["stats"];
    desktopImageUrl: string | null;
    mobileImageUrl: string | null;
    isActive: boolean;
  }>
) {
  const db = getServiceClient();
  const dbPatch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.eyebrow !== undefined) dbPatch.eyebrow = patch.eyebrow;
  if (patch.headline !== undefined) dbPatch.headline = patch.headline;
  if (patch.description !== undefined) dbPatch.description = patch.description;
  if (patch.accentText !== undefined) dbPatch.accent_text = patch.accentText;
  if (patch.stats !== undefined) dbPatch.stats_json = patch.stats;
  if (patch.desktopImageUrl !== undefined) dbPatch.desktop_image_url = patch.desktopImageUrl;
  if (patch.mobileImageUrl !== undefined) dbPatch.mobile_image_url = patch.mobileImageUrl;
  if (patch.isActive !== undefined) dbPatch.is_active = patch.isActive;

  const { error } = await db.from("hero_campaigns").update(dbPatch).eq("id", id);
  if (error) throw error;
}

// --- Tools ------------------------------------------------------------------

export async function getAllToolsAdmin(): Promise<Tool[]> {
  const db = getServiceClient();
  const { data, error } = await db.from("tools").select("*").order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapTool);
}

export async function updateTool(
  id: string,
  patch: Partial<{ isActive: boolean; sortOrder: number }>
) {
  const db = getServiceClient();
  const dbPatch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.isActive !== undefined) dbPatch.is_active = patch.isActive;
  if (patch.sortOrder !== undefined) dbPatch.sort_order = patch.sortOrder;

  const { error } = await db.from("tools").update(dbPatch).eq("id", id);
  if (error) throw error;
}

// --- Properties ---------------------------------------------------------

export interface AdminPropertyRow {
  id: string;
  citySlug: string;
  name: string;
  sector: string | null;
  status: string;
  isSample: boolean;
  isFeatured: boolean;
  sortOrder: number;
}

export async function getAllPropertiesAdmin(): Promise<AdminPropertyRow[]> {
  const db = getServiceClient();
  const { data, error } = await db
    .from("properties")
    .select("*, cities!inner(slug)")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    citySlug: Array.isArray(row.cities) ? row.cities[0]?.slug : row.cities?.slug,
    name: row.name,
    sector: row.sector,
    status: row.status,
    isSample: row.is_sample,
    isFeatured: row.is_featured,
    sortOrder: row.sort_order,
  }));
}

export async function updateProperty(
  id: string,
  patch: Partial<{ status: string; isFeatured: boolean; sortOrder: number }>
) {
  const db = getServiceClient();
  const dbPatch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.status !== undefined) dbPatch.status = patch.status;
  if (patch.isFeatured !== undefined) dbPatch.is_featured = patch.isFeatured;
  if (patch.sortOrder !== undefined) dbPatch.sort_order = patch.sortOrder;

  const { error } = await db.from("properties").update(dbPatch).eq("id", id);
  if (error) throw error;
}

// --- Dashboard stats ---------------------------------------------------

export async function getDashboardCounts() {
  const db = getServiceClient();
  const [cities, properties, tools, runs] = await Promise.all([
    db.from("cities").select("id", { count: "exact", head: true }),
    db.from("properties").select("id", { count: "exact", head: true }),
    db.from("tools").select("id", { count: "exact", head: true }),
    db.from("analysis_runs").select("id", { count: "exact", head: true }),
  ]);

  return {
    cities: cities.count ?? 0,
    properties: properties.count ?? 0,
    tools: tools.count ?? 0,
    analysisRuns: runs.count ?? 0,
  };
}
