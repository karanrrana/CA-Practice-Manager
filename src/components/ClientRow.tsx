import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  FileDown,
  Mail,
  Pencil,
  Phone,
  Plus,
  Receipt,
  Trash2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmployeeRow } from "@/components/EmployeeRow";
import { EmptyState } from "@/components/EmptyState";
import { generateCompanyReport } from "@/utils/pdf";
import { cn } from "@/lib/utils";
import type {
  Client,
  Comment,
  Employee,
  Service,
  ServiceActivity,
  StaffProfile,
} from "@/types";

const statusStyles: Record<string, string> = {
  Active: "bg-emerald-100 text-emerald-700",
  Inactive: "bg-amber-100 text-amber-700",
  Archived: "bg-muted text-muted-foreground",
};

export function ClientRow({
  client,
  employees,
  servicesForEmployee,
  allServices,
  comments,
  activity,
  staff,
  canManageCompanies,
  canDeleteCompanies,
  canManageContacts,
  username,
  staffId,
  onChanged,
  onEditClient,
  onDeleteClient,
  onAddEmployee,
  onEditEmployee,
  onDeleteEmployee,
  onAddService,
  onEditService,
  onDeleteService,
}: {
  client: Client;
  employees: Employee[];
  servicesForEmployee: (employeeId: string) => Service[];
  allServices: Service[];
  comments: Comment[];
  activity: ServiceActivity[];
  staff: StaffProfile[];
  canManageCompanies: boolean;
  canDeleteCompanies: boolean;
  canManageContacts: boolean;
  username: string;
  staffId: string | null;
  onChanged: () => void;
  onEditClient: () => void;
  onDeleteClient: () => void;
  onAddEmployee: () => void;
  onEditEmployee: (e: Employee) => void;
  onDeleteEmployee: (e: Employee) => void;
  onAddService: (employeeId: string) => void;
  onEditService: (s: Service) => void;
  onDeleteService: (s: Service) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const serviceCount = allServices.length;
  const completedCount = allServices.filter((s) => s.status === "Completed").length;

  const initials = client.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-wrap items-center gap-4 p-4">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex flex-1 items-center gap-3 text-left"
        >
          {expanded ? (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          )}
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {initials || "?"}
          </span>
          <div className="min-w-0">
            <p className="flex items-center gap-2 truncate font-semibold text-foreground">
              {client.name}
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-medium",
                  statusStyles[client.status] ?? statusStyles.Active,
                )}
              >
                {client.status}
              </span>
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
              {client.email && (
                <span className="inline-flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {client.email}
                </span>
              )}
              {client.phone && (
                <span className="inline-flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {client.phone}
                </span>
              )}
              {client.gst_number && (
  <span className="inline-flex items-center gap-1">
    <Receipt className="h-3 w-3" />
    {client.gst_number}
  </span>
)}

{client.pan_number && (
  <span className="inline-flex items-center gap-1">
    <Receipt className="h-3 w-3" />
    {client.pan_number}
  </span>
)}
              
            </div>
            {client.tags.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {client.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </button>

        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
          {employees.length} contact{employees.length !== 1 ? "s" : ""}
        </span>
        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
          {serviceCount} service{serviceCount !== 1 ? "s" : ""}
        </span>

        <div className="flex items-center gap-1">
          {serviceCount > 0 && completedCount > 0 && canManageCompanies && (
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                generateCompanyReport(client, employees, allServices, username)
              }
            >
              <FileDown className="mr-1 h-3.5 w-3.5" /> PDF
            </Button>
          )}
          {canManageCompanies && (
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onEditClient}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          )}
          {canDeleteCompanies && (
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={onDeleteClient}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="space-y-2 border-t border-border bg-muted/30 p-4">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <Users className="h-4 w-4" /> Client Contacts
            </p>
            {canManageContacts && (
              <Button size="sm" onClick={onAddEmployee}>
                <Plus className="mr-1 h-3.5 w-3.5" /> Add Client Contact
              </Button>
            )}
          </div>
          {employees.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No client contacts"
              description={
                canManageContacts
                  ? "Add the first client contact for this company."
                  : "No client contacts match the current filters."
              }
            />
          ) : (
            employees.map((emp) => (
              <EmployeeRow
                key={emp.id}
                employee={emp}
                services={servicesForEmployee(emp.id)}
                comments={comments}
                activity={activity}
                canManageContacts={canManageContacts}
                canCreateServices={true}
                canEditServices={true}
                canDeleteServices={canDeleteCompanies || canManageCompanies}
                username={username}
                staffId={staffId}
                onChanged={onChanged}
                onEditEmployee={() => onEditEmployee(emp)}
                onDeleteEmployee={() => onDeleteEmployee(emp)}
                onAddService={() => onAddService(emp.id)}
                onEditService={onEditService}
                onDeleteService={onDeleteService}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
