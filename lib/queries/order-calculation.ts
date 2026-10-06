import type { SupabaseClient } from "@supabase/supabase-js";
import { getEffectivePrice } from "@/lib/utils";
import { validateCoupon, computeTax } from "@/lib/queries/checkout";
import type { Database } from "@/types/database";

export interface CartItemInput {
  productId: string;
  variantId: string | null;
  quantity: number;
}

export interface ResolvedLineItem {
  productId: string;
  variantId: string | null;
  title: string;
  variantLabel: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  categoryId: string | null;
}

export interface OrderComputation {
  lineItems: ResolvedLineItem[];
  subtotal: number;
  discountAmount: number;
  couponCode: string | null;
  shippingCost: number;
  shippingMethodName: string | null;
  taxAmount: number;
  total: number;
  errors: string[];
}

export async function computeOrder(
  supabase: SupabaseClient<Database>,
  {
    items,
    shippingMethodId,
    couponCode,
    userId,
  }: {
    items: CartItemInput[];
    shippingMethodId: string;
    couponCode: string | null;
    userId: string | null;
  }
): Promise<OrderComputation> {
  const errors: string[] = [];
  const lineItems: ResolvedLineItem[] = [];

  if (items.length === 0) {
    return {
      lineItems: [],
      subtotal: 0,
      discountAmount: 0,
      couponCode: null,
      shippingCost: 0,
      shippingMethodName: null,
      taxAmount: 0,
      total: 0,
      errors: ["Your cart is empty."],
    };
  }

  const productIds = Array.from(new Set(items.map((i) => i.productId)));
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .in("id", productIds)
    .eq("status", "active");
  const productById = new Map((products ?? []).map((p) => [p.id, p]));

  const variantIds = items.map((i) => i.variantId).filter((id): id is string => Boolean(id));
  const { data: variants } =
    variantIds.length > 0
      ? await supabase.from("product_variants").select("*").in("id", variantIds)
      : { data: [] };
  const variantById = new Map((variants ?? []).map((v) => [v.id, v]));

  for (const item of items) {
    const product = productById.get(item.productId);
    if (!product) {
      errors.push("One of the items in your cart is no longer available.");
      continue;
    }

    const variant = item.variantId ? variantById.get(item.variantId) : undefined;
    if (item.variantId && !variant) {
      errors.push(`A selected option for "${product.title}" is no longer available.`);
      continue;
    }

    const unitPrice = variant?.price != null ? variant.price : getEffectivePrice(product);
    const stock = variant ? variant.stock_quantity : product.stock_quantity;

    if (product.track_inventory && !product.allow_backorders && stock < item.quantity) {
      errors.push(`"${product.title}" only has ${Math.max(stock, 0)} left in stock.`);
      continue;
    }

    const variantLabel = variant
      ? (variant.option_values as { option_name: string; value: string }[])
          .map((ov) => `${ov.option_name}: ${ov.value}`)
          .join(", ")
      : null;

    lineItems.push({
      productId: product.id,
      variantId: variant?.id ?? null,
      title: product.title,
      variantLabel,
      unitPrice,
      quantity: item.quantity,
      lineTotal: Math.round(unitPrice * item.quantity * 100) / 100,
      categoryId: product.category_id,
    });
  }

  const subtotal = Math.round(lineItems.reduce((sum, i) => sum + i.lineTotal, 0) * 100) / 100;

  let discountAmount = 0;
  let appliedCouponCode: string | null = null;
  if (couponCode) {
    const couponResult = await validateCoupon(
      couponCode,
      lineItems.map((i) => ({
        productId: i.productId,
        categoryId: i.categoryId,
        lineTotal: i.lineTotal,
      })),
      subtotal,
      userId
    );
    if (couponResult.ok) {
      discountAmount = couponResult.discountAmount;
      appliedCouponCode = couponResult.coupon.code;
    } else {
      errors.push(couponResult.message);
    }
  }

  const { data: shippingMethod } = await supabase
    .from("shipping_methods")
    .select("*")
    .eq("id", shippingMethodId)
    .eq("is_active", true)
    .maybeSingle();

  if (!shippingMethod) {
    errors.push("Select a valid shipping method.");
  }

  const amountAfterDiscount = Math.max(subtotal - discountAmount, 0);
  const freeShippingThreshold = shippingMethod?.free_shipping_threshold ?? null;
  const shippingCost =
    freeShippingThreshold != null && amountAfterDiscount >= freeShippingThreshold
      ? 0
      : shippingMethod?.price ?? 0;

  const { data: siteSettings } = await supabase
    .from("site_settings")
    .select("tax_rate, tax_inclusive")
    .limit(1)
    .maybeSingle();

  const taxAmount = computeTax(
    amountAfterDiscount,
    siteSettings?.tax_rate ?? 0,
    siteSettings?.tax_inclusive ?? false
  );

  const total = Math.round((amountAfterDiscount + shippingCost + taxAmount) * 100) / 100;

  return {
    lineItems,
    subtotal,
    discountAmount,
    couponCode: appliedCouponCode,
    shippingCost,
    shippingMethodName: shippingMethod?.name ?? null,
    taxAmount,
    total,
    errors,
  };
}
