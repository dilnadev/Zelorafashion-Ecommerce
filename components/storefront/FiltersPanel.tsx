"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import { ProductFilters } from "./ProductFilters";
import type { FilterOptions } from "@/lib/queries/products";

export function FiltersPanel({ filterOptions }: { filterOptions: FilterOptions }) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <>
      <aside className="hidden w-64 shrink-0 md:block">
        <ProductFilters filterOptions={filterOptions} />
      </aside>

      <button
        type="button"
        onClick={() => setIsSheetOpen(true)}
        className="mb-6 flex cursor-pointer items-center gap-2 rounded border border-black/10 px-4 py-2.5 text-caption uppercase tracking-[0.1em] text-ink md:hidden"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters
      </button>

      <AnimatePresence>
        {isSheetOpen && (
          <div className="fixed inset-0 z-50 flex items-end md:hidden">
            <motion.div
              className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSheetOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
              className="relative z-10 max-h-[85vh] w-full overflow-y-auto rounded-t-md bg-white p-6"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-serif text-xl text-ink">Filters</h2>
                <button
                  type="button"
                  onClick={() => setIsSheetOpen(false)}
                  aria-label="Close filters"
                  className="cursor-pointer rounded-full p-1.5 text-ink-muted hover:bg-black/[0.04]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <ProductFilters filterOptions={filterOptions} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
