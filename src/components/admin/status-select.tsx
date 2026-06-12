"use client";

import { useState, useTransition } from "react";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { REQUEST_STATUSES, type RequestStatus } from "@/db/schema";
import { updateRequestStatus } from "@/actions/admin";
import { cn, STATUS_COLORS, STATUS_LABELS } from "@/lib/utils";

export function StatusSelect({
  requestId,
  status,
}: {
  requestId: number;
  status: RequestStatus;
}) {
  const [current, setCurrent] = useState<RequestStatus>(status);
  const [pending, startTransition] = useTransition();

  function handleChange(next: RequestStatus) {
    if (next === current) return;
    const previous = current;
    setCurrent(next);
    startTransition(async () => {
      const result = await updateRequestStatus(requestId, next);
      if (result.success) {
        toast.success(`Status actualizat: ${STATUS_LABELS[next]}`);
      } else {
        setCurrent(previous);
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="relative inline-flex">
      <select
        value={current}
        disabled={pending}
        onChange={(e) => handleChange(e.target.value as RequestStatus)}
        className={cn(
          "h-11 cursor-pointer appearance-none rounded-xl py-0 pl-4 pr-10 text-sm font-semibold ring-1 ring-inset transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-60",
          STATUS_COLORS[current]
        )}
        aria-label="Schimbă statusul cererii"
      >
        {REQUEST_STATUSES.map((statusOption) => (
          <option key={statusOption} value={statusOption}>
            {STATUS_LABELS[statusOption]}
          </option>
        ))}
      </select>
      <ChevronDown
        className={cn(
          "pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 transition-transform",
          pending && "animate-pulse"
        )}
        aria-hidden
      />
    </div>
  );
}
