import type { City, HeroCampaign, Tool } from "@grihamconnect/types";
import { getServiceClient } from "./client";

export async function getActiveHeroCampaign(): Promise<HeroCampaign | null> {
  const db = getServiceClient();
  const nowIso = new Date().toISOString();

  const { data, error } = await db
    .from("hero_campaigns")
    .select("*")
    .eq("is_active", true)
    .or(`starts_at.is.null,starts_at.lte.${nowIso}`)
    .or(`ends_at.is.null,ends_at.gte.${nowIso}`)
    .order("priority", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    eyebrow: data.eyebrow,
    headline: data.headline,
    description: data.description,
    accentText: data.accent_text,
    stats: data.stats_json ?? [],
    desktopImageUrl: data.desktop_image_url,
    mobileImageUrl: data.mobile_image_url,
    imagePosition: data.image_position,
    overlayStrength: Number(data.overlay_strength),
    theme: data.theme,
    ctaLabel: data.cta_label,
    ctaAction: data.cta_action,
    priority: data.priority,
    isActive: data.is_active,
    startsAt: data.starts_at,
    endsAt: data.ends_at,
  };
}

export async function getActiveCities(): Promise<City[]> {
  const db = getServiceClient();
  const { data, error } = await db
    .from("cities")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    displayName: row.display_name,
    shortDescription: row.short_description,
    imageUrl: row.image_url,
    icon: row.icon,
    isActive: row.is_active,
    sortOrder: row.sort_order,
  }));
}

export async function getCityBySlug(slug: string): Promise<City | null> {
  const db = getServiceClient();
  const { data, error } = await db
    .from("cities")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
    displayName: data.display_name,
    shortDescription: data.short_description,
    imageUrl: data.image_url,
    icon: data.icon,
    isActive: data.is_active,
    sortOrder: data.sort_order,
  };
}

export async function getActiveTools(): Promise<Tool[]> {
  const db = getServiceClient();
  const { data, error } = await db
    .from("tools")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    key: row.key,
    name: row.name,
    description: row.description,
    icon: row.icon,
    componentType: row.component_type,
    isActive: row.is_active,
    sortOrder: row.sort_order,
    configuration: row.configuration_json ?? {},
  }));
}
