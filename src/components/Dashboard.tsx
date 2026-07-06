import {
  AlertTriangle,
  Building2,
  CalendarClock,
  CheckCircle2,
  Circle,
  ClipboardList,
  Clock,
  Eye,
  UserCheck,
  UserX,
  Users,
  UsersRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { MyAssignedTasks } from "@/components/MyAssignedTasks";
import type {
  Client,
  Comment,
  Employee,
  Role,
  Service,
  StaffProfile,
} from "@/types";
import { formatDate, formatDateTime, isDueToday, isOverdue } from "@/utils/format";

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  icon: typeof Users;
  accent: string;
}) {
  return (
  <div
    className="
    group relative overflow-hidden rounded-3xl
    border border-slate-200/60
    bg-gradient-to-br from-white via-white to-slate-50
    p-6
    shadow-sm
    transition-all duration-300
    hover:-translate-y-2
    hover:shadow-2xl
    hover:border-blue-300
    "
  >
    {/* Background Glow */}
    <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-blue-500/10 blur-3xl transition-all duration-300 group-hover:bg-blue-500/20" />

    {/* Content */}
    <div className="relative flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          {label}
        </p>

        <h2 className="mt-3 text-5xl font-extrabold tracking-tight text-slate-900">
          {value}
        </h2>
      </div>

      <div
        className={cn(
          "flex h-16 w-16 items-center justify-center rounded-2xl shadow-md transition-all duration-300 group-hover:scale-110 group-hover:rotate-6",
          accent
        )}
      >
        <Icon className="h-8 w-8" />
      </div>
    </div>

    {/* Bottom Accent Line */}
    <div className="mt-5 h-1 w-full rounded-full bg-slate-100 overflow-hidden">
      <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
    </div>
  </div>
);
}

const PROGRESS =
  "bg-[color-mix(in_oklab,var(--status-progress)_20%,transparent)] text-[color-mix(in_oklab,var(--status-progress)_55%,black)]";
const REVIEW =
  "bg-[color-mix(in_oklab,var(--status-review)_20%,transparent)] text-[color-mix(in_oklab,var(--status-review)_55%,black)]";
const COMPLETED =
  "bg-[color-mix(in_oklab,var(--status-completed)_20%,transparent)] text-[color-mix(in_oklab,var(--status-completed)_50%,black)]";

export function Dashboard({
  role,
  staffId,
  clients,
  employees,
  services,
  staff,
  comments,
}: {
  role: Role;
  staffId: string | null;
  clients: Client[];
  employees: Employee[];
  services: Service[];
  staff: StaffProfile[];
  comments: Comment[];
}) {
  const myServices =
    role === "Staff"
      ? services.filter(
          (s) => s.assigned_staff_id === staffId || s.supporting_staff_id === staffId,
        )
      : services;
      
    const assignedServices = services.filter(
  (s) =>
    s.assigned_staff_id === staffId ||
    s.supporting_staff_id === staffId
);
  const byStatus = (s: string) => myServices.filter((x) => x.status === s).length;
  const dueToday = myServices.filter(
    (s) => isDueToday(s.due_date) && s.status !== "Completed",
  ).length;
  const overdue = myServices.filter((s) => isOverdue(s.due_date, s.status)).length;

  if (role === "Staff") {
    const cards = [
      { label: "Assigned to Me", value: myServices.length, icon: ClipboardList, accent: "bg-primary/10 text-primary" },
      { label: "Pending", value: byStatus("Not Started"), icon: Circle, accent: "bg-muted text-muted-foreground" },
      { label: "In Progress", value: byStatus("In Progress"), icon: Clock, accent: PROGRESS },
      { label: "Completed", value: byStatus("Completed"), icon: CheckCircle2, accent: COMPLETED },
      { label: "Due Today", value: dueToday, icon: CalendarClock, accent: "bg-amber-100 text-amber-700" },
      { label: "Overdue", value: overdue, icon: AlertTriangle, accent: "bg-destructive/10 text-destructive" },
    ];
    return (
  <div className="space-y-8">

    {/* Statistics Cards */}
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((c, index) => (
        <motion.div
          key={c.label}
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: index * 0.08,
          }}
        >
          <StatCard {...c} />
        </motion.div>
      ))}
    </div>

    {/* My Assigned Tasks */}
    {/* <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: 0.5,
      }}
    >
      <MyAssignedTasks
  services={myServices}
  clients={clients}
  employees={employees}
/>
    </motion.div> */}

  </div>
);
  }

  const activeStaff = staff.filter((s) => s.is_active).length;
  const inactiveStaff = staff.length - activeStaff;

  const cards = [
    { label: "Total Companies", value: clients.length, icon: Building2, accent: "bg-primary/10 text-primary" },
    { label: "Client Contacts", value: employees.length, icon: Users, accent: "bg-primary/10 text-primary" },
    ...(role === "Admin"
      ? [
          { label: "Staff Members", value: staff.length, icon: UsersRound, accent: "bg-primary/10 text-primary" },
          { label: "Active Staff", value: activeStaff, icon: UserCheck, accent: "bg-emerald-100 text-emerald-700" },
          { label: "Inactive Staff", value: inactiveStaff, icon: UserX, accent: "bg-muted text-muted-foreground" },
        ]
      : []),
    { label: "Total Services", value: services.length, icon: ClipboardList, accent: "bg-primary/10 text-primary" },
    { label: "Not Started", value: byStatus("Not Started"), icon: Circle, accent: "bg-muted text-muted-foreground" },
    { label: "In Progress", value: byStatus("In Progress"), icon: Clock, accent: PROGRESS },
    { label: "Pending Review", value: byStatus("Pending Review"), icon: Eye, accent: REVIEW },
    { label: "Completed", value: byStatus("Completed"), icon: CheckCircle2, accent: COMPLETED },
    { label: "Due Today", value: dueToday, icon: CalendarClock, accent: "bg-amber-100 text-amber-700" },
    { label: "Overdue", value: overdue, icon: AlertTriangle, accent: "bg-destructive/10 text-destructive" },
  ];

  // Workload by staff (Admin)
  const workload = staff
    .map((s) => ({
      staff: s,
      count: services.filter((x) => x.assigned_staff_id === s.id).length,
    }))
    .sort((a, b) => b.count - a.count);

  const recentCompanies = [...clients]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 5);

  return (
  <div className="space-y-6">

    {/* Dashboard Header */}

    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

      <div>

        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          Dashboard
        </h1>

        <p className="mt-2 text-lg text-slate-500">
          Welcome back 👋 Here's what's happening in your practice today.
        </p>

      </div>

      <div className="rounded-2xl border bg-white px-6 py-4 shadow-sm">

        <p className="text-xs uppercase tracking-wider text-slate-500">
          Today
        </p>

        <h3 className="mt-1 text-lg font-semibold">
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </h3>

      </div>
     
    </div>

    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
  {cards.map((c) => (
    <StatCard key={c.label} {...c} />
  ))}
</div>


{/* Quick Actions */}

<div className="rounded-2xl border bg-white p-6 shadow-sm">
  <div className="mb-5">
    <h2 className="text-xl font-bold">Quick Actions</h2>
    <p className="text-sm text-muted-foreground">
      Frequently used actions
    </p>
  </div>

  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <button 
    onClick={() => {
  window.location.href = "/companies#add-company";
}}
    className="group rounded-2xl border bg-blue-50 p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="text-3xl">🏢</div>
      <h3 className="mt-4 font-semibold">Add Company</h3>
      <p className="mt-1 text-sm text-slate-500">
        Register a new company
      </p>
      
    </button>

    <button
    onClick={() => {
  window.location.href = "/companies";
}} 
className="group rounded-2xl border bg-green-50 p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="text-3xl">👤</div>
      <h3 className="mt-4 font-semibold">Add Contact</h3>
      <p className="mt-1 text-sm text-slate-500">
        Create a client contact
      </p>
    </button>

    <button
     onClick={() => {
  window.location.href = "/companies";
}}
     className="group rounded-2xl border bg-yellow-50 p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="text-3xl">📋</div>
      <h3 className="mt-4 font-semibold">Add Service</h3>
      <p className="mt-1 text-sm text-slate-500">
        Assign a new service
      </p>
    </button>

    <button 
    onClick={() => {
  window.location.href = "/documents";
}}
    className="group rounded-2xl border bg-purple-50 p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="text-3xl">📁</div>
      <h3 className="mt-4 font-semibold">Upload Document</h3>
      <p className="mt-1 text-sm text-slate-500">
        Store client files
      </p>
    </button>
  </div>
</div>
{/* {role === "Manager" && (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <MyAssignedTasks
      services={assignedServices}
      clients={clients}
      employees={employees}
    />
  </motion.div>
)} */}

{role === "Admin" && (
  <div className="grid gap-4 lg:grid-cols-2">

    {/* Workload */}

    <div className="rounded-2xl border bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl">
      <h3 className="mb-5 text-xl font-bold text-slate-900">
        Workload by Staff
      </h3>

      {workload.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No staff yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {workload.slice(0, 6).map(({ staff: s, count }) => {
            const max = workload[0].count || 1;

            return (
              <li key={s.id}>
                <div className="flex items-center justify-between">
                  <span>{s.full_name}</span>
                  <span>{count}</span>
                </div>

                <div className="mt-3 h-3 w-full rounded-full bg-slate-200">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
                    style={{
                      width: `${(count / max) * 100}%`,
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>

    {/* Recent Companies */}

              <div className="rounded-2xl border bg-white p-6 shadow-lg transition-all hover:shadow-xl">
            <h3 className="mb-5 text-xl font-bold text-slate-900">
              Recently Added Companies
            </h3>

            {recentCompanies.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No companies yet.
              </p>
            ) : (
              <ul className="space-y-3">
                {recentCompanies.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between rounded-xl border bg-slate-50 p-4 transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-md"
                  >
                    <div>
                      <h4 className="font-semibold text-slate-900">
                        {c.name}
                      </h4>

                      <p className="mt-1 text-xs text-slate-500">
                        Added on {formatDate(c.created_at)}
                      </p>
                    </div>

                    <div className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                      Company
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
