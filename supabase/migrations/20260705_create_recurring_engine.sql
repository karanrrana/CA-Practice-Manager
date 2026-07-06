CREATE OR REPLACE FUNCTION public.calculate_next_due_date(
    p_due_date date,
    p_interval integer
)
RETURNS date
LANGUAGE plpgsql
AS $$
BEGIN

    IF p_due_date IS NULL THEN
        RETURN NULL;
    END IF;

    RETURN (
        p_due_date
        + make_interval(months => p_interval)
    )::date;

END;
$$;

CREATE OR REPLACE FUNCTION public.recurring_service_exists(
    p_parent uuid,
    p_contact uuid,
    p_name text,
    p_due_date date
)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN

    RETURN EXISTS (

        SELECT 1

        FROM public.services

        WHERE

            parent_service_id = p_parent

            AND client_contact_id = p_contact

            AND name = p_name

            AND due_date = p_due_date

    );

END;
$$;

CREATE OR REPLACE FUNCTION public.handle_recurring_completion()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE

    v_parent uuid;

    v_next_due date;

BEGIN

    ------------------------------------------------
    -- Only when service becomes Completed
    ------------------------------------------------

    IF OLD.status = NEW.status THEN
        RETURN NEW;
    END IF;

    IF NEW.status <> 'Completed' THEN
        RETURN NEW;
    END IF;

    ------------------------------------------------
    -- Ignore non recurring
    ------------------------------------------------

    IF NEW.is_recurring IS DISTINCT FROM TRUE THEN
        RETURN NEW;
    END IF;

    IF NEW.recurrence_interval <= 0 THEN
        RETURN NEW;
    END IF;

    ------------------------------------------------
    -- Root Parent
    ------------------------------------------------

    v_parent :=
        COALESCE(
            NEW.parent_service_id,
            NEW.id
        );

    ------------------------------------------------
    -- Next Due
    ------------------------------------------------

    v_next_due :=
        public.calculate_next_due_date(
            NEW.due_date,
            NEW.recurrence_interval
        );

    ------------------------------------------------
    -- Update current row
    ------------------------------------------------

    UPDATE public.services

    SET

        last_completed_at = now(),

        next_due_date = v_next_due

    WHERE id = NEW.id;

    ------------------------------------------------
    -- Already created?
    ------------------------------------------------

    IF public.recurring_service_exists(

        v_parent,

        NEW.client_contact_id,

        NEW.name,

        v_next_due

    ) THEN

        RETURN NEW;

    END IF;

    ------------------------------------------------
    -- Create next occurrence
    ------------------------------------------------

    INSERT INTO public.services(

        client_contact_id,

        name,

        status,

        assigned_staff_id,

        supporting_staff_id,

        created_by_staff_id,

        due_date,

        is_recurring,

        recurrence,

        recurrence_interval,

        next_due_date,

        parent_service_id

    )

    VALUES(

        NEW.client_contact_id,

        NEW.name,

        'Not Started',

        NEW.assigned_staff_id,

        NEW.supporting_staff_id,

        NEW.created_by_staff_id,

        v_next_due,

        TRUE,

        NEW.recurrence,

        NEW.recurrence_interval,

        v_next_due,

        v_parent

    );

    RETURN NEW;

END;
$$;

DROP TRIGGER IF EXISTS trg_handle_recurring_completion
ON public.services;

CREATE TRIGGER trg_handle_recurring_completion

AFTER UPDATE

ON public.services

FOR EACH ROW

EXECUTE FUNCTION public.handle_recurring_completion();