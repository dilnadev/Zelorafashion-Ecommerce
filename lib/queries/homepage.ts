import { createClient } from "@/lib/supabase/server";
import { attachImages } from "@/lib/queries/shared";
import type { ProductCardData } from "@/components/storefront/ProductCard";
import type { Category, HeroSlide } from "@/types";

export async function getActiveHeroSlides(): Promise<HeroSlide[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("hero_slides")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  return data ?? [];
}

export async function getFeaturedCategories(limit = 10): Promise<Category[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order")
    .limit(limit);
  return data ?? [];
}

export async function getNewArrivals(limit = 8): Promise<ProductCardData[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(limit);
  return attachImages(data ?? []);
}

export async function getBestSellers(limit = 8): Promise<ProductCardData[]> {
  const supabase = createClient();
  const { data: orderItems } = await supabase
    .from("order_items")
    .select("product_id, quantity");

  if (!orderItems || orderItems.length === 0) return [];

  const unitsSold = new Map<string, number>();
  for (const item of orderItems) {
    if (!item.product_id) continue;
    unitsSold.set(item.product_id, (unitsSold.get(item.product_id) ?? 0) + item.quantity);
  }

  const topIds = Array.from(unitsSold.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);

  if (topIds.length === 0) return [];

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("status", "active")
    .in("id", topIds);

  if (!products || products.length === 0) return [];

  const rank = new Map(topIds.map((id, i) => [id, i]));
  const ordered = [...products].sort(
    (a, b) => (rank.get(a.id) ?? 0) - (rank.get(b.id) ?? 0)
  );

  return attachImages(ordered);
}

export interface ActiveSale {
  productTitle: string;
  productSlug: string;
  saleEnd: string;
}

export async function getActiveSale(): Promise<ActiveSale | null> {
  const supabase = createClient();
  const nowIso = new Date().toISOString();

  const { data } = await supabase
    .from("products")
    .select("title, slug, sale_end")
    .eq("status", "active")
    .not("sale_price", "is", null)
    .not("sale_end", "is", null)
    .gte("sale_end", nowIso)
    .or(`sale_start.is.null,sale_start.lte.${nowIso}`)
    .order("sale_end", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!data || !data.sale_end) return null;

  return {
    productTitle: data.title,
    productSlug: data.slug,
    saleEnd: data.sale_end,
  };
}
