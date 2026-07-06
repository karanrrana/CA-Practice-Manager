import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { TaskCard } from "@/components/TaskCard";
import { isOverdue } from "@/utils/format";
import type { Client, Employee, Service } from "@/types";

interface MyTasksProps {
  staffId: string | null;
  services: Service[];
  clients: Client[];
  employees: Employee[];
}

export default function MyTasks({
  staffId,
  services,
  clients,
  employees,
}: MyTasksProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Due Date");

  // Fast lookup maps
  const employeeMap = useMemo(
    () => new Map(employees.map((e) => [e.id, e])),
    [employees]
  );

  const companyMap = useMemo(
    () => new Map(clients.map((c) => [c.id, c])),
    [clients]
  );

  // Only tasks assigned to current user
  const assignedTasks = useMemo(() => {
    return services.filter(
      (s) =>
        s.assigned_staff_id === staffId ||
        s.supporting_staff_id === staffId
    );
  }, [services, staffId]);

  // Search + Status Filter
  const filteredTasks = useMemo(() => {
    return assignedTasks.filter((service) => {
      const contact = employeeMap.get(service.client_contact_id);
      const company = companyMap.get(contact?.company_id ?? "");

      const matchesSearch =
        service.name.toLowerCase().includes(search.toLowerCase()) ||
        contact?.name
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        company?.name
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All"
          ? true
          : statusFilter === "Overdue"
          ? isOverdue(service.due_date, service.status)
          : service.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [
    assignedTasks,
    search,
    statusFilter,
    employeeMap,
    companyMap,
  ]);

  // Sorting
  const sortedTasks = useMemo(() => {
    const arr = [...filteredTasks];

    switch (sortBy) {
      case "Newest":
        return arr.sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        );

      case "Oldest":
        return arr.sort(
          (a, b) =>
            new Date(a.created_at).getTime() -
            new Date(b.created_at).getTime()
        );

      default:
        return arr.sort(
          (a, b) =>
            new Date(a.due_date ?? "").getTime() -
            new Date(b.due_date ?? "").getTime()
        );
    }
  }, [filteredTasks, sortBy]);

  return (
    <div className="space-y-6">

      {/* Header */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <h1 className="text-3xl font-bold">
            My Tasks
          </h1>

          <p className="text-muted-foreground">
            {sortedTasks.length} Assigned Tasks
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">

          <div className="relative w-full md:w-96">

            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

            <Input
              className="pl-9"
              placeholder="Search by company, contact or service..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option>Due Date</option>
            <option>Newest</option>
            <option>Oldest</option>
          </select>

        </div>

      </div>

      {/* Filters */}

      <div className="flex flex-wrap gap-2">

        {[
          "All",
          "Not Started",
          "In Progress",
          "Pending Review",
          "Completed",
          "Overdue",
        ].map((status) => (

          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`rounded-full px-4 py-2 text-sm transition ${
              statusFilter === status
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            {status}
          </button>

        ))}

      </div>

      {/* Task Cards */}

      <div className="grid gap-5 lg:grid-cols-2">

        {sortedTasks.length === 0 ? (

          <div className="col-span-full rounded-xl border border-dashed p-10 text-center">

            <h3 className="text-lg font-semibold">
              🎉 You're all caught up!
            </h3>

            <p className="mt-2 text-muted-foreground">
              No tasks match your current filters.
            </p>

          </div>

        ) : (

          sortedTasks.map((task) => {

            const contact = employeeMap.get(
              task.client_contact_id
            );

            const company = companyMap.get(
              contact?.company_id ?? ""
            );

            return (

              <TaskCard
                key={task.id}
                task={{
                  service: task,
                  company,
                  contact,
                }}
              />

            );

          })

        )}

      </div>

    </div>
  );
}