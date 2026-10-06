"use client";

import { formatCurrency } from "@/lib/utils";

interface PriceRangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

export function PriceRangeSlider({ min, max, value, onChange }: PriceRangeSliderProps) {
  const [low, high] = value;
  const range = Math.max(max - min, 1);
  const lowPct = ((low - min) / range) * 100;
  const highPct = ((high - min) / range) * 100;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-body text-ink">
        <span>{formatCurrency(low)}</span>
        <span>{formatCurrency(high)}</span>
      </div>
      <div className="relative h-1.5 rounded-full bg-black/10">
        <div
          className="absolute h-full rounded-full bg-accent"
          style={{ left: `${lowPct}%`, right: `${100 - highPct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={low}
          aria-label="Minimum price"
          onChange={(e) => onChange([Math.min(Number(e.target.value), high - 1), high])}
          className="range-thumb pointer-events-none absolute inset-x-0 top-1/2 h-1.5 w-full -translate-y-1/2 appearance-none bg-transparent"
        />
        <input
          type="range"
          min={min}
          max={max}
          value={high}
          aria-label="Maximum price"
          onChange={(e) => onChange([low, Math.max(Number(e.target.value), low + 1)])}
          className="range-thumb pointer-events-none absolute inset-x-0 top-1/2 h-1.5 w-full -translate-y-1/2 appearance-none bg-transparent"
        />
      </div>
    </div>
  );
}
