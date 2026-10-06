"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { FilterOptions } from "@/lib/queries/products";

interface Chip {
  key: string;
  label: string;
  remove: (params: URLSearchParams) => void;
}

export function ActiveFilterChips({ filterOptions }: { filterOptions: FilterOptions }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const chips: Chip[] = [];

  const category = searchParams.get("category");
  if (category) {
    const name = filterOptions.categories.find((c) => c.slug === category)?.name ?? category;
    chips.push({
      key: "category",
      label: name,
      remove: (p) => p.delete("category"),
    });
  }

  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  if (minPrice || maxPrice) {
    chips.push({
      key: "price",
      label: `₹${minPrice ?? filterOptions.priceMin} – ₹${maxPrice ?? filterOptions.priceMax}`,
      remove: (p) => {
        p.delete("minPrice");
        p.delete("maxPrice");
      },
    });
  }

  for (const color of searchParams.get("colors")?.split(",").filter(Boolean) ?? []) {
    chips.push({
      key: `color-${color}`,
      label: color,
      remove: (p) => {
        const remaining = (p.get("colors")?.split(",") ?? []).filter((c) => c !== color);
        if (remaining.length) p.set("colors", remaining.join(","));
        else p.delete("colors");
      },
    });
  }

  for (const size of searchParams.get("sizes")?.split(",").filter(Boolean) ?? []) {
    chips.push({
      key: `size-${size}`,
      label: size,
      remove: (p) => {
        const remaining = (p.get("sizes")?.split(",") ?? []).filter((s) => s !== size);
        if (remaining.length) p.set("sizes", remaining.join(","));
        else p.delete("sizes");
      },
    });
  }

  const minRating = searchParams.get("minRating");
  if (minRating) {
    chips.push({
      key: "rating",
      label: `${minRating}★ & up`,
      remove: (p) => p.delete("minRating"),
    });
  }

  if (searchParams.get("inStock") === "1") {
    chips.push({
      key: "inStock",
      label: "In stock only",
      remove: (p) => p.delete("inStock"),
    });
  }

  if (chips.length === 0) return null;

  function removeChip(chip: Chip) {
    const params = new URLSearchParams(searchParams.toString());
    chip.remove(params);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="mb-6 flex flex-wrap gap-2">
      <AnimatePresence initial={false}>
        {chips.map((chip) => (
          <motion.button
            key={chip.key}
            type="button"
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => removeChip(chip)}
            className="flex cursor-pointer items-center gap-1.5 rounded bg-ink/[0.05] px-3 py-1.5 text-caption normal-case tracking-normal text-ink transition-colors hover:bg-ink/[0.09]"
          >
            {chip.label}
            <X className="h-3 w-3" />
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
