import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Role, StaffProfile } from "@/types";

interface AuthContextValue {
  session: Session | null;
  profile: StaffProfile | null;
  ready: boolean;
  role: Role | null;
  isAdmin: boolean;
  isManager: boolean;
  canManageCompanies: boolean; // Admin or Manager
  canDeleteCompanies: boolean; // Admin
  canManageContacts: boolean; // Admin or Manager
  canManageStaff: boolean; // Admin
  username: string;
  staffId: string | null;
  mustChangePassword: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const db = supabase as unknown as { from: (t: string) => any };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [ready, setReady] = useState(false);
  const lastLoginStamped = useRef<string | null>(null);

  const loadProfile = useCallback(async (userId: string) => {
    const { data } = await db
      .from("staff_profiles")
      .select("*")
      .eq("auth_user_id", userId)
      .maybeSingle();
    setProfile((data as StaffProfile) ?? null);
    return data as StaffProfile | null;
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        setTimeout(() => {
          loadProfile(newSession.user.id);
          if (lastLoginStamped.current !== newSession.user.id) {
            lastLoginStamped.current = newSession.user.id;
            db.from("staff_profiles")
              .update({ last_login_at: new Date().toISOString() })
              .eq("auth_user_id", newSession.user.id);
          }
        }, 0);
      } else {
        setProfile(null);
      }
    });

    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      if (data.session?.user) await loadProfile(data.session.user.id);
      setReady(true);
    });

    return () => sub.subscription.unsubscribe();
  }, [loadProfile]);

  const login = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) return { ok: false, error: error.message };
      if (data.user) {
        const prof = await loadProfile(data.user.id);
        if (!prof || !prof.is_active) {
          await supabase.auth.signOut();
          return { ok: false, error: "Account is inactive or not a staff member." };
        }
      }
      return { ok: true };
    },
    [loadProfile],
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (session?.user) await loadProfile(session.user.id);
  }, [session, loadProfile]);

  const role = profile?.role ?? null;

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      profile,
      ready,
      role,
      isAdmin: role === "Admin",
      isManager: role === "Manager",
      canManageCompanies: role === "Admin" || role === "Manager",
      canDeleteCompanies: role === "Admin",
      canManageContacts: role === "Admin" || role === "Manager",
      canManageStaff: role === "Admin",
      username: profile?.full_name ?? session?.user?.email ?? "User",
      staffId: profile?.id ?? null,
      mustChangePassword: !!profile?.must_change_password,
      login,
      logout,
      refreshProfile,
    }),
    [session, profile, ready, role, login, logout, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
