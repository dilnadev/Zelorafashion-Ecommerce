"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { getCategoryImage } from "@/lib/placeholder-images";
import type { Category } from "@/types";

export function FeaturedCategories({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="mx-auto max-w-content px-6 py-20 md:px-16 md:py-30">
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-10 font-serif text-section text-ink"
      >
        Shop by Category
      </motion.h2>
      <motion.div
        className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
      >
        {categories.map((category) => (
          <motion.div
            key={category.id}
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
            }}
          >
            <Link href={`/products?category=${category.slug}`} className="group block">
              <div className="relative aspect-[3/4] overflow-hidden bg-ink/[0.04]">
                <Image
                  src={getCategoryImage(category)}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-105"
                  sizes="(min-width: 768px) 25vw, 50vw"
                />
                <div className="absolute inset-0 bg-accent/20" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/60 via-ink/0 to-transparent p-5 pt-10">
                  <p className="text-caption uppercase tracking-[0.12em] text-white">{category.name}</p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
