"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/providers/ToastProvider";
import { formatCurrency } from "@/lib/utils";
import {
  createShippingMethod,
  updateShippingMethod,
  deleteShippingMethod,
  type ShippingMethodInput,
} from "@/app/(admin)/admin/settings/actions";
import type { ShippingMethod } from "@/types";

const EMPTY_FORM: ShippingMethodInput = {
  name: "",
  description: "",
  price: 0,
  estimatedDelivery: "",
  freeShippingThreshold: null,
  isActive: true,
};

export function ShippingMethodsManager({ initialMethods }: { initialMethods: ShippingMethod[] }) {
  const { toast } = useToast();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<ShippingMethod | null>(null);
  const [deleting, setDeleting] = useState<ShippingMethod | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [form, setForm] = useState<ShippingMethodInput>(EMPTY_FORM);

  function openAdd() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
  }

  function openEdit(method: ShippingMethod) {
    setEditing(method);
    setForm({
      name: method.name,
      description: method.description ?? "",
      price: method.price,
      estimatedDelivery: method.estimated_delivery ?? "",
      freeShippingThreshold: method.free_shipping_threshold,
      isActive: method.is_active,
    });
    setIsModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    const result = editing ? await updateShippingMethod(editing.id, form) : await createShippingMethod(form);
    setIsSubmitting(false);

    if (!result.success) {
      toast({ title: "Something went wrong", description: result.message, variant: "error" });
      return;
    }
    toast({ title: editing ? "Shipping method updated" : "Shipping method created", variant: "success" });
    setIsModalOpen(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!deleting) return;
    setIsDeleting(true);
    const result = await deleteShippingMethod(deleting.id);
    setIsDeleting(false);

    if (!result.success) {
      toast({ title: "Couldn't delete shipping method", description: result.message, variant: "error" });
      return;
    }
    toast({ title: "Shipping method deleted", variant: "success" });
    setDeleting(null);
    router.refresh();
  }

  return (
    <section className="rounded-2xl border border-black/[0.06] bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-serif text-lg text-ink">Shipping Methods</h2>
        <Button size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={openAdd}>
          Add Method
        </Button>
      </div>

      {initialMethods.length === 0 ? (
        <p className="text-body text-ink-muted">No shipping methods yet.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-black/[0.06]">
          <table className="w-full text-left">
            <thead className="border-b border-black/[0.06] bg-black/[0.02]">
              <tr className="text-caption text-ink-muted">
                <th className="px-4 py-2 font-normal">Name</th>
                <th className="px-4 py-2 font-normal">Price</th>
                <th className="px-4 py-2 font-normal">Delivery</th>
                <th className="px-4 py-2 font-normal">Free above</th>
                <th className="px-4 py-2 font-normal">Status</th>
                <th className="px-4 py-2 font-normal">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.06]">
              {initialMethods.map((method) => (
                <tr key={method.id}>
                  <td className="px-4 py-3 text-body text-ink">{method.name}</td>
                  <td className="px-4 py-3 text-body text-ink-muted">{formatCurrency(method.price)}</td>
                  <td className="px-4 py-3 text-body text-ink-muted">{method.estimated_delivery ?? "—"}</td>
                  <td className="px-4 py-3 text-body text-ink-muted">
                    {method.free_shipping_threshold ? formatCurrency(method.free_shipping_threshold) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-caption normal-case tracking-normal ${
                        method.is_active ? "bg-green-50 text-green-700" : "bg-black/[0.06] text-ink-muted"
                      }`}
                    >
                      {method.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(method)}
                        aria-label={`Edit ${method.name}`}
                        className="cursor-pointer rounded-full p-1.5 text-ink-muted transition-colors hover:bg-black/[0.04] hover:text-ink"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting(method)}
                        aria-label={`Delete ${method.name}`}
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editing ? "Edit Shipping Method" : "Add Shipping Method"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price"
              type="number"
              min="0"
              step="0.01"
              required
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            />
            <Input
              label="Estimated delivery"
              value={form.estimatedDelivery}
              onChange={(e) => setForm({ ...form, estimatedDelivery: e.target.value })}
            />
          </div>
          <Input
            label="Free shipping above (optional)"
            type="number"
            min="0"
            step="0.01"
            value={form.freeShippingThreshold ?? ""}
            onChange={(e) =>
              setForm({ ...form, freeShippingThreshold: e.target.value === "" ? null : Number(e.target.value) })
            }
          />
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
            Save Shipping Method
          </Button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleting)}
        title="Delete shipping method"
        description={`Are you sure you want to delete "${deleting?.name}"?`}
        isConfirming={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
      />
    </section>
  );
}
