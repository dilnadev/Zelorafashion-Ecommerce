"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import type { AdminCustomerListItem, AdminCustomerSort } from "@/lib/queries/admin-customers";

interface CustomersTableProps {
  customers: AdminCustomerListItem[];
  total: number;
  page: number;
  pageSize: number;
  search: string;
  sortBy: AdminCustomerSort;
  sortDir: "asc" | "desc";
}

export function CustomersTable({ customers, total, page, pageSize, search, sortBy, sortDir }: CustomersTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(search);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") params.delete(key);
      else params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateParams({ search: searchValue, page: null });
  }

  function toggleSort(field: AdminCustomerSort) {
    if (sortBy === field) {
      updateParams({ sortDir: sortDir === "asc" ? "desc" : "asc" });
    } else {
      updateParams({ sortBy: field, sortDir: "asc" });
    }
  }

  return (
    <div>
      <form onSubmit={handleSearchSubmit} className="relative mb-6 w-full max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
        <input
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search by name or email"
          className="h-10 w-full rounded-full border border-black/10 bg-white pl-9 pr-4 text-body text-ink outline-none focus:border-accent"
        />
      </form>

      <div className="overflow-x-auto rounded-2xl border border-black/[0.06] bg-white">
        <table className="w-full text-left">
          <thead className="border-b border-black/[0.06] bg-black/[0.02]">
            <tr className="text-caption text-ink-muted">
              <th className="px-5 py-3 font-normal">
                <button
                  type="button"
                  onClick={() => toggleSort("full_name")}
                  className="flex cursor-pointer items-center gap-1"
                >
                  Name <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-5 py-3 font-normal">Email</th>
              <th className="px-5 py-3 font-normal">Total Orders</th>
              <th className="px-5 py-3 font-normal">
                <button
                  type="button"
                  onClick={() => toggleSort("total_spent")}
                  className="flex cursor-pointer items-center gap-1"
                >
                  Total Spent <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-5 py-3 font-normal">
                <button
                  type="button"
                  onClick={() => toggleSort("created_at")}
                  className="flex cursor-pointer items-center gap-1"
                >
                  Join Date <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-5 py-3 font-normal">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.06]">
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td className="px-5 py-3">
                  <Link href={`/admin/customers/${customer.id}`} className="text-body text-ink hover:text-accent">
                    {customer.full_name ?? "—"}
                  </Link>
                </td>
                <td className="px-5 py-3 text-body text-ink-muted">{customer.email}</td>
                <td className="px-5 py-3 text-body text-ink-muted">{customer.total_orders}</td>
                <td className="px-5 py-3 text-body text-ink">{formatCurrency(customer.total_spent)}</td>
                <td className="px-5 py-3 text-body text-ink-muted">{formatDate(customer.created_at)}</td>
                <td className="px-5 py-3">
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-caption normal-case tracking-normal",
                      customer.is_active ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                    )}
                  >
                    {customer.is_active ? "Active" : "Suspended"}
                  </span>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-body text-ink-muted">
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-caption normal-case tracking-normal text-ink-muted">
            Page {page} of {totalPages} — {total} customers
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => updateParams({ page: String(page - 1) })}>
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
