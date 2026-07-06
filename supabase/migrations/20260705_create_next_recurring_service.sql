-- =====================================================
-- Automatically create next recurring service
-- =====================================================

CREATE OR REPLACE FUNCTION public.create_next_recurring_service()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    v_next_due date;
BEGIN

    -- Only when status changes to Completed
    IF OLD.status IS DISTINCT FROM 'Completed'
       AND NEW.status = 'Completed'
       AND NEW.is_recurring = true THEN

        CASE NEW.recurrence

            WHEN 'Monthly' THEN
                v_next_due := NEW.due_date + interval '1 month';

            WHEN 'Quarterly' THEN
                v_next_due := NEW.due_date + interval '3 months';

            WHEN 'Half-Yearly' THEN
                v_next_due := NEW.due_date + interval '6 months';

            WHEN 'Yearly' THEN
                v_next_due := NEW.due_date + interval '1 year';

            ELSE
                RETURN NEW;

        END CASE;

        INSERT INTO public.services (

            client_contact_id,

            name,

            status,

            assigned_staff_id,

            supporting_staff_id,

            created_by_staff_id,

            due_date,

            is_recurring,

            recurrence,

            next_due_date,

            parent_service_id

        )

        VALUES (

            NEW.client_contact_id,

            NEW.name,

            'Not Started',

            NEW.assigned_staff_id,

            NEW.supporting_staff_id,

            NEW.created_by_staff_id,

            v_next_due,

            true,

            NEW.recurrence,

            v_next_due,

            COALESCE(NEW.parent_service_id, NEW.id)

        );

    END IF;

    RETURN NEW;

END;
$$;

DROP TRIGGER IF EXISTS trg_create_next_recurring_service
ON public.services;

CREATE TRIGGER trg_create_next_recurring_service
AFTER UPDATE
ON public.services
FOR EACH ROW
EXECUTE FUNCTION public.create_next_recurring_service();