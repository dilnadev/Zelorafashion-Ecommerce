"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { ProductCard, type ProductCardData } from "./ProductCard";

const STORAGE_KEY = "recently-viewed-products";
const MAX_STORED = 10;
const MAX_SHOWN = 8;

function readStoredIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function recordView(productId: string) {
  const ids = [productId, ...readStoredIds().filter((id) => id !== productId)].slice(
    0,
    MAX_STORED
  );
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export function RecentlyViewed({ productId }: { productId: string }) {
  const [products, setProducts] = useState<ProductCardData[]>([]);

  useEffect(() => {
    const priorIds = readStoredIds().filter((id) => id !== productId);
    recordView(productId);

    if (priorIds.length === 0) return;

    let cancelled = false;
    const supabase = createClient();

    (async () => {
      const [{ data: productRows }, { data: imageRows }] = await Promise.all([
        supabase.from("products").select("*").in("id", priorIds).eq("status", "active"),
        supabase
          .from("product_images")
          .select("*")
          .in("product_id", priorIds)
          .order("sort_order"),
      ]);
      if (cancelled || !productRows) return;

      const imagesByProduct = new Map<string, string[]>();
      for (const image of imageRows ?? []) {
        const list = imagesByProduct.get(image.product_id) ?? [];
        list.push(image.image_url);
        imagesByProduct.set(image.product_id, list);
      }

      const byId = new Map(productRows.map((p) => [p.id, p]));
      const ordered = priorIds
        .map((id) => byId.get(id))
        .filter((p): p is NonNullable<typeof p> => Boolean(p))
        .slice(0, MAX_SHOWN)
        .map((p) => ({
          id: p.id,
          slug: p.slug,
          title: p.title,
          price: p.price,
          sale_price: p.sale_price,
          sale_start: p.sale_start,
          sale_end: p.sale_end,
          stock_quantity: p.stock_quantity,
          track_inventory: p.track_inventory,
          created_at: p.created_at,
          images: imagesByProduct.get(p.id) ?? [],
        }));

      setProducts(ordered);
    })();

    return () => {
      cancelled = true;
    };
  }, [productId]);

  if (products.length === 0) return null;

  return (
    <section className="mt-20">
      <h2 className="mb-8 font-serif text-section text-ink">Recently Viewed</h2>
      <motion.div
        className="flex gap-6 overflow-x-auto pb-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
      >
        {products.map((product) => (
          <motion.div
            key={product.id}
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
            }}
            className="w-56 shrink-0"
          >
            <ProductCard product={product} showWishlist />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
