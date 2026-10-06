"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Star, Trash2, Pencil } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { AddressForm } from "./AddressForm";
import { useToast } from "@/components/providers/ToastProvider";
import {
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  type AddressInput,
} from "@/app/(storefront)/account/addresses/actions";
import type { Address } from "@/types";

export function AddressBook({ initialAddresses: addresses }: { initialAddresses: Address[] }) {
  const { toast } = useToast();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function openAddModal() {
    setEditing(null);
    setIsModalOpen(true);
  }

  function openEditModal(address: Address) {
    setEditing(address);
    setIsModalOpen(true);
  }

  async function handleSubmit(input: AddressInput) {
    setIsSubmitting(true);
    const result = editing
      ? await updateAddress(editing.id, input)
      : await createAddress(input);
    setIsSubmitting(false);

    if (!result.success) {
      toast({ title: "Something went wrong", description: result.message, variant: "error" });
      return;
    }

    toast({ title: editing ? "Address updated" : "Address added", variant: "success" });
    setIsModalOpen(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this address?")) return;
    const result = await deleteAddress(id);
    if (!result.success) {
      toast({ title: "Couldn't delete address", variant: "error" });
      return;
    }
    router.refresh();
  }

  async function handleSetDefault(id: string) {
    const result = await setDefaultAddress(id);
    if (result.success) router.refresh();
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-serif text-section text-ink">Addresses</h1>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openAddModal}>
          Add Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <p className="text-body text-ink-muted">No saved addresses yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <div key={address.id} className="rounded border border-ink/[0.08] p-5">
              <div className="mb-2 flex items-start justify-between">
                <p className="text-body font-medium text-ink">{address.full_name}</p>
                {address.is_default && (
                  <span className="rounded bg-accent/10 px-2.5 py-1 text-caption normal-case tracking-normal text-accent">
                    Default
                  </span>
                )}
              </div>
              <p className="text-body text-ink-muted">
                {address.address_line1}
                {address.address_line2 ? `, ${address.address_line2}` : ""}
              </p>
              <p className="text-body text-ink-muted">
                {address.city}, {address.state} {address.zip}
              </p>
              <p className="text-body text-ink-muted">{address.country}</p>

              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(address)}
                  className="flex cursor-pointer items-center gap-1.5 rounded border border-ink/15 px-3 py-1.5 text-caption normal-case tracking-normal text-ink transition-colors hover:border-ink/30"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
                {!address.is_default && (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(address.id)}
                    className="flex cursor-pointer items-center gap-1.5 rounded border border-ink/15 px-3 py-1.5 text-caption normal-case tracking-normal text-ink transition-colors hover:border-ink/30"
                  >
                    <Star className="h-3.5 w-3.5" />
                    Set Default
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(address.id)}
                  className="flex cursor-pointer items-center gap-1.5 rounded border border-ink/15 px-3 py-1.5 text-caption normal-case tracking-normal text-destructive transition-colors hover:border-destructive/40"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editing ? "Edit Address" : "Add Address"}
      >
        <AddressForm initial={editing ?? undefined} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </Modal>
    </div>
  );
}
