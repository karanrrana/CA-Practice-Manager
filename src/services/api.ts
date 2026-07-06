import { supabase } from "@/integrations/supabase/client";
import type {
  AppNotification,
  Client,
  ClientContact,
  ClientContactInput,
  ClientInput,
  Comment,
  DocumentRecord,
  Service,
  ServiceActivity,
  ServiceInput,
  StaffProfile,
} from "@/types";

const db = supabase as unknown as {
  from: (table: string) => any;
};

// ---------- COMPANIES ----------
export async function fetchClients(): Promise<Client[]> {
  const { data, error } = await db.from("clients").select("*");
  if (error) throw error;
  return (data ?? []) as Client[];
}

export async function createClient(input: ClientInput): Promise<Client> {
  const { data, error } = await db
    .from("clients")
    .insert({
      name: input.name,
      email: input.email || null,
      phone: input.phone || null,
      gst_number: input.gst_number || null,
      address: input.address || null,
      status: input.status,
      tags: input.tags ?? [],
    })
    .select()
    .single();
  if (error) throw error;
  return data as Client;
}

export async function updateClient(id: string, input: ClientInput): Promise<Client> {
  const { data, error } = await db
    .from("clients")
    .update({
      name: input.name,
      email: input.email || null,
      phone: input.phone || null,
      gst_number: input.gst_number || null,
      address: input.address || null,
      status: input.status,
      tags: input.tags ?? [],
    })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Client;
}

export async function deleteClient(id: string): Promise<void> {
  const { error } = await db.from("clients").delete().eq("id", id);
  if (error) throw error;
}

// ---------- CLIENT CONTACTS ----------
export async function fetchClientContacts(): Promise<ClientContact[]> {
  const { data, error } = await db.from("client_contacts").select("*");
  if (error) throw error;
  return (data ?? []) as ClientContact[];
}
export const fetchEmployees = fetchClientContacts;

function contactPayload(input: ClientContactInput) {
  return {
    name: input.name,
    email: input.email || null,
    phone: input.phone || null,
    employee_id: input.employee_id || null,
    designation: input.designation || null,
    department: input.department || null,
    pan_number: input.pan_number || null,
    aadhaar_number: input.aadhaar_number || null,
    notes: input.notes || null,
  };
}

export async function createClientContact(
  companyId: string,
  input: ClientContactInput,
): Promise<ClientContact> {
  const { data, error } = await db
    .from("client_contacts")
    .insert({ company_id: companyId, ...contactPayload(input) })
    .select()
    .single();
  if (error) throw error;
  return data as ClientContact;
}
export const createEmployee = createClientContact;

export async function updateClientContact(
  id: string,
  input: ClientContactInput,
): Promise<ClientContact> {
  const { data, error } = await db
    .from("client_contacts")
    .update(contactPayload(input))
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as ClientContact;
}
export const updateEmployee = updateClientContact;

export async function deleteClientContact(id: string): Promise<void> {
  const { error } = await db.from("client_contacts").delete().eq("id", id);
  if (error) throw error;
}
export const deleteEmployee = deleteClientContact;

// ---------- SERVICES ----------
async function notifyServiceAssignment(
  staffId: string | null,
  serviceId: string,
  serviceName: string,
) {
  if (!staffId) return;

  const { error } = await db
    .from("notifications")
    .insert({
      recipient_staff_id: staffId,
      type: "Assignment",
      title: "New Service Assigned",
      body: `You have been assigned "${serviceName}".`,
      priority: "Normal",
      entity_id: serviceId,
      entity_type: "service",
      link: `/services/${serviceId}`,
    });

  if (error) {
    console.error("Failed to create notification:", error);
  }
}

export async function fetchServices(): Promise<Service[]> {
  const { data, error } = await db.from("services").select("*");
  if (error) throw error;
  return (data ?? []) as Service[];
}

export async function createService(
  contactId: string,
  input: ServiceInput,
  createdByStaffId: string | null,
): Promise<Service> {
  const { data, error } = await db
    .from("services")
    .insert({
      client_contact_id: contactId,

      name: input.name,

      status: input.status,

      assigned_staff_id: input.assigned_staff_id || null,

      supporting_staff_id: input.supporting_staff_id || null,

      created_by_staff_id: createdByStaffId,

      due_date: input.due_date || null,

      // --------------------------
      // Recurring Service
      // --------------------------

      is_recurring: input.is_recurring,

      recurrence: input.recurrence,

      recurrence_interval: input.recurrence_interval,

      next_due_date: input.due_date || null,
    })
    .select()
    .single();

  if (error) throw error;

  // Notify Assigned Staff
  await notifyServiceAssignment(
    data.assigned_staff_id,
    data.id,
    data.name,
  );

  // Notify Supporting Staff (if different)
  if (
    data.supporting_staff_id &&
    data.supporting_staff_id !== data.assigned_staff_id
  ) {
    await notifyServiceAssignment(
      data.supporting_staff_id,
      data.id,
      `${data.name} (Supporting Staff)`,
    );
  }

  return data as Service;
}

export async function updateService(
  id: string,
  input: ServiceInput,
): Promise<Service> {

  // Fetch existing service
  const { data: existing, error: fetchError } = await db
    .from("services")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError) throw fetchError;

  // Update service
  const { data, error } = await db
    .from("services")
    .update({
      name: input.name,

      status: input.status,

      assigned_staff_id: input.assigned_staff_id || null,

      supporting_staff_id: input.supporting_staff_id || null,

      due_date: input.due_date || null,

      is_recurring: input.is_recurring,

      recurrence: input.recurrence,

      recurrence_interval: input.recurrence_interval,

      next_due_date: input.due_date || null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  // -------------------------
  // Assignment Changed
  // -------------------------

  if (
    existing.assigned_staff_id !==
    data.assigned_staff_id
  ) {

    await notifyServiceAssignment(
      data.assigned_staff_id,
      data.id,
      data.name,
    );

  }

  // -------------------------
  // Supporting Staff Changed
  // -------------------------

  if (
    existing.supporting_staff_id !==
    data.supporting_staff_id &&
    data.supporting_staff_id
  ) {

    await notifyServiceAssignment(
      data.supporting_staff_id,
      data.id,
      `${data.name} (Supporting Staff)`,
    );

  }

  return data as Service;
}
export async function updateServiceStatus(
  id: string,
  status: string,
): Promise<Service> {

  // Fetch current service
  const { data: service, error: fetchError } = await db
    .from("services")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError) throw fetchError;

  // Update status
  const { data, error } = await db
    .from("services")
    .update({
      status,
      completed_at:
        status === "Completed"
          ? new Date().toISOString()
          : null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  // ----------------------------------------
  // Create next recurring service
  // ----------------------------------------

  if (
    status === "Completed" &&
    service.is_recurring &&
    service.recurring_status === "Active"
  ) {

    await createNextRecurringService(service);

  }

  return data as Service;
}

export async function deleteService(id: string): Promise<void> {
  const { error } = await db.from("services").delete().eq("id", id);
  if (error) throw error;
}

// ---------- COMMENTS ----------
export async function fetchComments(): Promise<Comment[]> {
  const { data, error } = await db
    .from("comments")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Comment[];
}

export async function createComment(
  serviceId: string,
  username: string,
  message: string,
): Promise<Comment> {
  const { data, error } = await db
    .from("comments")
    .insert({ service_id: serviceId, username, message })
    .select()
    .single();
  if (error) throw error;
  return data as Comment;
}

// ---------- STAFF ----------
export async function fetchStaff(): Promise<StaffProfile[]> {
  const { data, error } = await db
    .from("staff_profiles")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as StaffProfile[];
}

// ---------- SERVICE ACTIVITY ----------
export async function fetchActivity(): Promise<ServiceActivity[]> {
  const { data, error } = await db
    .from("service_activity")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ServiceActivity[];
}

export async function logActivity(
  serviceId: string,
  actorStaffId: string | null,
  actorName: string | null,
  action: string,
  description?: string,
): Promise<void> {
  await db.from("service_activity").insert({
    service_id: serviceId,
    actor_staff_id: actorStaffId,
    actor_name: actorName,
    action,
    description: description ?? null,
  });
}

// ---------- AUDIT ----------
export async function logAudit(
  actorStaffId: string | null,
  actorName: string | null,
  action: string,
  entity: string,
  entityId: string | null,
  detail?: Record<string, unknown>,
): Promise<void> {
  await db.from("audit_logs").insert({
    actor_staff_id: actorStaffId,
    actor_name: actorName,
    action,
    entity,
    entity_id: entityId,
    detail: detail ?? null,
  });
}



// ---------- NOTIFICATIONS ----------
export async function fetchNotifications(): Promise<AppNotification[]> {
  const { data, error } = await db
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []) as AppNotification[];
}

export async function markNotificationRead(id: string): Promise<void> {
  await db.from("notifications").update({ is_read: true }).eq("id", id);
}

export async function notifyStaff(
  recipientStaffId: string,
  type: string,
  title: string,
  body?: string,
): Promise<void> {
  await db.from("notifications").insert({
    recipient_staff_id: recipientStaffId,
    type,
    title,
    body: body ?? null,
  });
}


// ---------- DOCUMENTS ----------
export async function fetchDocuments(): Promise<DocumentRecord[]> {
  const { data, error } = await db
    .from("documents")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []) as DocumentRecord[];
}

export async function uploadDocument(opts: {
  file: File;
  companyId: string | null;
  contactId: string | null;
  category: string;
  staffId: string | null;
  staffName: string | null;
}): Promise<void> {
  const path = `${opts.companyId ?? "general"}/${Date.now()}-${opts.file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(path, opts.file, {
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { error } = await db.from("documents").insert({
    company_id: opts.companyId,
    contact_id: opts.contactId,
    category: opts.category || null,
    file_name: opts.file.name,
    file_type: opts.file.type || null,
    file_path: path,
    uploaded_by_staff_id: opts.staffId,
    uploaded_by_name: opts.staffName,
  });

  if (error) throw error;
}

export async function getDocumentUrl(path: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from("documents")
    .createSignedUrl(path, 60 * 5);

  if (error) return null;

  return data?.signedUrl ?? null;
}

export async function deleteDocument(
  id: string,
  path: string,
): Promise<void> {
  await supabase.storage
    .from("documents")
    .remove([path]);

  const { error } = await db
    .from("documents")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function updateRecurringStatus(
  id: string,
  recurringStatus: "Active" | "Paused",
): Promise<Service> {

  const { data, error } = await db
    .from("services")
    .update({
      recurring_status: recurringStatus,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data as Service;
}

export async function createNextRecurringService(
  service: Service,
): Promise<void> {

  if (
    !service.is_recurring ||
    service.recurring_status !== "Active"
  ) {
    return;
  }

  let nextDue = service.due_date
    ? new Date(service.due_date)
    : null;

  if (!nextDue) return;

  switch (service.recurrence_interval) {

    case 1:
      nextDue.setMonth(nextDue.getMonth() + 1);
      break;

    case 3:
      nextDue.setMonth(nextDue.getMonth() + 3);
      break;

    case 6:
      nextDue.setMonth(nextDue.getMonth() + 6);
      break;

    case 12:
      nextDue.setFullYear(nextDue.getFullYear() + 1);
      break;
  }

  const formattedDate =
    nextDue.toISOString().split("T")[0];

  // Duplicate protection
  const { data: existing } = await db
    .from("services")
    .select("id")
    .eq(
      "parent_service_id",
      service.parent_service_id ?? service.id
    )
    .eq("due_date", formattedDate)
    .maybeSingle();

  if (existing) return;

  await db.from("services").insert({

    client_contact_id:
      service.client_contact_id,

    name:
      service.name,

    status:
      "Not Started",

    assigned_staff_id:
      service.assigned_staff_id,

    supporting_staff_id:
      service.supporting_staff_id,

    created_by_staff_id:
      service.created_by_staff_id,

    due_date:
      formattedDate,

    is_recurring:
      true,

    recurrence:
      service.recurrence,

    recurrence_interval:
      service.recurrence_interval,

    recurring_status:
      "Active",

    next_due_date:
      formattedDate,

    parent_service_id:
      service.parent_service_id ?? service.id,
  });

}