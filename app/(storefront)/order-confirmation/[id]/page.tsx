import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/queries/order-confirmation";
import { OrderConfirmationCheck } from "@/components/storefront/OrderConfirmationCheck";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function OrderConfirmationPage({
  params,
}: {
  params: { id: string };
}) {
  const order = await getOrderById(params.id);
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-2xl px-6 py-20 text-center md:px-16">
      <div className="flex justify-center">
        <OrderConfirmationCheck />
      </div>

      <h1 className="mt-6 font-serif text-section text-ink">
        {order.payment_status === "paid" ? "Order confirmed" : "Order received"}
      </h1>
      <p className="mt-2 text-body text-ink-muted">
        {order.payment_status === "paid"
          ? "Thank you — your payment was successful and your order is being prepared."
          : "We're waiting on payment confirmation. This page will update once it clears."}
      </p>

      <div className="mt-10 rounded border border-ink/[0.08] bg-white p-6 text-left">
        <div className="flex items-center justify-between border-b border-ink/[0.08] pb-4">
          <span className="text-caption text-ink-muted">Order Number</span>
          <span className="text-body font-medium text-ink">{order.order_number}</span>
        </div>
        <div className="flex items-center justify-between border-b border-ink/[0.08] py-4">
          <span className="text-caption text-ink-muted">Placed On</span>
          <span className="text-body text-ink">{formatDate(order.created_at)}</span>
        </div>
        {order.shipping_method && (
          <div className="flex items-center justify-between border-b border-ink/[0.08] py-4">
            <span className="text-caption text-ink-muted">Estimated Delivery</span>
            <span className="text-body text-ink">{order.shipping_method}</span>
          </div>
        )}

        <ul className="divide-y divide-ink/[0.08] py-2">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between py-3">
              <span className="text-body text-ink">
                {item.title} × {item.quantity}
              </span>
              <span className="text-body text-ink">{formatCurrency(item.line_total)}</span>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between border-t border-ink/[0.08] pt-4 text-body-lg font-medium text-ink">
          <span>Total</span>
          <span>{formatCurrency(order.total)}</span>
        </div>
      </div>

      <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          href="/products"
          className="inline-flex h-12 items-center justify-center rounded bg-ink px-8 text-caption uppercase tracking-[0.1em] text-white transition-colors hover:bg-charcoal"
        >
          Continue Shopping
        </Link>
        <Link
          href={`/track-order?order=${encodeURIComponent(order.order_number)}&email=${encodeURIComponent(order.email)}`}
          className="inline-flex h-12 items-center justify-center rounded border border-ink/15 px-8 text-caption uppercase tracking-[0.1em] text-ink transition-colors hover:border-ink/30"
        >
          Track Order
        </Link>
      </div>
    </div>
  );
}
