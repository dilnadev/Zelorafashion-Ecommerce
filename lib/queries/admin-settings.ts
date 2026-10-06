import { createClient } from "@/lib/supabase/server";
import type { createPublicClient } from "@/lib/supabase/public";
import type { SiteSettings, SeoSettings, PageSeo, ShippingMethod, HeroSlide } from "@/types";

export async function getSiteSettingsRow(): Promise<SiteSettings | null> {
  const supabase = createClient();
  const { data } = await supabase.from("site_settings").select("*").limit(1).maybeSingle();
  return data;
}

export async function getSeoSettingsRow(
  client?: ReturnType<typeof createClient> | ReturnType<typeof createPublicClient>
): Promise<SeoSettings | null> {
  const supabase = client ?? createClient();
  const { data } = await supabase.from("seo_settings").select("*").limit(1).maybeSingle();
  return data;
}

export async function getPageSeoList(): Promise<PageSeo[]> {
  const supabase = createClient();
  const { data } = await supabase.from("page_seo").select("*").order("page_slug");
  return data ?? [];
}

export async function getAdminShippingMethods(): Promise<ShippingMethod[]> {
  const supabase = createClient();
  const { data } = await supabase.from("shipping_methods").select("*").order("sort_order");
  return data ?? [];
}

export async function getAdminHeroSlides(): Promise<HeroSlide[]> {
  const supabase = createClient();
  const { data } = await supabase.from("hero_slides").select("*").order("sort_order");
  return data ?? [];
}
