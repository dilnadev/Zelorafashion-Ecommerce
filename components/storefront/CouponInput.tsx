"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/components/providers/ToastProvider";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import { applyCouponAction } from "@/app/(storefront)/cart/actions";

export function CouponInput() {
  const { items, subtotal, coupon, applyCoupon, removeCoupon } = useCart();
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  async function handleApply() {
    if (!code.trim()) return;
    setIsApplying(true);
    const result = await applyCouponAction(
      code.trim(),
      items.map((i) => ({ productId: i.productId, lineTotal: i.unitPrice * i.quantity })),
      subtotal
    );
    setIsApplying(false);

    if (!result.ok) {
      toast({ title: "Coupon not applied", description: result.message, variant: "error" });
      return;
    }

    applyCoupon({ code: result.coupon.code, discountAmount: result.discountAmount });
    toast({
      title: "Coupon applied",
      description: `You saved ${formatCurrency(result.discountAmount)}`,
      variant: "success",
    });
    setCode("");
  }

  if (coupon) {
    return (
      <div className="flex items-center justify-between rounded border border-success/30 bg-success/5 px-4 py-3">
        <div>
          <p className="text-body font-medium text-ink">{coupon.code}</p>
          <p className="text-caption normal-case tracking-normal text-success">
            -{formatCurrency(coupon.discountAmount)} applied
          </p>
        </div>
        <button
          type="button"
          onClick={removeCoupon}
          aria-label="Remove coupon"
          className="cursor-pointer text-ink-muted transition-colors hover:text-destructive"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleApply()}
        placeholder="Promo code"
        className="h-12 flex-1 rounded border border-ink/15 px-4 text-body text-ink outline-none focus:border-accent"
      />
      <Button variant="secondary" isLoading={isApplying} onClick={handleApply}>
        Apply
      </Button>
    </div>
  );
}
