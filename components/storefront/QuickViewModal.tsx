"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/components/providers/ToastProvider";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, cn } from "@/lib/utils";
import type { ProductCardData } from "./ProductCard";

interface SizeOption {
  id: string;
  value: string;
}

export function QuickViewModal({
  product,
  onClose,
}: {
  product: ProductCardData | null;
  onClose: () => void;
}) {
  const { addItem, flyToCart } = useCart();
  const { toast } = useToast();
  const imageRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [sizes, setSizes] = useState<SizeOption[]>([]);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!product) return;
    setQuantity(1);
    setSelectedSize(null);
    setSizes([]);
    setIsLoading(true);

    const supabase = createClient();
    supabase
      .from("product_options")
      .select("id")
      .eq("product_id", product.id)
      .ilike("name", "size")
      .maybeSingle()
      .then(async ({ data: sizeOption }) => {
        if (!sizeOption) {
          setIsLoading(false);
          return;
        }
        const { data: values } = await supabase
          .from("product_option_values")
          .select("id, value")
          .eq("option_id", sizeOption.id)
          .order("sort_order");
        setSizes(values ?? []);
        setIsLoading(false);
      });
  }, [product]);

  if (!product) return null;

  const isOnSale = product.sale_price != null && product.sale_price < product.price;
  const isOutOfStock = product.track_inventory && product.stock_quantity <= 0;
  const needsSize = sizes.length > 0;
  const canAdd = !isOutOfStock && (!needsSize || selectedSize);

  function handleAddToCart() {
    if (!product || !canAdd) return;

    addItem({
      id: `${product.id}:${selectedSize ?? "default"}`,
      productId: product.id,
      variantId: null,
      title: product.title,
      slug: product.slug,
      image: product.images[0] ?? null,
      variantLabel: selectedSize ? `Size ${selectedSize}` : null,
      unitPrice: isOnSale ? product.sale_price! : product.price,
      maxQuantity: product.track_inventory ? product.stock_quantity : 99,
      quantity,
    });

    if (imageRef.current && product.images[0]) {
      flyToCart(product.images[0], imageRef.current);
    }

    toast({ title: "Added to bag", description: product.title, variant: "success" });
    onClose();
  }

  return (
    <Modal isOpen={Boolean(product)} onClose={onClose} size="lg">
      <div className="grid gap-8 md:grid-cols-2">
        <div
          ref={imageRef}
          className="relative aspect-[4/5] overflow-hidden bg-ink/[0.03]"
        >
          {product.images[0] && (
            <Image
              src={product.images[0]}
              alt={product.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 90vw, 400px"
            />
          )}
        </div>

        <div className="flex flex-col">
          <h3 className="font-serif text-2xl text-ink">{product.title}</h3>
          <div className="mt-2 flex items-center gap-2">
            <span className={cn("text-body-lg", isOnSale ? "text-accent" : "text-ink")}>
              {formatCurrency(isOnSale ? product.sale_price! : product.price)}
            </span>
            {isOnSale && (
              <span className="text-body text-ink-muted line-through">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>

          {isLoading ? (
            <Skeleton variant="text" width="60%" className="mt-6" />
          ) : (
            needsSize && (
              <div className="mt-6">
                <p className="mb-3 text-caption uppercase tracking-[0.12em] text-ink-muted">Size</p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => setSelectedSize(size.value)}
                      className={cn(
                        "cursor-pointer rounded border px-4 py-1.5 text-body transition-colors",
                        selectedSize === size.value
                          ? "border-ink bg-ink text-white"
                          : "border-black/10 text-ink hover:border-ink"
                      )}
                    >
                      {size.value}
                    </button>
                  ))}
                </div>
              </div>
            )
          )}

          <div className="mt-6">
            <p className="mb-3 text-caption uppercase tracking-[0.12em] text-ink-muted">Quantity</p>
            <div className="flex w-fit items-center gap-4 rounded border border-black/10 px-3 py-2">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
                className="cursor-pointer text-ink-muted transition-colors hover:text-ink disabled:opacity-30"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-4 text-center text-body">{quantity}</span>
              <button
                type="button"
                onClick={() =>
                  setQuantity((q) =>
                    Math.min(product.track_inventory ? product.stock_quantity : 99, q + 1)
                  )
                }
                disabled={product.track_inventory && quantity >= product.stock_quantity}
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
            disabled={!canAdd}
            onClick={handleAddToCart}
          >
            {isOutOfStock
              ? "Out of Stock"
              : needsSize && !selectedSize
              ? "Select a size"
              : "Add to Bag"}
          </Button>

          <Link
            href={`/products/${product.slug}`}
            className="mt-4 text-center text-body text-ink-muted underline underline-offset-4"
          >
            View full details
          </Link>
        </div>
      </div>
    </Modal>
  );
}
