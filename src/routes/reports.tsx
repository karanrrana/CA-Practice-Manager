import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, FileDown } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { ReportToolbar } from "@/components/reports/ReportToolbar";
import { ReportFilters } from "@/components/reports/ReportFilters";
import { ReportPreview } from "@/components/reports/ReportPreview";
import { generateReportPdf } from "@/utils/reportPdf";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppData } from "@/hooks/useAppData";
import { useAuth } from "@/context/AuthContext";
import { exportServicesCsv, generateCompanyReport } from "@/utils/pdf";
import { formatDate } from "@/utils/format";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports — CA Practice Manager" }] }),
  component: ReportsPage,
});

function ReportsPage() {
  const { clients, employees, services, staff } = useAppData();
  const { username } = useAuth();
  const [reportType, setReportType] =
  useState("Company");

const [filter, setFilter] =
  useState("");

const [companyId, setCompanyId] =
  useState("all");

  const staffName = (id: string | null) =>
    id ? staff.find((s) => s.id === id)?.full_name ?? "—" : "—";

  const decorate = (s: any) => ({ ...s, assigned_to: staffName(s.assigned_staff_id) });
  const uniqueServices = [
  ...new Set(
    services.map((s) => s.name)
  ),
].sort();

  const buildRows = () => {

  const empById = new Map(
    employees.map((e) => [e.id, e])
  );

  const companyById = new Map(
    clients.map((c) => [c.id, c])
  );

  return services
    .filter((s) => {

      const emp = empById.get(
        s.client_contact_id
      );

      const company = emp
        ? companyById.get(emp.company_id)
        : undefined;

      if (
        reportType === "Company"
      ) {

        if (
          companyId === "all"
        )
          return true;

        return (
          company?.id === companyId
        );

      }

      if (
        reportType === "Status"
      ) {

        return (
          s.status === filter
        );

      }

      if (
        reportType === "Service"
      ) {

        return (
          s.name === filter
        );

      }

      return true;

    })

    .map((s) => {

      const emp = empById.get(
        s.client_contact_id
      );

      const company = emp
        ? companyById.get(emp.company_id)
        : undefined;

      return {

        company:
          company?.name ?? "",

        contact:
          emp?.name ?? "",

        service:
          s.name,

        assignedTo:
          staffName(
            s.assigned_staff_id
          ),

        status:
          s.status,

        dueDate:
          formatDate(
            s.due_date
          ),

        recurring:
          s.is_recurring,

        recurrence:
          s.recurrence,

      };

    });

};

  const downloadPdf = () => {
    const targets = companyId === "all" ? clients : clients.filter((c) => c.id === companyId);
    targets.forEach((company) => {
      const emps = employees.filter((e) => e.company_id === company.id);
      const empIds = emps.map((e) => e.id);
      const svcs = services
        .filter((s) => empIds.includes(s.client_contact_id))
        .map(decorate);
      if (svcs.length > 0) generateCompanyReport(company, emps, svcs, username);
    });
  };

 return (
  <AppLayout
    title="Reports"
    subtitle="Generate work reports & export data"
  >
    <div className="space-y-6">

      {/* Report Type */}

      <ReportToolbar
        reportType={reportType}
        setReportType={setReportType}
      />

      {/* Filters */}

      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">

        {reportType === "Company" ? (

          <div className="space-y-2">

            <label className="text-sm font-medium">
              Company
            </label>

            <Select
              value={companyId}
              onValueChange={setCompanyId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Company" />
              </SelectTrigger>

              <SelectContent>

                <SelectItem value="all">
                  All Companies
                </SelectItem>

                {clients.map((company) => (

                  <SelectItem
                    key={company.id}
                    value={company.id}
                  >
                    {company.name}
                  </SelectItem>

                ))}

              </SelectContent>

            </Select>

          </div>

        ) : (

          <ReportFilters
            reportType={reportType}
            filter={filter}
            setFilter={setFilter}
            services={uniqueServices}
          />

        )}

      </div>

      {/* Preview */}

      <ReportPreview
        rows={buildRows()}
      />

      {/* Export Buttons */}

      <div className="flex flex-wrap gap-3">

        <Button
  onClick={() =>
    generateReportPdf(
      `${reportType} Report`,
      buildRows(),
      username,
    )
  }
>
          <FileDown className="mr-2 h-4 w-4" />

          Export PDF

        </Button>

        <Button
          variant="outline"
          onClick={() =>
            exportServicesCsv(buildRows())
          }
        >
          <Download className="mr-2 h-4 w-4" />

          Export CSV

        </Button>

      </div>

    </div>

  </AppLayout>
);
}
