"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/providers/ToastProvider";
import { updateFulfillmentStatus, addOrderNote, updateShipping, refundOrder } from "@/app/(admin)/admin/orders/actions";
import type { PaymentStatus, FulfillmentStatus } from "@/types/database";

const FULFILLMENT_OPTIONS: { value: FulfillmentStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

interface OrderDetailPanelProps {
  orderId: string;
  fulfillmentStatus: FulfillmentStatus;
  paymentStatus: PaymentStatus;
  trackingNumber: string | null;
  trackingCarrier: string | null;
}

export function OrderDetailPanel({
  orderId,
  fulfillmentStatus,
  paymentStatus,
  trackingNumber,
  trackingCarrier,
}: OrderDetailPanelProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [status, setStatus] = useState(fulfillmentStatus);
  const [statusNote, setStatusNote] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const [tracking, setTracking] = useState(trackingNumber ?? "");
  const [carrier, setCarrier] = useState(trackingCarrier ?? "");
  const [isSavingShipping, setIsSavingShipping] = useState(false);

  const [note, setNote] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);

  const [showRefundConfirm, setShowRefundConfirm] = useState(false);
  const [isRefunding, setIsRefunding] = useState(false);

  async function handleStatusUpdate() {
    setIsUpdatingStatus(true);
    const result = await updateFulfillmentStatus(orderId, status, statusNote);
    setIsUpdatingStatus(false);

    if (!result.success) {
      toast({ title: "Couldn't update status", description: result.message, variant: "error" });
      return;
    }
    setStatusNote("");
    toast({ title: "Order status updated", variant: "success" });
    router.refresh();
  }

  async function handleSaveShipping() {
    setIsSavingShipping(true);
    const result = await updateShipping(orderId, tracking, carrier);
    setIsSavingShipping(false);

    if (!result.success) {
      toast({ title: "Couldn't save tracking info", description: result.message, variant: "error" });
      return;
    }
    toast({ title: "Tracking info saved", variant: "success" });
    router.refresh();
  }

  async function handleAddNote() {
    if (!note.trim()) return;
    setIsAddingNote(true);
    const result = await addOrderNote(orderId, note);
    setIsAddingNote(false);

    if (!result.success) {
      toast({ title: "Couldn't add note", description: result.message, variant: "error" });
      return;
    }
    setNote("");
    toast({ title: "Note added", variant: "success" });
    router.refresh();
  }

  async function handleRefund() {
    setIsRefunding(true);
    const result = await refundOrder(orderId);
    setIsRefunding(false);
    setShowRefundConfirm(false);

    if (!result.success) {
      toast({ title: "Couldn't process refund", description: result.message, variant: "error" });
      return;
    }
    toast({ title: "Payment refunded", variant: "success" });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-black/[0.06] bg-white p-6">
        <h2 className="mb-4 font-serif text-lg text-ink">Fulfillment status</h2>
        <div className="flex flex-wrap items-end gap-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as FulfillmentStatus)}
            className="h-11 cursor-pointer rounded-xl border border-black/10 bg-white px-3 text-body text-ink outline-none focus:border-accent"
          >
            {FULFILLMENT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <input
            value={statusNote}
            onChange={(e) => setStatusNote(e.target.value)}
            placeholder="Optional note for this change"
            className="h-11 min-w-[220px] flex-1 rounded-xl border border-black/10 px-3 text-body text-ink outline-none focus:border-accent"
          />
          <Button onClick={handleStatusUpdate} isLoading={isUpdatingStatus} disabled={status === fulfillmentStatus && !statusNote}>
            Update Status
          </Button>
        </div>
      </section>

      <section className="rounded-2xl border border-black/[0.06] bg-white p-6">
        <h2 className="mb-4 font-serif text-lg text-ink">Shipping</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Tracking number" value={tracking} onChange={(e) => setTracking(e.target.value)} />
          <Input label="Carrier" value={carrier} onChange={(e) => setCarrier(e.target.value)} />
        </div>
        <div className="mt-4">
          <Button variant="secondary" onClick={handleSaveShipping} isLoading={isSavingShipping}>
            Save Tracking Info
          </Button>
        </div>
      </section>

      <section className="rounded-2xl border border-black/[0.06] bg-white p-6">
        <h2 className="mb-4 font-serif text-lg text-ink">Payment</h2>
        <p className="mb-4 text-body text-ink-muted">
          {paymentStatus === "paid" && "This order has been paid via Razorpay."}
          {paymentStatus === "pending" && "Payment has not been completed yet."}
          {paymentStatus === "failed" && "The last payment attempt failed."}
          {paymentStatus === "refunded" && "This payment has been refunded."}
        </p>
        {paymentStatus === "paid" && (
          <Button variant="destructive" onClick={() => setShowRefundConfirm(true)}>
            Refund Payment
          </Button>
        )}
      </section>

      <section className="rounded-2xl border border-black/[0.06] bg-white p-6">
        <h2 className="mb-4 font-serif text-lg text-ink">Add a note</h2>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="Internal note about this order"
          className="w-full rounded-xl border border-black/10 px-3 py-2 text-body text-ink outline-none focus:border-accent"
        />
        <div className="mt-4">
          <Button variant="secondary" onClick={handleAddNote} isLoading={isAddingNote} disabled={!note.trim()}>
            Add Note
          </Button>
        </div>
      </section>

      <ConfirmDialog
        isOpen={showRefundConfirm}
        title="Refund payment"
        description="This will refund the full payment via Razorpay and mark the order as refunded. This cannot be undone."
        confirmLabel="Refund"
        isConfirming={isRefunding}
        onConfirm={handleRefund}
        onClose={() => setShowRefundConfirm(false)}
      />
    </div>
  );
}
