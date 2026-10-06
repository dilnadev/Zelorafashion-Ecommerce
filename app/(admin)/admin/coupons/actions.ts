"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { verifyAdminAction } from "@/lib/auth/verify-admin-action";
import type { CouponType } from "@/types/database";

export interface ActionResult {
  success: boolean;
  message?: string;
}

export interface CouponInput {
  code: string;
  type: CouponType;
  value: number;
  minOrderAmount: number | null;
  usageLimit: number | null;
  perCustomerLimit: number | null;
  validFrom: string | null;
  validTo: string | null;
  applicableProducts: string[];
  applicableCategories: string[];
  isActive: boolean;
}

function toPayload(input: CouponInput) {
  return {
    code: input.code.trim().toUpperCase(),
    type: input.type,
    value: input.value,
    min_order_amount: input.minOrderAmount,
    usage_limit: input.usageLimit,
    per_customer_limit: input.perCustomerLimit,
    valid_from: input.validFrom,
    valid_to: input.validTo,
    applicable_products: input.applicableProducts.length ? input.applicableProducts : null,
    applicable_categories: input.applicableCategories.length ? input.applicableCategories : null,
    is_active: input.isActive,
  };
}

export async function createCoupon(input: CouponInput): Promise<ActionResult> {
  const check = await verifyAdminAction();
  if (!check.ok) return { success: false, message: check.message };
  if (!input.code.trim()) return { success: false, message: "Code is required." };

  const supabase = createClient();
  const { error } = await supabase.from("coupons").insert(toPayload(input));

  if (error) {
    return {
      success: false,
      message: error.code === "23505" ? "A coupon with that code already exists." : "Couldn't create coupon.",
    };
  }

  revalidatePath("/admin/coupons");
  return { success: true };
}

export async function updateCoupon(id: string, input: CouponInput): Promise<ActionResult> {
  const check = await verifyAdminAction();
  if (!check.ok) return { success: false, message: check.message };
  if (!input.code.trim()) return { success: false, message: "Code is required." };

  const supabase = createClient();
  const { error } = await supabase.from("coupons").update(toPayload(input)).eq("id", id);

  if (error) {
    return {
      success: false,
      message: error.code === "23505" ? "A coupon with that code already exists." : "Couldn't update coupon.",
    };
  }

  revalidatePath("/admin/coupons");
  return { success: true };
}

export async function deleteCoupon(id: string): Promise<ActionResult> {
  const check = await verifyAdminAction();
  if (!check.ok) return { success: false, message: check.message };

  const supabase = createClient();
  const { error } = await supabase.from("coupons").delete().eq("id", id);
  if (error) return { success: false, message: "Couldn't delete coupon." };

  revalidatePath("/admin/coupons");
  return { success: true };
}
