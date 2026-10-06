import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminCustomerById } from "@/lib/queries/admin-customers";
import { CustomerDetailPanel } from "@/components/admin/CustomerDetailPanel";
import { StatusBadge } from "@/components/storefront/account/StatusBadge";
import { PaymentStatusBadge } from "@/components/admin/PaymentStatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";

export const revalidate = 0;

export default async function AdminCustomerDetailPage({ params }: { params: { id: string } }) {
  const customer = await getAdminCustomerById(params.id);
  if (!customer) notFound();

  return (
    <div>
      <Link href="/admin/customers" className="text-body text-ink-muted hover:text-accent">
        ← Back to customers
      </Link>

      <div className="mb-8 mt-4">
        <h1 className="font-serif text-section text-ink">{customer.full_name ?? "Unnamed Customer"}</h1>
        <p className="text-body text-ink-muted">{customer.email}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-black/[0.06] bg-white p-6">
            <h2 className="mb-4 font-serif text-lg text-ink">Profile</h2>
            <div className="grid gap-2 text-body text-ink-muted sm:grid-cols-2">
              <p>Email: {customer.email}</p>
              <p>Phone: {customer.phone ?? "—"}</p>
              <p>Joined: {formatDate(customer.created_at)}</p>
              <p>Lifetime value: {formatCurrency(customer.total_spent)}</p>
            </div>
          </section>

          {customer.addresses.length > 0 && (
            <section className="rounded-2xl border border-black/[0.06] bg-white p-6">
              <h2 className="mb-4 font-serif text-lg text-ink">Addresses</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {customer.addresses.map((address) => (
                  <div key={address.id} className="rounded-xl border border-black/[0.06] p-4">
                    <p className="text-body text-ink">{address.full_name}</p>
                    <p className="text-body text-ink-muted">
                      {address.address_line1}
                      {address.address_line2 ? `, ${address.address_line2}` : ""}
                    </p>
                    <p className="text-body text-ink-muted">
                      {address.city}, {address.state} {address.zip}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-2xl border border-black/[0.06] bg-white p-6">
            <h2 className="mb-4 font-serif text-lg text-ink">Order History</h2>
            {customer.orders.length === 0 ? (
              <p className="text-body text-ink-muted">No orders yet.</p>
            ) : (
              <div className="overflow-hidden rounded-xl border border-black/[0.06]">
                <table className="w-full text-left">
                  <thead className="border-b border-black/[0.06] bg-black/[0.02]">
                    <tr className="text-caption text-ink-muted">
                      <th className="px-4 py-2 font-normal">Order #</th>
                      <th className="px-4 py-2 font-normal">Date</th>
                      <th className="px-4 py-2 font-normal">Total</th>
                      <th className="px-4 py-2 font-normal">Payment</th>
                      <th className="px-4 py-2 font-normal">Fulfillment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.06]">
                    {customer.orders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-4 py-3">
                          <Link href={`/admin/orders/${order.id}`} className="text-body text-accent hover:underline">
                            {order.order_number}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-body text-ink-muted">{formatDate(order.created_at)}</td>
                        <td className="px-4 py-3 text-body text-ink">{formatCurrency(order.total)}</td>
                        <td className="px-4 py-3">
                          <PaymentStatusBadge status={order.payment_status} />
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={order.fulfillment_status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        <CustomerDetailPanel
          userId={customer.id}
          isActive={customer.is_active}
          initialNotes={customer.internal_notes ?? ""}
        />
      </div>
    </div>
  );
}
