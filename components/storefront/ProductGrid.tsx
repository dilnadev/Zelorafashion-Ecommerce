"use client";

import { motion, type Variants } from "framer-motion";
import { ProductCard, type ProductCardData } from "./ProductCard";
import { cn } from "@/lib/utils";

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
  },
};

interface ProductGridProps {
  products: ProductCardData[];
  className?: string;
  onQuickView?: (product: ProductCardData) => void;
  showWishlist?: boolean;
}

export function ProductGrid({ products, className, onQuickView, showWishlist }: ProductGridProps) {
  return (
    <motion.div
      className={cn("grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6", className)}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
    >
      {products.map((product) => (
        <motion.div key={product.id} variants={item}>
          <ProductCard product={product} onQuickView={onQuickView} showWishlist={showWishlist} />
        </motion.div>
      ))}
    </motion.div>
  );
}
