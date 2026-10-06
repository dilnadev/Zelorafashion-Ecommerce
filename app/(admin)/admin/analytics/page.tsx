import { getRevenueOverTime } from "@/lib/queries/admin";
import {
  getOrdersOverTime,
  getCustomerAcquisitionOverTime,
  getTopProductsByRevenue,
  getTopCategories,
} from "@/lib/queries/admin-analytics";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { TimeSeriesChart } from "@/components/admin/TimeSeriesChart";
import { TopProductsByRevenueChart } from "@/components/admin/TopProductsByRevenueChart";
import { TopCategoriesChart } from "@/components/admin/TopCategoriesChart";

export const revalidate = 0;

export default async function AdminAnalyticsPage() {
  const [revenuePoints, orderPoints, customerPoints, topProducts, topCategories] = await Promise.all([
    getRevenueOverTime(30),
    getOrdersOverTime(30),
    getCustomerAcquisitionOverTime(30),
    getTopProductsByRevenue(10),
    getTopCategories(8),
  ]);

  return (
    <div>
      <h1 className="mb-8 font-serif text-section text-ink">Analytics</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueChart initialPoints={revenuePoints} />
        <TimeSeriesChart
          title="Orders Over Time"
          endpoint="/api/admin/orders-over-time"
          unitLabel="orders"
          initialPoints={orderPoints}
          gradientId="ordersFill"
        />
        <TopProductsByRevenueChart products={topProducts} />
        <TopCategoriesChart categories={topCategories} />
        <TimeSeriesChart
          title="Customer Acquisition"
          endpoint="/api/admin/customer-acquisition"
          unitLabel="new customers"
          initialPoints={customerPoints}
          gradientId="customersFill"
        />
      </div>
    </div>
  );
}
