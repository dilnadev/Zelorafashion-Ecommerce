"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Eye } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/components/providers/ToastProvider";
import { formatCurrency, getEffectivePrice, isProductOnSale, cn } from "@/lib/utils";

// Dynamically imported (not just its data client) because the wishlist
// feature's Supabase query-builder usage pulls in ~200KB that would
// otherwise land in every page rendering a ProductCard, including the
// homepage. Only pages that opt in via `showWishlist` pay this cost.
const WishlistHeartButton = dynamic(() => import("./WishlistHeartButton"), {
  ssr: false,
});

export interface ProductCardData {
  id: string;
  slug: string;
  title: string;
  price: number;
  sale_price: number | null;
  sale_start: string | null;
  sale_end: string | null;
  stock_quantity: number;
  track_inventory: boolean;
  created_at: string;
  images: string[];
}

const NEW_WINDOW_DAYS = 14;

interface ProductCardProps {
  product: ProductCardData;
  onQuickView?: (product: ProductCardData) => void;
  showWishlist?: boolean;
}

export function ProductCard({ product, onQuickView, showWishlist = false }: ProductCardProps) {
  const { addItem, flyToCart } = useCart();
  const { toast } = useToast();
  const imageRef = useRef<HTMLDivElement>(null);

  const isNew =
    Date.now() - new Date(product.created_at).getTime() <
    NEW_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const isOnSale = isProductOnSale(product);
  const isOutOfStock = product.track_inventory && product.stock_quantity <= 0;
  const primaryImage = product.images[0] ?? null;
  const secondaryImage = product.images[1] ?? null;

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    addItem({
      id: `${product.id}:default`,
      productId: product.id,
      variantId: null,
      title: product.title,
      slug: product.slug,
      image: primaryImage,
      variantLabel: null,
      unitPrice: getEffectivePrice(product),
      maxQuantity: product.track_inventory ? product.stock_quantity : 99,
    });

    if (imageRef.current && primaryImage) {
      flyToCart(primaryImage, imageRef.current);
    }

    toast({
      title: "Added to bag",
      description: product.title,
      variant: "success",
    });
  }

  return (
    <motion.div
      initial="rest"
      whileHover="hover"
      animate="rest"
      className="group"
    >
      <Link href={`/products/${product.slug}`} className="block">
        <div
          ref={imageRef}
          className="relative aspect-[4/5] overflow-hidden bg-ink/[0.03]"
        >
          {primaryImage && (
            <motion.div
              variants={{ rest: { scale: 1 }, hover: { scale: 1.05 } }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              className="absolute inset-0"
            >
              <Image
                src={primaryImage}
                alt={product.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </motion.div>
          )}
          {secondaryImage && (
            <motion.div
              variants={{ rest: { opacity: 0 }, hover: { opacity: 1 } }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0"
            >
              <Image
                src={secondaryImage}
                alt={product.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </motion.div>
          )}

          {showWishlist && (
            <WishlistHeartButton productId={product.id} productSlug={product.slug} />
          )}

          {onQuickView && (
            <motion.button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView(product);
              }}
              variants={{ rest: { opacity: 0 }, hover: { opacity: 1 } }}
              transition={{ duration: 0.2 }}
              aria-label="Quick view"
              className="absolute right-3 top-14 cursor-pointer rounded-full bg-white p-2 text-ink transition-colors hover:bg-ink hover:text-white"
            >
              <Eye className="h-4 w-4" />
            </motion.button>
          )}

          <div className="absolute left-3 top-3 flex flex-col gap-2">
            {isNew && (
              <motion.span
                animate={{ opacity: [1, 0.6, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="bg-ink px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-white"
              >
                New
              </motion.span>
            )}
            {isOnSale && (
              <span className="bg-accent px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-white">
                Sale
              </span>
            )}
          </div>

          {!isOutOfStock ? (
            <motion.button
              type="button"
              onClick={handleQuickAdd}
              variants={{
                rest: { opacity: 0, y: 20 },
                hover: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.3, delay: 0.1 }}
              whileTap={{ scale: 0.97 }}
              className="absolute inset-x-3 bottom-3 cursor-pointer bg-white py-3 text-caption uppercase tracking-[0.1em] text-ink transition-colors hover:bg-ink hover:text-white"
            >
              Quick Add
            </motion.button>
          ) : (
            <div className="absolute inset-x-3 bottom-3 bg-white/90 py-3 text-center text-caption uppercase tracking-[0.1em] text-ink-muted">
              Out of Stock
            </div>
          )}
        </div>

        <div className="mt-4 space-y-1">
          <h3 className="font-serif text-product-title text-ink">{product.title}</h3>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-body",
                isOnSale ? "text-accent" : "text-ink"
              )}
            >
              {formatCurrency(isOnSale ? product.sale_price! : product.price)}
            </span>
            {isOnSale && (
              <span className="text-body text-ink-muted line-through">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
