import { createClient } from "@/lib/supabase/server";
import type { createPublicClient } from "@/lib/supabase/public";
import type { SiteSettings } from "@/types";

export type SiteSettingsData = Pick<
  SiteSettings,
  | "site_name"
  | "tagline"
  | "logo_url"
  | "logo_inverted_url"
  | "favicon_url"
  | "contact_email"
  | "contact_phone"
  | "business_address"
  | "currency_code"
  | "currency_symbol"
  | "announcement_bar_active"
  | "announcement_bar_text"
  | "announcement_bar_link"
  | "announcement_bar_color"
  | "social_instagram"
  | "social_facebook"
  | "social_twitter"
  | "social_tiktok"
  | "social_youtube"
>;

export const DEFAULT_SITE_SETTINGS: SiteSettingsData = {
  site_name: "Store",
  tagline: "Considered essentials, made to last.",
  logo_url: null,
  logo_inverted_url: null,
  favicon_url: null,
  contact_email: null,
  contact_phone: null,
  business_address: null,
  currency_code: "INR",
  currency_symbol: "₹",
  announcement_bar_active: false,
  announcement_bar_text: null,
  announcement_bar_link: null,
  announcement_bar_color: null,
  social_instagram: null,
  social_facebook: null,
  social_twitter: null,
  social_tiktok: null,
  social_youtube: null,
};

export async function getSiteSettings(
  client?: ReturnType<typeof createClient> | ReturnType<typeof createPublicClient>
): Promise<SiteSettingsData> {
  const supabase = client ?? createClient();
  const { data } = await supabase.from("site_settings").select("*").limit(1).maybeSingle();

  if (!data) return DEFAULT_SITE_SETTINGS;

  return { ...DEFAULT_SITE_SETTINGS, ...data };
}
