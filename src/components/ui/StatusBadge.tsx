import { cn } from "@/lib/utils/cn";
import { PAYMENT_STATUS_LABELS } from "@/lib/utils/constants";

const statusStyles: Record<string, string> = {
  paid: "bg-green-50 text-green-600",
  pending: "bg-yellow-50 text-yellow-600",
  failed: "bg-red-50 text-red-600",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "text-xs font-medium px-2 py-0.5 rounded-full",
        statusStyles[status] ?? "bg-neutral-100 text-neutral-600"
      )}
    >
      {PAYMENT_STATUS_LABELS[status] || status}
    </span>
  );
}
