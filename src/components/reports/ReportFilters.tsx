interface ReportFiltersProps {

  reportType: string;

  filter: string;

  setFilter: (value: string) => void;

  services: string[];

}

export function ReportFilters({

  reportType,

  filter,

  setFilter,

  services,

}: ReportFiltersProps) {

  let options: string[] = [];

  if (reportType === "Status") {

    options = [

      "Not Started",

      "In Progress",

      "Pending Review",

      "Completed",

    ];

  }

  if (reportType === "Service") {

    options = services;

  }

  return (

    <div className="rounded-xl border bg-card p-5">

      <h2 className="mb-3 text-lg font-semibold">

        Filters

      </h2>

      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="w-full rounded-lg border p-2"
      >

        <option value="">
          Select...
        </option>

        {options.map((o) => (

          <option
            key={o}
            value={o}
          >
            {o}
          </option>

        ))}

      </select>

    </div>

  );

}