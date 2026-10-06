import { createClient } from "@/lib/supabase/server";
import type { Coupon } from "@/types";

export async function getAdminCoupons(): Promise<Coupon[]> {
  const supabase = createClient();
  const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
  return data ?? [];
}

export interface CouponFormOptions {
  categories: { id: string; name: string }[];
  products: { id: string; title: string }[];
}

export async function getCouponFormOptions(): Promise<CouponFormOptions> {
  const supabase = createClient();
  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase.from("categories").select("id, name").order("name"),
    supabase.from("products").select("id, title").order("title"),
  ]);
  return { categories: categories ?? [], products: products ?? [] };
}
