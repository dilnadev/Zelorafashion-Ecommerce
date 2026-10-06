import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrderDetailForUser } from "@/lib/queries/account";
import { StatusBadge } from "@/components/storefront/account/StatusBadge";
import { OrderTimeline } from "@/components/storefront/account/OrderTimeline";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const order = await getOrderDetailForUser(user.id, params.id);
  if (!order) notFound();

  const shipping = order.shipping_address as Record<string, string>;

  return (
    <div>
      <Link href="/account/orders" className="text-body text-ink-muted hover:text-accent">
        ← Back to orders
      </Link>

      <div className="mb-8 mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-section text-ink">{order.order_number}</h1>
          <p className="text-body text-ink-muted">Placed on {formatDate(order.created_at)}</p>
        </div>
        <StatusBadge status={order.fulfillment_status} />
      </div>

      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <h2 className="mb-4 text-body-lg text-ink">Items</h2>
          <ul className="divide-y divide-ink/[0.08] rounded border border-ink/[0.08] px-5">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between py-4">
                <div>
                  <p className="text-body text-ink">{item.title}</p>
                  <p className="text-caption normal-case tracking-normal text-ink-muted">
                    Qty {item.quantity}
                  </p>
                </div>
                <span className="text-body text-ink">{formatCurrency(item.line_total)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 space-y-2 rounded border border-ink/[0.08] p-5">
            <div className="flex justify-between text-body text-ink-muted">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-body text-success">
                <span>Discount</span>
                <span>-{formatCurrency(order.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between text-body text-ink-muted">
              <span>Shipping</span>
              <span>{formatCurrency(order.shipping_cost)}</span>
            </div>
            <div className="flex justify-between text-body text-ink-muted">
              <span>Tax</span>
              <span>{formatCurrency(order.tax_amount)}</span>
            </div>
            <div className="flex justify-between border-t border-ink/[0.08] pt-2 text-body-lg font-medium text-ink">
              <span>Total</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>

          {order.tracking_number && (
            <div className="mt-4 rounded border border-ink/[0.08] p-5">
              <p className="text-caption text-ink-muted">Tracking</p>
              <p className="mt-1 text-body text-ink">
                {order.tracking_carrier} — {order.tracking_number}
              </p>
            </div>
          )}

          <div className="mt-4 rounded border border-ink/[0.08] p-5">
            <p className="text-caption text-ink-muted">Shipping Address</p>
            <p className="mt-1 text-body text-ink">{shipping.full_name}</p>
            <p className="text-body text-ink-muted">
              {shipping.address_line1}
              {shipping.address_line2 ? `, ${shipping.address_line2}` : ""}
            </p>
            <p className="text-body text-ink-muted">
              {shipping.city}, {shipping.state} {shipping.zip}
            </p>
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-body-lg text-ink">Status Timeline</h2>
          <OrderTimeline entries={order.timeline} />
        </div>
      </div>
    </div>
  );
}
