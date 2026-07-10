import { Building2, CalendarDays, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusPill } from "@/components/StatusPill";
import { formatDate, isOverdue } from "@/utils/format";
import type {
  Client,
  Employee,
  Service,
  StaffProfile,
} from "@/types";

interface TaskCardProps {
  task: {
    service: Service;
    company?: Client;
    contact?: Employee;
    assignedStaff?: StaffProfile;
  };

  compact?: boolean;
}

export function TaskCard({
  task,
  compact = false,
}: TaskCardProps) {
  const { service, company, contact, assignedStaff } = task;

  const overdue = isOverdue(
    service.due_date,
    service.status
  );

  const borderColor =
    overdue
      ? "border-l-red-500"
      : service.status === "Completed"
      ? "border-l-green-500"
      : service.status === "In Progress"
      ? "border-l-blue-500"
      : service.status === "Pending Review"
      ? "border-l-violet-500"
      : "border-l-slate-300";

  return (
    <div
      className={cn(
        "rounded-2xl border border-border border-l-4 bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
        borderColor,
        compact && "p-4"
      )}
    >
      {/* Header */}

      <div className="flex items-start justify-between">

        <div>

          <h3
            className={cn(
              "font-semibold text-foreground",
              compact
                ? "text-base"
                : "text-lg"
            )}
          >
            {service.name}
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            {company?.name}
          </p>

        </div>

        <StatusPill status={service.status} />

      </div>

      {/* Info */}

      <div className="mt-3 space-y-2 text-sm">

  <div className="flex items-center gap-2">
    <User className="h-4 w-4 text-primary" />
    <span>{contact?.name}</span>
  </div>

  <div
    className={cn(
      "flex items-center gap-2",
      overdue
        ? "font-medium text-red-600"
        : "text-muted-foreground"
    )}
  >
    <CalendarDays className="h-4 w-4" />

    <div className="flex flex-col">

  <span className="text-muted-foreground">
    Due {formatDate(service.due_date)}
  </span>

  {service.completed_at && (
  <span className="text-xs font-medium text-green-600 mt-1">
    ✓ Completed {service.completed_at}
  </span>
)}

</div>

  </div>

</div>

      {/* Badges */}

      <div className="mt-5 flex flex-wrap gap-2">

        {service.is_recurring && (

          <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">

            🔁 {service.recurrence}

          </span>

        )}

        {service.is_recurring && (

          <span
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium",
              service.recurring_status === "Active"
                ? "bg-green-100 text-green-700"
                : "bg-orange-100 text-orange-700"
            )}
          >

            {service.recurring_status}

          </span>

        )}

      </div>

      {/* Footer */}

      {assignedStaff && (

        <div className="mt-5 border-t pt-4 text-xs text-muted-foreground">

          Assigned to

          <div className="mt-1 font-medium text-foreground">

            {assignedStaff.full_name}

          </div>

        </div>

      )}

    </div>
  );
}