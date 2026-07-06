
-- 1. employees table
CREATE TABLE public.employees (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  phone text,
  employee_id text,
  designation text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.employees TO anon, authenticated;
GRANT ALL ON public.employees TO service_role;

ALTER TABLE public.employees DISABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_employees_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. add employee_id to services
ALTER TABLE public.services ADD COLUMN employee_id uuid;

-- 3. migrate existing services: create a "General" employee per company that has services
WITH new_emps AS (
  INSERT INTO public.employees (company_id, name)
  SELECT DISTINCT c.id, 'General'
  FROM public.clients c
  WHERE EXISTS (SELECT 1 FROM public.services s WHERE s.client_id = c.id)
  RETURNING id, company_id
)
UPDATE public.services s
SET employee_id = ne.id
FROM new_emps ne
WHERE s.client_id = ne.company_id;

-- 4. enforce relationship
ALTER TABLE public.services
  ADD CONSTRAINT services_employee_id_fkey
  FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;

ALTER TABLE public.services ALTER COLUMN employee_id SET NOT NULL;

-- 5. drop old client_id column
ALTER TABLE public.services DROP COLUMN client_id;
