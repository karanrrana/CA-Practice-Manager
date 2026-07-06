import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { Dashboard } from "@/components/Dashboard";
import { CardsSkeleton } from "@/components/Skeletons";
import { useAppData } from "@/hooks/useAppData";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — CA Practice Manager" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const { clients, employees, services, staff, comments, loading } = useAppData();
  const { role, staffId } = useAuth();

  const subtitle =
    role === "Staff"
      ? "Your assigned work overview"
      : "Companies, contacts, services & progress overview";

  return (
    <AppLayout title="Dashboard" subtitle={subtitle}>
      {loading || !role ? (
        <CardsSkeleton />
      ) : (
        <Dashboard
          role={role}
          staffId={staffId}
          clients={clients}
          employees={employees}
          services={services}
          staff={staff}
          comments={comments}
        />
      )}
    </AppLayout>
  );
}
