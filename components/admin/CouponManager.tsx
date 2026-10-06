"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/providers/ToastProvider";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { createCoupon, updateCoupon, deleteCoupon, type CouponInput } from "@/app/(admin)/admin/coupons/actions";
import type { Coupon } from "@/types";
import type { CouponFormOptions } from "@/lib/queries/admin-coupons";

type RestrictionType = "all" | "products" | "categories";

interface FormState extends Omit<CouponInput, "applicableProducts" | "applicableCategories"> {
  restrictionType: RestrictionType;
  applicableProducts: string[];
  applicableCategories: string[];
}

const EMPTY_FORM: FormState = {
  code: "",
  type: "percentage",
  value: 10,
  minOrderAmount: null,
  usageLimit: null,
  perCustomerLimit: null,
  validFrom: null,
  validTo: null,
  restrictionType: "all",
  applicableProducts: [],
  applicableCategories: [],
  isActive: true,
};

function toDateInput(value: string | null): string {
  return value ? value.slice(0, 10) : "";
}

export function CouponManager({ initialCoupons, options }: { initialCoupons: Coupon[]; options: CouponFormOptions }) {
  const { toast } = useToast();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [deleting, setDeleting] = useState<Coupon | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [productFilter, setProductFilter] = useState("");

  const filteredProducts = useMemo(
    () => options.products.filter((p) => p.title.toLowerCase().includes(productFilter.toLowerCase())),
    [options.products, productFilter]
  );

  function openAdd() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setProductFilter("");
    setIsModalOpen(true);
  }

  function openEdit(coupon: Coupon) {
    setEditing(coupon);
    setForm({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      minOrderAmount: coupon.min_order_amount,
      usageLimit: coupon.usage_limit,
      perCustomerLimit: coupon.per_customer_limit,
      validFrom: coupon.valid_from,
      validTo: coupon.valid_to,
      restrictionType: coupon.applicable_products?.length
        ? "products"
        : coupon.applicable_categories?.length
          ? "categories"
          : "all",
      applicableProducts: coupon.applicable_products ?? [],
      applicableCategories: coupon.applicable_categories ?? [],
      isActive: coupon.is_active,
    });
    setProductFilter("");
    setIsModalOpen(true);
  }

  function toggleProduct(id: string) {
    setForm((prev) => ({
      ...prev,
      applicableProducts: prev.applicableProducts.includes(id)
        ? prev.applicableProducts.filter((p) => p !== id)
        : [...prev.applicableProducts, id],
    }));
  }

  function toggleCategory(id: string) {
    setForm((prev) => ({
      ...prev,
      applicableCategories: prev.applicableCategories.includes(id)
        ? prev.applicableCategories.filter((c) => c !== id)
        : [...prev.applicableCategories, id],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    const input: CouponInput = {
      code: form.code,
      type: form.type,
      value: form.value,
      minOrderAmount: form.minOrderAmount,
      usageLimit: form.usageLimit,
      perCustomerLimit: form.perCustomerLimit,
      validFrom: form.validFrom,
      validTo: form.validTo,
      applicableProducts: form.restrictionType === "products" ? form.applicableProducts : [],
      applicableCategories: form.restrictionType === "categories" ? form.applicableCategories : [],
      isActive: form.isActive,
    };

    const result = editing ? await updateCoupon(editing.id, input) : await createCoupon(input);
    setIsSubmitting(false);

    if (!result.success) {
      toast({ title: "Something went wrong", description: result.message, variant: "error" });
      return;
    }
    toast({ title: editing ? "Coupon updated" : "Coupon created", variant: "success" });
    setIsModalOpen(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!deleting) return;
    setIsDeleting(true);
    const result = await deleteCoupon(deleting.id);
    setIsDeleting(false);

    if (!result.success) {
      toast({ title: "Couldn't delete coupon", description: result.message, variant: "error" });
      return;
    }
    toast({ title: "Coupon deleted", variant: "success" });
    setDeleting(null);
    router.refresh();
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-serif text-section text-ink">Coupons</h1>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openAdd}>
          Add Coupon
        </Button>
      </div>

      {initialCoupons.length === 0 ? (
        <p className="text-body text-ink-muted">No coupons yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-black/[0.06] bg-white">
          <table className="w-full text-left">
            <thead className="border-b border-black/[0.06] bg-black/[0.02]">
              <tr className="text-caption text-ink-muted">
                <th className="px-5 py-3 font-normal">Code</th>
                <th className="px-5 py-3 font-normal">Type</th>
                <th className="px-5 py-3 font-normal">Value</th>
                <th className="px-5 py-3 font-normal">Used</th>
                <th className="px-5 py-3 font-normal">Valid</th>
                <th className="px-5 py-3 font-normal">Status</th>
                <th className="px-5 py-3 font-normal">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.06]">
              {initialCoupons.map((coupon) => (
                <tr key={coupon.id}>
                  <td className="px-5 py-3 text-body text-ink">{coupon.code}</td>
                  <td className="px-5 py-3 text-body text-ink-muted capitalize">{coupon.type}</td>
                  <td className="px-5 py-3 text-body text-ink-muted">
                    {coupon.type === "percentage" ? `${coupon.value}%` : formatCurrency(coupon.value)}
                  </td>
                  <td className="px-5 py-3 text-body text-ink-muted">
                    {coupon.times_used}
                    {coupon.usage_limit ? ` / ${coupon.usage_limit}` : ""}
                  </td>
                  <td className="px-5 py-3 text-body text-ink-muted">
                    {coupon.valid_from || coupon.valid_to
                      ? `${coupon.valid_from ? formatDate(coupon.valid_from) : "—"} to ${coupon.valid_to ? formatDate(coupon.valid_to) : "—"}`
                      : "No limit"}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-caption normal-case tracking-normal",
                        coupon.is_active ? "bg-green-50 text-green-700" : "bg-black/[0.06] text-ink-muted"
                      )}
                    >
                      {coupon.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(coupon)}
                        aria-label={`Edit ${coupon.code}`}
                        className="cursor-pointer rounded-full p-1.5 text-ink-muted transition-colors hover:bg-black/[0.04] hover:text-ink"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting(coupon)}
                        aria-label={`Delete ${coupon.code}`}
                        className="cursor-pointer rounded-full p-1.5 text-ink-muted transition-colors hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editing ? "Edit Coupon" : "Add Coupon"} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Code"
              required
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            />
            <div>
              <label className="mb-1.5 block text-caption text-ink-muted">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as "percentage" | "fixed" })}
                className="h-14 w-full cursor-pointer rounded-xl border border-black/10 px-4 text-body text-ink outline-none focus:border-accent"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed amount</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label={form.type === "percentage" ? "Value (%)" : "Value (amount)"}
              type="number"
              min="0"
              required
              value={form.value}
              onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
            />
            <Input
              label="Minimum order amount (optional)"
              type="number"
              min="0"
              value={form.minOrderAmount ?? ""}
              onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value === "" ? null : Number(e.target.value) })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Usage limit (optional)"
              type="number"
              min="0"
              value={form.usageLimit ?? ""}
              onChange={(e) => setForm({ ...form, usageLimit: e.target.value === "" ? null : Number(e.target.value) })}
            />
            <Input
              label="Per-customer limit (optional)"
              type="number"
              min="0"
              value={form.perCustomerLimit ?? ""}
              onChange={(e) => setForm({ ...form, perCustomerLimit: e.target.value === "" ? null : Number(e.target.value) })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-caption text-ink-muted">Valid from (optional)</label>
              <input
                type="date"
                value={toDateInput(form.validFrom)}
                onChange={(e) => setForm({ ...form, validFrom: e.target.value || null })}
                className="h-11 w-full rounded-xl border border-black/10 px-3 text-body text-ink outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-caption text-ink-muted">Valid to (optional)</label>
              <input
                type="date"
                value={toDateInput(form.validTo)}
                onChange={(e) => setForm({ ...form, validTo: e.target.value || null })}
                className="h-11 w-full rounded-xl border border-black/10 px-3 text-body text-ink outline-none focus:border-accent"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-caption text-ink-muted">Applies to</label>
            <select
              value={form.restrictionType}
              onChange={(e) => setForm({ ...form, restrictionType: e.target.value as RestrictionType })}
              className="h-11 w-full cursor-pointer rounded-xl border border-black/10 px-3 text-body text-ink outline-none focus:border-accent"
            >
              <option value="all">All products</option>
              <option value="categories">Specific categories</option>
              <option value="products">Specific products</option>
            </select>
          </div>

          {form.restrictionType === "categories" && (
            <div className="max-h-40 space-y-1 overflow-y-auto rounded-xl border border-black/10 p-3">
              {options.categories.map((category) => (
                <label key={category.id} className="flex items-center gap-2 text-body text-ink">
                  <input
                    type="checkbox"
                    checked={form.applicableCategories.includes(category.id)}
                    onChange={() => toggleCategory(category.id)}
                    className="h-4 w-4 cursor-pointer rounded border-black/20"
                  />
                  {category.name}
                </label>
              ))}
              {options.categories.length === 0 && <p className="text-body text-ink-muted">No categories yet.</p>}
            </div>
          )}

          {form.restrictionType === "products" && (
            <div className="space-y-2">
              <input
                value={productFilter}
                onChange={(e) => setProductFilter(e.target.value)}
                placeholder="Search products…"
                className="h-10 w-full rounded-full border border-black/10 px-4 text-body text-ink outline-none focus:border-accent"
              />
              <div className="max-h-40 space-y-1 overflow-y-auto rounded-xl border border-black/10 p-3">
                {filteredProducts.map((product) => (
                  <label key={product.id} className="flex items-center gap-2 text-body text-ink">
                    <input
                      type="checkbox"
                      checked={form.applicableProducts.includes(product.id)}
                      onChange={() => toggleProduct(product.id)}
                      className="h-4 w-4 cursor-pointer rounded border-black/20"
                    />
                    {product.title}
                  </label>
                ))}
                {filteredProducts.length === 0 && <p className="text-body text-ink-muted">No products found.</p>}
              </div>
            </div>
          )}

          <label className="flex items-center gap-2 text-body text-ink">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="h-4 w-4 cursor-pointer rounded border-black/20"
            />
            Active
          </label>

          <Button type="submit" size="lg" className="w-full" isLoading={isSubmitting}>
            Save Coupon
          </Button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleting)}
        title="Delete coupon"
        description={`Are you sure you want to delete "${deleting?.code}"?`}
        isConfirming={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
