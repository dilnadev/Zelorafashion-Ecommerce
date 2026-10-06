"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { PLACEHOLDER_IMAGES } from "@/lib/placeholder-images";

export function FeaturedCollection() {
  return (
    <section className="mx-auto max-w-content px-6 md:px-16">
      <div className="grid gap-0 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative aspect-[4/5] md:aspect-auto"
        >
          <Image
            src={PLACEHOLDER_IMAGES.featuredCollection}
            alt="Featured collection"
            fill
            className="object-cover"
            sizes="(min-width: 768px) 50vw, 100vw"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="flex flex-col items-start justify-center gap-6 bg-bg-cream p-10 md:p-16"
        >
          <p className="text-caption uppercase tracking-[0.12em] text-accent">Featured Collection</p>
          <h2 className="font-serif text-section leading-tight text-ink">The New Edit</h2>
          <p className="max-w-sm text-body-lg text-ink-muted">
            Pieces chosen for how they make you feel, not just how they look — considered
            silhouettes for everyday elegance.
          </p>
          <Link
            href="/products?sort=newest"
            className="group relative inline-block text-caption uppercase tracking-[0.12em] text-ink"
          >
            Explore the Collection
            <span className="absolute inset-x-0 -bottom-1 h-px origin-left scale-x-100 bg-ink transition-transform duration-300 group-hover:scale-x-0" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
