"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import type { HeroSlide } from "@/types";

const SLIDE_DURATION_MS = 6000;

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      SLIDE_DURATION_MS
    );
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) return null;

  const slide = slides[index];
  const words = slide.heading.split(" ");

  return (
    <section className="relative h-[85vh] min-h-[560px] w-full overflow-hidden bg-ink">
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <Image
            src={slide.image_url}
            alt={slide.heading}
            fill
            priority={index === 0}
            className="object-cover"
          />
          <div className="absolute inset-0 bg-ink/30" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 flex h-full max-w-content flex-col justify-end gap-6 px-6 pb-20 mx-auto md:px-16">
        <motion.h1
          key={`heading-${slide.id}`}
          className="max-w-2xl font-serif text-hero text-white"
        >
          {words.map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: [0.25, 0.1, 0.25, 1] }}
              className="mr-3 inline-block"
            >
              {word}
            </motion.span>
          ))}
        </motion.h1>
        {slide.subheading && (
          <motion.p
            key={`sub-${slide.id}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="max-w-md text-body-lg text-white/90"
          >
            {slide.subheading}
          </motion.p>
        )}
        {slide.cta_text && slide.cta_link && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
          >
            <Link
              href={slide.cta_link}
              className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded bg-white px-9 text-caption uppercase tracking-[0.12em] text-ink transition-colors hover:bg-white/90"
            >
              <span
                className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-black/[0.06] to-transparent transition-transform duration-700 group-hover:translate-x-full"
                aria-hidden="true"
              />
              <span className="relative">{slide.cta_text}</span>
            </Link>
          </motion.div>
        )}

        {slides.length > 1 && (
          <div className="flex gap-2 pt-4">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className="relative h-1 w-10 cursor-pointer overflow-hidden rounded-full bg-white/30"
              >
                {i === index && (
                  <motion.span
                    key={slide.id}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: SLIDE_DURATION_MS / 1000, ease: "linear" }}
                    style={{ originX: 0 }}
                    className="absolute inset-0 bg-white"
                  />
                )}
                {i < index && <span className="absolute inset-0 bg-white" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
