import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/hooks/useAppData";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/calendar")({
  head: () => ({ meta: [{ title: "Calendar — CA Practice Manager" }] }),
  component: CalendarPage,
});

function CalendarPage() {
  const { services, employees, clients, staff } = useAppData();
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const companyForService = (s: any) => {
    const emp = employees.find((e) => e.id === s.client_contact_id);
    return clients.find((c) => c.id === emp?.company_id)?.name ?? "";
  };

  const monthEvents = useMemo(() => {
    const map = new Map<string, any[]>();
    services.forEach((s) => {
      if (!s.due_date) return;
      const list = map.get(s.due_date) ?? [];
      list.push(s);
      map.set(s.due_date, list);
    });
    return map;
  }, [services]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const monthName = cursor.toLocaleString("default", { month: "long", year: "numeric" });
  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <AppLayout title="Calendar" subtitle="Service due dates & filing deadlines">
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">{monthName}</h3>
          <div className="flex gap-1">
            <Button size="icon" variant="outline" className="h-8 w-8"
              onClick={() => setCursor(new Date(year, month - 1, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="outline" className="h-8 w-8"
              onClick={() => setCursor(new Date(year, month + 1, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="py-1">{d}</div>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (!day) return <div key={i} />;
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const events = monthEvents.get(dateStr) ?? [];
            const isToday = dateStr === todayStr;
            return (
              <div
                key={i}
                className={cn(
                  "min-h-[72px] rounded-lg border border-border p-1 text-left",
                  isToday && "ring-2 ring-primary",
                )}
              >
                <span className="text-xs font-medium text-foreground">{day}</span>
                <div className="mt-0.5 space-y-0.5">
                  {events.slice(0, 3).map((e) => (
                    <div
                      key={e.id}
                      title={`${e.name} — ${companyForService(e)}`}
                      className={cn(
                        "truncate rounded px-1 py-0.5 text-[10px]",
                        e.status === "Completed"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-primary/10 text-primary",
                      )}
                    >
                      {e.name}
                    </div>
                  ))}
                  {events.length > 3 && (
                    <div className="text-[10px] text-muted-foreground">
                      +{events.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
