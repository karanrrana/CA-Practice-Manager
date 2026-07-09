import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, FileUp, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/EmptyState";
import { useAppData } from "@/hooks/useAppData";
import { useAuth } from "@/context/AuthContext";
import {
  deleteDocument,
  getDocumentUrl,
  logAudit,
  uploadDocument,
} from "@/services/api";
import { formatDateTime } from "@/utils/format";

const CATEGORIES = [
  "PAN Card",
  "GST Certificate",
  "Incorporation Certificate",
  "MOA",
  "AOA",
  "Financial Statements",
  "Bank Details",
  "Other",
];

export const Route = createFileRoute("/documents")({
  head: () => ({ meta: [{ title: "Documents — CA Practice Manager" }] }),
  component: DocumentsPage,
});

function DocumentsPage() {
  const { clients, documents, reload } = useAppData();
  const { canManageContacts, canDeleteCompanies, staffId, username } = useAuth();
  const [companyId, setCompanyId] = useState<string>("");
  const [category, setCategory] = useState("Other");
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(
    () => (companyId ? documents.filter((d) => d.company_id === companyId) : documents),
    [documents, companyId],
  );

  const handleUpload = async (file: File | null) => {
    if (!file) return;
    if (!companyId) return toast.error("Select a company first");
    setBusy(true);
    try {
      await uploadDocument({
        file,
        companyId,
        contactId: null,
        category,
        staffId,
        staffName: username,
      });
      await logAudit(staffId, username, "Document Uploaded", "Group", companyId, {
        file: file.name,
      });
      toast.success("Document uploaded");
      reload();
    } catch (err: any) {
      toast.error(err?.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const view = async (path: string) => {
    const url = await getDocumentUrl(path);
    if (url) window.open(url, "_blank");
    else toast.error("Could not open document");
  };

  return (
    <AppLayout title="Documents" subtitle="Company document storage">
      <div className="space-y-4">
        <div className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Company</label>
            <Select value={companyId} onValueChange={setCompanyId}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Select Group" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {canManageContacts && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Category</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <label className="inline-flex">
                <input
                  type="file"
                  className="hidden"
                  disabled={busy}
                  onChange={(e) => handleUpload(e.target.files?.[0] ?? null)}
                />
                <span className="inline-flex h-10 cursor-pointer items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                  <FileUp className="mr-1 h-4 w-4" /> Upload
                </span>
              </label>
            </>
          )}
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={FileUp}
            title="No documents"
            description="Select a company and upload documents."
          />
        ) : (
          <div className="space-y-2">
            {filtered.map((d) => (
              <div
                key={d.id}
                className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">{d.file_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {d.category || "Other"} · {d.uploaded_by_name || "—"} ·{" "}
                    {formatDateTime(d.created_at)}
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => view(d.file_path)}>
                  <Download className="mr-1 h-3.5 w-3.5" /> View
                </Button>
                {canDeleteCompanies && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={async () => {
                      await deleteDocument(d.id, d.file_path);
                      reload();
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
