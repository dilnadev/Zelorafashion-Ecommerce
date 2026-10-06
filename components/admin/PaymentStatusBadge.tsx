import { cn } from "@/lib/utils";
import type { PaymentStatus } from "@/types/database";

const STATUS_STYLES: Record<PaymentStatus, string> = {
  pending: "bg-amber-50 text-amber-700",
  paid: "bg-green-50 text-green-700",
  failed: "bg-red-50 text-red-700",
  refunded: "bg-black/[0.06] text-ink-muted",
};

const STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-caption normal-case tracking-normal",
        STATUS_STYLES[status]
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
