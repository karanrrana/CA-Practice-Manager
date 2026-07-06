import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_STYLES } from "@/utils/format";
import type { ServiceStatus } from "@/types";

export function StatusPill({ status }: { status: ServiceStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        s.bg,
        s.text,
        s.ring,
        status === "In Progress" && "animate-status-glow",
      )}
    >
      {status === "Completed" ? (
        <Check className="h-3 w-3 animate-check-pulse" strokeWidth={3} />
      ) : (
        <span className={cn("h-2 w-2 rounded-full", s.dot)} />
      )}
      {status}
    </span>
  );
}
