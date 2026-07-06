import { useMemo, useState } from "react";
import { useEffect } from "react";
import { Plus, Search, Users, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClientRow } from "@/components/ClientRow";
import { ClientForm } from "@/components/ClientForm";
import { EmployeeForm } from "@/components/EmployeeForm";
import { ServiceForm } from "@/components/ServiceForm";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import { ClientListSkeleton } from "@/components/Skeletons";
import { useAppData } from "@/hooks/useAppData";
import { useAuth } from "@/context/AuthContext";
import {
  createClient,
  createClientContact,
  createService,
  deleteClient,
  deleteClientContact,
  deleteService,
  logActivity,
  logAudit,
  updateClient,
  updateClientContact,
  updateService,
} from "@/services/api";
import {
  STATUS_VALUES,
  type Client,
  type ClientContact,
  type Service,
} from "@/types";
import type {
  ClientFormValues,
  EmployeeFormValues,
  ServiceFormValues,
} from "@/lib/validation";

const PAGE_SIZE = 10;

export function ClientList() {
  const { clients, employees, services, comments, staff, activity, loading, reload } =
    useAppData();
  const {
    canManageCompanies,
    canDeleteCompanies,
    canManageContacts,
    username,
    staffId,
  } = useAuth();

  const staffName = (id: string | null) =>
    id ? (staff.find((s) => s.id === id)?.full_name ?? "—") : "";

  const [search, setSearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [employeeFilter, setEmployeeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [serviceNameFilter, setServiceNameFilter] = useState("all");
  const [companyStatusFilter, setCompanyStatusFilter] = useState("active");
  const [dueDateFilter, setDueDateFilter] = useState("");
  const [clientSort, setClientSort] = useState("recent");
  const [serviceSort, setServiceSort] = useState("due");
  const [page, setPage] = useState(1);

  const [clientDialog, setClientDialog] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [employeeDialog, setEmployeeDialog] = useState(false);
  const [employeeCompanyId, setEmployeeCompanyId] = useState<string | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<ClientContact | null>(null);
  const [serviceDialog, setServiceDialog] = useState(false);
  useEffect(() => {
  if (window.location.hash === "#add-company") {
    setEditingClient(null);
    setClientDialog(true);

    // Remove the hash so refresh won't reopen the dialog
    history.replaceState(null, "", window.location.pathname);
  }
}, []);
  const [serviceEmployeeId, setServiceEmployeeId] = useState<string | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<
    | { type: "client"; item: Client }
    | { type: "employee"; item: ClientContact }
    | { type: "service"; item: Service }
    | null
  >(null);
  const [submitting, setSubmitting] = useState(false);

  const serviceNames = useMemo(
    () => Array.from(new Set(services.map((s) => s.name))),
    [services],
  );
  const employeesByCompany = useMemo(() => {
    const map = new Map<string, ClientContact[]>();
    employees.forEach((e) => {
      const list = map.get(e.company_id) ?? [];
      list.push(e);
      map.set(e.company_id, list);
    });
    return map;
  }, [employees]);

  const decorate = (s: Service): Service => ({
    ...s,
    assigned_to: s.assigned_staff_id ? staffName(s.assigned_staff_id) : null,
  });

  const sortServices = (list: Service[]) => {
    const copy = [...list];
    switch (serviceSort) {
      case "due":
        return copy.sort((a, b) => (a.due_date ?? "").localeCompare(b.due_date ?? ""));
      case "status":
        return copy.sort((a, b) => a.status.localeCompare(b.status));
      case "name":
        return copy.sort((a, b) => a.name.localeCompare(b.name));
      case "assignee":
        return copy.sort((a, b) =>
          (a.assigned_to ?? "").localeCompare(b.assigned_to ?? ""),
        );
      default:
        return copy;
    }
  };

  const servicesForEmployee = (employeeId: string) => {
    let list = services.filter((s) => s.client_contact_id === employeeId).map(decorate);
    if (statusFilter !== "all") list = list.filter((s) => s.status === statusFilter);
    if (assigneeFilter !== "all")
      list = list.filter((s) => s.assigned_staff_id === assigneeFilter);
    if (serviceNameFilter !== "all") list = list.filter((s) => s.name === serviceNameFilter);
    if (dueDateFilter) list = list.filter((s) => s.due_date === dueDateFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      const emp = employees.find((e) => e.id === employeeId);
      const empMatches =
        emp &&
        (emp.name.toLowerCase().includes(q) ||
          (emp.email ?? "").toLowerCase().includes(q) ||
          (emp.phone ?? "").toLowerCase().includes(q) ||
          (emp.pan_number ?? "").toLowerCase().includes(q) ||
          (emp.aadhaar_number ?? "").toLowerCase().includes(q));
      list = list.filter((s) => empMatches || s.name.toLowerCase().includes(q));
    }
    return sortServices(list);
  };

  const hasServiceFilters =
    statusFilter !== "all" ||
    assigneeFilter !== "all" ||
    serviceNameFilter !== "all" ||
    employeeFilter !== "all" ||
    !!dueDateFilter;

  const employeesForCompany = (companyId: string) => {
    let list = employeesByCompany.get(companyId) ?? [];
    if (employeeFilter !== "all") list = list.filter((e) => e.id === employeeFilter);

    if (search.trim()) {
      const q = search.toLowerCase();
      const company = clients.find((c) => c.id === companyId);
      const companyMatches =
        company &&
        (company.name.toLowerCase().includes(q) ||
          (company.gst_number ?? "").toLowerCase().includes(q));
      list = list.filter((e) => {
        if (companyMatches) return true;
        const empMatches =
          e.name.toLowerCase().includes(q) ||
          (e.email ?? "").toLowerCase().includes(q) ||
          (e.phone ?? "").toLowerCase().includes(q) ||
          (e.pan_number ?? "").toLowerCase().includes(q) ||
          (e.aadhaar_number ?? "").toLowerCase().includes(q);
        return empMatches || servicesForEmployee(e.id).length > 0;
      });
    }

    if (hasServiceFilters) {
      list = list.filter((e) => servicesForEmployee(e.id).length > 0);
    }

    return list.sort((a, b) => a.name.localeCompare(b.name));
  };

  const allServicesForCompany = (companyId: string) => {
    const empIds = (employeesByCompany.get(companyId) ?? []).map((e) => e.id);
    return services.filter((s) => empIds.includes(s.client_contact_id)).map(decorate);
  };

  const filteredClients = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = clients.filter((c) => {
      // company status filter (archived hidden unless explicitly chosen)
      if (companyStatusFilter === "active" && c.status !== "Active") return false;
      if (companyStatusFilter === "inactive" && c.status !== "Inactive") return false;
      if (companyStatusFilter === "archived" && c.status !== "Archived") return false;
      if (companyStatusFilter === "all" && c.status === "Archived") {
        // 'all' still includes archived
      }
      if (!q) return true;
      const companyEmployees = employeesByCompany.get(c.id) ?? [];
      const matchesCompany =
        c.name.toLowerCase().includes(q) ||
        (c.email ?? "").toLowerCase().includes(q) ||
        (c.phone ?? "").toLowerCase().includes(q) ||
        (c.gst_number ?? "").toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q));
      const matchesEmployee = companyEmployees.some(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          (e.email ?? "").toLowerCase().includes(q) ||
          (e.phone ?? "").toLowerCase().includes(q) ||
          (e.pan_number ?? "").toLowerCase().includes(q) ||
          (e.aadhaar_number ?? "").toLowerCase().includes(q),
      );
      const matchesService = allServicesForCompany(c.id).some((s) =>
        s.name.toLowerCase().includes(q),
      );
      return matchesCompany || matchesEmployee || matchesService;
    });

    if (companyFilter !== "all") list = list.filter((c) => c.id === companyFilter);
    if (hasServiceFilters) {
      list = list.filter((c) => employeesForCompany(c.id).length > 0);
    }

    const copy = [...list];
    switch (clientSort) {
      case "az":
        copy.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "za":
        copy.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "recent":
        copy.sort((a, b) => b.created_at.localeCompare(a.created_at));
        break;
      case "oldest":
        copy.sort((a, b) => a.created_at.localeCompare(b.created_at));
        break;
    }
    return copy;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    clients,
    employees,
    services,
    staff,
    search,
    companyFilter,
    employeeFilter,
    statusFilter,
    assigneeFilter,
    serviceNameFilter,
    dueDateFilter,
    companyStatusFilter,
    clientSort,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredClients.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filteredClients.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const employeeFilterOptions = useMemo(() => {
    if (companyFilter !== "all") return employeesByCompany.get(companyFilter) ?? [];
    return employees;
  }, [companyFilter, employees, employeesByCompany]);

  // ---- handlers ----
  const handleClientSubmit = async (values: ClientFormValues) => {
    if (!canManageCompanies) return;
    setSubmitting(true);
    try {
      if (editingClient) {
        await updateClient(editingClient.id, values);
        await logAudit(staffId, username, "Company Edited", "company", editingClient.id);
        toast.success("Company updated");
      } else {
        const c = await createClient(values);
        await logAudit(staffId, username, "Company Created", "company", c.id);
        toast.success("Company added");
      }
      setClientDialog(false);
      setEditingClient(null);
      reload();
    } catch {
      toast.error("Failed to save company");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmployeeSubmit = async (values: EmployeeFormValues) => {
    if (!canManageContacts) return;
    setSubmitting(true);
    try {
      if (editingEmployee) {
        await updateClientContact(editingEmployee.id, values);
        toast.success("Client contact updated");
      } else if (employeeCompanyId) {
        await createClientContact(employeeCompanyId, values);
        toast.success("Client contact added");
      }
      setEmployeeDialog(false);
      setEditingEmployee(null);
      setEmployeeCompanyId(null);
      reload();
    } catch {
      toast.error("Failed to save client contact");
    } finally {
      setSubmitting(false);
    }
  };

  const handleServiceSubmit = async (values: ServiceFormValues) => {
    setSubmitting(true);
    try {
      if (editingService) {
        const prev = editingService;
        await updateService(editingService.id, values);
        await logActivity(editingService.id, staffId, username, "Updated", "Service updated");
        if (prev.status !== values.status) {
          await logActivity(
            editingService.id,
            staffId,
            username,
            "Status Changed",
            `Status: ${prev.status} → ${values.status}`,
          );
        }
        if (prev.assigned_staff_id !== (values.assigned_staff_id || null)) {
          await logActivity(
            editingService.id,
            staffId,
            username,
            "Reassigned",
            `Assigned to ${staffName(values.assigned_staff_id || null) || "Unassigned"}`,
          );
        }
        toast.success("Service updated");
      } else if (serviceEmployeeId) {
        const svc = await createService(serviceEmployeeId, values, staffId);
        await logActivity(svc.id, staffId, username, "Created", "Service created");
        if (values.assigned_staff_id) {
          await logActivity(
            svc.id,
            staffId,
            username,
            "Assigned",
            `Assigned to ${staffName(values.assigned_staff_id)}`,
          );
        }
        toast.success("Service added");
      }
      setServiceDialog(false);
      setEditingService(null);
      setServiceEmployeeId(null);
      reload();
    } catch {
      toast.error("Failed to save service");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      if (deleteTarget.type === "client") {
        await deleteClient(deleteTarget.item.id);
        await logAudit(staffId, username, "Company Deleted", "company", deleteTarget.item.id);
        toast.success("Company deleted");
      } else if (deleteTarget.type === "employee") {
        await deleteClientContact(deleteTarget.item.id);
        toast.success("Client contact deleted");
      } else {
        await deleteService(deleteTarget.item.id);
        await logAudit(staffId, username, "Service Deleted", "service", deleteTarget.item.id);
        toast.success("Service deleted");
      }
      setDeleteTarget(null);
      reload();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setSubmitting(false);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setCompanyFilter("all");
    setEmployeeFilter("all");
    setStatusFilter("all");
    setAssigneeFilter("all");
    setServiceNameFilter("all");
    setDueDateFilter("");
    setCompanyStatusFilter("active");
  };

  const activeFilterCount =
    (search ? 1 : 0) +
    (companyFilter !== "all" ? 1 : 0) +
    (employeeFilter !== "all" ? 1 : 0) +
    (statusFilter !== "all" ? 1 : 0) +
    (assigneeFilter !== "all" ? 1 : 0) +
    (serviceNameFilter !== "all" ? 1 : 0) +
    (dueDateFilter ? 1 : 0);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-foreground">Companies</h2>
        {canManageCompanies && (
          <Button
            onClick={() => {
              setEditingClient(null);
              setClientDialog(true);
            }}
          >
            <Plus className="mr-1 h-4 w-4" /> Add Company
          </Button>
        )}
      </div>

      {/* search + filters */}
      <div className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search companies, contacts (name/email/phone/PAN/Aadhaar), services, tags…"
            className="pl-9"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <Select value={companyStatusFilter} onValueChange={setCompanyStatusFilter}>
            <SelectTrigger><SelectValue placeholder="Company status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
              <SelectItem value="all">All (incl. archived)</SelectItem>
            </SelectContent>
          </Select>

          <Select value={companyFilter} onValueChange={setCompanyFilter}>
            <SelectTrigger><SelectValue placeholder="Company" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All companies</SelectItem>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
            <SelectTrigger><SelectValue placeholder="Client contact" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All contacts</SelectItem>
              {employeeFilterOptions.map((e) => (
                <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
            <SelectTrigger><SelectValue placeholder="Assigned staff" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All staff</SelectItem>
              {staff.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUS_VALUES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={serviceNameFilter} onValueChange={setServiceNameFilter}>
            <SelectTrigger><SelectValue placeholder="Service" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All services</SelectItem>
              {serviceNames.map((n) => (
                <SelectItem key={n} value={n}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="date"
            value={dueDateFilter}
            onChange={(e) => setDueDateFilter(e.target.value)}
          />

          <Select value={serviceSort} onValueChange={setServiceSort}>
            <SelectTrigger><SelectValue placeholder="Sort services" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="due">Sort: Due date</SelectItem>
              <SelectItem value="status">Sort: Status</SelectItem>
              <SelectItem value="name">Sort: Name</SelectItem>
              <SelectItem value="assignee">Sort: Assignee</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <Select value={clientSort} onValueChange={setClientSort}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Companies: Newest</SelectItem>
              <SelectItem value="oldest">Companies: Oldest</SelectItem>
              <SelectItem value="az">Companies: A–Z</SelectItem>
              <SelectItem value="za">Companies: Z–A</SelectItem>
            </SelectContent>
          </Select>
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              <X className="mr-1 h-3.5 w-3.5" /> Clear filters ({activeFilterCount})
            </Button>
          )}
        </div>
      </div>

      {/* list */}
      {loading ? (
        <ClientListSkeleton />
      ) : paged.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No companies found"
          description="Try adjusting your search or filters."
        />
      ) : (
        <div className="space-y-3">
          {paged.map((client) => (
            <ClientRow
              key={client.id}
              client={client}
              employees={employeesForCompany(client.id)}
              servicesForEmployee={servicesForEmployee}
              allServices={allServicesForCompany(client.id)}
              comments={comments}
              activity={activity}
              staff={staff}
              staffId={staffId}
              canManageCompanies={canManageCompanies}
              canDeleteCompanies={canDeleteCompanies}
              canManageContacts={canManageContacts}
              username={username}
              onChanged={reload}
              onEditClient={() => {
                setEditingClient(client);
                setClientDialog(true);
              }}
              onDeleteClient={() => setDeleteTarget({ type: "client", item: client })}
              onAddEmployee={() => {
                setEditingEmployee(null);
                setEmployeeCompanyId(client.id);
                setEmployeeDialog(true);
              }}
              onEditEmployee={(e) => {
                setEditingEmployee(e);
                setEmployeeCompanyId(client.id);
                setEmployeeDialog(true);
              }}
              onDeleteEmployee={(e) => setDeleteTarget({ type: "employee", item: e })}
              onAddService={(employeeId) => {
                setEditingService(null);
                setServiceEmployeeId(employeeId);
                setServiceDialog(true);
              }}
              onEditService={(s) => {
                setEditingService(s);
                setServiceDialog(true);
              }}
              onDeleteService={(s) => setDeleteTarget({ type: "service", item: s })}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={currentPage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={currentPage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
        </div>
      )}

      {/* dialogs */}
      <ClientForm
        open={clientDialog}
        onOpenChange={(v) => {
          setClientDialog(v);
          if (!v) setEditingClient(null);
        }}
        client={editingClient}
        onSubmit={handleClientSubmit}
        submitting={submitting}
      />
      <EmployeeForm
        open={employeeDialog}
        onOpenChange={(v) => {
          setEmployeeDialog(v);
          if (!v) setEditingEmployee(null);
        }}
        employee={editingEmployee}
        onSubmit={handleEmployeeSubmit}
        submitting={submitting}
      />
      <ServiceForm
        open={serviceDialog}
        onOpenChange={(v) => {
          setServiceDialog(v);
          if (!v) setEditingService(null);
        }}
        service={editingService}
        staff={staff}
        onSubmit={handleServiceSubmit}
        submitting={submitting}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Confirm deletion"
        description="This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        loading={submitting}
      />
    </section>
  );
}
