import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { employeeSchema, type EmployeeFormValues } from "@/lib/validation";
import type { Employee } from "@/types";

export function EmployeeForm({
  open,
  onOpenChange,
  employee,
  onSubmit,
  submitting,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  employee?: Employee | null;
  onSubmit: (values: EmployeeFormValues) => void;
  submitting?: boolean;
}) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      employee_id: "",
      designation: "",
      department: "",
      pan_number: "",
      aadhaar_number: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: employee?.name ?? "",
        email: employee?.email ?? "",
        phone: employee?.phone ?? "",
        employee_id: employee?.employee_id ?? "",
        designation: employee?.designation ?? "",
        department: employee?.department ?? "",
        pan_number: employee?.pan_number ?? "",
        aadhaar_number: employee?.aadhaar_number ?? "",
        notes: employee?.notes ?? "",
      });
    }
  }, [open, employee, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl rounded-2xl border shadow-2xl p-8">

    <DialogHeader className="border-b pb-5">

      <DialogTitle className="text-2xl font-bold">
        {employee ? "Edit Client Contact" : "Add Client Contact"}
      </DialogTitle>

      <p className="text-sm text-muted-foreground">
        Manage client contact information and identification details.
      </p>

    </DialogHeader>

    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 pt-6"
      noValidate
    >

      {/* Full Name */}

      <Field label="Full Name" error={errors.name?.message}>
        <Input
          {...register("name")}
          placeholder="Rahul Sharma"
          className="h-11 rounded-xl"
        />
      </Field>

      {/* Email + Phone */}

      <div className="grid grid-cols-2 gap-5">

        <Field label="Email" error={errors.email?.message}>
          <Input
            {...register("email")}
            placeholder="rahul@acme.com"
            className="h-11 rounded-xl"
          />
        </Field>

        <Field label="Phone" error={errors.phone?.message}>
          <Input
            {...register("phone")}
            placeholder="9876543210"
            className="h-11 rounded-xl"
          />
        </Field>

      </div>

      {/* Designation + Department */}

      <div className="grid grid-cols-2 gap-5">

        <Field label="Designation" error={errors.designation?.message}>
          <Input
            {...register("designation")}
            placeholder="Director"
            className="h-11 rounded-xl"
          />
        </Field>

        <Field label="Department" error={errors.department?.message}>
          <Input
            {...register("department")}
            placeholder="Finance"
            className="h-11 rounded-xl"
          />
        </Field>

      </div>

      {/* PAN + Aadhaar */}

      <div className="grid grid-cols-2 gap-5">

        <Field label="PAN Number" error={errors.pan_number?.message}>
          <Input
            {...register("pan_number")}
            placeholder="ABCDE1234F"
            className="uppercase h-11 rounded-xl"
            onChange={(e) => {

              e.target.value = e.target.value
                .toUpperCase()
                .replace(/\s/g, "");

              register("pan_number").onChange(e);

            }}
          />
        </Field>

        <Field
          label="Aadhaar Number"
          error={errors.aadhaar_number?.message}
        >
          <Input
            {...register("aadhaar_number")}
            placeholder="1234 5678 9012"
            maxLength={14}
            className="h-11 rounded-xl"
            onChange={(e) => {

              let value = e.target.value
                .replace(/\D/g, "")
                .substring(0, 12);

              value = value.replace(
                /(\d{4})(\d{4})(\d{0,4})/,
                (_, a, b, c) =>
                  c
                    ? `${a} ${b} ${c}`
                    : b
                    ? `${a} ${b}`
                    : a,
              );

              e.target.value = value;

              register("aadhaar_number").onChange(e);

            }}
          />
        </Field>

      </div>

      {/* Internal ID */}

      <Field label="Internal ID" error={errors.employee_id?.message}>
        <Input
          {...register("employee_id")}
          placeholder="EMP-001"
          className="h-11 rounded-xl"
        />
      </Field>

      {/* Notes */}

      <Field label="Notes" error={errors.notes?.message}>
        <Controller
          control={control}
          name="notes"
          render={({ field }) => (
            <Textarea
              value={field.value}
              onChange={field.onChange}
              placeholder="Any additional notes..."
              rows={4}
              className="rounded-xl"
            />
          )}
        />
      </Field>

      <DialogFooter className="border-t pt-6 mt-8">

        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={submitting}
          className="rounded-xl"
        >
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={submitting}
          className="rounded-xl px-6"
        >
          {employee ? "Save Changes" : "Add Client Contact"}
        </Button>

      </DialogFooter>

    </form>

  </DialogContent>
</Dialog>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
