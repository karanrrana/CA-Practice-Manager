import { z } from "zod";

const todayStr = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export const clientSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Group name is required")
    .max(120, "Group name is too long"),

  email: z
    .string()
    .trim()
    .max(255)
    .email("Invalid email address")
    .or(z.literal("")),

  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{7,15}$/, "Enter a valid phone number")
    .or(z.literal("")),

  status: z.enum([
    "Active",
    "Inactive",
    "Archived",
  ]),

  tags: z.array(z.string()),
});

export const clientContactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(120, "Name too long"),

  email: z
    .string()
    .trim()
    .max(255)
    .email("Invalid email address")
    .or(z.literal("")),

  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{7,15}$/, "Enter a valid phone number")
    .or(z.literal("")),

  designation: z
    .string()
    .trim()
    .max(120)
    .or(z.literal("")),

  department: z
    .string()
    .trim()
    .max(120)
    .or(z.literal("")),

  pan_number: z
    .string()
    .trim()
    .regex(
      /^[A-Z]{5}[0-9]{4}[A-Z]$/,
      "Invalid PAN (e.g. ABCDE1234F)"
    )
    .or(z.literal("")),

  aadhaar_number: z
    .string()
    .trim()
    .refine(
      (value) => {
        if (value === "") return true;

        const digits = value.replace(/\s/g, "");

        return /^\d{12}$/.test(digits);
      },
      {
        message: "Aadhaar must be 12 digits",
      }
    ),

  notes: z
    .string()
    .trim()
    .max(1000)
    .or(z.literal("")),
});

// Alias
export const employeeSchema = clientContactSchema;

export const serviceSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Service name is required")
      .max(120),

    status: z.enum([
      "Not Started",
      "In Progress",
      "Pending Review",
      "Completed",
    ]),

    assigned_staff_id: z
      .string()
      .trim()
      .max(80)
      .or(z.literal("")),

    supporting_staff_id: z
      .string()
      .trim()
      .max(80)
      .or(z.literal("")),

    due_date: z
      .string()
      .min(1, "Due date is required")
      .refine((v) => {
        const d = new Date(v);

        return (
          !isNaN(d.getTime()) &&
          d >= todayStr()
        );
      }, "Due date cannot be earlier than today"),

    // ----------------------------
    // Completion Date
    // ----------------------------

    completed_at: z
      .string()
      .or(z.literal(""))
      .optional(),

    // ----------------------------
    // Recurring Service
    // ----------------------------

    is_recurring: z.boolean(),

    recurrence: z.enum([
      "None",
      "Monthly",
      "Quarterly",
      "Half-Yearly",
      "Yearly",
    ]),

    recurring_status: z.enum([
      "Active",
      "Paused",
    ]),

    recurrence_interval: z.number(),
  })
  .refine(
    (values) => {
      if (
        values.status !== "Completed" &&
        values.completed_at
      ) {
        return false;
      }

      return true;
    },
    {
      message:
        "Completion date can only be set for completed services",
      path: ["completed_at"],
    },
  );

export const staffSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(120),

  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .max(255),

  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{7,15}$/, "Enter a valid phone number")
    .or(z.literal("")),

  designation: z
    .string()
    .trim()
    .max(120)
    .or(z.literal("")),

  role: z.enum([
    "Admin",
    "Manager",
    "Staff",
  ]),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .or(z.literal("")),
});

export type ClientFormValues = z.infer<typeof clientSchema>;
export type ClientContactFormValues = z.infer<typeof clientContactSchema>;
export type EmployeeFormValues = ClientContactFormValues;
export type ServiceFormValues = z.infer<typeof serviceSchema>;
export type StaffFormValues = z.infer<typeof staffSchema>;