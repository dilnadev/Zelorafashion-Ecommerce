"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { verifyAdminAction } from "@/lib/auth/verify-admin-action";

export interface ActionResult {
  success: boolean;
  message?: string;
}

export async function recordMediaUpload(input: {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}): Promise<ActionResult> {
  const check = await verifyAdminAction();
  if (!check.ok) return { success: false, message: check.message };

  const supabase = createClient();
  const { error } = await supabase.from("media").insert({
    url: input.url,
    filename: input.filename,
    size: input.size,
    mime_type: input.mimeType,
    uploaded_by: check.userId,
  });

  if (error) return { success: false, message: "Couldn't save media record." };

  revalidatePath("/admin/media");
  return { success: true };
}

export interface MediaUsageResult {
  usedByProducts: string[];
  usedByHeroSlides: boolean;
}

export async function checkMediaUsage(url: string): Promise<MediaUsageResult> {
  const supabase = createClient();
  const [{ data: images }, { data: slides }] = await Promise.all([
    supabase.from("product_images").select("product_id").eq("image_url", url),
    supabase.from("hero_slides").select("id").eq("image_url", url),
  ]);

  const productIds = Array.from(new Set((images ?? []).map((img) => img.product_id)));
  const { data: products } = productIds.length
    ? await supabase.from("products").select("title").in("id", productIds)
    : { data: [] as { title: string }[] };

  return {
    usedByProducts: (products ?? []).map((p) => p.title),
    usedByHeroSlides: (slides ?? []).length > 0,
  };
}

export async function deleteMedia(id: string, url: string): Promise<ActionResult> {
  const check = await verifyAdminAction();
  if (!check.ok) return { success: false, message: check.message };

  const supabase = createClient();

  const marker = "/media-library/";
  const markerIndex = url.indexOf(marker);
  if (markerIndex !== -1) {
    const path = url.slice(markerIndex + marker.length);
    await supabase.storage.from("media-library").remove([path]);
  }

  const { error } = await supabase.from("media").delete().eq("id", id);
  if (error) return { success: false, message: "Couldn't delete media." };

  revalidatePath("/admin/media");
  return { success: true };
}
