import { createAdminClient } from "@/lib/supabase/admin";
import type { Order, OrderItem, OrderTimelineEntry } from "@/types";

export interface OrderTrackingResult extends Order {
  items: OrderItem[];
  timeline: OrderTimelineEntry[];
}

function escapeLike(value: string): string {
  return value.replace(/[%_\\]/g, (match) => `\\${match}`);
}

/**
 * Guests have no session, so lookup is gated on order_number + email
 * matching together (not just the guessable order_number) to prevent
 * enumerating other customers' orders. Uses the admin client because the
 * `orders` RLS policy only allows select by the authenticated owner.
 */
export async function getOrderForTracking(
  orderNumber: string,
  email: string
): Promise<OrderTrackingResult | null> {
  const supabase = createAdminClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .ilike("order_number", escapeLike(orderNumber))
    .ilike("email", escapeLike(email))
    .maybeSingle();

  if (!order) return null;

  const [{ data: items }, { data: timeline }] = await Promise.all([
    supabase.from("order_items").select("*").eq("order_id", order.id),
    supabase.from("order_timeline").select("*").eq("order_id", order.id).order("created_at"),
  ]);

  return { ...order, items: items ?? [], timeline: timeline ?? [] };
}
