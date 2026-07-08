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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {employee ? "Edit Client Contact" : "Add Client Contact"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Field label="Full Name" error={errors.name?.message}>
            <Input {...register("name")} placeholder="Rahul Sharma" />
          </Field>
          <Field label="Email" error={errors.email?.message}>
            <Input {...register("email")} placeholder="rahul@acme.com" />
          </Field>
          <Field label="Phone" error={errors.phone?.message}>
            <Input {...register("phone")} placeholder="9876543210" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Designation" error={errors.designation?.message}>
              <Input {...register("designation")} placeholder="Director" />
            </Field>
            <Field label="Department" error={errors.department?.message}>
              <Input {...register("department")} placeholder="Finance" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="PAN Number" error={errors.pan_number?.message}>
              <Input
  {...register("pan_number")}
  className="uppercase"
  onChange={(e) => {

    e.target.value = e.target.value
      .toUpperCase()
      .replace(/\s/g, "");

    register("pan_number").onChange(e);

  }}
/>
            </Field>
            <Field label="Aadhaar Number" error={errors.aadhaar_number?.message}>
              <Input
  {...register("aadhaar_number")}
  maxLength={14}
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
          <Field label="Internal ID" error={errors.employee_id?.message}>
            <Input {...register("employee_id")} placeholder="EMP-001" />
          </Field>
          <Field label="Notes" error={errors.notes?.message}>
            <Controller
              control={control}
              name="notes"
              render={({ field }) => (
                <Textarea
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Any additional notes…"
                  rows={3}
                />
              )}
            />
          </Field>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
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
