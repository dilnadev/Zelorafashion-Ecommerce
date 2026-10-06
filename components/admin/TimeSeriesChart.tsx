"use client";

import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import type { CountPoint } from "@/lib/queries/admin-analytics";

const RANGES = [
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
  { label: "1Y", days: 365 },
];

const ACCENT = "#171717";

function formatTick(date: string) {
  const isMonth = date.length === 7;
  const d = isMonth ? new Date(`${date}-01`) : new Date(date);
  return isMonth
    ? d.toLocaleDateString("en-IN", { month: "short" })
    : d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

interface TimeSeriesChartProps {
  title: string;
  endpoint: string;
  unitLabel: string;
  initialPoints: CountPoint[];
  gradientId: string;
}

export function TimeSeriesChart({ title, endpoint, unitLabel, initialPoints, gradientId }: TimeSeriesChartProps) {
  const [days, setDays] = useState(30);
  const [points, setPoints] = useState(initialPoints);
  const [isLoading, setIsLoading] = useState(false);

  async function handleRangeChange(nextDays: number) {
    if (nextDays === days) return;
    setDays(nextDays);
    setIsLoading(true);
    const res = await fetch(`${endpoint}?range=${nextDays}`);
    const data = await res.json();
    setPoints(data.points);
    setIsLoading(false);
  }

  function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-lg border border-black/[0.06] bg-white px-3 py-2 shadow-card">
        <p className="text-caption normal-case tracking-normal text-ink-muted">{label ? formatTick(label) : ""}</p>
        <p className="text-body font-semibold text-ink">
          {payload[0].value} {unitLabel}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-body-lg text-ink">{title}</h3>
        <div className="flex gap-1 rounded-full bg-black/[0.04] p-1">
          {RANGES.map((r) => (
            <button
              key={r.days}
              type="button"
              onClick={() => handleRangeChange(r.days)}
              className={cn(
                "cursor-pointer rounded-full px-3 py-1 text-caption normal-case tracking-normal transition-colors",
                days === r.days ? "bg-white text-ink shadow-sm" : "text-ink-muted"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className={cn("h-64 transition-opacity", isLoading && "opacity-50")}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={ACCENT} stopOpacity={0.1} />
                <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.06)" />
            <XAxis
              dataKey="date"
              tickFormatter={formatTick}
              tick={{ fontSize: 12, fill: "#6B6B6B" }}
              axisLine={false}
              tickLine={false}
              minTickGap={32}
            />
            <YAxis tick={{ fontSize: 12, fill: "#6B6B6B" }} axisLine={false} tickLine={false} width={32} allowDecimals={false} />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="count"
              stroke={ACCENT}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              activeDot={{ r: 4, stroke: "#FFFFFF", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
