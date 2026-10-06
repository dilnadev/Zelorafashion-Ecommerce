import { createClient } from "@/lib/supabase/server";
import type { Coupon, ShippingMethod } from "@/types";

export async function getActiveShippingMethods(): Promise<ShippingMethod[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("shipping_methods")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  return data ?? [];
}

export interface CouponLineItem {
  productId: string;
  categoryId: string | null;
  lineTotal: number;
}

export type CouponValidationResult =
  | { ok: true; discountAmount: number; coupon: Coupon }
  | { ok: false; message: string };

export async function validateCoupon(
  code: string,
  items: CouponLineItem[],
  subtotal: number,
  userId: string | null
): Promise<CouponValidationResult> {
  const supabase = createClient();
  const { data: coupon } = await supabase
    .from("coupons")
    .select("*")
    .ilike("code", code.trim())
    .maybeSingle();

  if (!coupon || !coupon.is_active) {
    return { ok: false, message: "Invalid coupon code." };
  }

  const now = new Date();
  if (coupon.valid_from && new Date(coupon.valid_from) > now) {
    return { ok: false, message: "This coupon isn't active yet." };
  }
  if (coupon.valid_to && new Date(coupon.valid_to) < now) {
    return { ok: false, message: "This coupon has expired." };
  }
  if (coupon.min_order_amount != null && subtotal < coupon.min_order_amount) {
    return {
      ok: false,
      message: `This coupon requires a minimum order of ${coupon.min_order_amount}.`,
    };
  }
  if (coupon.usage_limit != null && coupon.times_used >= coupon.usage_limit) {
    return { ok: false, message: "This coupon has reached its usage limit." };
  }

  if (userId && coupon.per_customer_limit != null) {
    const { count } = await supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .ilike("coupon_code", code.trim());
    if ((count ?? 0) >= coupon.per_customer_limit) {
      return { ok: false, message: "You've already used this coupon." };
    }
  }

  const hasProductRestriction = (coupon.applicable_products?.length ?? 0) > 0;
  const hasCategoryRestriction = (coupon.applicable_categories?.length ?? 0) > 0;

  let applicableItems = items;
  if (hasProductRestriction) {
    applicableItems = items.filter((i) => coupon.applicable_products!.includes(i.productId));
  } else if (hasCategoryRestriction) {
    applicableItems = items.filter(
      (i) => i.categoryId && coupon.applicable_categories!.includes(i.categoryId)
    );
  }

  if ((hasProductRestriction || hasCategoryRestriction) && applicableItems.length === 0) {
    return { ok: false, message: "This coupon doesn't apply to the items in your cart." };
  }

  const applicableSubtotal = applicableItems.reduce((sum, i) => sum + i.lineTotal, 0);
  const rawDiscount =
    coupon.type === "percentage"
      ? (applicableSubtotal * coupon.value) / 100
      : Math.min(coupon.value, applicableSubtotal);

  return { ok: true, discountAmount: Math.round(rawDiscount * 100) / 100, coupon };
}

export function computeTax(
  amountAfterDiscount: number,
  taxRatePercent: number,
  taxInclusive: boolean
): number {
  if (taxRatePercent <= 0) return 0;
  const raw = taxInclusive
    ? (amountAfterDiscount * taxRatePercent) / (100 + taxRatePercent)
    : (amountAfterDiscount * taxRatePercent) / 100;
  return Math.round(raw * 100) / 100;
}
