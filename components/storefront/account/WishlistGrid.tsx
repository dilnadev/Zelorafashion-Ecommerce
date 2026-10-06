"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";
import { createClient } from "@/lib/supabase/client";
import { ProductGrid } from "@/components/storefront/ProductGrid";
import { Skeleton } from "@/components/ui/Skeleton";
import type { ProductCardData } from "@/components/storefront/ProductCard";

export function WishlistGrid() {
  const { ids, isLoaded } = useWishlist();
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    if (ids.size === 0) {
      setProducts([]);
      setIsFetching(false);
      return;
    }

    setIsFetching(true);
    const supabase = createClient();
    const idList = Array.from(ids);

    Promise.all([
      supabase.from("products").select("*").in("id", idList),
      supabase.from("product_images").select("*").in("product_id", idList).order("sort_order"),
    ]).then(([{ data: productRows }, { data: imageRows }]) => {
      const imagesByProduct = new Map<string, string[]>();
      for (const image of imageRows ?? []) {
        const list = imagesByProduct.get(image.product_id) ?? [];
        list.push(image.image_url);
        imagesByProduct.set(image.product_id, list);
      }

      setProducts(
        (productRows ?? []).map((p) => ({
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
        }))
      );
      setIsFetching(false);
    });
  }, [ids, isLoaded]);

  if (!isLoaded || isFetching) {
    return (
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton height={280} />
            <Skeleton variant="text" width="70%" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <Heart className="h-12 w-12 text-ink-muted/40" />
        <p className="text-body-lg text-ink">Your wishlist is empty</p>
        <Link
          href="/products"
          className="inline-flex h-12 items-center justify-center rounded bg-ink px-8 text-caption uppercase tracking-[0.1em] text-white transition-colors hover:bg-charcoal"
        >
          Discover Products
        </Link>
      </div>
    );
  }

  return <ProductGrid products={products} showWishlist />;
}
