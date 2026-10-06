import { getAdminOrders, type AdminOrderSort } from "@/lib/queries/admin-orders";
import { OrdersTable } from "@/components/admin/OrdersTable";
import type { PaymentStatus, FulfillmentStatus } from "@/types/database";

export const revalidate = 0;

const VALID_SORTS: AdminOrderSort[] = ["created_at", "total", "order_number"];
const VALID_PAYMENT: PaymentStatus[] = ["pending", "paid", "failed", "refunded"];
const VALID_FULFILLMENT: FulfillmentStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled"];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const page = Number(searchParams.page ?? 1);
  const search = typeof searchParams.search === "string" ? searchParams.search : "";
  const sortByParam = typeof searchParams.sortBy === "string" ? searchParams.sortBy : "created_at";
  const sortBy = VALID_SORTS.includes(sortByParam as AdminOrderSort) ? (sortByParam as AdminOrderSort) : "created_at";
  const sortDir = searchParams.sortDir === "asc" ? "asc" : "desc";

  const paymentStatusParam = typeof searchParams.paymentStatus === "string" ? searchParams.paymentStatus : "";
  const paymentStatus = VALID_PAYMENT.includes(paymentStatusParam as PaymentStatus)
    ? (paymentStatusParam as PaymentStatus)
    : "";

  const fulfillmentStatusParam =
    typeof searchParams.fulfillmentStatus === "string" ? searchParams.fulfillmentStatus : "";
  const fulfillmentStatus = VALID_FULFILLMENT.includes(fulfillmentStatusParam as FulfillmentStatus)
    ? (fulfillmentStatusParam as FulfillmentStatus)
    : "";

  const dateFrom = typeof searchParams.dateFrom === "string" ? searchParams.dateFrom : "";
  const dateTo = typeof searchParams.dateTo === "string" ? searchParams.dateTo : "";
  const minTotal = typeof searchParams.minTotal === "string" ? searchParams.minTotal : "";
  const maxTotal = typeof searchParams.maxTotal === "string" ? searchParams.maxTotal : "";

  const result = await getAdminOrders({
    page,
    pageSize: 20,
    search,
    paymentStatus,
    fulfillmentStatus,
    dateFrom,
    dateTo,
    minTotal: minTotal ? Number(minTotal) : undefined,
    maxTotal: maxTotal ? Number(maxTotal) : undefined,
    sortBy,
    sortDir,
  });

  return (
    <div>
      <h1 className="mb-8 font-serif text-section text-ink">Orders</h1>
      <OrdersTable
        orders={result.orders}
        total={result.total}
        page={result.page}
        pageSize={result.pageSize}
        search={search}
        paymentStatus={paymentStatus}
        fulfillmentStatus={fulfillmentStatus}
        dateFrom={dateFrom}
        dateTo={dateTo}
        minTotal={minTotal}
        maxTotal={maxTotal}
        sortBy={sortBy}
        sortDir={sortDir}
      />
    </div>
  );
}
