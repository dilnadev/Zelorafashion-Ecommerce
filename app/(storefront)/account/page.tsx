import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getProfile, getRecentOrders, getDefaultAddress } from "@/lib/queries/account";
import { StatusBadge } from "@/components/storefront/account/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function AccountDashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [profile, recentOrders, defaultAddress] = await Promise.all([
    getProfile(user.id),
    getRecentOrders(user.id),
    getDefaultAddress(user.id),
  ]);

  return (
    <div>
      <h1 className="mb-2 font-serif text-section text-ink">
        Welcome back{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}
      </h1>
      <p className="mb-10 text-body text-ink-muted">{user.email}</p>

      <div className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-body-lg text-ink">Recent Orders</h2>
          <Link href="/account/orders" className="text-body text-accent underline underline-offset-4">
            View all
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-body text-ink-muted">You haven&apos;t placed any orders yet.</p>
        ) : (
          <div className="divide-y divide-ink/[0.08] rounded border border-ink/[0.08]">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-ink/[0.02]"
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

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-body-lg text-ink">Default Address</h2>
          <Link href="/account/addresses" className="text-body text-accent underline underline-offset-4">
            Manage
          </Link>
        </div>
        {defaultAddress ? (
          <div className="rounded border border-ink/[0.08] p-5">
            <p className="text-body text-ink">{defaultAddress.full_name}</p>
            <p className="text-body text-ink-muted">
              {defaultAddress.address_line1}
              {defaultAddress.address_line2 ? `, ${defaultAddress.address_line2}` : ""}
            </p>
            <p className="text-body text-ink-muted">
              {defaultAddress.city}, {defaultAddress.state} {defaultAddress.zip}
            </p>
          </div>
        ) : (
          <p className="text-body text-ink-muted">No default address saved yet.</p>
        )}
      </div>
    </div>
  );
}
