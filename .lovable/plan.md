## Goal

Transform the current single-page, localStorage-auth app into a professionally routed CA Practice Management System using Supabase Auth (Staff log in), Client Contacts (never log in), and role-based access enforced by RLS — while preserving the existing UI, theme, sidebar, dashboard cards, and all current features.

## Terminology

- Company = client (unchanged)
- Employee → **Client Contact** (renamed everywhere)
- New separate module: **Staff Members** (our firm's people; the only ones who log in)

## Database Changes

1. **Rename & extend contacts**: rename `employees` → `client_contacts`, preserving all rows and the services link. Add optional fields: `department`, `pan_number`, `aadhaar_number`, `notes`. Keep `company_id`.
2. **`app_role` enum**: `Admin`, `Staff`.
3. **`staff_profiles`** table: `id`, `auth_user_id` (FK → auth.users, ON DELETE CASCADE), `full_name`, `email`, `phone`, `role`, `designation`, `is_active`, `last_login_at`, `created_at`, `updated_at`.
4. **`has_role()`** SECURITY DEFINER function (reads staff_profiles) to avoid RLS recursion + an `is_active_staff()` helper.
5. **`services` changes**: drop text `assigned_to`; add `assigned_staff_id` (FK → staff_profiles, ON DELETE SET NULL) and `created_by_staff_id` (FK → staff_profiles, ON DELETE SET NULL). Keep `completed_at` trigger.
6. **`service_activity`** table (timeline): `service_id`, `actor_staff_id`, `action` (created/assigned/status_changed/completed/comment_added), `detail`, `created_at`.
7. **GRANTs + RLS** on every table:
   - Admin → full access via `has_role(uid,'Admin')`.
   - Staff → read companies/contacts; insert/update services + comments + activity; cannot delete companies/contacts or touch staff_profiles.
   - `staff_profiles`: each staff reads own row; Admin manages all.
8. **Seed default admin** via a secure server-side step (Supabase Auth Admin API) — `admin@cafirm.com` with a temporary password, auto-confirmed, with an `Admin` staff_profile. Auto-confirm enabled; public signup disabled.

## Auth

- Replace hardcoded `AuthContext` with Supabase Auth (email/password, `persistSession`).
- `onAuthStateChange` wired once in `__root.tsx`; update `last_login_at` on sign-in.
- Bearer middleware already present in `src/start.ts`.

## Routes (new, role-protected, shared sidebar/layout)

```
/login                      public
/_authenticated/            gate (redirect to /login)
  dashboard                 Admin + Staff (role-specific content)
  companies                 Admin + Staff (Staff read-only on company/contact)
  staff                     Admin only
  reports                   Admin + Staff
  profile                   Admin + Staff
  settings                  Admin only
/access-denied              shown when role lacks access
```

Sidebar shows links filtered by role; layout/theme unchanged.

## Server Functions (privileged, role-checked)

- Staff CRUD: create (Auth Admin createUser + profile), edit, enable/disable, delete, reset password, assign role — all verify caller is Admin via `has_role`.
- Active-staff dropdown source for service assignment.
- Seed admin (idempotent, admin-guarded after first run).

## UI Work (preserve design)

- **Dashboard**: keep existing card grid. Admin sees Companies / Client Contacts / Staff / Services / Completed / Pending / In Progress / Due Today / Overdue / Inactive Staff. Staff sees: My Assigned / Pending / Completed / Due Today / Overdue + Recent Comments.
- **Companies page**: existing Company → Client Contact → Service → Comments nesting. Rename labels to "Client Contact". Add new optional contact fields to `ClientContactForm`. Staff: hide add/edit/delete on company & contact; keep service + comment actions.
- **Service form**: replace free-text "Assigned to" with **Assigned Staff** dropdown (active staff). Store `created_by_staff_id` automatically.
- **Activity timeline**: per-service list (created/assigned/status/comment/completed) with timestamps.
- **Staff Management page** (Admin): table (Name, Email, Phone, Role, Status, Last Login) + add/edit/disable/enable/delete/reset-password/assign-role dialogs.
- **Search/Filters**: extend to contacts (name/email/phone/PAN/Aadhaar), staff (name/email), and service filters by Company / Client Contact / Assigned Staff / Status / Due Date / Name.
- **PDF report**: group by Client Contact (rename), keep generation.

## Type & API layer

- Update `src/types`, `src/lib/validation.ts` (contact + staff schemas), `src/services/api.ts` (rename employees→clientContacts, add staff + activity APIs), `src/hooks/useAppData.ts`.

## Technical Notes

- RLS uses SECURITY DEFINER `has_role` to prevent recursion.
- Staff creation uses the Auth Admin API inside an Admin-guarded server function (never client-side); passwords never stored manually.
- `assigned_staff_id`/`created_by_staff_id` use ON DELETE SET NULL so deleting staff doesn't destroy service history.
- Data migration backfills `created_by_staff_id` = seeded admin for existing services.

## Default credentials (after build)

`admin@cafirm.com` / temporary password — shared with you to log in and create the rest of the staff; you should change it immediately.