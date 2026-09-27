"use server";

import {
  updateCity,
  updateHeroCampaign,
  updateProperty,
  updateTool,
} from "@grihamconnect/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  checkAdminPassword,
  createSessionToken,
} from "../../lib/adminAuth";

export async function loginAction(_prevState: { error: string } | null, formData: FormData) {
  const password = String(formData.get("password") ?? "");

  let ok: boolean;
  try {
    ok = checkAdminPassword(password);
  } catch {
    return { error: "Admin login isn't configured (ADMIN_PASSWORD missing)." };
  }

  if (!ok) return { error: "Incorrect password." };

  const store = await cookies();
  store.set(ADMIN_SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
    path: "/",
  });

  redirect("/admin");
}

export async function logoutAction() {
  const store = await cookies();
  store.delete(ADMIN_SESSION_COOKIE);
  redirect("/admin/login");
}

// Every mutation revalidates the homepage too — admin content is meant to
// take effect without a redeploy (see the architecture skill's cache section).

export async function toggleCityActiveAction(id: string, isActive: boolean) {
  await updateCity(id, { isActive });
  revalidatePath("/admin/cities");
  revalidatePath("/");
}

export async function setCitySortOrderAction(id: string, formData: FormData) {
  const sortOrder = Number(formData.get("sortOrder"));
  if (Number.isFinite(sortOrder)) await updateCity(id, { sortOrder });
  revalidatePath("/admin/cities");
  revalidatePath("/");
}

export async function toggleToolActiveAction(id: string, isActive: boolean) {
  await updateTool(id, { isActive });
  revalidatePath("/admin/tools");
  revalidatePath("/");
}

export async function setToolSortOrderAction(id: string, formData: FormData) {
  const sortOrder = Number(formData.get("sortOrder"));
  if (Number.isFinite(sortOrder)) await updateTool(id, { sortOrder });
  revalidatePath("/admin/tools");
  revalidatePath("/");
}

export async function togglePropertyFeaturedAction(id: string, isFeatured: boolean) {
  await updateProperty(id, { isFeatured });
  revalidatePath("/admin/properties");
  revalidatePath("/");
}

export async function togglePropertyStatusAction(id: string, currentStatus: string) {
  await updateProperty(id, { status: currentStatus === "active" ? "inactive" : "active" });
  revalidatePath("/admin/properties");
  revalidatePath("/");
}

export async function setPropertySortOrderAction(id: string, formData: FormData) {
  const sortOrder = Number(formData.get("sortOrder"));
  if (Number.isFinite(sortOrder)) await updateProperty(id, { sortOrder });
  revalidatePath("/admin/properties");
  revalidatePath("/");
}

export async function updateHeroAction(id: string, formData: FormData) {
  const stats = [1, 2, 3]
    .map((i) => ({
      value: String(formData.get(`statValue${i}`) ?? "").trim(),
      label: String(formData.get(`statLabel${i}`) ?? "").trim(),
    }))
    .filter((s) => s.value && s.label);

  await updateHeroCampaign(id, {
    eyebrow: String(formData.get("eyebrow") ?? "") || null,
    headline: String(formData.get("headline") ?? ""),
    description: String(formData.get("description") ?? "") || null,
    accentText: String(formData.get("accentText") ?? "") || null,
    stats,
    desktopImageUrl: String(formData.get("desktopImageUrl") ?? "") || null,
    mobileImageUrl: String(formData.get("mobileImageUrl") ?? "") || null,
    isActive: formData.get("isActive") === "on",
  });
  revalidatePath("/admin/hero");
  revalidatePath("/");
}
