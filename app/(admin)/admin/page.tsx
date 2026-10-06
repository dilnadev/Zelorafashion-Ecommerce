import {
  getDashboardKPIs,
  getRevenueOverTime,
  getTopSellingProducts,
  getRecentOrdersAdmin,
  getLowStockProducts,
} from "@/lib/queries/admin";
import { KpiCard } from "@/components/admin/KpiCard";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { TopProductsChart } from "@/components/admin/TopProductsChart";
import { RecentOrdersTable } from "@/components/admin/RecentOrdersTable";
import { LowStockAlerts } from "@/components/admin/LowStockAlerts";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const [kpis, revenuePoints, topProducts, recentOrders, lowStock] = await Promise.all([
    getDashboardKPIs(30),
    getRevenueOverTime(30),
    getTopSellingProducts(5),
    getRecentOrdersAdmin(10),
    getLowStockProducts(10),
  ]);

  return (
    <div>
      <h1 className="mb-8 font-serif text-section text-ink">Dashboard</h1>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total Revenue" value={kpis.revenue} changePct={kpis.revenueChangePct} format="currency" />
        <KpiCard label="Total Orders" value={kpis.totalOrders} changePct={kpis.totalOrdersChangePct} />
        <KpiCard label="New Customers" value={kpis.newCustomers} changePct={kpis.newCustomersChangePct} />
        <KpiCard
          label="Avg Order Value"
          value={kpis.avgOrderValue}
          changePct={kpis.avgOrderValueChangePct}
          format="currency"
        />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart initialPoints={revenuePoints} />
        </div>
        <TopProductsChart products={topProducts} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentOrdersTable orders={recentOrders} />
        </div>
        <LowStockAlerts products={lowStock} />
      </div>
    </div>
  );
}
