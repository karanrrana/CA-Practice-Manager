import { Button } from "@/components/ui/button";

interface ReportToolbarProps {
  reportType: string;
  setReportType: (value: string) => void;
}

export function ReportToolbar({
  reportType,
  setReportType,
}: ReportToolbarProps) {
  return (
    <div className="rounded-xl border bg-card p-5">

      <h2 className="mb-4 text-lg font-semibold">
        Generate Report
      </h2>

      <div className="flex flex-wrap gap-3">

        {[
          "Company",
          "Status",
          "Service",
        ].map((type) => (

          <Button
            key={type}
            variant={
              reportType === type
                ? "default"
                : "outline"
            }
            onClick={() => setReportType(type)}
          >
            {type}
          </Button>

        ))}

      </div>

    </div>
  );
}