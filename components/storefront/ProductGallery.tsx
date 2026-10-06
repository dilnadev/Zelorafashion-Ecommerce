"use client";

import { useRef, useState, type PointerEvent, type TouchEvent } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  title: string;
  mainImageRef?: React.MutableRefObject<HTMLDivElement | null>;
}

export function ProductGallery({ images, title, mainImageRef }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState("50% 50%");
  const [pinchScale, setPinchScale] = useState(1);
  const pinchStartDistance = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const activeImage = images[activeIndex] ?? null;

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse" || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomOrigin(`${x}% ${y}%`);
  }

  function handleTouchStart(e: TouchEvent<HTMLDivElement>) {
    if (e.touches.length === 2) {
      const [a, b] = [e.touches[0], e.touches[1]];
      pinchStartDistance.current = Math.hypot(
        a.clientX - b.clientX,
        a.clientY - b.clientY
      );
    }
  }

  function handleTouchMove(e: TouchEvent<HTMLDivElement>) {
    if (e.touches.length === 2 && pinchStartDistance.current) {
      const [a, b] = [e.touches[0], e.touches[1]];
      const distance = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      const ratio = distance / pinchStartDistance.current;
      setPinchScale(Math.min(3, Math.max(1, ratio)));
    }
  }

  function handleTouchEnd(e: TouchEvent<HTMLDivElement>) {
    if (e.touches.length < 2) {
      pinchStartDistance.current = null;
      if (e.touches.length === 0) setPinchScale(1);
    }
  }

  return (
    <div>
      <div
        ref={(node) => {
          containerRef.current = node;
          if (mainImageRef) mainImageRef.current = node;
        }}
        className="relative aspect-[4/5] touch-none overflow-hidden bg-ink/[0.03] md:cursor-zoom-in"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onPointerMove={handlePointerMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait">
          {activeImage && (
            <motion.div
              key={activeImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
              style={{
                transform: `scale(${isZoomed ? 1.8 : pinchScale})`,
                transformOrigin: isZoomed ? zoomOrigin : "center",
                transition: isZoomed ? "transform 0.2s ease-out" : undefined,
              }}
            >
              <Image
                src={activeImage}
                alt={title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 600px"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {images.length > 1 && (
        <div className="mt-4 flex gap-3 overflow-x-auto">
          {images.map((image, index) => (
            <motion.button
              key={image}
              type="button"
              onClick={() => setActiveIndex(index)}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "relative h-20 w-20 shrink-0 overflow-hidden border-2 transition-colors",
                index === activeIndex ? "border-accent" : "border-transparent"
              )}
            >
              <Image
                src={image}
                alt={`${title} thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
