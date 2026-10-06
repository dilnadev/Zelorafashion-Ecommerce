"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { PLACEHOLDER_IMAGES } from "@/lib/placeholder-images";

export function EditorialBanner() {
  return (
    <section className="relative h-[70vh] min-h-[440px] w-full overflow-hidden bg-ink">
      <motion.div
        initial={{ scale: 1.08 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
        className="absolute inset-0"
      >
        <Image
          src={PLACEHOLDER_IMAGES.editorialBanner}
          alt="Confidence is timeless"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-ink/35" />
      </motion.div>

      <div className="relative z-10 flex h-full flex-col items-center justify-center gap-5 px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="font-serif text-hero text-white"
        >
          Confidence is timeless.
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Link
            href="/products"
            className="inline-flex h-12 items-center justify-center rounded border border-white/60 px-8 text-caption uppercase tracking-[0.12em] text-white transition-colors hover:bg-white hover:text-ink"
          >
            Discover the Edit
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
