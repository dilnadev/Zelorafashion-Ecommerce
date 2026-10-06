"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { PLACEHOLDER_IMAGES } from "@/lib/placeholder-images";

const RIGHT_COLLECTIONS = [
  { label: "Evening Edit", href: "/products?sort=newest", image: PLACEHOLDER_IMAGES.signature[1] },
  { label: "Jewellery", href: "/products?category=jewellery", image: PLACEHOLDER_IMAGES.signature[2] },
];

export function SignatureCollections() {
  return (
    <section className="mx-auto max-w-content px-6 py-20 md:px-16 md:py-30">
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-10 font-serif text-section text-ink"
      >
        Signature Collections
      </motion.h2>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Link href="/products?sort=best-selling" className="group block h-full">
            <div className="relative aspect-[4/5] h-full w-full overflow-hidden bg-ink/[0.04] md:aspect-auto">
              <Image
                src={PLACEHOLDER_IMAGES.signature[0]}
                alt="The Essentials"
                fill
                style={{ objectPosition: "68% 12%" }}
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(min-width: 768px) 50vw, 100vw"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/60 via-ink/0 to-transparent p-6 pt-14">
                <p className="font-serif text-2xl text-white">The Essentials</p>
              </div>
            </div>
          </Link>
        </motion.div>

        <div className="flex flex-col gap-8 md:gap-10">
          {RIGHT_COLLECTIONS.map((collection, i) => (
            <motion.div
              key={collection.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: (i + 1) * 0.1 }}
            >
              <Link href={collection.href} className="group block">
                <div className="relative aspect-[4/5] overflow-hidden bg-ink/[0.04]">
                  <Image
                    src={collection.image}
                    alt={collection.label}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(min-width: 768px) 50vw, 100vw"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/60 via-ink/0 to-transparent p-6 pt-14">
                    <p className="font-serif text-2xl text-white">{collection.label}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
