"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";
import { cn } from "@/lib/utils";

export default function WishlistHeartButton({
  productId,
  productSlug,
}: {
  productId: string;
  productSlug: string;
}) {
  const { isWishlisted, toggle } = useWishlist();
  const router = useRouter();
  const [isBouncing, setIsBouncing] = useState(false);
  const wishlisted = isWishlisted(productId);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsBouncing(true);
    const result = await toggle(productId);
    if (result === "signin-required") {
      router.push(`/login?redirect=/products/${productSlug}`);
    }
  }

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      animate={isBouncing ? { scale: [1, 1.3, 1] } : {}}
      onAnimationComplete={() => setIsBouncing(false)}
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={wishlisted}
      className="absolute right-3 top-3 cursor-pointer rounded-full bg-white p-2 shadow-card transition-colors hover:bg-black/[0.04]"
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-colors",
          wishlisted ? "fill-destructive text-destructive" : "text-ink"
        )}
      />
    </motion.button>
  );
}
