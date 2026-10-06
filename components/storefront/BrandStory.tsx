"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { PLACEHOLDER_IMAGES } from "@/lib/placeholder-images";
import type { SiteSettingsData } from "@/lib/site-settings";

export function BrandStory({ settings }: { settings: SiteSettingsData }) {
  return (
    <section className="mx-auto max-w-content px-6 pt-20 md:px-16 md:pt-30">
      <div className="grid gap-0 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative order-2 aspect-[4/5] overflow-hidden md:order-1 md:aspect-auto"
        >
          <Image
            src={PLACEHOLDER_IMAGES.brandStory}
            alt={settings.site_name}
            fill
            className="object-cover object-left md:origin-left md:scale-[1.65]"
            sizes="(min-width: 768px) 50vw, 100vw"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="order-1 flex flex-col items-start justify-center gap-6 bg-bg p-10 md:order-2 md:p-16"
        >
          <h2 className="font-serif text-section leading-tight text-ink">Made for Her.</h2>
          <p className="max-w-sm text-body-lg text-ink-muted">
            {settings.tagline ||
              `${settings.site_name} celebrates modern femininity through considered silhouettes, refined details and timeless design.`}
          </p>
          <Link
            href="/about"
            className="group relative inline-block text-caption uppercase tracking-[0.12em] text-ink"
          >
            Our Story
            <span className="absolute inset-x-0 -bottom-1 h-px origin-left scale-x-100 bg-ink transition-transform duration-300 group-hover:scale-x-0" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
