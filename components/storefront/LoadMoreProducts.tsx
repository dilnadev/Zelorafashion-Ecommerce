"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/Button";
import { ProductGrid } from "./ProductGrid";
import type { ProductCardData } from "./ProductCard";

const QuickViewModal = dynamic(
  () => import("./QuickViewModal").then((m) => m.QuickViewModal),
  { ssr: false }
);

interface LoadMoreProductsProps {
  initialProducts: ProductCardData[];
  initialHasMore: boolean;
  queryString: string;
}

export function LoadMoreProducts({
  initialProducts,
  initialHasMore,
  queryString,
}: LoadMoreProductsProps) {
  const [batches, setBatches] = useState<ProductCardData[][]>([initialProducts]);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<ProductCardData | null>(null);

  useEffect(() => {
    setBatches([initialProducts]);
    setHasMore(initialHasMore);
    setPage(1);
  }, [queryString, initialProducts, initialHasMore]);

  async function handleLoadMore() {
    setIsLoading(true);
    const nextPage = page + 1;
    const params = new URLSearchParams(queryString);
    params.set("page", String(nextPage));

    try {
      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      setBatches((prev) => [...prev, data.products]);
      setHasMore(data.hasMore);
      setPage(nextPage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      {batches.map((batch, i) => (
        <ProductGrid
          key={i}
          products={batch}
          className={i > 0 ? "mt-6" : undefined}
          onQuickView={setQuickViewProduct}
          showWishlist
        />
      ))}

      {hasMore && (
        <div className="mt-12 flex justify-center">
          <Button variant="secondary" isLoading={isLoading} onClick={handleLoadMore}>
            Load More
          </Button>
        </div>
      )}

      <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </div>
  );
}
