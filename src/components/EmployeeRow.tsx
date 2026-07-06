import { useState } from "react";
import {
  Briefcase,
  BadgeCheck,
  ChevronDown,
  ChevronRight,
  CreditCard,
  Mail,
  Pencil,
  Phone,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ServiceRow } from "@/components/ServiceRow";
import { EmptyState } from "@/components/EmptyState";
import type { Comment, Employee, Service, ServiceActivity } from "@/types";

export function EmployeeRow({
  employee,
  services,
  comments,
  activity,
  canManageContacts,
  canCreateServices,
  canEditServices,
  canDeleteServices,
  username,
  staffId,
  onChanged,
  onEditEmployee,
  onDeleteEmployee,
  onAddService,
  onEditService,
  onDeleteService,
}: {
  employee: Employee;
  services: Service[];
  comments: Comment[];
  activity: ServiceActivity[];
  canManageContacts: boolean;
  canCreateServices: boolean;
  canEditServices: boolean;
  canDeleteServices: boolean;
  username: string;
  staffId: string | null;
  onChanged: () => void;
  onEditEmployee: () => void;
  onDeleteEmployee: () => void;
  onAddService: () => void;
  onEditService: (s: Service) => void;
  onDeleteService: (s: Service) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
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
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">
              {employee.name}
              {employee.designation && (
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  {employee.designation}
                </span>
              )}
              {employee.department && (
                <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  {employee.department}
                </span>
              )}
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
              {employee.email && (
                <span className="inline-flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {employee.email}
                </span>
              )}
              {employee.phone && (
                <span className="inline-flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {employee.phone}
                </span>
              )}
              {employee.pan_number && (
                <span className="inline-flex items-center gap-1">
                  <CreditCard className="h-3 w-3" />
                  {employee.pan_number}
                </span>
              )}
              {employee.employee_id && (
                <span className="inline-flex items-center gap-1">
                  <BadgeCheck className="h-3 w-3" />
                  {employee.employee_id}
                </span>
              )}
            </div>
          </div>
        </button>

        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
          {services.length} service{services.length !== 1 ? "s" : ""}
        </span>

        {canManageContacts && (
          <div className="flex items-center gap-1">
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onEditEmployee}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={onDeleteEmployee}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>

      {expanded && (
        <div className="space-y-2 border-t border-border bg-muted/30 p-3">
          {employee.notes && (
            <p className="rounded-md bg-background px-3 py-2 text-xs text-muted-foreground">
              {employee.notes}
            </p>
          )}
          {canCreateServices && (
            <div className="flex justify-end">
              <Button size="sm" onClick={onAddService}>
                <Plus className="mr-1 h-3.5 w-3.5" /> Add Service
              </Button>
            </div>
          )}
          {services.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No services"
              description={
                canCreateServices
                  ? "Add the first service for this client contact."
                  : "No services match the current filters."
              }
            />
          ) : (
            services.map((s) => (
              <ServiceRow
                key={s.id}
                service={s}
                comments={comments}
                activity={activity}
                canEdit={canEditServices}
                canDelete={canDeleteServices}
                username={username}
                staffId={staffId}
                onChanged={onChanged}
                onEdit={() => onEditService(s)}
                onDelete={() => onDeleteService(s)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
