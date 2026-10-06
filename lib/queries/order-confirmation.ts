import { createAdminClient } from "@/lib/supabase/admin";
import type { Order, OrderItem } from "@/types";

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

/**
 * Looked up by the order's opaque UUID (not the human-friendly, guessable
 * order_number) so a guest can view their own confirmation page right after
 * checkout without being able to enumerate other customers' orders.
 */
export async function getOrderById(id: string): Promise<OrderWithItems | null> {
  const supabase = createAdminClient();

  const { data: order } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
  if (!order) return null;

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", order.id);

  return { ...order, items: items ?? [] };
}
