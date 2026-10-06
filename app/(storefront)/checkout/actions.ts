"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { computeOrder, type CartItemInput } from "@/lib/queries/order-calculation";
import { getRazorpayClient } from "@/lib/razorpay";
import type { OrderComputation } from "@/lib/queries/order-calculation";

export interface ShippingAddressInput {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export async function previewOrderAction(
  items: CartItemInput[],
  shippingMethodId: string,
  couponCode: string | null
): Promise<OrderComputation> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return computeOrder(supabase, {
    items,
    shippingMethodId,
    couponCode,
    userId: user?.id ?? null,
  });
}

export interface CreateOrderResult {
  success: boolean;
  message?: string;
  orderId?: string;
  orderNumber?: string;
  razorpayOrderId?: string;
  amount?: number;
  currency?: string;
  keyId?: string;
}

export async function createOrderAction(
  items: CartItemInput[],
  shippingMethodId: string,
  couponCode: string | null,
  shipping: ShippingAddressInput
): Promise<CreateOrderResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Pricing/stock/coupon validation reads via the session-aware client (RLS
  // applies normally — products/categories are public-read anyway). The
  // actual persistence below uses the admin client: guests have no
  // Supabase session to satisfy the orders SELECT policy, and Postgres
  // checks INSERT ... RETURNING against the SELECT policy too, so a
  // session-scoped client can't even read back the row it just inserted.
  // Safe here because everything written was already validated above.
  const computation = await computeOrder(supabase, {
    items,
    shippingMethodId,
    couponCode,
    userId: user?.id ?? null,
  });

  if (computation.errors.length > 0) {
    return { success: false, message: computation.errors[0] };
  }

  const admin = createAdminClient();

  const addressJson = {
    full_name: shipping.fullName,
    phone: shipping.phone,
    address_line1: shipping.addressLine1,
    address_line2: shipping.addressLine2 || null,
    city: shipping.city,
    state: shipping.state,
    zip: shipping.zip,
    country: shipping.country,
  };

  const { data: order, error: orderErr } = await admin
    .from("orders")
    .insert({
      user_id: user?.id ?? null,
      email: shipping.email,
      shipping_address: addressJson,
      billing_address: addressJson,
      shipping_method: computation.shippingMethodName,
      shipping_cost: computation.shippingCost,
      subtotal: computation.subtotal,
      discount_amount: computation.discountAmount,
      tax_amount: computation.taxAmount,
      total: computation.total,
      coupon_code: computation.couponCode,
      payment_status: "pending",
      fulfillment_status: "pending",
    })
    .select()
    .single();

  if (orderErr || !order) {
    return { success: false, message: "Couldn't create your order. Please try again." };
  }

  const { error: itemsErr } = await admin.from("order_items").insert(
    computation.lineItems.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      variant_id: item.variantId,
      title: item.title,
      variant_info: item.variantLabel ? { label: item.variantLabel } : null,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      line_total: item.lineTotal,
    }))
  );

  if (itemsErr) {
    return { success: false, message: "Couldn't save your order items. Please try again." };
  }

  await admin.from("order_timeline").insert({
    order_id: order.id,
    status: "pending",
    note: "Order created, awaiting payment.",
  });

  const amountInPaise = Math.round(computation.total * 100);
  const razorpay = getRazorpayClient();
  let razorpayOrder;
  try {
    razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: order.order_number ?? order.id,
      notes: { internal_order_id: order.id },
    });
  } catch {
    return { success: false, message: "Couldn't initialize payment. Please try again." };
  }

  await admin.from("orders").update({ razorpay_order_id: razorpayOrder.id }).eq("id", order.id);

  return {
    success: true,
    orderId: order.id,
    orderNumber: order.order_number ?? undefined,
    razorpayOrderId: razorpayOrder.id,
    amount: amountInPaise,
    currency: "INR",
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  };
}
