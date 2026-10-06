import { formatCurrency } from "@/lib/utils";

interface OrderSummaryProps {
  subtotal: number;
  discount?: number;
  shippingCost?: number | null;
  taxAmount?: number | null;
  total: number;
}

export function OrderSummary({
  subtotal,
  discount = 0,
  shippingCost = null,
  taxAmount = null,
  total,
}: OrderSummaryProps) {
  return (
    <div className="space-y-3 text-body">
      <div className="flex justify-between text-ink">
        <span>Subtotal</span>
        <span>{formatCurrency(subtotal)}</span>
      </div>
      {discount > 0 && (
        <div className="flex justify-between text-success">
          <span>Discount</span>
          <span>-{formatCurrency(discount)}</span>
        </div>
      )}
      <div className="flex justify-between text-ink-muted">
        <span>Shipping</span>
        <span>{shippingCost == null ? "Calculated at checkout" : formatCurrency(shippingCost)}</span>
      </div>
      <div className="flex justify-between text-ink-muted">
        <span>Tax</span>
        <span>{taxAmount == null ? "Calculated at checkout" : formatCurrency(taxAmount)}</span>
      </div>
      <div className="flex justify-between border-t border-ink/[0.08] pt-3 text-body-lg font-medium text-ink">
        <span>Total</span>
        <span>{formatCurrency(total)}</span>
      </div>
    </div>
  );
}
