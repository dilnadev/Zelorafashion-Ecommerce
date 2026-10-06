"use server";

import { createClient } from "@/lib/supabase/server";
import { validateCoupon, type CouponValidationResult } from "@/lib/queries/checkout";

export async function applyCouponAction(
  code: string,
  items: { productId: string; lineTotal: number }[],
  subtotal: number
): Promise<CouponValidationResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const productIds = items.map((i) => i.productId);
  const { data: products } = await supabase
    .from("products")
    .select("id, category_id")
    .in("id", productIds);

  const categoryByProduct = new Map((products ?? []).map((p) => [p.id, p.category_id]));
  const fullItems = items.map((i) => ({
    productId: i.productId,
    categoryId: categoryByProduct.get(i.productId) ?? null,
    lineTotal: i.lineTotal,
  }));

  return validateCoupon(code, fullItems, subtotal, user?.id ?? null);
}
