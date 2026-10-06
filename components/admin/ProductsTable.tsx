"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/providers/ToastProvider";
import { formatCurrency, cn } from "@/lib/utils";
import { bulkDeleteProducts, bulkUpdateStatus, deleteProduct } from "@/app/(admin)/admin/products/actions";
import type { AdminProductListItem, AdminProductSort } from "@/lib/queries/admin-products";

interface ProductsTableProps {
  products: AdminProductListItem[];
  total: number;
  page: number;
  pageSize: number;
  search: string;
  sortBy: AdminProductSort;
  sortDir: "asc" | "desc";
}

const SORT_OPTIONS: { value: AdminProductSort; label: string }[] = [
  { value: "created_at", label: "Newest" },
  { value: "title", label: "Name" },
  { value: "price", label: "Price" },
  { value: "stock_quantity", label: "Stock" },
];

export function ProductsTable({
  products,
  total,
  page,
  pageSize,
  search,
  sortBy,
  sortDir,
}: ProductsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [searchValue, setSearchValue] = useState(search);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const allSelected = products.length > 0 && selected.size === products.length;

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

  function toggleSort(field: AdminProductSort) {
    if (sortBy === field) {
      updateParams({ sortDir: sortDir === "asc" ? "desc" : "asc" });
    } else {
      updateParams({ sortBy: field, sortDir: "asc" });
    }
  }

  function toggleSelectAll() {
    setSelected(allSelected ? new Set() : new Set(products.map((p) => p.id)));
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleDelete() {
    if (!deletingId) return;
    setIsProcessing(true);
    const result = await deleteProduct(deletingId);
    setIsProcessing(false);
    setDeletingId(null);

    if (!result.success) {
      toast({ title: "Couldn't delete product", description: result.message, variant: "error" });
      return;
    }
    toast({ title: "Product deleted", variant: "success" });
    router.refresh();
  }

  async function handleBulkDelete() {
    setIsProcessing(true);
    const result = await bulkDeleteProducts(Array.from(selected));
    setIsProcessing(false);
    setBulkDeleting(false);

    if (!result.success) {
      toast({ title: "Couldn't delete products", description: result.message, variant: "error" });
      return;
    }
    toast({ title: `${selected.size} product(s) deleted`, variant: "success" });
    setSelected(new Set());
    router.refresh();
  }

  async function handleBulkStatus(status: "draft" | "active") {
    setIsProcessing(true);
    const result = await bulkUpdateStatus(Array.from(selected), status);
    setIsProcessing(false);

    if (!result.success) {
      toast({ title: "Couldn't update products", description: result.message, variant: "error" });
      return;
    }
    toast({ title: `${selected.size} product(s) updated`, variant: "success" });
    setSelected(new Set());
    router.refresh();
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search by name or SKU"
            className="h-10 w-full rounded-full border border-black/10 bg-white pl-9 pr-4 text-body text-ink outline-none focus:border-accent"
          />
        </form>
        <div className="flex items-center gap-3">
          <select
            value={sortBy}
            onChange={(e) => updateParams({ sortBy: e.target.value })}
            className="h-10 cursor-pointer rounded-full border border-black/10 bg-white px-3 text-body text-ink outline-none"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                Sort: {opt.label}
              </option>
            ))}
          </select>
          <Link href="/admin/products/new">
            <Button leftIcon={<Plus className="h-4 w-4" />}>Add Product</Button>
          </Link>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-accent/20 bg-accent/5 px-4 py-3">
          <span className="text-body text-ink">{selected.size} selected</span>
          <Button variant="secondary" size="sm" onClick={() => handleBulkStatus("active")} disabled={isProcessing}>
            Set Active
          </Button>
          <Button variant="secondary" size="sm" onClick={() => handleBulkStatus("draft")} disabled={isProcessing}>
            Set Draft
          </Button>
          <Button
            variant="destructive"
            size="sm"
            leftIcon={<Trash2 className="h-3.5 w-3.5" />}
            onClick={() => setBulkDeleting(true)}
            disabled={isProcessing}
          >
            Delete
          </Button>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-black/[0.06] bg-white">
        <table className="w-full text-left">
          <thead className="border-b border-black/[0.06] bg-black/[0.02]">
            <tr className="text-caption text-ink-muted">
              <th className="w-10 px-5 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 cursor-pointer rounded border-black/20"
                />
              </th>
              <th className="px-5 py-3 font-normal">Image</th>
              <th className="px-5 py-3 font-normal">
                <button type="button" onClick={() => toggleSort("title")} className="flex cursor-pointer items-center gap-1">
                  Name <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-5 py-3 font-normal">SKU</th>
              <th className="px-5 py-3 font-normal">Category</th>
              <th className="px-5 py-3 font-normal">
                <button type="button" onClick={() => toggleSort("price")} className="flex cursor-pointer items-center gap-1">
                  Price <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-5 py-3 font-normal">
                <button type="button" onClick={() => toggleSort("stock_quantity")} className="flex cursor-pointer items-center gap-1">
                  Stock <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-5 py-3 font-normal">Status</th>
              <th className="px-5 py-3 font-normal">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.06]">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-5 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(product.id)}
                    onChange={() => toggleSelect(product.id)}
                    className="h-4 w-4 cursor-pointer rounded border-black/20"
                  />
                </td>
                <td className="px-5 py-3">
                  <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-black/[0.04]">
                    {product.image_url && (
                      <Image src={product.image_url} alt={product.title} fill className="object-cover" sizes="48px" />
                    )}
                  </div>
                </td>
                <td className="px-5 py-3">
                  <Link href={`/admin/products/${product.id}`} className="text-body text-ink hover:text-accent">
                    {product.title}
                  </Link>
                </td>
                <td className="px-5 py-3 text-body text-ink-muted">{product.sku}</td>
                <td className="px-5 py-3 text-body text-ink-muted">{product.category_name ?? "—"}</td>
                <td className="px-5 py-3 text-body text-ink">{formatCurrency(product.sale_price ?? product.price)}</td>
                <td className="px-5 py-3 text-body text-ink">{product.stock_quantity}</td>
                <td className="px-5 py-3">
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-caption normal-case tracking-normal",
                      product.status === "active" ? "bg-green-50 text-green-700" : "bg-black/[0.06] text-ink-muted"
                    )}
                  >
                    {product.status === "active" ? "Active" : "Draft"}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="text-caption normal-case tracking-normal text-accent underline underline-offset-4"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => setDeletingId(product.id)}
                      className="cursor-pointer text-caption normal-case tracking-normal text-destructive underline underline-offset-4"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={9} className="px-5 py-12 text-center text-body text-ink-muted">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-caption normal-case tracking-normal text-ink-muted">
            Page {page} of {totalPages} — {total} products
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

      <ConfirmDialog
        isOpen={Boolean(deletingId)}
        title="Delete product"
        description="This will permanently delete this product and all its images and variants."
        isConfirming={isProcessing}
        onConfirm={handleDelete}
        onClose={() => setDeletingId(null)}
      />
      <ConfirmDialog
        isOpen={bulkDeleting}
        title="Delete products"
        description={`This will permanently delete ${selected.size} selected product(s).`}
        isConfirming={isProcessing}
        onConfirm={handleBulkDelete}
        onClose={() => setBulkDeleting(false)}
      />
    </div>
  );
}
