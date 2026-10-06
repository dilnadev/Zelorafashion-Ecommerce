import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getOrderHistory } from "@/lib/queries/account";
import { StatusBadge } from "@/components/storefront/account/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function OrderHistoryPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const orders = await getOrderHistory(user.id);

  return (
    <div>
      <h1 className="mb-8 font-serif text-section text-ink">Order History</h1>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <p className="text-body-lg text-ink">No orders yet</p>
          <Link
            href="/products"
            className="inline-flex h-12 items-center justify-center rounded bg-ink px-8 text-caption uppercase tracking-[0.1em] text-white transition-colors hover:bg-charcoal"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-ink/[0.08] rounded border border-ink/[0.08]">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="flex flex-col gap-2 px-5 py-4 transition-colors hover:bg-ink/[0.02] sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-body font-medium text-ink">{order.order_number}</p>
                <p className="text-caption normal-case tracking-normal text-ink-muted">
                  {formatDate(order.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-body text-ink">{formatCurrency(order.total)}</span>
                <StatusBadge status={order.fulfillment_status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
