import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAction } from "@/lib/auth/verify-admin-action";
import { getAdminOrdersForExport, type AdminOrderSort } from "@/lib/queries/admin-orders";
import { formatDate } from "@/lib/utils";
import type { PaymentStatus, FulfillmentStatus } from "@/types/database";

const VALID_SORTS: AdminOrderSort[] = ["created_at", "total", "order_number"];
const VALID_PAYMENT: PaymentStatus[] = ["pending", "paid", "failed", "refunded"];
const VALID_FULFILLMENT: FulfillmentStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled"];

function csvEscape(value: string | number): string {
  const str = String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

export async function GET(request: NextRequest) {
  const check = await verifyAdminAction();
  if (!check.ok) {
    return NextResponse.json({ message: check.message }, { status: 403 });
  }

  const params = request.nextUrl.searchParams;
  const search = params.get("search") ?? "";
  const sortByParam = params.get("sortBy") ?? "created_at";
  const sortBy = VALID_SORTS.includes(sortByParam as AdminOrderSort) ? (sortByParam as AdminOrderSort) : "created_at";
  const sortDir = params.get("sortDir") === "asc" ? "asc" : "desc";

  const paymentStatusParam = params.get("paymentStatus") ?? "";
  const paymentStatus = VALID_PAYMENT.includes(paymentStatusParam as PaymentStatus)
    ? (paymentStatusParam as PaymentStatus)
    : "";

  const fulfillmentStatusParam = params.get("fulfillmentStatus") ?? "";
  const fulfillmentStatus = VALID_FULFILLMENT.includes(fulfillmentStatusParam as FulfillmentStatus)
    ? (fulfillmentStatusParam as FulfillmentStatus)
    : "";

  const dateFrom = params.get("dateFrom") ?? "";
  const dateTo = params.get("dateTo") ?? "";
  const minTotal = params.get("minTotal");
  const maxTotal = params.get("maxTotal");

  const orders = await getAdminOrdersForExport({
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

  const header = ["Order #", "Date", "Customer", "Email", "Items", "Total", "Payment Status", "Fulfillment Status"];
  const rows = orders.map((o) => [
    o.order_number,
    formatDate(o.created_at, { year: "numeric", month: "2-digit", day: "2-digit" }),
    o.customer_name,
    o.email,
    o.items_count,
    o.total.toFixed(2),
    o.payment_status,
    o.fulfillment_status,
  ]);

  const csv = [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\r\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="orders-export-${Date.now()}.csv"`,
    },
  });
}
