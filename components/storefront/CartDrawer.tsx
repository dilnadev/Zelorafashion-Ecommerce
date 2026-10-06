"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import type { ProductCardData } from "@/components/storefront/ProductCard";

export function CartDrawer({ recommendedProducts = [] }: { recommendedProducts?: ProductCardData[] }) {
  const { items, subtotal, isDrawerOpen, closeDrawer, removeItem, updateQuantity } =
    useCart();

  const cartProductIds = new Set(items.map((item) => item.productId));
  const suggestions = recommendedProducts.filter((p) => !cartProductIds.has(p.id)).slice(0, 3);

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeDrawer}
            aria-hidden="true"
          />

          <motion.aside
            role="dialog"
            aria-label="Shopping bag"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative flex h-full w-full max-w-md flex-col bg-white shadow-card"
          >
            <div className="flex items-center justify-between border-b border-ink/[0.08] px-6 py-5">
              <h2 className="text-caption uppercase tracking-[0.12em] text-ink">
                Your Bag {items.length > 0 && `(${items.length})`}
              </h2>
              <button
                type="button"
                onClick={closeDrawer}
                aria-label="Close bag"
                className="cursor-pointer rounded-full p-1.5 text-ink-muted transition-colors hover:bg-ink/[0.04] hover:text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <ShoppingBag className="h-12 w-12 text-ink-muted/50" strokeWidth={1.5} />
                <p className="text-body-lg text-ink">Your bag is empty</p>
                <p className="text-body text-ink-muted">
                  Looks like you haven&apos;t added anything yet.
                </p>
                <Link href="/products" onClick={closeDrawer} className="mt-2">
                  <Button className="uppercase tracking-[0.1em]">Continue Shopping</Button>
                </Link>
              </div>
            ) : (
              <>
                <motion.ul
                  className="flex-1 space-y-6 overflow-y-auto px-6 py-6"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: { transition: { staggerChildren: 0.05 } },
                  }}
                >
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.li
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0, x: 50, marginBottom: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex gap-4"
                      >
                        <div className="relative h-28 w-24 shrink-0 overflow-hidden bg-ink/[0.03]">
                          {item.image && (
                            <Image
                              src={item.image}
                              alt={item.title}
                              fill
                              className="object-cover"
                              sizes="96px"
                            />
                          )}
                        </div>
                        <div className="flex flex-1 flex-col justify-between">
                          <div>
                            <p className="text-body font-medium text-ink">
                              {item.title}
                            </p>
                            {item.variantLabel && (
                              <p className="text-caption normal-case tracking-normal text-ink-muted">
                                {item.variantLabel}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 rounded border border-ink/10 px-2 py-1">
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                                disabled={item.quantity <= 1}
                                aria-label="Decrease quantity"
                                className="cursor-pointer text-ink-muted transition-colors hover:text-ink disabled:opacity-30"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="w-4 text-center text-body">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                                disabled={item.quantity >= item.maxQuantity}
                                aria-label="Increase quantity"
                                className="cursor-pointer text-ink-muted transition-colors hover:text-ink disabled:opacity-30"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <p className="text-body font-medium text-ink">
                              {formatCurrency(item.unitPrice * item.quantity)}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          aria-label={`Remove ${item.title}`}
                          className="cursor-pointer self-start text-ink-muted transition-colors hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </motion.li>
                    ))}
                  </AnimatePresence>

                  {suggestions.length > 0 && (
                    <li className="border-t border-ink/[0.08] pt-6">
                      <p className="mb-4 text-caption uppercase tracking-[0.12em] text-ink-muted">
                        You May Also Like
                      </p>
                      <div className="flex gap-3">
                        {suggestions.map((product) => (
                          <Link
                            key={product.id}
                            href={`/products/${product.slug}`}
                            onClick={closeDrawer}
                            className="group block flex-1"
                          >
                            <div className="relative aspect-[4/5] overflow-hidden bg-ink/[0.03]">
                              {product.images[0] && (
                                <Image
                                  src={product.images[0]}
                                  alt={product.title}
                                  fill
                                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                                  sizes="120px"
                                />
                              )}
                            </div>
                            <p className="mt-2 truncate text-caption normal-case tracking-normal text-ink">
                              {product.title}
                            </p>
                            <p className="text-caption normal-case tracking-normal text-ink-muted">
                              {formatCurrency(product.sale_price ?? product.price)}
                            </p>
                          </Link>
                        ))}
                      </div>
                    </li>
                  )}
                </motion.ul>

                <div className="border-t border-ink/[0.08] px-6 py-6">
                  <div className="mb-4 flex items-center justify-between text-body-lg font-medium text-ink">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <p className="mb-4 text-caption normal-case tracking-normal text-ink-muted">
                    Shipping and taxes calculated at checkout.
                  </p>
                  <Link href="/checkout" onClick={closeDrawer}>
                    <Button size="lg" className="w-full uppercase tracking-[0.1em]">
                      Proceed to Checkout
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
