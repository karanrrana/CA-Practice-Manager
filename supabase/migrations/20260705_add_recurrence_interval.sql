ALTER TABLE public.services

ADD COLUMN IF NOT EXISTS recurrence_interval integer
DEFAULT 0;