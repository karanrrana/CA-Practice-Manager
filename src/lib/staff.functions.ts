import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const DEFAULT_ADMIN_EMAIL = "admin@practice.local";
const DEFAULT_ADMIN_PASSWORD = "Admin@123";

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase
    .from("staff_profiles")
    .select("role, is_active")
    .eq("auth_user_id", context.userId)
    .maybeSingle();
  if (error) throw new Error("Authorization check failed");
  if (!data || !data.is_active || data.role !== "Admin") {
    throw new Error("Forbidden: admin access required");
  }
}

// ---------- SEED DEFAULT ADMIN (idempotent, bootstrap only) ----------
export const seedAdmin = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { count } = await supabaseAdmin
    .from("staff_profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "Admin")
    .eq("is_active", true);

  if ((count ?? 0) > 0) return { created: false };

  // create or find the auth user
  let userId: string | null = null;
  const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email: DEFAULT_ADMIN_EMAIL,
    password: DEFAULT_ADMIN_PASSWORD,
    email_confirm: true,
  });
  if (createErr) {
    const { data: list } = await supabaseAdmin.auth.admin.listUsers();
    const existing = list?.users?.find((u: any) => u.email === DEFAULT_ADMIN_EMAIL);
    userId = existing?.id ?? null;
  } else {
    userId = created.user?.id ?? null;
  }
  if (!userId) throw new Error("Could not provision admin user");

  await supabaseAdmin.from("staff_profiles").upsert(
    {
      auth_user_id: userId,
      full_name: "Administrator",
      email: DEFAULT_ADMIN_EMAIL,
      role: "Admin",
      designation: "System Administrator",
      is_active: true,
      must_change_password: true,
    },
    { onConflict: "auth_user_id" },
  );

  return { created: true, email: DEFAULT_ADMIN_EMAIL };
});

// ---------- CREATE STAFF ----------
const createStaffSchema = z.object({
  full_name: z.string().min(1).max(120),
  email: z.string().email().max(255),
  phone: z.string().max(20).optional().default(""),
  designation: z.string().max(120).optional().default(""),
  role: z.enum(["Admin", "Manager", "Staff"]),
  password: z.string().min(8).max(72),
});

export const createStaff = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => createStaffSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    });
    if (error) throw new Error(error.message);
    const userId = created.user?.id;
    if (!userId) throw new Error("Failed to create user");

    const { error: profErr } = await supabaseAdmin.from("staff_profiles").insert({
      auth_user_id: userId,
      full_name: data.full_name,
      email: data.email,
      phone: data.phone || null,
      designation: data.designation || null,
      role: data.role,
      is_active: true,
      must_change_password: true,
    });
    if (profErr) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw new Error(profErr.message);
    }
    return { ok: true };
  });

// ---------- UPDATE STAFF ----------
const updateStaffSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().min(1).max(120),
  phone: z.string().max(20).optional().default(""),
  designation: z.string().max(120).optional().default(""),
  role: z.enum(["Admin", "Manager", "Staff"]),
});

export const updateStaff = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => updateStaffSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // protect last admin if downgrading
    if (data.role !== "Admin") {
      const { data: target } = await supabaseAdmin
        .from("staff_profiles")
        .select("role")
        .eq("id", data.id)
        .maybeSingle();
      if (target?.role === "Admin") {
        const { count } = await supabaseAdmin
          .from("staff_profiles")
          .select("id", { count: "exact", head: true })
          .eq("role", "Admin")
          .eq("is_active", true);
        if ((count ?? 0) <= 1) throw new Error("Cannot remove the last active admin");
      }
    }

    const { error } = await supabaseAdmin
      .from("staff_profiles")
      .update({
        full_name: data.full_name,
        phone: data.phone || null,
        designation: data.designation || null,
        role: data.role,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- TOGGLE ACTIVE ----------
export const setStaffActive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid(), is_active: z.boolean() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (!data.is_active) {
      const { data: target } = await supabaseAdmin
        .from("staff_profiles")
        .select("role")
        .eq("id", data.id)
        .maybeSingle();
      if (target?.role === "Admin") {
        const { count } = await supabaseAdmin
          .from("staff_profiles")
          .select("id", { count: "exact", head: true })
          .eq("role", "Admin")
          .eq("is_active", true);
        if ((count ?? 0) <= 1) throw new Error("Cannot disable the last active admin");
      }
    }

    const { error } = await supabaseAdmin
      .from("staff_profiles")
      .update({ is_active: data.is_active })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- DELETE STAFF ----------
export const deleteStaff = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: target } = await supabaseAdmin
      .from("staff_profiles")
      .select("auth_user_id, role")
      .eq("id", data.id)
      .maybeSingle();
    if (!target) throw new Error("Staff not found");
    if (target.role === "Admin") {
      const { count } = await supabaseAdmin
        .from("staff_profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "Admin")
        .eq("is_active", true);
      if ((count ?? 0) <= 1) throw new Error("Cannot delete the last active admin");
    }

    await supabaseAdmin.from("staff_profiles").delete().eq("id", data.id);
    if (target.auth_user_id) {
      await supabaseAdmin.auth.admin.deleteUser(target.auth_user_id);
    }
    return { ok: true };
  });

// ---------- RESET PASSWORD ----------
export const resetStaffPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid(), password: z.string().min(8).max(72) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: target } = await supabaseAdmin
      .from("staff_profiles")
      .select("auth_user_id")
      .eq("id", data.id)
      .maybeSingle();
    if (!target?.auth_user_id) throw new Error("Staff not found");

    const { error } = await supabaseAdmin.auth.admin.updateUserById(target.auth_user_id, {
      password: data.password,
    });
    if (error) throw new Error(error.message);
    await supabaseAdmin
      .from("staff_profiles")
      .update({ must_change_password: true })
      .eq("id", data.id);
    return { ok: true };
  });

// ---------- CHANGE OWN PASSWORD (clears must_change flag) ----------
export const completePasswordChange = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await context.supabase
      .from("staff_profiles")
      .update({ must_change_password: false })
      .eq("auth_user_id", context.userId);
    return { ok: true };
  });
