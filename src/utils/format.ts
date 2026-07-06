import type { ServiceStatus } from "@/types";

export function formatDate(value: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(value: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export function isDueToday(dueDate: string | null): boolean {
  if (!dueDate) return false;
  const d = new Date(dueDate);
  const t = startOfToday();
  return d.toDateString() === t.toDateString();
}

export function isOverdue(
  dueDate: string | null,
  status: ServiceStatus,
): boolean {
  if (!dueDate || status === "Completed") return false;
  const d = new Date(dueDate);
  d.setHours(0, 0, 0, 0);
  return d < startOfToday();
}

export const STATUS_STYLES: Record<
  ServiceStatus,
  { dot: string; bg: string; text: string; ring: string }
> = {
  "Not Started": {
    dot: "bg-[var(--status-notstarted)]",
    bg: "bg-muted",
    text: "text-muted-foreground",
    ring: "ring-border",
  },
  "In Progress": {
    dot: "bg-[var(--status-progress)]",
    bg: "bg-[color-mix(in_oklab,var(--status-progress)_18%,transparent)]",
    text: "text-[color-mix(in_oklab,var(--status-progress)_60%,black)]",
    ring: "ring-[var(--status-progress)]",
  },
  "Pending Review": {
    dot: "bg-[var(--status-review)]",
    bg: "bg-[color-mix(in_oklab,var(--status-review)_18%,transparent)]",
    text: "text-[color-mix(in_oklab,var(--status-review)_55%,black)]",
    ring: "ring-[var(--status-review)]",
  },
  Completed: {
    dot: "bg-[var(--status-completed)]",
    bg: "bg-[color-mix(in_oklab,var(--status-completed)_18%,transparent)]",
    text: "text-[color-mix(in_oklab,var(--status-completed)_50%,black)]",
    ring: "ring-[var(--status-completed)]",
  },
};
