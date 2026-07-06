import { useEffect, useState } from "react";
import { Calculator, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { seedAdmin } from "@/lib/staff.functions";

export function Login() {
  const { login, session, profile, ready } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Bootstrap the default admin on first load (idempotent server fn)
    seedAdmin().catch(() => {});
  }, []);

  useEffect(() => {
    if (ready && session && profile) {
      navigate({ to: "/dashboard" });
    }
  }, [ready, session, profile, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.ok) {
      toast.success("Welcome back!");
      navigate({ to: "/dashboard" });
    } else {
      toast.error(res.error || "Invalid email or password");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-lg">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Calculator className="h-6 w-6" />
          </span>
          <h1 className="text-xl font-bold text-foreground">Minocha & Minocha</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Staff sign in to manage your firm
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@practice.local"
                className="pl-9"
                autoFocus
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-9"
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </Button>
        </form>

        <div className="mt-6 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground">Default admin</p>
          <p className="mt-1">admin@practice.local / Admin@123</p>
          <p className="mt-1 italic">You'll be asked to change the password after first login.</p>
        </div>
      </div>
    </div>
  );
}
