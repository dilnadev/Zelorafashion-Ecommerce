import { createAdminClient } from "@/lib/supabase/admin";
import type { Profile, Order, Address } from "@/types";

export interface AdminCustomerListItem {
  id: string;
  full_name: string | null;
  email: string;
  total_orders: number;
  total_spent: number;
  is_active: boolean;
  created_at: string;
}

export interface AdminCustomerListResult {
  customers: AdminCustomerListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export type AdminCustomerSort = "created_at" | "total_spent" | "full_name";

export interface AdminCustomerListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: AdminCustomerSort;
  sortDir?: "asc" | "desc";
}

export async function getAdminCustomers({
  page = 1,
  pageSize = 20,
  search,
  sortBy = "created_at",
  sortDir = "desc",
}: AdminCustomerListParams): Promise<AdminCustomerListResult> {
  const supabase = createAdminClient();

  let query = supabase.from("profiles").select("*", { count: "exact" }).eq("role", "customer");
  if (search) query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);

  // total_spent needs order aggregation, so sort by it happens after fetching
  // the whole matching set below when requested; otherwise paginate directly.
  if (sortBy !== "total_spent") {
    query = query.order(sortBy, { ascending: sortDir === "asc" });
    const from = (page - 1) * pageSize;
    query = query.range(from, from + pageSize - 1);
  }

  const { data: profiles, count } = await query;
  const rows = (profiles ?? []) as Profile[];

  const userIds = rows.map((p) => p.id);
  const { data: orders } = userIds.length
    ? await supabase.from("orders").select("user_id, total, payment_status").in("user_id", userIds)
    : { data: [] as { user_id: string | null; total: number; payment_status: string }[] };

  const statsByUser = new Map<string, { count: number; spent: number }>();
  for (const order of orders ?? []) {
    if (!order.user_id) continue;
    const stats = statsByUser.get(order.user_id) ?? { count: 0, spent: 0 };
    stats.count += 1;
    if (order.payment_status === "paid") stats.spent += order.total;
    statsByUser.set(order.user_id, stats);
  }

  let customers: AdminCustomerListItem[] = rows.map((p) => ({
    id: p.id,
    full_name: p.full_name,
    email: p.email,
    total_orders: statsByUser.get(p.id)?.count ?? 0,
    total_spent: statsByUser.get(p.id)?.spent ?? 0,
    is_active: p.is_active,
    created_at: p.created_at,
  }));

  let total = count ?? 0;

  if (sortBy === "total_spent") {
    customers = customers.sort((a, b) => (sortDir === "asc" ? a.total_spent - b.total_spent : b.total_spent - a.total_spent));
    total = customers.length;
    const from = (page - 1) * pageSize;
    customers = customers.slice(from, from + pageSize);
  }

  return { customers, total, page, pageSize };
}

export interface AdminCustomerDetail extends Profile {
  orders: Order[];
  addresses: Address[];
  total_spent: number;
}

export async function getAdminCustomerById(id: string): Promise<AdminCustomerDetail | null> {
  const supabase = createAdminClient();

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
  if (!profile) return null;

  const [{ data: orders }, { data: addresses }] = await Promise.all([
    supabase.from("orders").select("*").eq("user_id", id).order("created_at", { ascending: false }),
    supabase.from("addresses").select("*").eq("user_id", id),
  ]);

  const total_spent = (orders ?? [])
    .filter((o) => o.payment_status === "paid")
    .reduce((sum, o) => sum + o.total, 0);

  return {
    ...profile,
    orders: orders ?? [],
    addresses: addresses ?? [],
    total_spent,
  };
}
