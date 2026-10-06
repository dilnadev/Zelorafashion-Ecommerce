"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Heart, Minus, Plus, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useToast } from "@/components/providers/ToastProvider";
import { formatCurrency, isProductOnSale, cn } from "@/lib/utils";
import type { OptionWithValues } from "@/lib/queries/product-detail";
import type { Product, ProductVariant } from "@/types";

const LOW_STOCK_THRESHOLD = 5;

interface ProductInfoPanelProps {
  product: Product;
  options: OptionWithValues[];
  variants: ProductVariant[];
  images: string[];
  ratingAverage: number;
  ratingCount: number;
  mainImageRef: React.MutableRefObject<HTMLDivElement | null>;
  onJumpToReviews: () => void;
}

function variantMatches(variant: ProductVariant, constraints: Record<string, string>) {
  const map = new Map(
    (variant.option_values as { option_name: string; value: string }[]).map((ov) => [
      ov.option_name,
      ov.value,
    ])
  );
  return Object.entries(constraints).every(([name, value]) => map.get(name) === value);
}

export function ProductInfoPanel({
  product,
  options,
  variants,
  images,
  ratingAverage,
  ratingCount,
  mainImageRef,
  onJumpToReviews,
}: ProductInfoPanelProps) {
  const { addItem, flyToCart } = useCart();
  const { isWishlisted, toggle } = useWishlist();
  const { toast } = useToast();
  const router = useRouter();
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const wishlisted = isWishlisted(product.id);

  async function handleWishlistToggle() {
    const result = await toggle(product.id);
    if (result === "signin-required") {
      router.push(`/login?redirect=/products/${product.slug}`);
    }
  }

  const isVariantMode = options.length > 0 && variants.length > 0;
  const allSelected = options.every((o) => selections[o.name]);

  const matchedVariant = useMemo(() => {
    if (!isVariantMode || !allSelected) return null;
    return variants.find((v) => variantMatches(v, selections)) ?? null;
  }, [isVariantMode, allSelected, variants, selections]);

  const isOnSale = isProductOnSale(product);
  const price =
    matchedVariant?.price != null
      ? matchedVariant.price
      : isOnSale
      ? product.sale_price!
      : product.price;
  const compareAtPrice =
    matchedVariant?.price == null && isOnSale ? product.price : null;

  const stock = matchedVariant ? matchedVariant.stock_quantity : product.stock_quantity;
  const isOutOfStock =
    product.track_inventory && (isVariantMode ? allSelected && stock <= 0 : stock <= 0);
  const isLowStock =
    product.track_inventory &&
    stock > 0 &&
    stock <= LOW_STOCK_THRESHOLD &&
    (!isVariantMode || allSelected);
  const canAddToCart = !isOutOfStock && (!isVariantMode || matchedVariant);
  const maxQuantity = product.track_inventory ? Math.max(stock, 0) : 99;

  function isValueDisabled(optionName: string, value: string) {
    const otherSelections = Object.fromEntries(
      Object.entries(selections).filter(([key]) => key !== optionName)
    );
    return !variants.some(
      (v) =>
        variantMatches(v, { ...otherSelections, [optionName]: value }) &&
        (!product.track_inventory || v.stock_quantity > 0)
    );
  }

  function handleAddToCart() {
    if (!canAddToCart) return;

    const variantLabel = Object.entries(selections)
      .map(([name, value]) => `${name}: ${value}`)
      .join(", ");

    addItem({
      id: `${product.id}:${matchedVariant?.id ?? "default"}`,
      productId: product.id,
      variantId: matchedVariant?.id ?? null,
      title: product.title,
      slug: product.slug,
      image: images[0] ?? null,
      variantLabel: variantLabel || null,
      unitPrice: price,
      maxQuantity: maxQuantity || 99,
      quantity,
    });

    if (mainImageRef.current && images[0]) {
      flyToCart(images[0], mainImageRef.current);
    }

    toast({ title: "Added to bag", description: product.title, variant: "success" });
  }

  return (
    <div>
      <h1 className="font-serif text-section text-ink">{product.title}</h1>

      <button
        type="button"
        onClick={onJumpToReviews}
        className="mt-3 flex cursor-pointer items-center gap-2 text-body text-ink-muted hover:text-accent"
      >
        <span className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "h-4 w-4",
                i < Math.round(ratingAverage) ? "fill-current text-ink" : "text-ink-muted"
              )}
            />
          ))}
        </span>
        {ratingCount > 0
          ? `${ratingAverage.toFixed(1)} (${ratingCount} review${ratingCount === 1 ? "" : "s"})`
          : "No reviews yet"}
      </button>

      <div className="mt-4 flex items-center gap-3">
        <span className={cn("text-3xl", isOnSale ? "text-accent" : "text-ink")}>
          {formatCurrency(price)}
        </span>
        {compareAtPrice && (
          <span className="text-body-lg text-ink-muted line-through">
            {formatCurrency(compareAtPrice)}
          </span>
        )}
      </div>

      {isLowStock && (
        <p className="mt-2 text-caption uppercase tracking-[0.1em] text-accent">
          Only {stock} left in stock
        </p>
      )}

      <p className="mt-2 text-caption text-ink-muted">SKU: {matchedVariant?.sku ?? product.sku}</p>

      {product.description && (
        <p className="mt-6 text-body text-ink-muted">
          {product.description.replace(/<[^>]*>/g, "").slice(0, 220)}
        </p>
      )}

      {options.map((option) => (
        <div key={option.id} className="mt-8">
          <p className="mb-3 text-caption uppercase tracking-[0.12em] text-ink-muted">{option.name}</p>
          {option.name.toLowerCase() === "color" ? (
            <div className="flex flex-wrap gap-3">
              {option.values.map((value) => {
                const selected = selections[option.name] === value.value;
                const disabled = isValueDisabled(option.name, value.value);
                return (
                  <button
                    key={value.id}
                    type="button"
                    disabled={disabled}
                    onClick={() =>
                      setSelections((prev) => ({ ...prev, [option.name]: value.value }))
                    }
                    title={value.value}
                    className={cn(
                      "relative h-10 w-10 cursor-pointer rounded-full border-2 transition-all disabled:cursor-not-allowed disabled:opacity-30",
                      selected ? "border-accent" : "border-black/10"
                    )}
                    style={{ backgroundColor: value.value.toLowerCase() }}
                  >
                    {selected && (
                      <Check className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow" />
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {option.values.map((value) => {
                const selected = selections[option.name] === value.value;
                const disabled = isValueDisabled(option.name, value.value);
                return (
                  <button
                    key={value.id}
                    type="button"
                    disabled={disabled}
                    onClick={() =>
                      setSelections((prev) => ({ ...prev, [option.name]: value.value }))
                    }
                    className={cn(
                      "cursor-pointer rounded border px-4 py-2 text-body transition-colors disabled:cursor-not-allowed disabled:border-black/5 disabled:text-ink-muted/40 disabled:line-through",
                      selected
                        ? "border-ink bg-ink text-white"
                        : "border-black/10 text-ink hover:border-ink"
                    )}
                  >
                    {value.value}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}

      <div className="mt-8">
        <p className="mb-3 text-caption uppercase tracking-[0.12em] text-ink-muted">Quantity</p>
        <div className="flex w-fit items-center gap-4 rounded border border-black/10 px-4 py-2.5">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
            className="cursor-pointer text-ink-muted transition-colors hover:text-ink disabled:opacity-30"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-6 text-center text-body">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(maxQuantity || 99, q + 1))}
            disabled={product.track_inventory && quantity >= maxQuantity}
            aria-label="Increase quantity"
            className="cursor-pointer text-ink-muted transition-colors hover:text-ink disabled:opacity-30"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <Button
        size="lg"
        className="mt-8 w-full uppercase tracking-[0.1em]"
        disabled={!canAddToCart}
        onClick={handleAddToCart}
      >
        {isOutOfStock
          ? "Out of Stock"
          : isVariantMode && !allSelected
          ? `Select ${options.map((o) => o.name).join(" & ")}`
          : "Add to Bag"}
      </Button>

      <button
        type="button"
        onClick={handleWishlistToggle}
        className="mx-auto mt-5 flex cursor-pointer items-center justify-center gap-2 text-caption uppercase tracking-[0.1em] text-ink-muted transition-colors hover:text-ink"
      >
        <Heart className={cn("h-4 w-4", wishlisted && "fill-accent text-accent")} />
        {wishlisted ? "Added to Wishlist" : "Add to Wishlist"}
      </button>
    </div>
  );
}
