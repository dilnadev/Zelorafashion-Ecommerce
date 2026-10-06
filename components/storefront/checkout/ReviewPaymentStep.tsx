"use client";

import { Button } from "@/components/ui/Button";
import { OrderSummary } from "@/components/storefront/OrderSummary";
import { formatCurrency } from "@/lib/utils";
import type { OrderComputation } from "@/lib/queries/order-calculation";
import type { ShippingAddressInput } from "@/app/(storefront)/checkout/actions";

interface ReviewPaymentStepProps {
  computation: OrderComputation;
  address: ShippingAddressInput;
  onBack: () => void;
  onPlaceOrder: () => void;
  isPlacingOrder: boolean;
}

export function ReviewPaymentStep({
  computation,
  address,
  onBack,
  onPlaceOrder,
  isPlacingOrder,
}: ReviewPaymentStepProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-4 text-body-lg text-ink">Items</h2>
        <ul className="divide-y divide-ink/[0.08]">
          {computation.lineItems.map((item) => (
            <li key={`${item.productId}:${item.variantId ?? "default"}`} className="flex justify-between py-3">
              <div>
                <p className="text-body text-ink">
                  {item.title} <span className="text-ink-muted">× {item.quantity}</span>
                </p>
                {item.variantLabel && (
                  <p className="text-caption normal-case tracking-normal text-ink-muted">
                    {item.variantLabel}
                  </p>
                )}
              </div>
              <span className="text-body text-ink">{formatCurrency(item.lineTotal)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-start justify-between rounded border border-ink/[0.08] p-4">
        <div>
          <h3 className="text-caption text-ink-muted">Shipping to</h3>
          <p className="mt-1 text-body text-ink">{address.fullName}</p>
          <p className="text-body text-ink-muted">
            {address.addressLine1}
            {address.addressLine2 ? `, ${address.addressLine2}` : ""}
          </p>
          <p className="text-body text-ink-muted">
            {address.city}, {address.state} {address.zip}
          </p>
          <p className="text-body text-ink-muted">{address.country}</p>
        </div>
        <div className="text-right">
          <h3 className="text-caption text-ink-muted">Method</h3>
          <p className="mt-1 text-body text-ink">{computation.shippingMethodName}</p>
        </div>
      </div>

      <OrderSummary
        subtotal={computation.subtotal}
        discount={computation.discountAmount}
        shippingCost={computation.shippingCost}
        taxAmount={computation.taxAmount}
        total={computation.total}
      />

      <div className="flex gap-3">
        <Button type="button" variant="ghost" onClick={onBack} disabled={isPlacingOrder}>
          Back
        </Button>
        <Button
          type="button"
          size="lg"
          className="flex-1"
          onClick={onPlaceOrder}
          isLoading={isPlacingOrder}
        >
          Place Order — Pay {formatCurrency(computation.total)}
        </Button>
      </div>
    </div>
  );
}
