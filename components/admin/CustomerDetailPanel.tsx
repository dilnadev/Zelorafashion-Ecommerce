"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/providers/ToastProvider";
import { updateCustomerStatus, updateCustomerNotes } from "@/app/(admin)/admin/customers/actions";

interface CustomerDetailPanelProps {
  userId: string;
  isActive: boolean;
  initialNotes: string;
}

export function CustomerDetailPanel({ userId, isActive, initialNotes }: CustomerDetailPanelProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [notes, setNotes] = useState(initialNotes);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  async function handleSaveNotes() {
    setIsSavingNotes(true);
    const result = await updateCustomerNotes(userId, notes);
    setIsSavingNotes(false);

    if (!result.success) {
      toast({ title: "Couldn't save notes", description: result.message, variant: "error" });
      return;
    }
    toast({ title: "Notes saved", variant: "success" });
    router.refresh();
  }

  async function handleToggleStatus() {
    setIsTogglingStatus(true);
    const result = await updateCustomerStatus(userId, !isActive);
    setIsTogglingStatus(false);
    setShowStatusConfirm(false);

    if (!result.success) {
      toast({ title: "Couldn't update status", description: result.message, variant: "error" });
      return;
    }
    toast({ title: isActive ? "Customer suspended" : "Customer reactivated", variant: "success" });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-black/[0.06] bg-white p-6">
        <h2 className="mb-4 font-serif text-lg text-ink">Account Status</h2>
        <p className="mb-4 text-body text-ink-muted">
          {isActive
            ? "This customer can sign in and place orders normally."
            : "This customer's account is suspended — they cannot sign in."}
        </p>
        <Button variant={isActive ? "destructive" : "secondary"} onClick={() => setShowStatusConfirm(true)}>
          {isActive ? "Suspend Account" : "Reactivate Account"}
        </Button>
      </section>

      <section className="rounded-2xl border border-black/[0.06] bg-white p-6">
        <h2 className="mb-4 font-serif text-lg text-ink">Internal Notes</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={5}
          placeholder="Private notes visible only to admins"
          className="w-full rounded-xl border border-black/10 p-4 text-body text-ink outline-none focus:border-accent"
        />
        <div className="mt-4">
          <Button variant="secondary" onClick={handleSaveNotes} isLoading={isSavingNotes}>
            Save Notes
          </Button>
        </div>
      </section>

      <ConfirmDialog
        isOpen={showStatusConfirm}
        title={isActive ? "Suspend account" : "Reactivate account"}
        description={
          isActive
            ? "This customer will be immediately signed out and unable to log back in until reactivated."
            : "This customer will be able to sign in again."
        }
        confirmLabel={isActive ? "Suspend" : "Reactivate"}
        confirmVariant={isActive ? "destructive" : "primary"}
        isConfirming={isTogglingStatus}
        onConfirm={handleToggleStatus}
        onClose={() => setShowStatusConfirm(false)}
      />
    </div>
  );
}
