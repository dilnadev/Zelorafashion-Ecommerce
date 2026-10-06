"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useCart } from "@/hooks/useCart";

export function FlyToCartLayer() {
  const { flyRequest, clearFlyRequest, cartIconRef, pulseCartIcon } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted || !flyRequest) return null;

  const cartRect = cartIconRef.current?.getBoundingClientRect();
  if (!cartRect) return null;

  const { fromRect, imageUrl } = flyRequest;
  const startX = fromRect.left + fromRect.width / 2 - 20;
  const startY = fromRect.top + fromRect.height / 2 - 20;
  const endX = cartRect.left + cartRect.width / 2 - 20;
  const endY = cartRect.top + cartRect.height / 2 - 20;
  const arcLiftY = Math.min(startY, endY) - 120;

  return createPortal(
    <motion.div
      className="pointer-events-none fixed left-0 top-0 z-[200] h-10 w-10 overflow-hidden rounded-lg bg-cover bg-center shadow-card"
      style={{ backgroundImage: `url(${imageUrl})` }}
      initial={{ x: startX, y: startY, scale: 1, rotate: 0, opacity: 1 }}
      animate={{
        x: [startX, (startX + endX) / 2, endX],
        y: [startY, arcLiftY, endY],
        scale: [1, 0.6, 0.2],
        rotate: [0, 10, 10],
        opacity: [1, 1, 0],
      }}
      transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
      onAnimationComplete={() => {
        clearFlyRequest();
        pulseCartIcon();
      }}
    />,
    document.body
  );
}
