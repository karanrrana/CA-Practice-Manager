import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  History,
  MessageSquare,
  Pencil,
  Trash2,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { CalendarDays, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/StatusPill";
import { StatusSelect } from "@/components/StatusSelect";
import { CommentsThread } from "@/components/CommentsThread";
import {
  logActivity,
  updateServiceStatus,
  updateRecurringStatus,
  createNextRecurringService,
} from "@/services/api";
import { formatDate, formatDateTime, isOverdue } from "@/utils/format";
import type { Comment, Service, ServiceActivity, ServiceStatus } from "@/types";

export function ServiceRow({
  service,
  comments,
  activity,
  canEdit,
  canDelete,
  username,
  staffId,
  onChanged,
  onEdit,
  onDelete,
}: {
  service: Service;
  comments: Comment[];
  activity: ServiceActivity[];
  canEdit: boolean;
  canDelete: boolean;
  username: string;
  staffId: string | null;
  onChanged: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [busy, setBusy] = useState(false);
  const overdue = isOverdue(service.due_date, service.status);

  const changeStatus = async (status: ServiceStatus) => {
    setBusy(true);
    try {
      await updateServiceStatus(service.id, status);
      await logActivity(
        service.id,
        staffId,
        username,
        status === "Completed" ? "Completed" : "Status Changed",
        `Status: ${service.status} → ${status}`,
      );
      toast.success("Status updated");
      onChanged();
    } catch {
      toast.error("Failed to update status");
    } finally {
      setBusy(false);
    }
  };
  const toggleRecurring = async () => {

  if (!service.is_recurring) return;

  setBusy(true);

  try {

    const nextStatus =
      service.recurring_status === "Active"
        ? "Paused"
        : "Active";

    const updatedService =
  await updateRecurringStatus(
    service.id,
    nextStatus
  );
  
  if (
      nextStatus === "Active" &&
      updatedService.status === "Completed"
    ) {
      await createNextRecurringService(updatedService);
    }

    toast.success(
      `Recurring service ${nextStatus.toLowerCase()}`
    );

    onChanged();

  } catch {

    toast.error(
      "Failed to update recurring status"
    );

  } finally {

    setBusy(false);

  }

};
  const serviceComments = comments.filter((c) => c.service_id === service.id);
  const serviceActivity = activity.filter((a) => a.service_id === service.id);

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex flex-wrap items-center gap-3 p-3">
        <button
  onClick={() => setExpanded((v) => !v)}
  className="flex flex-1 items-center gap-2 text-left"
>
  {expanded ? (
    <ChevronDown className="h-4 w-4 text-muted-foreground" />
  ) : (
    <ChevronRight className="h-4 w-4 text-muted-foreground" />
  )}

  <span className="font-medium text-foreground">
    {service.name}
  </span>

  <StatusPill status={service.status} />

  {/* Recurring Badge */}
  {service.is_recurring && (
    <>
      <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-medium text-indigo-700">
        🔁 {service.recurrence}
      </span>

      <span
        className={cn(
          "rounded-full px-2 py-0.5 text-[10px] font-medium",
          service.recurring_status === "Active"
            ? "bg-green-100 text-green-700"
            : "bg-orange-100 text-orange-700"
        )}
      >
        {service.recurring_status === "Active"
          ? "🟢 Active"
          : "⏸ Paused"}
      </span>
    </>
  )}
</button>

        <div className="flex flex-col gap-1 text-xs">

  <div className="flex items-center gap-1.5 text-muted-foreground">
    <User className="h-3.5 w-3.5" />
    <span>{service.assigned_to || "Unassigned"}</span>
  </div>

  <div className="flex items-center gap-1.5 text-muted-foreground">
    <CalendarDays className="h-3.5 w-3.5" />
    <span>
      Due {formatDate(service.due_date)}
      {overdue && " · Overdue"}
    </span>
  </div>

  {service.completed_at && (
    <div className="flex items-center gap-1.5 text-green-600">
      <CheckCircle2 className="h-3.5 w-3.5" />
      <span>Completed {formatDate(service.completed_at)}</span>
    </div>
  )}

</div>

        <div className="flex items-center gap-1.5">

  <span className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
    <MessageSquare className="h-3 w-3" />
    {serviceComments.length}
  </span>

  <StatusSelect
    value={service.status}
    onChange={changeStatus}
    disabled={busy}
  />

  {/* Pause / Resume Recurring */}
  {service.is_recurring && (
    <Button
      size="sm"
      variant={
        service.recurring_status === "Active"
          ? "secondary"
          : "default"
      }
      onClick={toggleRecurring}
      disabled={busy}
    >
      {service.recurring_status === "Active"
        ? "⏸ Pause"
        : "▶ Resume"}
    </Button>
  )}

  {canEdit && (
    <Button
      size="icon"
      variant="ghost"
      className="h-8 w-8"
      onClick={onEdit}
    >
      <Pencil className="h-3.5 w-3.5" />
    </Button>
  )}

  {canDelete && (
    <Button
      size="icon"
      variant="ghost"
      className="h-8 w-8 text-destructive hover:text-destructive"
      onClick={onDelete}
    >
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  )}

</div>
      </div>

      {expanded && (
        <div className="space-y-3 border-t border-border p-3">
          <CommentsThread
            serviceId={service.id}
            comments={serviceComments}
            onPosted={async (msg) => {
              await logActivity(
                service.id,
                staffId,
                username,
                "Comment Added",
                msg.slice(0, 80),
              );
              onChanged();
            }}
          />

          <div className="rounded-lg border border-border bg-background p-3">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <History className="h-3.5 w-3.5" /> Activity Timeline
            </div>
            {serviceActivity.length === 0 ? (
              <p className="text-xs text-muted-foreground">No activity recorded yet.</p>
            ) : (
              <ol className="space-y-2">
                {serviceActivity.map((a) => (
                  <li key={a.id} className="flex gap-2 text-xs">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <div>
                      <p className="font-medium text-foreground">
                        {a.action}
                        {a.description && (
                          <span className="font-normal text-muted-foreground">
                            {" "}
                            — {a.description}
                          </span>
                        )}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {a.actor_name || "System"} · {formatDateTime(a.created_at)}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
