import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { ClientList } from "@/components/ClientList";

export const Route = createFileRoute("/companies")({
  head: () => ({ meta: [{ title: "Companies — CA Practice Manager" }] }),
  component: CompaniesPage,
});

function CompaniesPage() {
  return (
    <AppLayout title="Companies" subtitle="Manage companies, client contacts & services">
      <ClientList />
    </AppLayout>
  );
}
