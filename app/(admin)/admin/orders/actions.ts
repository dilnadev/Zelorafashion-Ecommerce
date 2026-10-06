"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { verifyAdminAction } from "@/lib/auth/verify-admin-action";
import { refundPayment } from "@/lib/razorpay";
import type { FulfillmentStatus } from "@/types/database";

export interface ActionResult {
  success: boolean;
  message?: string;
}

async function logTimeline(
  supabase: ReturnType<typeof createClient>,
  orderId: string,
  status: string,
  note: string | null,
  createdBy: string
) {
  await supabase.from("order_timeline").insert({
    order_id: orderId,
    status,
    note,
    created_by: createdBy,
  });
}

export async function updateFulfillmentStatus(
  orderId: string,
  status: FulfillmentStatus,
  note?: string
): Promise<ActionResult> {
  const check = await verifyAdminAction();
  if (!check.ok) return { success: false, message: check.message };

  const supabase = createClient();
  const { error } = await supabase.from("orders").update({ fulfillment_status: status }).eq("id", orderId);
  if (error) return { success: false, message: "Couldn't update order status." };

  await logTimeline(supabase, orderId, status, note?.trim() || null, check.userId);

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  return { success: true };
}

export async function addOrderNote(orderId: string, note: string): Promise<ActionResult> {
  const check = await verifyAdminAction();
  if (!check.ok) return { success: false, message: check.message };
  if (!note.trim()) return { success: false, message: "Note cannot be empty." };

  const supabase = createClient();
  await logTimeline(supabase, orderId, "note", note.trim(), check.userId);

  revalidatePath(`/admin/orders/${orderId}`);
  return { success: true };
}

export async function updateShipping(
  orderId: string,
  trackingNumber: string,
  trackingCarrier: string
): Promise<ActionResult> {
  const check = await verifyAdminAction();
  if (!check.ok) return { success: false, message: check.message };

  const supabase = createClient();
  const { error } = await supabase
    .from("orders")
    .update({
      tracking_number: trackingNumber.trim() || null,
      tracking_carrier: trackingCarrier.trim() || null,
    })
    .eq("id", orderId);

  if (error) return { success: false, message: "Couldn't save tracking info." };

  if (trackingNumber.trim()) {
    await logTimeline(
      supabase,
      orderId,
      "tracking updated",
      `${trackingCarrier.trim() || "Carrier"}: ${trackingNumber.trim()}`,
      check.userId
    );
  }

  revalidatePath(`/admin/orders/${orderId}`);
  return { success: true };
}

export async function refundOrder(orderId: string): Promise<ActionResult> {
  const check = await verifyAdminAction();
  if (!check.ok) return { success: false, message: check.message };

  const supabase = createClient();
  const { data: order } = await supabase
    .from("orders")
    .select("payment_status, razorpay_payment_id, total")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) return { success: false, message: "Order not found." };
  if (order.payment_status !== "paid") {
    return { success: false, message: "Only paid orders can be refunded." };
  }
  if (!order.razorpay_payment_id) {
    return { success: false, message: "No payment record found for this order." };
  }

  try {
    await refundPayment(order.razorpay_payment_id, Math.round(order.total * 100));
  } catch {
    return { success: false, message: "Razorpay refund failed. Please try again." };
  }

  const { error } = await supabase.from("orders").update({ payment_status: "refunded" }).eq("id", orderId);
  if (error) return { success: false, message: "Refund processed but order status couldn't be updated." };

  await logTimeline(supabase, orderId, "refunded", "Payment refunded via Razorpay.", check.userId);

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  return { success: true };
}
