ALTER TABLE public.services

ADD COLUMN IF NOT EXISTS recurring_status text
NOT NULL
DEFAULT 'Active';