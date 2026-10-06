import { createAdminClient } from "@/lib/supabase/admin";

function bucketTimeSeries(rangeDays: number, dates: Date[]): Map<string, number> {
  const now = new Date();
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
      buckets.set(keyFor(new Date(now.getFullYear(), now.getMonth() - i, 1)), 0);
    }
  } else {
    for (let i = rangeDays; i >= 0; i--) {
      buckets.set(keyFor(new Date(now.getTime() - i * 86400000)), 0);
    }
  }

  for (const date of dates) {
    const key = keyFor(date);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }

  return buckets;
}

export interface CountPoint {
  date: string;
  count: number;
}

export async function getOrdersOverTime(rangeDays: number): Promise<CountPoint[]> {
  const admin = createAdminClient();
  const start = new Date(Date.now() - rangeDays * 86400000);

  const { data } = await admin.from("orders").select("created_at").gte("created_at", start.toISOString());
  const buckets = bucketTimeSeries(
    rangeDays,
    (data ?? []).map((o) => new Date(o.created_at))
  );

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));
}

export async function getCustomerAcquisitionOverTime(rangeDays: number): Promise<CountPoint[]> {
  const admin = createAdminClient();
  const start = new Date(Date.now() - rangeDays * 86400000);

  const { data } = await admin
    .from("profiles")
    .select("created_at")
    .eq("role", "customer")
    .gte("created_at", start.toISOString());
  const buckets = bucketTimeSeries(
    rangeDays,
    (data ?? []).map((p) => new Date(p.created_at))
  );

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));
}

export interface TopProductByRevenue {
  title: string;
  revenue: number;
  unitsSold: number;
}

export async function getTopProductsByRevenue(limit = 10): Promise<TopProductByRevenue[]> {
  const admin = createAdminClient();
  const { data: items } = await admin.from("order_items").select("product_id, title, quantity, line_total");
  if (!items || items.length === 0) return [];

  const byProduct = new Map<string, TopProductByRevenue>();
  for (const item of items) {
    const key = item.product_id ?? item.title;
    const entry = byProduct.get(key) ?? { title: item.title, revenue: 0, unitsSold: 0 };
    entry.revenue += item.line_total;
    entry.unitsSold += item.quantity;
    byProduct.set(key, entry);
  }

  return Array.from(byProduct.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit)
    .map((p) => ({ ...p, revenue: Math.round(p.revenue * 100) / 100 }));
}

export interface TopCategory {
  name: string;
  revenue: number;
}

export async function getTopCategories(limit = 8): Promise<TopCategory[]> {
  const admin = createAdminClient();
  const [{ data: items }, { data: products }, { data: categories }] = await Promise.all([
    admin.from("order_items").select("product_id, line_total"),
    admin.from("products").select("id, category_id"),
    admin.from("categories").select("id, name"),
  ]);

  const categoryByProduct = new Map((products ?? []).map((p) => [p.id, p.category_id]));
  const nameByCategory = new Map((categories ?? []).map((c) => [c.id, c.name]));

  const revenueByCategory = new Map<string, number>();
  for (const item of items ?? []) {
    if (!item.product_id) continue;
    const categoryId = categoryByProduct.get(item.product_id);
    if (!categoryId) continue;
    revenueByCategory.set(categoryId, (revenueByCategory.get(categoryId) ?? 0) + item.line_total);
  }

  return Array.from(revenueByCategory.entries())
    .map(([categoryId, revenue]) => ({
      name: nameByCategory.get(categoryId) ?? "Uncategorized",
      revenue: Math.round(revenue * 100) / 100,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}
