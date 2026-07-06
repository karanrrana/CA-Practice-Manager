import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { KeyRound, Mail, Shield, User } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatDateTime } from "@/utils/format";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — CA Practice Manager" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { profile, role } = useAuth();
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  const changePw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.length < 8) return toast.error("Password must be at least 8 characters");
    if (pw !== confirm) return toast.error("Passwords do not match");
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pw });
      if (error) throw error;
      toast.success("Password updated");
      setPw("");
      setConfirm("");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update password");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppLayout title="Profile" subtitle="Your account details">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Account</h3>
          <dl className="space-y-3 text-sm">
            <Row icon={User} label="Name" value={profile?.full_name ?? "—"} />
            <Row icon={Mail} label="Email" value={profile?.email ?? "—"} />
            <Row icon={Shield} label="Role" value={role ?? "—"} />
            <Row
              icon={User}
              label="Designation"
              value={profile?.designation ?? "—"}
            />
            <Row
              icon={User}
              label="Last Login"
              value={profile?.last_login_at ? formatDateTime(profile.last_login_at) : "—"}
            />
          </dl>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
            <KeyRound className="h-4 w-4" /> Change Password
          </h3>
          <form onSubmit={changePw} className="space-y-4">
            <div className="space-y-1.5">
              <Label>New Password</Label>
              <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Confirm Password</Label>
              <Input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={busy}>
              Update Password
            </Button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" /> {label}
      </dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  );
}
