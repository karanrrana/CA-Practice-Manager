import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  KeyRound,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import { useAppData } from "@/hooks/useAppData";
import { useAuth } from "@/context/AuthContext";
import { logAudit } from "@/services/api";
import { staffSchema, type StaffFormValues } from "@/lib/validation";
import { formatDateTime } from "@/utils/format";
import type { StaffProfile } from "@/types";
import {
  createStaff,
  deleteStaff,
  resetStaffPassword,
  setStaffActive,
  updateStaff,
} from "@/lib/staff.functions";

export function StaffManagement() {
  const { staff, reload } = useAppData();
  const { staffId, username } = useAuth();
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState<StaffProfile | null>(null);
  const [pwTarget, setPwTarget] = useState<StaffProfile | null>(null);
  const [pwValue, setPwValue] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<StaffProfile | null>(null);
  const [busy, setBusy] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<StaffFormValues>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      designation: "",
      role: "Staff",
      password: "",
    },
  });

  useEffect(() => {
    if (dialog) {
      reset({
        full_name: editing?.full_name ?? "",
        email: editing?.email ?? "",
        phone: editing?.phone ?? "",
        designation: editing?.designation ?? "",
        role: editing?.role ?? "Staff",
        password: "",
      });
    }
  }, [dialog, editing, reset]);

  const filtered = staff.filter(
    (s) =>
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()),
  );

  const onSubmit = async (values: StaffFormValues) => {
    setBusy(true);
    try {
      if (editing) {
        await updateStaff({
          data: {
            id: editing.id,
            full_name: values.full_name,
            phone: values.phone,
            designation: values.designation,
            role: values.role,
          },
        });
        if (editing.role !== values.role) {
          await logAudit(staffId, username, "Role Changed", "staff", editing.id, {
            from: editing.role,
            to: values.role,
          });
        }
        toast.success("Staff updated");
      } else {
        if (!values.password || values.password.length < 8) {
          toast.error("Password must be at least 8 characters");
          setBusy(false);
          return;
        }
        await createStaff({
          data: {
            full_name: values.full_name,
            email: values.email,
            phone: values.phone,
            designation: values.designation,
            role: values.role,
            password: values.password,
          },
        });
        await logAudit(staffId, username, "Staff Created", "staff", null, {
          email: values.email,
        });
        toast.success("Staff member added");
      }
      setDialog(false);
      setEditing(null);
      reload();
    } catch (err: any) {
      toast.error(err?.message || "Operation failed");
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (s: StaffProfile) => {
    setBusy(true);
    try {
      await setStaffActive({ data: { id: s.id, is_active: !s.is_active } });
      toast.success(s.is_active ? "Staff disabled" : "Staff enabled");
      reload();
    } catch (err: any) {
      toast.error(err?.message || "Operation failed");
    } finally {
      setBusy(false);
    }
  };

  const doReset = async () => {
    if (!pwTarget) return;
    if (pwValue.length < 8) return toast.error("Password must be at least 8 characters");
    setBusy(true);
    try {
      await resetStaffPassword({ data: { id: pwTarget.id, password: pwValue } });
      await logAudit(staffId, username, "Password Reset", "staff", pwTarget.id);
      toast.success("Password reset");
      setPwTarget(null);
      setPwValue("");
    } catch (err: any) {
      toast.error(err?.message || "Operation failed");
    } finally {
      setBusy(false);
    }
  };

  const doDelete = async () => {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      await deleteStaff({ data: { id: deleteTarget.id } });
      await logAudit(staffId, username, "Staff Deleted", "staff", deleteTarget.id);
      toast.success("Staff deleted");
      setDeleteTarget(null);
      reload();
    } catch (err: any) {
      toast.error(err?.message || "Operation failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search staff by name or email…"
          className="max-w-xs"
        />
        <Button
          onClick={() => {
            setEditing(null);
            setDialog(true);
          }}
        >
          <Plus className="mr-1 h-4 w-4" /> Add Staff
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={ShieldCheck} title="No staff members" description="Add your first staff member." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.full_name}</TableCell>
                  <TableCell>{s.email}</TableCell>
                  <TableCell>{s.phone || "—"}</TableCell>
                  <TableCell>{s.designation || "—"}</TableCell>
                  <TableCell>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {s.role}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        s.is_active
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {s.is_active ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {s.last_login_at ? formatDateTime(s.last_login_at) : "Never"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        title="Edit"
                        onClick={() => {
                          setEditing(s);
                          setDialog(true);
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        title="Reset password"
                        onClick={() => {
                          setPwTarget(s);
                          setPwValue("");
                        }}
                      >
                        <KeyRound className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        title={s.is_active ? "Disable" : "Enable"}
                        onClick={() => toggleActive(s)}
                      >
                        {s.is_active ? (
                          <UserX className="h-3.5 w-3.5" />
                        ) : (
                          <UserCheck className="h-3.5 w-3.5" />
                        )}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        title="Delete"
                        onClick={() => setDeleteTarget(s)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add / Edit dialog */}
      <Dialog open={dialog} onOpenChange={(v) => { setDialog(v); if (!v) setEditing(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Staff Member" : "Add Staff Member"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input {...register("full_name")} placeholder="Jane Doe" />
              {errors.full_name && (
                <p className="text-xs text-destructive">{errors.full_name.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input {...register("email")} placeholder="jane@practice.local" disabled={!!editing} />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input {...register("phone")} placeholder="9876543210" />
              </div>
              <div className="space-y-1.5">
                <Label>Designation</Label>
                <Input {...register("designation")} placeholder="Senior Accountant" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="Staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            {!editing && (
              <div className="space-y-1.5">
                <Label>Temporary Password</Label>
                <Input type="text" {...register("password")} placeholder="Min 8 characters" />
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialog(false)} disabled={busy}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {editing ? "Save Changes" : "Add Staff"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reset password dialog */}
      <Dialog open={!!pwTarget} onOpenChange={(v) => !v && setPwTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Set a new temporary password for {pwTarget?.full_name}. They'll be asked to
              change it on next login.
            </p>
            <Input
              type="text"
              value={pwValue}
              onChange={(e) => setPwValue(e.target.value)}
              placeholder="New password (min 8 chars)"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPwTarget(null)} disabled={busy}>
              Cancel
            </Button>
            <Button onClick={doReset} disabled={busy}>
              Reset Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete staff member"
        description="This permanently removes their login and profile. This cannot be undone."
        confirmLabel="Delete"
        onConfirm={doDelete}
        loading={busy}
      />
    </section>
  );
}
