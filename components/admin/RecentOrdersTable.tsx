import Link from "next/link";
import { StatusBadge } from "@/components/storefront/account/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Order } from "@/types";

export function RecentOrdersTable({ orders }: { orders: Order[] }) {
  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-body-lg text-ink">Recent Orders</h3>
        <Link href="/admin/orders" className="text-body text-accent underline underline-offset-4">
          View all
        </Link>
      </div>

      {orders.length === 0 ? (
        <p className="text-body text-ink-muted">No orders yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-caption text-ink-muted">
                <th className="pb-3 font-normal">Order</th>
                <th className="pb-3 font-normal">Customer</th>
                <th className="pb-3 font-normal">Date</th>
                <th className="pb-3 font-normal">Total</th>
                <th className="pb-3 font-normal">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.06]">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="py-3 text-body text-ink">{order.order_number}</td>
                  <td className="py-3 text-body text-ink-muted">{order.email}</td>
                  <td className="py-3 text-body text-ink-muted">{formatDate(order.created_at)}</td>
                  <td className="py-3 text-body text-ink">{formatCurrency(order.total)}</td>
                  <td className="py-3">
                    <StatusBadge status={order.fulfillment_status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
