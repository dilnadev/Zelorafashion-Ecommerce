import { createClient } from "@/lib/supabase/server";
import type { Order, OrderItem, OrderTimelineEntry } from "@/types";
import type { PaymentStatus, FulfillmentStatus } from "@/types/database";

export interface AdminOrderListItem {
  id: string;
  order_number: string;
  created_at: string;
  customer_name: string;
  email: string;
  items_count: number;
  total: number;
  payment_status: PaymentStatus;
  fulfillment_status: FulfillmentStatus;
}

export interface AdminOrderListResult {
  orders: AdminOrderListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export type AdminOrderSort = "created_at" | "total" | "order_number";

export interface AdminOrderListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  paymentStatus?: PaymentStatus | "";
  fulfillmentStatus?: FulfillmentStatus | "";
  dateFrom?: string;
  dateTo?: string;
  minTotal?: number;
  maxTotal?: number;
  sortBy?: AdminOrderSort;
  sortDir?: "asc" | "desc";
}

async function enrichOrderRows(
  supabase: ReturnType<typeof createClient>,
  rows: Order[]
): Promise<AdminOrderListItem[]> {
  const userIds = Array.from(new Set(rows.map((o) => o.user_id).filter((id): id is string => Boolean(id))));
  const orderIds = rows.map((o) => o.id);

  const [{ data: profiles }, { data: items }] = await Promise.all([
    userIds.length
      ? supabase.from("profiles").select("id, full_name").in("id", userIds)
      : Promise.resolve({ data: [] as { id: string; full_name: string | null }[] }),
    orderIds.length
      ? supabase.from("order_items").select("order_id").in("order_id", orderIds)
      : Promise.resolve({ data: [] as { order_id: string }[] }),
  ]);

  const nameByUserId = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));
  const itemCountByOrder = new Map<string, number>();
  for (const item of items ?? []) {
    itemCountByOrder.set(item.order_id, (itemCountByOrder.get(item.order_id) ?? 0) + 1);
  }

  return rows.map((o) => ({
    id: o.id,
    order_number: o.order_number,
    created_at: o.created_at,
    customer_name:
      (o.user_id ? nameByUserId.get(o.user_id) : null) ??
      (o.shipping_address as { full_name?: string })?.full_name ??
      "Guest",
    email: o.email,
    items_count: itemCountByOrder.get(o.id) ?? 0,
    total: o.total,
    payment_status: o.payment_status,
    fulfillment_status: o.fulfillment_status,
  }));
}

export async function getAdminOrders(params: AdminOrderListParams): Promise<AdminOrderListResult> {
  const {
    page = 1,
    pageSize = 20,
    search,
    paymentStatus,
    fulfillmentStatus,
    dateFrom,
    dateTo,
    minTotal,
    maxTotal,
    sortBy = "created_at",
    sortDir = "desc",
  } = params;
  const supabase = createClient();

  let query = supabase.from("orders").select("*", { count: "exact" });
  if (search) query = query.or(`order_number.ilike.%${search}%,email.ilike.%${search}%`);
  if (paymentStatus) query = query.eq("payment_status", paymentStatus);
  if (fulfillmentStatus) query = query.eq("fulfillment_status", fulfillmentStatus);
  if (dateFrom) query = query.gte("created_at", dateFrom);
  if (dateTo) query = query.lte("created_at", `${dateTo}T23:59:59.999Z`);
  if (typeof minTotal === "number" && !Number.isNaN(minTotal)) query = query.gte("total", minTotal);
  if (typeof maxTotal === "number" && !Number.isNaN(maxTotal)) query = query.lte("total", maxTotal);
  query = query.order(sortBy, { ascending: sortDir === "asc" });

  const from = (page - 1) * pageSize;
  query = query.range(from, from + pageSize - 1);

  const { data: orders, count } = await query;
  const rows = (orders ?? []) as Order[];

  return {
    orders: await enrichOrderRows(supabase, rows),
    total: count ?? 0,
    page,
    pageSize,
  };
}

export async function getAdminOrdersForExport(params: AdminOrderListParams): Promise<AdminOrderListItem[]> {
  const { search, paymentStatus, fulfillmentStatus, dateFrom, dateTo, minTotal, maxTotal } = params;
  const supabase = createClient();
  let query = supabase.from("orders").select("*");
  if (search) query = query.or(`order_number.ilike.%${search}%,email.ilike.%${search}%`);
  if (paymentStatus) query = query.eq("payment_status", paymentStatus);
  if (fulfillmentStatus) query = query.eq("fulfillment_status", fulfillmentStatus);
  if (dateFrom) query = query.gte("created_at", dateFrom);
  if (dateTo) query = query.lte("created_at", `${dateTo}T23:59:59.999Z`);
  if (typeof minTotal === "number" && !Number.isNaN(minTotal)) query = query.gte("total", minTotal);
  if (typeof maxTotal === "number" && !Number.isNaN(maxTotal)) query = query.lte("total", maxTotal);
  query = query.order(params.sortBy ?? "created_at", { ascending: (params.sortDir ?? "desc") === "asc" });

  const { data: orders } = await query;
  const rows = (orders ?? []) as Order[];

  return enrichOrderRows(supabase, rows);
}

export interface AdminOrderItemDetail extends OrderItem {
  image_url: string | null;
}

export interface AdminOrderDetail extends Order {
  items: AdminOrderItemDetail[];
  timeline: OrderTimelineEntry[];
  customer_name: string | null;
  customer_phone: string | null;
}

export async function getAdminOrderById(id: string): Promise<AdminOrderDetail | null> {
  const supabase = createClient();

  const { data: order } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
  if (!order) return null;

  const [{ data: items }, { data: timeline }, profileResult] = await Promise.all([
    supabase.from("order_items").select("*").eq("order_id", id),
    supabase.from("order_timeline").select("*").eq("order_id", id).order("created_at", { ascending: true }),
    order.user_id
      ? supabase.from("profiles").select("full_name, phone").eq("id", order.user_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const rows = items ?? [];
  const productIds = Array.from(new Set(rows.map((i) => i.product_id).filter((id): id is string => Boolean(id))));

  const { data: images } = productIds.length
    ? await supabase
        .from("product_images")
        .select("product_id, image_url, sort_order")
        .in("product_id", productIds)
        .order("sort_order")
    : { data: [] as { product_id: string; image_url: string }[] };

  const firstImageByProduct = new Map<string, string>();
  for (const img of images ?? []) {
    if (!firstImageByProduct.has(img.product_id)) {
      firstImageByProduct.set(img.product_id, img.image_url);
    }
  }

  const shippingAddress = order.shipping_address as { full_name?: string; phone?: string };

  return {
    ...order,
    items: rows.map((item) => ({
      ...item,
      image_url: item.product_id ? firstImageByProduct.get(item.product_id) ?? null : null,
    })),
    timeline: timeline ?? [],
    customer_name: profileResult?.data?.full_name ?? shippingAddress?.full_name ?? null,
    customer_phone: profileResult?.data?.phone ?? shippingAddress?.phone ?? null,
  };
}
