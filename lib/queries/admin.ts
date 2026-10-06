import { createAdminClient } from "@/lib/supabase/admin";
import type { Order } from "@/types";

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / previous) * 100;
}

export interface DashboardKPIs {
  revenue: number;
  revenueChangePct: number | null;
  totalOrders: number;
  totalOrdersChangePct: number | null;
  newCustomers: number;
  newCustomersChangePct: number | null;
  avgOrderValue: number;
  avgOrderValueChangePct: number | null;
}

export async function getDashboardKPIs(periodDays = 30): Promise<DashboardKPIs> {
  const admin = createAdminClient();
  const now = new Date();
  const periodStart = new Date(now.getTime() - periodDays * 86400000);
  const previousStart = new Date(periodStart.getTime() - periodDays * 86400000);

  const [
    { data: currentOrders },
    { data: previousOrders },
    { count: currentCustomers },
    { count: previousCustomers },
  ] = await Promise.all([
    admin
      .from("orders")
      .select("total, payment_status")
      .gte("created_at", periodStart.toISOString()),
    admin
      .from("orders")
      .select("total, payment_status")
      .gte("created_at", previousStart.toISOString())
      .lt("created_at", periodStart.toISOString()),
    admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "customer")
      .gte("created_at", periodStart.toISOString()),
    admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "customer")
      .gte("created_at", previousStart.toISOString())
      .lt("created_at", periodStart.toISOString()),
  ]);

  const currentPaid = (currentOrders ?? []).filter((o) => o.payment_status === "paid");
  const previousPaid = (previousOrders ?? []).filter((o) => o.payment_status === "paid");

  const revenue = currentPaid.reduce((sum, o) => sum + o.total, 0);
  const prevRevenue = previousPaid.reduce((sum, o) => sum + o.total, 0);

  const totalOrders = (currentOrders ?? []).length;
  const prevTotalOrders = (previousOrders ?? []).length;

  const avgOrderValue = currentPaid.length ? revenue / currentPaid.length : 0;
  const prevAvgOrderValue = previousPaid.length ? prevRevenue / previousPaid.length : 0;

  return {
    revenue: Math.round(revenue * 100) / 100,
    revenueChangePct: pctChange(revenue, prevRevenue),
    totalOrders,
    totalOrdersChangePct: pctChange(totalOrders, prevTotalOrders),
    newCustomers: currentCustomers ?? 0,
    newCustomersChangePct: pctChange(currentCustomers ?? 0, previousCustomers ?? 0),
    avgOrderValue: Math.round(avgOrderValue * 100) / 100,
    avgOrderValueChangePct: pctChange(avgOrderValue, prevAvgOrderValue),
  };
}

export interface RevenuePoint {
  date: string;
  revenue: number;
}

export async function getRevenueOverTime(rangeDays: number): Promise<RevenuePoint[]> {
  const admin = createAdminClient();
  const now = new Date();
  const start = new Date(now.getTime() - rangeDays * 86400000);

  const { data } = await admin
    .from("orders")
    .select("total, created_at")
    .eq("payment_status", "paid")
    .gte("created_at", start.toISOString());

  const groupByMonth = rangeDays > 120;
  const buckets = new Map<string, number>();

  function keyFor(d: Date) {
    return groupByMonth
      ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  if (groupByMonth) {
    const months = Math.ceil(rangeDays / 30);
    for (let i = months; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.set(keyFor(d), 0);
    }
  } else {
    for (let i = rangeDays; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      buckets.set(keyFor(d), 0);
    }
  }

  for (const order of data ?? []) {
    const key = keyFor(new Date(order.created_at));
    buckets.set(key, (buckets.get(key) ?? 0) + order.total);
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, revenue]) => ({ date, revenue: Math.round(revenue * 100) / 100 }));
}

export interface TopProduct {
  title: string;
  unitsSold: number;
}

export async function getTopSellingProducts(limit = 5): Promise<TopProduct[]> {
  const admin = createAdminClient();
  const { data: items } = await admin.from("order_items").select("product_id, title, quantity");
  if (!items || items.length === 0) return [];

  const unitsByProduct = new Map<string, { title: string; units: number }>();
  for (const item of items) {
    const key = item.product_id ?? item.title;
    const entry = unitsByProduct.get(key) ?? { title: item.title, units: 0 };
    entry.units += item.quantity;
    unitsByProduct.set(key, entry);
  }

  return Array.from(unitsByProduct.values())
    .sort((a, b) => b.units - a.units)
    .slice(0, limit)
    .map((p) => ({ title: p.title, unitsSold: p.units }));
}

export async function getRecentOrdersAdmin(limit = 10): Promise<Order[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export interface LowStockProduct {
  id: string;
  title: string;
  sku: string;
  stock_quantity: number;
}

export async function getLowStockProducts(
  threshold = 10,
  limit = 10
): Promise<LowStockProduct[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("products")
    .select("id, title, sku, stock_quantity")
    .eq("track_inventory", true)
    .eq("status", "active")
    .lt("stock_quantity", threshold)
    .order("stock_quantity", { ascending: true })
    .limit(limit);
  return data ?? [];
}
