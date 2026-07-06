import type { ReportRow } from "@/types/report";

interface ReportPreviewProps {
  rows: ReportRow[];
}

export function ReportPreview({
  rows,
}: ReportPreviewProps) {
  return (
    <div className="rounded-xl border bg-card p-5">

      <div className="mb-4 flex items-center justify-between">

        <h2 className="text-lg font-semibold">
          Preview
        </h2>

        <span className="text-sm text-muted-foreground">
          {rows.length} Results
        </span>

      </div>

      <table className="w-full text-sm">

        <thead>

          <tr className="border-b">

            <th className="p-2 text-left">Company</th>

            <th className="p-2 text-left">Contact</th>

            <th className="p-2 text-left">Service</th>

            <th className="p-2 text-left">Status</th>

            <th className="p-2 text-left">Due Date</th>

          </tr>

        </thead>

        <tbody>

          {rows.map((row, index) => (

            <tr
              key={index}
              className="border-b"
            >

              <td className="p-2">{row.company}</td>

              <td className="p-2">{row.contact}</td>

              <td className="p-2">{row.service}</td>

              <td className="p-2">{row.status}</td>

              <td className="p-2">{row.dueDate}</td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}