import Link from "next/link";
import type { Metadata } from "next";
import { getOrderForTracking } from "@/lib/queries/order-tracking";
import { StatusBadge } from "@/components/storefront/account/StatusBadge";
import { OrderTimeline } from "@/components/storefront/account/OrderTimeline";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Track Your Order",
};

export const revalidate = 0;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function TrackOrderPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const orderNumber = first(searchParams.order)?.trim() ?? "";
  const email = first(searchParams.email)?.trim() ?? "";
  const hasQuery = orderNumber.length > 0 && email.length > 0;

  const order = hasQuery ? await getOrderForTracking(orderNumber, email) : null;
  const notFound = hasQuery && !order;

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 md:px-16">
      <h1 className="font-serif text-section text-ink">Track Your Order</h1>
      <p className="mt-2 text-body text-ink-muted">
        Enter your order number and the email address used at checkout to see its status.
      </p>

      <form method="get" className="mt-8 grid gap-5 sm:grid-cols-2">
        <Input
          label="Order Number"
          name="order"
          defaultValue={orderNumber}
          required
        />
        <Input
          label="Email Address"
          name="email"
          type="email"
          defaultValue={email}
          required
        />
        <Button type="submit" size="lg" className="sm:col-span-2 sm:w-auto">
          Track Order
        </Button>
      </form>

      {notFound && (
        <p className="mt-8 rounded border border-ink/[0.08] bg-white p-5 text-body text-ink-muted">
          We couldn&apos;t find an order matching that order number and email. Double-check both
          and try again, or{" "}
          <Link href="/contact" className="text-accent underline underline-offset-4">
            contact us
          </Link>{" "}
          for help.
        </p>
      )}

      {order && (
        <div className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/[0.08] pb-5">
            <div>
              <p className="text-body-lg text-ink">{order.order_number}</p>
              <p className="text-caption normal-case tracking-normal text-ink-muted">
                Placed on {formatDate(order.created_at)}
              </p>
            </div>
            <StatusBadge status={order.fulfillment_status} />
          </div>

          {order.tracking_number && (
            <div className="mt-5 rounded border border-ink/[0.08] p-5">
              <p className="text-caption text-ink-muted">Tracking</p>
              <p className="mt-1 text-body text-ink">
                {order.tracking_carrier} — {order.tracking_number}
              </p>
            </div>
          )}

          <div className="mt-8">
            <h2 className="mb-4 text-body-lg text-ink">Status</h2>
            <OrderTimeline entries={order.timeline} />
          </div>

          <ul className="mt-8 divide-y divide-ink/[0.08] rounded border border-ink/[0.08] px-5">
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
        </div>
      )}
    </div>
  );
}
