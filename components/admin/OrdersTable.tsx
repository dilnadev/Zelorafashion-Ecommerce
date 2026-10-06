"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown, Download, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/storefront/account/StatusBadge";
import { PaymentStatusBadge } from "@/components/admin/PaymentStatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { AdminOrderListItem, AdminOrderSort } from "@/lib/queries/admin-orders";
import type { PaymentStatus, FulfillmentStatus } from "@/types/database";

interface OrdersTableProps {
  orders: AdminOrderListItem[];
  total: number;
  page: number;
  pageSize: number;
  search: string;
  paymentStatus: PaymentStatus | "";
  fulfillmentStatus: FulfillmentStatus | "";
  dateFrom: string;
  dateTo: string;
  minTotal: string;
  maxTotal: string;
  sortBy: AdminOrderSort;
  sortDir: "asc" | "desc";
}

const PAYMENT_OPTIONS: { value: PaymentStatus | ""; label: string }[] = [
  { value: "", label: "All payment statuses" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

const FULFILLMENT_OPTIONS: { value: FulfillmentStatus | ""; label: string }[] = [
  { value: "", label: "All fulfillment statuses" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export function OrdersTable({
  orders,
  total,
  page,
  pageSize,
  search,
  paymentStatus,
  fulfillmentStatus,
  dateFrom,
  dateTo,
  minTotal,
  maxTotal,
  sortBy,
  sortDir,
}: OrdersTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchValue, setSearchValue] = useState(search);
  const [paymentValue, setPaymentValue] = useState(paymentStatus);
  const [fulfillmentValue, setFulfillmentValue] = useState(fulfillmentStatus);
  const [dateFromValue, setDateFromValue] = useState(dateFrom);
  const [dateToValue, setDateToValue] = useState(dateTo);
  const [minTotalValue, setMinTotalValue] = useState(minTotal);
  const [maxTotalValue, setMaxTotalValue] = useState(maxTotal);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") params.delete(key);
      else params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleFilterSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateParams({
      search: searchValue,
      paymentStatus: paymentValue,
      fulfillmentStatus: fulfillmentValue,
      dateFrom: dateFromValue,
      dateTo: dateToValue,
      minTotal: minTotalValue,
      maxTotal: maxTotalValue,
      page: null,
    });
  }

  function toggleSort(field: AdminOrderSort) {
    if (sortBy === field) {
      updateParams({ sortDir: sortDir === "asc" ? "desc" : "asc" });
    } else {
      updateParams({ sortBy: field, sortDir: "asc" });
    }
  }

  const exportParams = new URLSearchParams(searchParams.toString());
  exportParams.delete("page");

  return (
    <div>
      <form onSubmit={handleFilterSubmit} className="mb-6 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search by order # or email"
              className="h-10 w-full rounded-full border border-black/10 bg-white pl-9 pr-4 text-body text-ink outline-none focus:border-accent"
            />
          </div>
          <select
            value={paymentValue}
            onChange={(e) => setPaymentValue(e.target.value as PaymentStatus | "")}
            className="h-10 cursor-pointer rounded-full border border-black/10 bg-white px-3 text-body text-ink outline-none"
          >
            {PAYMENT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <select
            value={fulfillmentValue}
            onChange={(e) => setFulfillmentValue(e.target.value as FulfillmentStatus | "")}
            className="h-10 cursor-pointer rounded-full border border-black/10 bg-white px-3 text-body text-ink outline-none"
          >
            {FULFILLMENT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-caption normal-case tracking-normal text-ink-muted">
            From
            <input
              type="date"
              value={dateFromValue}
              onChange={(e) => setDateFromValue(e.target.value)}
              className="h-9 rounded-lg border border-black/10 bg-white px-2 text-body text-ink outline-none focus:border-accent"
            />
          </label>
          <label className="flex items-center gap-2 text-caption normal-case tracking-normal text-ink-muted">
            To
            <input
              type="date"
              value={dateToValue}
              onChange={(e) => setDateToValue(e.target.value)}
              className="h-9 rounded-lg border border-black/10 bg-white px-2 text-body text-ink outline-none focus:border-accent"
            />
          </label>
          <label className="flex items-center gap-2 text-caption normal-case tracking-normal text-ink-muted">
            Min total
            <input
              type="number"
              min="0"
              value={minTotalValue}
              onChange={(e) => setMinTotalValue(e.target.value)}
              className="h-9 w-24 rounded-lg border border-black/10 bg-white px-2 text-body text-ink outline-none focus:border-accent"
            />
          </label>
          <label className="flex items-center gap-2 text-caption normal-case tracking-normal text-ink-muted">
            Max total
            <input
              type="number"
              min="0"
              value={maxTotalValue}
              onChange={(e) => setMaxTotalValue(e.target.value)}
              className="h-9 w-24 rounded-lg border border-black/10 bg-white px-2 text-body text-ink outline-none focus:border-accent"
            />
          </label>
          <Button type="submit" size="sm" variant="secondary">
            Apply filters
          </Button>
          <a href={`/api/admin/orders/export?${exportParams.toString()}`} className="ml-auto">
            <Button type="button" size="sm" leftIcon={<Download className="h-3.5 w-3.5" />}>
              Export CSV
            </Button>
          </a>
        </div>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-black/[0.06] bg-white">
        <table className="w-full text-left">
          <thead className="border-b border-black/[0.06] bg-black/[0.02]">
            <tr className="text-caption text-ink-muted">
              <th className="px-5 py-3 font-normal">
                <button
                  type="button"
                  onClick={() => toggleSort("order_number")}
                  className="flex cursor-pointer items-center gap-1"
                >
                  Order # <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-5 py-3 font-normal">
                <button
                  type="button"
                  onClick={() => toggleSort("created_at")}
                  className="flex cursor-pointer items-center gap-1"
                >
                  Date <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-5 py-3 font-normal">Customer</th>
              <th className="px-5 py-3 font-normal">Items</th>
              <th className="px-5 py-3 font-normal">
                <button
                  type="button"
                  onClick={() => toggleSort("total")}
                  className="flex cursor-pointer items-center gap-1"
                >
                  Total <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-5 py-3 font-normal">Payment</th>
              <th className="px-5 py-3 font-normal">Fulfillment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.06]">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-5 py-3">
                  <Link href={`/admin/orders/${order.id}`} className="text-body text-ink hover:text-accent">
                    {order.order_number}
                  </Link>
                </td>
                <td className="px-5 py-3 text-body text-ink-muted">{formatDate(order.created_at)}</td>
                <td className="px-5 py-3">
                  <div className="text-body text-ink">{order.customer_name}</div>
                  <div className="text-caption normal-case tracking-normal text-ink-muted">{order.email}</div>
                </td>
                <td className="px-5 py-3 text-body text-ink-muted">{order.items_count}</td>
                <td className="px-5 py-3 text-body text-ink">{formatCurrency(order.total)}</td>
                <td className="px-5 py-3">
                  <PaymentStatusBadge status={order.payment_status} />
                </td>
                <td className="px-5 py-3">
                  <StatusBadge status={order.fulfillment_status} />
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-body text-ink-muted">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-caption normal-case tracking-normal text-ink-muted">
            Page {page} of {totalPages} — {total} orders
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => updateParams({ page: String(page - 1) })}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => updateParams({ page: String(page + 1) })}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
