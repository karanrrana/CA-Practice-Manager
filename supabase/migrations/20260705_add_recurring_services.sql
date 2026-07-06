-- =====================================================
-- RECURRING SERVICES
-- =====================================================

DO $$ BEGIN
  CREATE TYPE public.recurrence_type AS ENUM (
    'None',
    'Monthly',
    'Quarterly',
    'Yearly'
  );
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS is_recurring boolean NOT NULL DEFAULT false,

ADD COLUMN IF NOT EXISTS recurrence public.recurrence_type NOT NULL DEFAULT 'None',

ADD COLUMN IF NOT EXISTS next_due_date date,

ADD COLUMN IF NOT EXISTS last_completed_at timestamptz,

ADD COLUMN IF NOT EXISTS parent_service_id uuid REFERENCES public.services(id);