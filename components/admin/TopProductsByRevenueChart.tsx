"use client";

import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { formatCurrency } from "@/lib/utils";
import type { TopProductByRevenue } from "@/lib/queries/admin-analytics";

const ACCENT = "#171717";

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { payload: TopProductByRevenue }[] }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-lg border border-black/[0.06] bg-white px-3 py-2 shadow-card">
      <p className="text-caption normal-case tracking-normal text-ink-muted">{item.title}</p>
      <p className="text-body font-semibold text-ink">{formatCurrency(item.revenue)}</p>
      <p className="text-caption normal-case tracking-normal text-ink-muted">{item.unitsSold} units sold</p>
    </div>
  );
}

export function TopProductsByRevenueChart({ products }: { products: TopProductByRevenue[] }) {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <h3 className="mb-4 text-body-lg text-ink">Top Products by Revenue</h3>
        <p className="text-body text-ink-muted">No sales yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white p-5">
      <h3 className="mb-4 text-body-lg text-ink">Top Products by Revenue</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={products} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }} barCategoryGap={12}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="title"
              width={140}
              tick={{ fontSize: 12, fill: "#1A1A1A" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: string) => (v.length > 18 ? `${v.slice(0, 18)}…` : v)}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
            <Bar dataKey="revenue" fill={ACCENT} radius={[0, 4, 4, 0]} maxBarSize={24}>
              {products.map((_, i) => (
                <Cell key={i} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
