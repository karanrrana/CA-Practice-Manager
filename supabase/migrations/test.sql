create table public.services (
  id uuid not null default gen_random_uuid (),
  name text not null,
  status text not null default 'Not Started'::text,
  due_date date null,
  completed_at timestamp with time zone null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  client_contact_id uuid not null,
  assigned_staff_id uuid null,
  supporting_staff_id uuid null,
  created_by_staff_id uuid null,
  is_recurring boolean not null default false,
  recurrence public.recurrence_type not null default 'None'::recurrence_type,
  next_due_date date null,
  last_completed_at timestamp with time zone null,
  parent_service_id uuid null,
  constraint services_pkey primary key (id),
  constraint services_assigned_staff_id_fkey foreign KEY (assigned_staff_id) references staff_profiles (id) on delete set null,
  constraint services_created_by_staff_id_fkey foreign KEY (created_by_staff_id) references staff_profiles (id) on delete set null,
  constraint services_employee_id_fkey foreign KEY (client_contact_id) references client_contacts (id) on delete CASCADE,
  constraint services_parent_service_id_fkey foreign KEY (parent_service_id) references services (id),
  constraint services_supporting_staff_id_fkey foreign KEY (supporting_staff_id) references staff_profiles (id) on delete set null
) TABLESPACE pg_default;

create index IF not exists idx_services_contact on public.services using btree (client_contact_id) TABLESPACE pg_default;

create index IF not exists idx_services_assigned on public.services using btree (assigned_staff_id) TABLESPACE pg_default;

create index IF not exists idx_services_status on public.services using btree (status) TABLESPACE pg_default;

create index IF not exists idx_services_due on public.services using btree (due_date) TABLESPACE pg_default;

create trigger trg_service_completion BEFORE
update on services for EACH row
execute FUNCTION handle_service_completion ();

create trigger trg_services_completion BEFORE INSERT
or
update on services for EACH row
execute FUNCTION handle_service_completion ();

create trigger trg_services_updated_at BEFORE
update on services for EACH row
execute FUNCTION set_updated_at ();