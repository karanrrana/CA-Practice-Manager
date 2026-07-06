import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";
import type { Service, Client, Employee } from "@/types";
import { Button } from "@/components/ui/button";
import { formatDate, isOverdue } from "@/utils/format";
import {
  Building2,
  UserRound,
} from "lucide-react";

export function MyAssignedTasks({
  services,
  clients,
  employees,
}: {
  services: Service[];
  clients: Client[];
  employees: Employee[];
}) {
  if (services.length === 0) {
    return (
      <div className="rounded-2xl border bg-white p-8 shadow-sm text-center">
        <h2 className="text-xl font-bold">
          My Assigned Tasks
        </h2>

        <p className="mt-3 text-muted-foreground">
          🎉 You have no assigned services.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-lg">

      <div className="mb-6 flex items-center justify-between">

        <div>

          <h2 className="text-2xl font-bold">
            📋 My Assigned Tasks
          </h2>

          <p className="text-sm text-muted-foreground">
            Services assigned to you
          </p>

        </div>

        <span className="rounded-full bg-indigo-100 px-4 py-2 text-sm font-semibold text-indigo-700">
          {services.length} Tasks
        </span>

      </div>

      <div className="space-y-4">

{services.map((service) => {

  const overdue = isOverdue(
    service.due_date,
    service.status
  );

  // Find the client contact
  const contact = employees.find(
    (e) => e.id === service.client_contact_id
  );

  // Find the company using the contact
  const company = clients.find(
  (c) => c.id === contact?.company_id
);

          return (

            <div
              key={service.id}
              className="rounded-2xl border bg-slate-50 p-5 transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-lg"
            >

              <div className="flex items-start justify-between">

                <div>

  <h3 className="text-lg font-bold">
    {service.name}
  </h3>

  <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
    <Building2 className="h-4 w-4 text-indigo-600" />
    <span>{company?.name ?? "Unknown Company"}</span>
  </p>

  <p className="mt-1 flex items-center gap-2 text-sm text-slate-600">
    <UserRound className="h-4 w-4 text-emerald-600" />
    <span>{contact?.name ?? "Unknown Contact"}</span>
  </p>

  <p className="mt-2 text-sm text-slate-500">
    📅 Due:{" "}
    {service.due_date
      ? formatDate(service.due_date)
      : "No Due Date"}
  </p>

</div>

                {overdue ? (
                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                    Overdue
                  </span>
                ) : (
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                    {service.status}
                  </span>
                )}

              </div>

              <div className="mt-5 flex items-center justify-between">

                <div className="flex gap-4 text-sm">

                  <div className="flex items-center gap-2">

                    <CalendarClock className="h-4 w-4 text-slate-500" />

                    {service.due_date
                      ? formatDate(service.due_date)
                      : "--"}

                  </div>

                  <div className="flex items-center gap-2">

                    {service.status === "Completed" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : service.status === "In Progress" ? (
                      <Clock className="h-4 w-4 text-yellow-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-slate-500" />
                    )}

                    {service.status}

                  </div>

                </div>

                <Button variant="outline">

                  Open

                  <ArrowRight className="ml-2 h-4 w-4" />

                </Button>

              </div>

            </div>

          );

        })}

      </div>

    </div>
  );
}