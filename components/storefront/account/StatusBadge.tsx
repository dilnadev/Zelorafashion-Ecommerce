import { cn } from "@/lib/utils";
import type { FulfillmentStatus } from "@/types/database";

const STATUS_STYLES: Record<FulfillmentStatus, string> = {
  pending: "bg-amber-50 text-amber-700",
  processing: "bg-blue-50 text-blue-700",
  shipped: "bg-blue-50 text-blue-700",
  delivered: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-700",
};

const STATUS_LABELS: Record<FulfillmentStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function StatusBadge({ status }: { status: FulfillmentStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-3 py-1 text-caption normal-case tracking-normal",
        STATUS_STYLES[status]
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
