import { useState, type ReactNode } from "react";
import { Navigate } from "@tanstack/react-router";
import { KeyRound } from "lucide-react";
import { toast } from "sonner";
import { Sidebar, MobileSidebar } from "@/components/Sidebar";
import { NotificationBell } from "@/components/NotificationBell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { completePasswordChange } from "@/lib/staff.functions";
import type { Role } from "@/types";

function ForcePasswordChange() {
  const { refreshProfile } = useAuth();
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.length < 8) return toast.error("Password must be at least 8 characters");
    if (pw !== confirm) return toast.error("Passwords do not match");
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pw });
      if (error) throw error;
      await completePasswordChange();
      await refreshProfile();
      toast.success("Password updated");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update password");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-lg">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <KeyRound className="h-6 w-6" />
          </span>
          <h1 className="text-xl font-bold text-foreground">Change your password</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            For security, set a new password before continuing.
          </p>
        </div>
        <form onSubmit={submit} className="space-y-4">
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
          <Button type="submit" className="w-full" disabled={busy}>
            Update Password
          </Button>
        </form>
      </div>
    </div>
  );
}

export function AppLayout({
  title,
  subtitle,
  allow,
  children,
}: {
  title: string;
  subtitle?: string;
  allow?: Role[];
  children: ReactNode;
}) {
  const { ready, session, profile, role, mustChangePassword } = useAuth();

  if (!ready) return <div className="min-h-screen bg-muted/40" />;
  if (!session || !profile) return <Navigate to="/login" />;
  if (mustChangePassword) return <ForcePasswordChange />;
  if (allow && role && !allow.includes(role)) return <Navigate to="/access-denied" />;

  return (
    <div className="flex min-h-screen bg-muted/40">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-card/80 px-4 py-3 backdrop-blur md:px-6">
          <MobileSidebar />
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">{title}</h1>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <NotificationBell />
        </header>
        <main className="flex-1 space-y-6 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
