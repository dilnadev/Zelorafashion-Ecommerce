"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { verifyAdminAction } from "@/lib/auth/verify-admin-action";
import type { SeoSettings } from "@/types";

export interface ActionResult {
  success: boolean;
  message?: string;
}

export async function updateSeoSettings(data: Partial<SeoSettings>): Promise<ActionResult> {
  const check = await verifyAdminAction();
  if (!check.ok) return { success: false, message: check.message };

  const supabase = createClient();
  const { data: existing } = await supabase.from("seo_settings").select("id").limit(1).maybeSingle();

  const { error } = existing
    ? await supabase.from("seo_settings").update(data).eq("id", existing.id)
    : await supabase.from("seo_settings").insert(data);

  if (error) return { success: false, message: "Couldn't save SEO settings." };

  revalidatePath("/", "layout");
  revalidatePath("/admin/seo");
  return { success: true };
}

export interface PageSeoInput {
  pageSlug: string;
  metaTitle: string;
  metaDescription: string;
  ogImageUrl: string;
}

export async function upsertPageSeo(input: PageSeoInput, existingId?: string): Promise<ActionResult> {
  const check = await verifyAdminAction();
  if (!check.ok) return { success: false, message: check.message };
  if (!input.pageSlug.trim()) return { success: false, message: "Page slug is required." };

  const supabase = createClient();
  const payload = {
    page_slug: input.pageSlug.trim(),
    meta_title: input.metaTitle || null,
    meta_description: input.metaDescription || null,
    og_image_url: input.ogImageUrl || null,
  };

  const { error } = existingId
    ? await supabase.from("page_seo").update(payload).eq("id", existingId)
    : await supabase.from("page_seo").insert(payload);

  if (error) {
    return {
      success: false,
      message: error.code === "23505" ? "A page with that slug already exists." : "Couldn't save page SEO.",
    };
  }

  revalidatePath("/admin/seo");
  return { success: true };
}

export async function deletePageSeo(id: string): Promise<ActionResult> {
  const check = await verifyAdminAction();
  if (!check.ok) return { success: false, message: check.message };

  const supabase = createClient();
  const { error } = await supabase.from("page_seo").delete().eq("id", id);
  if (error) return { success: false, message: "Couldn't delete page SEO entry." };

  revalidatePath("/admin/seo");
  return { success: true };
}
