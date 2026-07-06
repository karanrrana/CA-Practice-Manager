import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ScrollText } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { EmptyState } from "@/components/EmptyState";
import { supabase } from "@/integrations/supabase/client";
import { formatDateTime } from "@/utils/format";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — CA Practice Manager" }] }),
  component: SettingsPage,
});

interface AuditRow {
  id: string;
  actor_name: string | null;
  action: string;
  entity: string;
  created_at: string;
}

const db = supabase as unknown as { from: (t: string) => any };

function SettingsPage() {
  const [logs, setLogs] = useState<AuditRow[]>([]);

  useEffect(() => {
    db.from("audit_logs")
      .select("id, actor_name, action, entity, created_at")
      .order("created_at", { ascending: false })
      .limit(100)
      .then(({ data }: { data: AuditRow[] | null }) => setLogs(data ?? []));
  }, []);

  return (
    <AppLayout title="Settings" subtitle="System settings & audit trail" allow={["Admin"]}>
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
          <ScrollText className="h-4 w-4" /> Audit Logs
        </h3>
        {logs.length === 0 ? (
          <EmptyState
            icon={ScrollText}
            title="No audit entries"
            description="Sensitive actions will be recorded here."
          />
        ) : (
          <ul className="divide-y divide-border">
            {logs.map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-4 py-2 text-sm">
                <div>
                  <span className="font-medium text-foreground">{l.action}</span>{" "}
                  <span className="text-muted-foreground">on {l.entity}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {l.actor_name || "System"} · {formatDateTime(l.created_at)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppLayout>
  );
}
