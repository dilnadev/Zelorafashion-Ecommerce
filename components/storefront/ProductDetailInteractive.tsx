"use client";

import { useRef } from "react";
import { ProductGallery } from "./ProductGallery";
import { ProductInfoPanel } from "./ProductInfoPanel";
import type { OptionWithValues } from "@/lib/queries/product-detail";
import type { Product, ProductVariant } from "@/types";

interface ProductDetailInteractiveProps {
  product: Product;
  images: string[];
  options: OptionWithValues[];
  variants: ProductVariant[];
  ratingAverage: number;
  ratingCount: number;
}

export function ProductDetailInteractive({
  product,
  images,
  options,
  variants,
  ratingAverage,
  ratingCount,
}: ProductDetailInteractiveProps) {
  const mainImageRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="grid gap-10 md:grid-cols-2 md:gap-16">
      <ProductGallery images={images} title={product.title} mainImageRef={mainImageRef} />
      <ProductInfoPanel
        product={product}
        options={options}
        variants={variants}
        images={images}
        ratingAverage={ratingAverage}
        ratingCount={ratingCount}
        mainImageRef={mainImageRef}
        onJumpToReviews={() =>
          document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth" })
        }
      />
    </div>
  );
}
