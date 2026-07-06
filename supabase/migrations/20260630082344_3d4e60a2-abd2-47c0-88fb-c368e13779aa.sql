-- =========================================================
-- CA Practice Management System: production architecture
-- =========================================================

-- ---------- ENUMS ----------
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('Admin', 'Manager', 'Staff');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.company_status AS ENUM ('Active', 'Inactive', 'Archived');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ---------- RENAME employees -> client_contacts ----------
ALTER TABLE public.employees RENAME TO client_contacts;

ALTER TABLE public.client_contacts
  ADD COLUMN IF NOT EXISTS department text,
  ADD COLUMN IF NOT EXISTS pan_number text,
  ADD COLUMN IF NOT EXISTS aadhaar_number text,
  ADD COLUMN IF NOT EXISTS notes text;

-- rename services.employee_id -> client_contact_id
ALTER TABLE public.services RENAME COLUMN employee_id TO client_contact_id;

-- ---------- COMPANIES (clients) extra fields ----------
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS status public.company_status NOT NULL DEFAULT 'Active',
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}';

-- ---------- STAFF PROFILES ----------
CREATE TABLE public.staff_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  designation text,
  role public.app_role NOT NULL DEFAULT 'Staff',
  is_active boolean NOT NULL DEFAULT true,
  must_change_password boolean NOT NULL DEFAULT false,
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff_profiles TO authenticated;
GRANT ALL ON public.staff_profiles TO service_role;

-- ---------- ROLES / PERMISSIONS (future RBAC) ----------
CREATE TABLE public.roles (
  name public.app_role PRIMARY KEY,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.roles TO authenticated;
GRANT ALL ON public.roles TO service_role;

CREATE TABLE public.permissions (
  key text PRIMARY KEY,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.permissions TO authenticated;
GRANT ALL ON public.permissions TO service_role;

CREATE TABLE public.role_permissions (
  role public.app_role NOT NULL REFERENCES public.roles(name) ON DELETE CASCADE,
  permission_key text NOT NULL REFERENCES public.permissions(key) ON DELETE CASCADE,
  PRIMARY KEY (role, permission_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.role_permissions TO authenticated;
GRANT ALL ON public.role_permissions TO service_role;

-- ---------- SERVICES: staff FKs ----------
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS assigned_staff_id uuid REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS supporting_staff_id uuid REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS created_by_staff_id uuid REFERENCES public.staff_profiles(id) ON DELETE SET NULL;
ALTER TABLE public.services DROP COLUMN IF EXISTS assigned_to;

-- ---------- SERVICE ACTIVITY ----------
CREATE TABLE public.service_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  actor_staff_id uuid REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
  actor_name text,
  action text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_activity TO authenticated;
GRANT ALL ON public.service_activity TO service_role;

-- ---------- AUDIT LOGS (immutable) ----------
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_staff_id uuid REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
  actor_name text,
  action text NOT NULL,
  entity text,
  entity_id uuid,
  detail jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;

-- ---------- DOCUMENTS ----------
CREATE TABLE public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES public.client_contacts(id) ON DELETE CASCADE,
  service_id uuid REFERENCES public.services(id) ON DELETE CASCADE,
  category text,
  file_name text NOT NULL,
  file_type text,
  file_path text NOT NULL,
  file_url text,
  uploaded_by_staff_id uuid REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
  uploaded_by_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO authenticated;
GRANT ALL ON public.documents TO service_role;

-- ---------- SERVICE TEMPLATES ----------
CREATE TABLE public.service_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  items jsonb NOT NULL DEFAULT '[]',
  created_by_staff_id uuid REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_templates TO authenticated;
GRANT ALL ON public.service_templates TO service_role;

-- ---------- NOTIFICATIONS ----------
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_staff_id uuid NOT NULL REFERENCES public.staff_profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  link text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

-- =========================================================
-- HELPER FUNCTIONS (SECURITY DEFINER)
-- =========================================================
CREATE OR REPLACE FUNCTION public.current_staff_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM public.staff_profiles
  WHERE auth_user_id = auth.uid() AND is_active = true LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.has_role(_role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.staff_profiles
    WHERE auth_user_id = auth.uid() AND role = _role AND is_active = true
  )
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role('Admin')
$$;

CREATE OR REPLACE FUNCTION public.is_manager_or_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role('Admin') OR public.has_role('Manager')
$$;

CREATE OR REPLACE FUNCTION public.is_active_staff()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.staff_profiles
    WHERE auth_user_id = auth.uid() AND is_active = true
  )
$$;

-- =========================================================
-- RLS
-- =========================================================
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- COMPANIES
CREATE POLICY "staff view companies" ON public.clients FOR SELECT TO authenticated USING (public.is_active_staff());
CREATE POLICY "mgr insert companies" ON public.clients FOR INSERT TO authenticated WITH CHECK (public.is_manager_or_admin());
CREATE POLICY "mgr update companies" ON public.clients FOR UPDATE TO authenticated USING (public.is_manager_or_admin()) WITH CHECK (public.is_manager_or_admin());
CREATE POLICY "admin delete companies" ON public.clients FOR DELETE TO authenticated USING (public.is_admin());

-- CLIENT CONTACTS
CREATE POLICY "staff view contacts" ON public.client_contacts FOR SELECT TO authenticated USING (public.is_active_staff());
CREATE POLICY "mgr insert contacts" ON public.client_contacts FOR INSERT TO authenticated WITH CHECK (public.is_manager_or_admin());
CREATE POLICY "mgr update contacts" ON public.client_contacts FOR UPDATE TO authenticated USING (public.is_manager_or_admin()) WITH CHECK (public.is_manager_or_admin());
CREATE POLICY "mgr delete contacts" ON public.client_contacts FOR DELETE TO authenticated USING (public.is_manager_or_admin());

-- SERVICES
CREATE POLICY "staff view services" ON public.services FOR SELECT TO authenticated USING (public.is_active_staff());
CREATE POLICY "staff insert services" ON public.services FOR INSERT TO authenticated WITH CHECK (public.is_active_staff());
CREATE POLICY "staff update services" ON public.services FOR UPDATE TO authenticated USING (public.is_active_staff()) WITH CHECK (public.is_active_staff());
CREATE POLICY "mgr delete services" ON public.services FOR DELETE TO authenticated USING (public.is_manager_or_admin());

-- COMMENTS (immutable)
CREATE POLICY "staff view comments" ON public.comments FOR SELECT TO authenticated USING (public.is_active_staff());
CREATE POLICY "staff insert comments" ON public.comments FOR INSERT TO authenticated WITH CHECK (public.is_active_staff());

-- STAFF PROFILES
CREATE POLICY "staff view profiles" ON public.staff_profiles FOR SELECT TO authenticated USING (public.is_active_staff() OR auth_user_id = auth.uid());
CREATE POLICY "self update profile" ON public.staff_profiles FOR UPDATE TO authenticated USING (auth_user_id = auth.uid() OR public.is_admin()) WITH CHECK (auth_user_id = auth.uid() OR public.is_admin());
CREATE POLICY "admin insert profiles" ON public.staff_profiles FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "admin delete profiles" ON public.staff_profiles FOR DELETE TO authenticated USING (public.is_admin());

-- ROLES / PERMISSIONS
CREATE POLICY "staff view roles" ON public.roles FOR SELECT TO authenticated USING (public.is_active_staff());
CREATE POLICY "admin manage roles" ON public.roles FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "staff view perms" ON public.permissions FOR SELECT TO authenticated USING (public.is_active_staff());
CREATE POLICY "admin manage perms" ON public.permissions FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "staff view roleperms" ON public.role_permissions FOR SELECT TO authenticated USING (public.is_active_staff());
CREATE POLICY "admin manage roleperms" ON public.role_permissions FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- SERVICE ACTIVITY
CREATE POLICY "staff view activity" ON public.service_activity FOR SELECT TO authenticated USING (public.is_active_staff());
CREATE POLICY "staff insert activity" ON public.service_activity FOR INSERT TO authenticated WITH CHECK (public.is_active_staff());

-- AUDIT LOGS (immutable: no update/delete)
CREATE POLICY "mgr view audit" ON public.audit_logs FOR SELECT TO authenticated USING (public.is_manager_or_admin());
CREATE POLICY "staff insert audit" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (public.is_active_staff());

-- DOCUMENTS
CREATE POLICY "staff view documents" ON public.documents FOR SELECT TO authenticated USING (public.is_active_staff());
CREATE POLICY "staff insert documents" ON public.documents FOR INSERT TO authenticated WITH CHECK (public.is_active_staff());
CREATE POLICY "mgr delete documents" ON public.documents FOR DELETE TO authenticated USING (public.is_manager_or_admin());

-- SERVICE TEMPLATES
CREATE POLICY "staff view templates" ON public.service_templates FOR SELECT TO authenticated USING (public.is_active_staff());
CREATE POLICY "mgr manage templates" ON public.service_templates FOR ALL TO authenticated USING (public.is_manager_or_admin()) WITH CHECK (public.is_manager_or_admin());

-- NOTIFICATIONS
CREATE POLICY "own view notifications" ON public.notifications FOR SELECT TO authenticated USING (recipient_staff_id = public.current_staff_id());
CREATE POLICY "own update notifications" ON public.notifications FOR UPDATE TO authenticated USING (recipient_staff_id = public.current_staff_id()) WITH CHECK (recipient_staff_id = public.current_staff_id());
CREATE POLICY "staff insert notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (public.is_active_staff());

-- =========================================================
-- TRIGGERS
-- =========================================================
CREATE TRIGGER trg_staff_profiles_updated BEFORE UPDATE ON public.staff_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_service_templates_updated BEFORE UPDATE ON public.service_templates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- service completion trigger (re-attach for safety)
DROP TRIGGER IF EXISTS trg_service_completion ON public.services;
CREATE TRIGGER trg_service_completion BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.handle_service_completion();

-- =========================================================
-- INDEXES
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_contacts_company ON public.client_contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_services_contact ON public.services(client_contact_id);
CREATE INDEX IF NOT EXISTS idx_services_assigned ON public.services(assigned_staff_id);
CREATE INDEX IF NOT EXISTS idx_services_status ON public.services(status);
CREATE INDEX IF NOT EXISTS idx_services_due ON public.services(due_date);
CREATE INDEX IF NOT EXISTS idx_comments_service ON public.comments(service_id);
CREATE INDEX IF NOT EXISTS idx_activity_service ON public.service_activity(service_id);
CREATE INDEX IF NOT EXISTS idx_documents_company ON public.documents(company_id);
CREATE INDEX IF NOT EXISTS idx_documents_contact ON public.documents(contact_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_staff_id, is_read);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_staff_auth ON public.staff_profiles(auth_user_id);

-- =========================================================
-- SEED ROLES & PERMISSIONS
-- =========================================================
INSERT INTO public.roles(name, description) VALUES
  ('Admin','Full system access'),
  ('Manager','Manage companies, contacts, services and reports'),
  ('Staff','Handle assigned services and comments')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.permissions(key, description) VALUES
  ('companies.manage','Create/edit companies'),
  ('companies.delete','Delete companies'),
  ('contacts.manage','Create/edit/delete client contacts'),
  ('staff.manage','Manage staff members'),
  ('services.manage','Create/update services'),
  ('services.delete','Delete services'),
  ('reports.view','Generate reports'),
  ('settings.manage','Manage system settings'),
  ('documents.upload','Upload documents'),
  ('documents.delete','Delete documents')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.role_permissions(role, permission_key)
SELECT 'Admin', key FROM public.permissions
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions(role, permission_key) VALUES
  ('Manager','companies.manage'),
  ('Manager','contacts.manage'),
  ('Manager','services.manage'),
  ('Manager','services.delete'),
  ('Manager','reports.view'),
  ('Manager','documents.upload'),
  ('Staff','services.manage'),
  ('Staff','documents.upload'),
  ('Staff','reports.view')
ON CONFLICT DO NOTHING;