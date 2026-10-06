"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/Button";
import { CouponInput } from "@/components/storefront/CouponInput";
import { OrderSummary } from "@/components/storefront/OrderSummary";
import { formatCurrency } from "@/lib/utils";

export default function CartPage() {
  const { items, subtotal, coupon, removeItem, updateQuantity } = useCart();
  const discount = coupon?.discountAmount ?? 0;

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-content flex-col items-center justify-center gap-4 px-6 py-32 text-center">
        <ShoppingBag className="h-14 w-14 text-ink-muted/40" />
        <h1 className="font-serif text-section text-ink">Your bag is empty</h1>
        <p className="text-body text-ink-muted">
          Looks like you haven&apos;t added anything yet.
        </p>
        <Link
          href="/products"
          className="mt-2 inline-flex h-12 items-center justify-center rounded bg-ink px-8 text-caption uppercase tracking-[0.1em] text-white transition-colors hover:bg-charcoal"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-content px-6 py-10 md:px-16">
      <h1 className="mb-10 font-serif text-section text-ink">Your Bag</h1>

      <div className="flex flex-col gap-12 lg:flex-row">
        <motion.ul
          className="flex-1 divide-y divide-ink/[0.08]"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
        >
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <motion.li
                key={item.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, x: 50 }}
                transition={{ duration: 0.3 }}
                className="flex gap-5 py-6"
              >
                <div className="relative h-28 w-24 shrink-0 overflow-hidden bg-ink/[0.03]">
                  {item.image && (
                    <Image src={item.image} alt={item.title} fill className="object-cover" sizes="96px" />
                  )}
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex justify-between gap-4">
                    <div>
                      <Link
                        href={`/products/${item.slug}`}
                        className="text-body-lg font-medium text-ink hover:text-accent"
                      >
                        {item.title}
                      </Link>
                      {item.variantLabel && (
                        <p className="text-caption normal-case tracking-normal text-ink-muted">
                          {item.variantLabel}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      aria-label={`Remove ${item.title}`}
                      className="cursor-pointer text-ink-muted transition-colors hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 rounded border border-ink/15 px-3 py-1.5">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        aria-label="Decrease quantity"
                        className="cursor-pointer text-ink-muted transition-colors hover:text-ink disabled:opacity-30"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-5 text-center text-body">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.maxQuantity}
                        aria-label="Increase quantity"
                        className="cursor-pointer text-ink-muted transition-colors hover:text-ink disabled:opacity-30"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="text-body-lg font-medium text-ink">
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </p>
                  </div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>

        <div className="w-full shrink-0 lg:w-96">
          <div className="rounded border border-ink/[0.08] bg-white p-6">
            <div className="mb-6">
              <CouponInput />
            </div>
            <OrderSummary subtotal={subtotal} discount={discount} total={subtotal - discount} />
            <Link href="/checkout">
              <Button size="lg" className="mt-6 w-full uppercase tracking-[0.1em]">
                Proceed to Checkout
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
