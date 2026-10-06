import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminOrderById } from "@/lib/queries/admin-orders";
import { OrderDetailPanel } from "@/components/admin/OrderDetailPanel";
import { OrderTimeline } from "@/components/storefront/account/OrderTimeline";
import { StatusBadge } from "@/components/storefront/account/StatusBadge";
import { PaymentStatusBadge } from "@/components/admin/PaymentStatusBadge";
import { PrintButton } from "@/components/admin/PrintButton";
import { formatCurrency, formatDate } from "@/lib/utils";

export const revalidate = 0;

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const order = await getAdminOrderById(params.id);
  if (!order) notFound();

  const shipping = order.shipping_address as Record<string, string>;
  const billing = order.billing_address as Record<string, string>;

  return (
    <div>
      <div className="print:hidden">
        <Link href="/admin/orders" className="text-body text-ink-muted hover:text-accent">
          ← Back to orders
        </Link>
      </div>

      <div className="mb-8 mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-section text-ink">{order.order_number}</h1>
          <p className="text-body text-ink-muted">Placed on {formatDate(order.created_at)}</p>
        </div>
        <div className="flex items-center gap-3">
          <PaymentStatusBadge status={order.payment_status} />
          <StatusBadge status={order.fulfillment_status} />
          <div className="print:hidden">
            <PrintButton />
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-black/[0.06] bg-white p-6">
            <h2 className="mb-4 font-serif text-lg text-ink">Customer</h2>
            <p className="text-body text-ink">{order.customer_name ?? "Guest"}</p>
            <p className="text-body text-ink-muted">{order.email}</p>
            {order.customer_phone && <p className="text-body text-ink-muted">{order.customer_phone}</p>}
          </section>

          <div className="grid gap-6 sm:grid-cols-2">
            <section className="rounded-2xl border border-black/[0.06] bg-white p-6">
              <h2 className="mb-3 font-serif text-lg text-ink">Shipping Address</h2>
              <p className="text-body text-ink">{shipping.full_name}</p>
              <p className="text-body text-ink-muted">
                {shipping.address_line1}
                {shipping.address_line2 ? `, ${shipping.address_line2}` : ""}
              </p>
              <p className="text-body text-ink-muted">
                {shipping.city}, {shipping.state} {shipping.zip}
              </p>
              <p className="text-body text-ink-muted">{shipping.country}</p>
              {shipping.phone && <p className="text-body text-ink-muted">{shipping.phone}</p>}
            </section>
            <section className="rounded-2xl border border-black/[0.06] bg-white p-6">
              <h2 className="mb-3 font-serif text-lg text-ink">Billing Address</h2>
              <p className="text-body text-ink">{billing.full_name}</p>
              <p className="text-body text-ink-muted">
                {billing.address_line1}
                {billing.address_line2 ? `, ${billing.address_line2}` : ""}
              </p>
              <p className="text-body text-ink-muted">
                {billing.city}, {billing.state} {billing.zip}
              </p>
              <p className="text-body text-ink-muted">{billing.country}</p>
            </section>
          </div>

          <section className="rounded-2xl border border-black/[0.06] bg-white p-6">
            <h2 className="mb-4 font-serif text-lg text-ink">Items</h2>
            <ul className="divide-y divide-black/[0.06]">
              {order.items.map((item) => {
                const variantInfo = item.variant_info as { label?: string } | null;
                return (
                  <li key={item.id} className="flex items-center gap-4 py-4">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-black/[0.04]">
                      {item.image_url && (
                        <Image src={item.image_url} alt={item.title} fill className="object-cover" sizes="56px" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-body text-ink">{item.title}</p>
                      {variantInfo?.label && (
                        <p className="text-caption normal-case tracking-normal text-ink-muted">
                          {variantInfo.label}
                        </p>
                      )}
                      <p className="text-caption normal-case tracking-normal text-ink-muted">
                        Qty {item.quantity} × {formatCurrency(item.unit_price)}
                      </p>
                    </div>
                    <span className="text-body text-ink">{formatCurrency(item.line_total)}</span>
                  </li>
                );
              })}
            </ul>

            <div className="mt-4 space-y-2 border-t border-black/[0.06] pt-4">
              <div className="flex justify-between text-body text-ink-muted">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-body text-success">
                  <span>Discount{order.coupon_code ? ` (${order.coupon_code})` : ""}</span>
                  <span>-{formatCurrency(order.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-body text-ink-muted">
                <span>Shipping{order.shipping_method ? ` (${order.shipping_method})` : ""}</span>
                <span>{formatCurrency(order.shipping_cost)}</span>
              </div>
              <div className="flex justify-between text-body text-ink-muted">
                <span>Tax</span>
                <span>{formatCurrency(order.tax_amount)}</span>
              </div>
              <div className="flex justify-between border-t border-black/[0.06] pt-2 text-body-lg font-medium text-ink">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-black/[0.06] bg-white p-6">
            <h2 className="mb-4 font-serif text-lg text-ink">Payment Info</h2>
            <div className="grid gap-2 text-body text-ink-muted sm:grid-cols-2">
              <p>Method: Razorpay</p>
              <p>Status: {order.payment_status}</p>
              {order.razorpay_payment_id && <p>Payment ID: {order.razorpay_payment_id}</p>}
              {order.razorpay_order_id && <p>Razorpay Order ID: {order.razorpay_order_id}</p>}
            </div>
          </section>

          <section className="rounded-2xl border border-black/[0.06] bg-white p-6">
            <h2 className="mb-4 font-serif text-lg text-ink">Order Timeline</h2>
            <OrderTimeline entries={order.timeline} />
          </section>
        </div>

        <div className="print:hidden">
          <OrderDetailPanel
            orderId={order.id}
            fulfillmentStatus={order.fulfillment_status}
            paymentStatus={order.payment_status}
            trackingNumber={order.tracking_number}
            trackingCarrier={order.tracking_carrier}
          />
        </div>
      </div>
    </div>
  );
}
