"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { verifyAdminAction } from "@/lib/auth/verify-admin-action";
import type { SiteSettings } from "@/types";

export interface ActionResult {
  success: boolean;
  message?: string;
}

export async function updateSiteSettings(data: Partial<SiteSettings>): Promise<ActionResult> {
  const check = await verifyAdminAction();
  if (!check.ok) return { success: false, message: check.message };

  const supabase = createClient();
  const { data: existing } = await supabase.from("site_settings").select("id").limit(1).maybeSingle();

  const { error } = existing
    ? await supabase.from("site_settings").update(data).eq("id", existing.id)
    : await supabase.from("site_settings").insert(data);

  if (error) return { success: false, message: "Couldn't save settings." };

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  return { success: true };
}

export interface ShippingMethodInput {
  name: string;
  description: string;
  price: number;
  estimatedDelivery: string;
  freeShippingThreshold: number | null;
  isActive: boolean;
}

export async function createShippingMethod(input: ShippingMethodInput): Promise<ActionResult> {
  const check = await verifyAdminAction();
  if (!check.ok) return { success: false, message: check.message };
  if (!input.name.trim()) return { success: false, message: "Name is required." };

  const supabase = createClient();
  const { count } = await supabase.from("shipping_methods").select("*", { count: "exact", head: true });

  const { error } = await supabase.from("shipping_methods").insert({
    name: input.name,
    description: input.description || null,
    price: input.price,
    estimated_delivery: input.estimatedDelivery || null,
    free_shipping_threshold: input.freeShippingThreshold,
    is_active: input.isActive,
    sort_order: count ?? 0,
  });

  if (error) return { success: false, message: "Couldn't create shipping method." };

  revalidatePath("/admin/settings");
  revalidatePath("/checkout");
  return { success: true };
}

export async function updateShippingMethod(id: string, input: ShippingMethodInput): Promise<ActionResult> {
  const check = await verifyAdminAction();
  if (!check.ok) return { success: false, message: check.message };
  if (!input.name.trim()) return { success: false, message: "Name is required." };

  const supabase = createClient();
  const { error } = await supabase
    .from("shipping_methods")
    .update({
      name: input.name,
      description: input.description || null,
      price: input.price,
      estimated_delivery: input.estimatedDelivery || null,
      free_shipping_threshold: input.freeShippingThreshold,
      is_active: input.isActive,
    })
    .eq("id", id);

  if (error) return { success: false, message: "Couldn't update shipping method." };

  revalidatePath("/admin/settings");
  revalidatePath("/checkout");
  return { success: true };
}

export async function deleteShippingMethod(id: string): Promise<ActionResult> {
  const check = await verifyAdminAction();
  if (!check.ok) return { success: false, message: check.message };

  const supabase = createClient();
  const { error } = await supabase.from("shipping_methods").delete().eq("id", id);
  if (error) return { success: false, message: "Couldn't delete shipping method." };

  revalidatePath("/admin/settings");
  revalidatePath("/checkout");
  return { success: true };
}

export async function reorderShippingMethods(orderedIds: string[]): Promise<ActionResult> {
  const check = await verifyAdminAction();
  if (!check.ok) return { success: false, message: check.message };

  const supabase = createClient();
  await Promise.all(
    orderedIds.map((id, index) => supabase.from("shipping_methods").update({ sort_order: index }).eq("id", id))
  );

  revalidatePath("/admin/settings");
  return { success: true };
}

export interface HeroSlideInput {
  imageUrl: string;
  heading: string;
  subheading: string;
  ctaText: string;
  ctaLink: string;
  isActive: boolean;
}

export async function createHeroSlide(input: HeroSlideInput): Promise<ActionResult> {
  const check = await verifyAdminAction();
  if (!check.ok) return { success: false, message: check.message };
  if (!input.imageUrl || !input.heading.trim()) {
    return { success: false, message: "Image and heading are required." };
  }

  const supabase = createClient();
  const { count } = await supabase.from("hero_slides").select("*", { count: "exact", head: true });

  const { error } = await supabase.from("hero_slides").insert({
    image_url: input.imageUrl,
    heading: input.heading,
    subheading: input.subheading || null,
    cta_text: input.ctaText || null,
    cta_link: input.ctaLink || null,
    is_active: input.isActive,
    sort_order: count ?? 0,
  });

  if (error) return { success: false, message: "Couldn't create slide." };

  revalidatePath("/admin/settings");
  revalidatePath("/");
  return { success: true };
}

export async function updateHeroSlide(id: string, input: HeroSlideInput): Promise<ActionResult> {
  const check = await verifyAdminAction();
  if (!check.ok) return { success: false, message: check.message };
  if (!input.imageUrl || !input.heading.trim()) {
    return { success: false, message: "Image and heading are required." };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("hero_slides")
    .update({
      image_url: input.imageUrl,
      heading: input.heading,
      subheading: input.subheading || null,
      cta_text: input.ctaText || null,
      cta_link: input.ctaLink || null,
      is_active: input.isActive,
    })
    .eq("id", id);

  if (error) return { success: false, message: "Couldn't update slide." };

  revalidatePath("/admin/settings");
  revalidatePath("/");
  return { success: true };
}

export async function deleteHeroSlide(id: string): Promise<ActionResult> {
  const check = await verifyAdminAction();
  if (!check.ok) return { success: false, message: check.message };

  const supabase = createClient();
  const { error } = await supabase.from("hero_slides").delete().eq("id", id);
  if (error) return { success: false, message: "Couldn't delete slide." };

  revalidatePath("/admin/settings");
  revalidatePath("/");
  return { success: true };
}

export async function reorderHeroSlides(orderedIds: string[]): Promise<ActionResult> {
  const check = await verifyAdminAction();
  if (!check.ok) return { success: false, message: check.message };

  const supabase = createClient();
  await Promise.all(
    orderedIds.map((id, index) => supabase.from("hero_slides").update({ sort_order: index }).eq("id", id))
  );

  revalidatePath("/admin/settings");
  revalidatePath("/");
  return { success: true };
}
