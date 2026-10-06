import { createClient } from "@/lib/supabase/server";
import type { Address, Order, OrderItem, OrderTimelineEntry, Profile } from "@/types";

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = createClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  return data;
}

export async function getRecentOrders(userId: string, limit = 3): Promise<Order[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getOrderHistory(userId: string): Promise<Order[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export interface OrderDetail extends Order {
  items: OrderItem[];
  timeline: OrderTimelineEntry[];
}

export async function getOrderDetailForUser(
  userId: string,
  orderId: string
): Promise<OrderDetail | null> {
  const supabase = createClient();
  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!order) return null;

  const [{ data: items }, { data: timeline }] = await Promise.all([
    supabase.from("order_items").select("*").eq("order_id", order.id),
    supabase.from("order_timeline").select("*").eq("order_id", order.id).order("created_at"),
  ]);

  return { ...order, items: items ?? [], timeline: timeline ?? [] };
}

export async function getAddresses(userId: string): Promise<Address[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getDefaultAddress(userId: string): Promise<Address | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .eq("is_default", true)
    .maybeSingle();
  return data;
}
