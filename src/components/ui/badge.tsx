import { cn } from "@/lib/utils";
import {
  AVAILABILITY_COLORS,
  AVAILABILITY_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
} from "@/lib/utils";
import type { Availability, RequestStatus } from "@/db/schema";

export function StatusBadge({ status, pulse }: { status: RequestStatus; pulse?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset transition-colors duration-300",
        STATUS_COLORS[status]
      )}
    >
      {(pulse || status === "NEW") && (
        <span className="size-1.5 animate-pulse-dot rounded-full bg-current" aria-hidden />
      )}
      {STATUS_LABELS[status]}
    </span>
  );
}

export function AvailabilityBadge({ availability }: { availability: Availability }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        AVAILABILITY_COLORS[availability]
      )}
    >
      {AVAILABILITY_LABELS[availability]}
    </span>
  );
}
