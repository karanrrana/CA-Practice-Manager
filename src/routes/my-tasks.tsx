import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { CardsSkeleton } from "@/components/Skeletons";
import { useAppData } from "@/hooks/useAppData";
import { useAuth } from "@/context/AuthContext";
import MyTasks from "@/components/MyTasks";

export const Route = createFileRoute("/my-tasks")({
  head: () => ({
    meta: [{ title: "My Tasks — CA Practice Manager" }],
  }),
  component: MyTasksPage,
});

function MyTasksPage() {
  const {
    clients,
    employees,
    services,
    loading,
  } = useAppData();

  const { staffId } = useAuth();

  return (
    <AppLayout
      title="My Tasks"
      subtitle="Manage all work assigned to you"
    >
      {loading ? (
        <CardsSkeleton />
      ) : (
        <MyTasks
          staffId={staffId}
          services={services}
          clients={clients}
          employees={employees}
        />
      )}
    </AppLayout>
  );
}