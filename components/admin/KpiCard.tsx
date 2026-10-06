"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";
import { ArrowDown, ArrowUp } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: number;
  changePct: number | null;
  format?: "number" | "currency";
  periodLabel?: string;
}

function useCountUp(target: number, duration = 0.8) {
  const [value, setValue] = useState(0);
  const prevTarget = useRef(0);

  useEffect(() => {
    const controls = animate(prevTarget.current, target, {
      duration,
      ease: [0.25, 0.1, 0.25, 1],
      onUpdate: (v) => setValue(v),
    });
    prevTarget.current = target;
    return () => controls.stop();
  }, [target, duration]);

  return value;
}

export function KpiCard({
  label,
  value,
  changePct,
  format = "number",
  periodLabel = "vs previous period",
}: KpiCardProps) {
  const animatedValue = useCountUp(value);
  const isPositive = changePct != null && changePct >= 0;
  const formatted =
    format === "currency"
      ? formatCurrency(animatedValue)
      : Math.round(animatedValue).toLocaleString("en-IN");

  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white p-5">
      <p className="text-caption text-ink-muted">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-ink">{formatted}</p>
      <div className="mt-2 flex items-center gap-1.5 text-caption normal-case tracking-normal">
        {changePct == null ? (
          <span className="text-ink-muted">No data for {periodLabel}</span>
        ) : (
          <>
            <span
              className={cn(
                "flex items-center gap-0.5 font-medium",
                isPositive ? "text-success" : "text-destructive"
              )}
            >
              {isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
              {Math.abs(changePct).toFixed(1)}%
            </span>
            <span className="text-ink-muted">{periodLabel}</span>
          </>
        )}
      </div>
    </div>
  );
}
