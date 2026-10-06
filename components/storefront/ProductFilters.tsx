"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Star } from "lucide-react";
import { PriceRangeSlider } from "./PriceRangeSlider";
import { cn } from "@/lib/utils";
import type { FilterOptions } from "@/lib/queries/products";

const RATING_OPTIONS = [4, 3, 2, 1];

export function ProductFilters({ filterOptions }: { filterOptions: FilterOptions }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") params.delete(key);
      else params.set(key, value);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const currentCategory = searchParams.get("category");
  const currentColors = searchParams.get("colors")?.split(",").filter(Boolean) ?? [];
  const currentSizes = searchParams.get("sizes")?.split(",").filter(Boolean) ?? [];
  const currentMinRating = searchParams.get("minRating");
  const inStockOnly = searchParams.get("inStock") === "1";
  const minPrice = Number(searchParams.get("minPrice") ?? filterOptions.priceMin);
  const maxPrice = Number(searchParams.get("maxPrice") ?? filterOptions.priceMax);

  function toggleListValue(key: "colors" | "sizes", value: string, current: string[]) {
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateParams({ [key]: next.length ? next.join(",") : null });
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="mb-4 text-caption uppercase tracking-[0.12em] text-ink-muted">Category</p>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => updateParams({ category: null })}
            className={cn(
              "cursor-pointer text-left text-body transition-colors hover:text-accent",
              !currentCategory ? "font-medium text-accent" : "text-ink"
            )}
          >
            All
          </button>
          {filterOptions.categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => updateParams({ category: category.slug })}
              className={cn(
                "cursor-pointer text-left text-body transition-colors hover:text-accent",
                currentCategory === category.slug ? "font-medium text-accent" : "text-ink"
              )}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-4 text-caption uppercase tracking-[0.12em] text-ink-muted">Price</p>
        <PriceRangeSlider
          min={filterOptions.priceMin}
          max={filterOptions.priceMax}
          value={[minPrice, maxPrice]}
          onChange={([lo, hi]) =>
            updateParams({ minPrice: String(lo), maxPrice: String(hi) })
          }
        />
      </div>

      {filterOptions.colors.length > 0 && (
        <div>
          <p className="mb-4 text-caption uppercase tracking-[0.12em] text-ink-muted">Color</p>
          <div className="flex flex-wrap gap-2">
            {filterOptions.colors.map((color) => {
              const selected = currentColors.includes(color);
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => toggleListValue("colors", color, currentColors)}
                  aria-pressed={selected}
                  title={color}
                  className={cn(
                    "h-8 w-8 cursor-pointer rounded-full border-2 transition-all",
                    selected ? "border-accent" : "border-black/10"
                  )}
                  style={{ backgroundColor: color.toLowerCase() }}
                />
              );
            })}
          </div>
        </div>
      )}

      {filterOptions.sizes.length > 0 && (
        <div>
          <p className="mb-4 text-caption uppercase tracking-[0.12em] text-ink-muted">Size</p>
          <div className="flex flex-wrap gap-2">
            {filterOptions.sizes.map((size) => {
              const selected = currentSizes.includes(size);
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleListValue("sizes", size, currentSizes)}
                  aria-pressed={selected}
                  className={cn(
                    "cursor-pointer rounded border px-4 py-1.5 text-body transition-colors",
                    selected
                      ? "border-ink bg-ink text-white"
                      : "border-black/10 text-ink hover:border-ink"
                  )}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <p className="mb-4 text-caption uppercase tracking-[0.12em] text-ink-muted">Rating</p>
        <div className="flex flex-col gap-2">
          {RATING_OPTIONS.map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() =>
                updateParams({
                  minRating: currentMinRating === String(rating) ? null : String(rating),
                })
              }
              className={cn(
                "flex cursor-pointer items-center gap-1.5 text-body transition-colors hover:text-accent",
                currentMinRating === String(rating) ? "text-accent" : "text-ink"
              )}
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-4 w-4",
                    i < rating ? "fill-current" : "fill-none text-ink-muted"
                  )}
                />
              ))}
              <span>& up</span>
            </button>
          ))}
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-2.5 text-body text-ink">
        <input
          type="checkbox"
          checked={inStockOnly}
          onChange={(e) => updateParams({ inStock: e.target.checked ? "1" : null })}
          className="h-4 w-4 cursor-pointer rounded border-black/20 text-accent focus:ring-accent"
        />
        In stock only
      </label>
    </div>
  );
}
