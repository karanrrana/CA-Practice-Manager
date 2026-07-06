import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { StaffManagement } from "@/components/StaffManagement";

export const Route = createFileRoute("/staff")({
  head: () => ({ meta: [{ title: "Staff — CA Practice Manager" }] }),
  component: StaffPage,
});

function StaffPage() {
  return (
    <AppLayout
      title="Staff Members"
      subtitle="Manage your firm's staff, roles & access"
      allow={["Admin"]}
    >
      <StaffManagement />
    </AppLayout>
  );
}
