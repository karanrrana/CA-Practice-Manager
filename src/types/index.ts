export type Role = "Admin" | "Manager" | "Staff";

export type ServiceStatus =
  | "Not Started"
  | "In Progress"
  | "Pending Review"
  | "Completed";

export const STATUS_VALUES: ServiceStatus[] = [
  "Not Started",
  "In Progress",
  "Pending Review",
  "Completed",
];

export type CompanyStatus = "Active" | "Inactive" | "Archived";

export interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  gst_number: string | null;
  pan_number: string | null;
  address: string | null;
  status: CompanyStatus;
  tags: string[];
  created_at: string;
  updated_at: string;
}

// A Client Contact (employee/director/partner of a client company)
export interface ClientContact {
  id: string;
  company_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  employee_id: string | null;
  designation: string | null;
  department: string | null;
  pan_number: string | null;
  aadhaar_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
// backwards-compatible alias
export type Employee = ClientContact;

export interface Service {
  id: string;
  client_contact_id: string;

  name: string;

  status: ServiceStatus;

  assigned_staff_id: string | null;
  supporting_staff_id: string | null;

  created_by_staff_id: string | null;

  due_date: string | null;

  completed_at: string | null;

  created_at: string;
  updated_at: string;

  // ----------------------------
  // Recurring Service
  // ----------------------------

  is_recurring: boolean;

  recurrence:
  | "None"
  | "Monthly"
  | "Quarterly"
  | "Half-Yearly"
  | "Yearly";

  recurrence_interval: number;

  recurring_status: "Active" | "Paused";

  next_due_date: string | null;

  last_completed_at: string | null;

  parent_service_id: string | null;

  // client-side display helper (resolved staff name)
  assigned_to?: string | null;
}

export interface Comment {
  id: string;
  service_id: string;
  username: string;
  message: string;
  created_at: string;
}

export interface StaffProfile {
  id: string;
  auth_user_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  designation: string | null;
  role: Role;
  is_active: boolean;
  must_change_password: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceActivity {
  id: string;
  service_id: string;
  actor_staff_id: string | null;
  actor_name: string | null;
  action: string;
  description: string | null;
  created_at: string;
}

export interface DocumentRecord {
  id: string;
  company_id: string | null;
  contact_id: string | null;
  service_id: string | null;
  category: string | null;
  file_name: string;
  file_type: string | null;
  file_path: string;
  file_url: string | null;
  uploaded_by_staff_id: string | null;
  uploaded_by_name: string | null;
  created_at: string;
}


export interface ClientInput {
  name: string;
  email: string;
  phone: string;
  status: CompanyStatus;
  tags: string[];
}

export interface ClientContactInput {
  name: string;
  email: string;
  phone: string;
  designation: string;
  department: string;
  pan_number: string;
  aadhaar_number: string;
  notes: string;
}
export type EmployeeInput = ClientContactInput;

export interface ServiceInput {
  name: string;
  status: ServiceStatus;

  assigned_staff_id: string;
  supporting_staff_id: string;

  due_date: string;
  completed_at?: string;

  // ------------------------
  // Recurring Service
  // ------------------------

  is_recurring: boolean;

  recurrence_interval: number;

  recurring_status: "Active" | "Paused";

  recurrence:
  | "None"
  | "Monthly"
  | "Quarterly"
  | "Half-Yearly"
  | "Yearly";
}

export interface StaffInput {
  full_name: string;
  email: string;
  phone: string;
  designation: string;
  role: Role;
  password?: string;
}

export interface AppNotification {
  id: string;

  recipient_staff_id: string;

  type: string;

  title: string;

  body?: string | null;

  priority: "Low" | "Normal" | "High";

  entity_id?: string | null;

  entity_type?: string | null;

  link?: string | null;

  is_read: boolean;

  created_at: string;
}