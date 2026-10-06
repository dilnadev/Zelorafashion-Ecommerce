"use client";

import { motion } from "framer-motion";
import { ProductCard, type ProductCardData } from "./ProductCard";

export function RelatedProducts({ products }: { products: ProductCardData[] }) {
  if (products.length === 0) return null;

  return (
    <section className="mt-20">
      <h2 className="mb-8 font-serif text-section text-ink">You May Also Like</h2>
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
