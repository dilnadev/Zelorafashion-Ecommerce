"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X, Clock } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { formatCurrency } from "@/lib/utils";
import type { QuickSearchResult } from "@/lib/queries/search";

const RECENT_SEARCHES_KEY = "recent-searches";
const MAX_RECENT = 5;

function loadRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string) {
  const trimmed = query.trim();
  if (!trimmed) return;
  const existing = loadRecentSearches().filter((q) => q.toLowerCase() !== trimmed.toLowerCase());
  const next = [trimmed, ...existing].slice(0, MAX_RECENT);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
}

export function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<QuickSearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (isOpen) {
      setRecentSearches(loadRecentSearches());
      setQuery("");
      setResults([]);
      setActiveIndex(-1);
      document.body.style.overflow = "hidden";
      const timeout = setTimeout(() => inputRef.current?.focus(), 50);
      return () => {
        clearTimeout(timeout);
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setResults(data.results ?? []);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [results]);

  function goToProduct(slug: string, searchTerm: string) {
    saveRecentSearch(searchTerm);
    onClose();
    router.push(`/products/${slug}`);
  }

  function goToFullResults(searchTerm: string) {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;
    saveRecentSearch(trimmed);
    onClose();
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      onClose();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, results.length - 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, -1));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && results[activeIndex]) {
        goToProduct(results[activeIndex].slug, query);
      } else {
        goToFullResults(query);
      }
    }
  }

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          <motion.div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Search"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative z-10 mx-auto max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-b bg-white shadow-card"
          >
            <div className="flex items-center gap-3 border-b border-ink/[0.08] px-6 py-5">
              <Search className="h-5 w-5 shrink-0 text-ink-muted" strokeWidth={1.5} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search products…"
                className="w-full border-none font-serif text-xl text-ink outline-none placeholder:text-ink-muted"
              />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close search"
                className="cursor-pointer rounded-full p-1.5 text-ink-muted transition-colors hover:bg-ink/[0.04] hover:text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-3 py-3">
              {!query.trim() && recentSearches.length > 0 && (
                <div>
                  <p className="px-3 pb-2 text-caption uppercase tracking-[0.12em] text-ink-muted">Recent Searches</p>
                  {recentSearches.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => setQuery(term)}
                      className="flex w-full cursor-pointer items-center gap-3 rounded px-3 py-2.5 text-left text-body text-ink transition-colors hover:bg-ink/[0.03]"
                    >
                      <Clock className="h-4 w-4 text-ink-muted" />
                      {term}
                    </button>
                  ))}
                </div>
              )}

              {query.trim() && !isLoading && results.length === 0 && (
                <p className="px-3 py-6 text-center text-body text-ink-muted">No products found for &quot;{query}&quot;.</p>
              )}

              {results.map((result, index) => {
                const isActive = index === activeIndex;
                const onSale = result.sale_price != null && result.sale_price < result.price;
                return (
                  <button
                    key={result.id}
                    type="button"
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => goToProduct(result.slug, query)}
                    className={`flex w-full cursor-pointer items-center gap-4 rounded px-3 py-2.5 text-left transition-colors ${
                      isActive ? "bg-ink/[0.04]" : "hover:bg-ink/[0.03]"
                    }`}
                  >
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden bg-ink/[0.04]">
                      {result.image && <Image src={result.image} alt={result.title} fill className="object-cover" sizes="48px" />}
                    </div>
                    <span className="flex-1 truncate text-body text-ink">{result.title}</span>
                    <span className={`shrink-0 text-body ${onSale ? "text-accent" : "text-ink"}`}>
                      {formatCurrency(onSale ? result.sale_price! : result.price)}
                    </span>
                  </button>
                );
              })}

              {query.trim() && results.length > 0 && (
                <button
                  type="button"
                  onClick={() => goToFullResults(query)}
                  className="mt-1 flex w-full cursor-pointer items-center justify-center rounded px-3 py-3 text-caption uppercase tracking-[0.1em] text-ink transition-colors hover:bg-ink/[0.03]"
                >
                  View all results for &quot;{query}&quot;
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
