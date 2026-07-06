import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { serviceSchema, type ServiceFormValues } from "@/lib/validation";
import { STATUS_VALUES, type Service, type StaffProfile } from "@/types";

const UNASSIGNED = "__none__";

const SERVICE_CATEGORIES = {
  "Income Tax": [
    "Tax Audit",
    "Balance Sheet",
    "Income Tax Case",
    "ITR",
  ],
  GST: [
    "GST R1 / IFF",
    "GST R3B",
    "GST R9",
    "GST R9C",
    "GST Case",
  ],
  Society: [
    "Society Registration",
    "Annual Return",
    "Election",
    "Miscellaneous",
  ],
  Company: [
    "Balance Sheet",
    "Company Registration",
    "ROC Returns",

  ],
  Firm: [
    "Firm Registration",
    "Change of Partner",
    "Change of Address",
  ],
} as const;

export function ServiceForm({
  open,
  onOpenChange,
  service,
  staff,
  onSubmit,
  submitting,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  service?: Service | null;
  staff: StaffProfile[];
  onSubmit: (values: ServiceFormValues) => void;
  submitting?: boolean;
}) {
  const [selectedCategory, setSelectedCategory] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
  name: "",
  status: "Not Started",
  assigned_staff_id: "",
  supporting_staff_id: "",
  due_date: "",

  is_recurring: false,
recurrence: "None",
recurrence_interval: 0,

recurring_status: "Active",
},
  });

  useEffect(() => {
    if (open) {
      reset({
  name: service?.name ?? "",
  status: service?.status ?? "Not Started",
  assigned_staff_id: service?.assigned_staff_id ?? "",
  supporting_staff_id: service?.supporting_staff_id ?? "",
  due_date: service?.due_date ?? "",

  is_recurring: service?.is_recurring ?? false,

recurrence: service?.recurrence ?? "None",

recurrence_interval:
    service?.recurrence_interval ?? 0,

recurring_status:
    service?.recurring_status ?? "Active",
});

      if (service?.name) {
        for (const [category, services] of Object.entries(
          SERVICE_CATEGORIES
        )) {
          if (services.includes(service.name as never)) {
            setSelectedCategory(category);
            break;
          }
        }
      } else {
        setSelectedCategory("");
      }
    }
  }, [open, service, reset]);

  const activeStaff = staff.filter((s) => s.is_active);
  const isRecurring = watch("is_recurring");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md"
      onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{service ? "Edit Service" : "Add Service"}</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          {/* CATEGORY */}

          <div className="space-y-1.5">
            <Label>Service Category</Label>

            <Select
              value={selectedCategory}
              onValueChange={(value) => {
                setSelectedCategory(value);
                setValue("name", "");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>

              <SelectContent>
                {Object.keys(SERVICE_CATEGORIES).map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* SERVICE */}

          <div className="space-y-1.5">
            <Label>Service</Label>

            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={!selectedCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Service" />
                  </SelectTrigger>

                  <SelectContent>
                    {(
                      SERVICE_CATEGORIES[
                        selectedCategory as keyof typeof SERVICE_CATEGORIES
                      ] ?? []
                    ).map((serviceName) => (
                      <SelectItem
                        key={serviceName}
                        value={serviceName}
                      >
                        {serviceName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />

            {errors.name && (
              <p className="text-xs text-destructive">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* STATUS */}

          <div className="space-y-1.5">
            <Label>Status</Label>

            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {STATUS_VALUES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* ASSIGNED STAFF */}

          <div className="space-y-1.5">
            <Label>Assigned Staff</Label>

            <Controller
              control={control}
              name="assigned_staff_id"
              render={({ field }) => (
                <Select
                  value={field.value || UNASSIGNED}
                  onValueChange={(v) =>
                    field.onChange(v === UNASSIGNED ? "" : v)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value={UNASSIGNED}>
                      Unassigned
                    </SelectItem>

                    {activeStaff.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.full_name} · {s.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* SUPPORTING STAFF */}

          <div className="space-y-1.5">
            <Label>Supporting Staff (optional)</Label>

            <Controller
              control={control}
              name="supporting_staff_id"
              render={({ field }) => (
                <Select
                  value={field.value || UNASSIGNED}
                  onValueChange={(v) =>
                    field.onChange(v === UNASSIGNED ? "" : v)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value={UNASSIGNED}>
                      None
                    </SelectItem>

                    {activeStaff.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.full_name} · {s.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* DUE DATE */}

          <div className="space-y-1.5">
            <Label>Due Date</Label>

            <Input type="date" {...register("due_date")} />

            {errors.due_date && (
              <p className="text-xs text-destructive">
                {errors.due_date.message}
              </p>
            )}
          </div>
            {/* RECURRING SERVICE */}

<div className="rounded-xl border bg-slate-50 p-4 space-y-4">

  <div className="flex items-center justify-between">

    <div>
      <Label className="text-base">
        Recurring Service
      </Label>

      <p className="text-xs text-muted-foreground">
        Automatically create the next service after completion.
      </p>
    </div>

    <Controller
      control={control}
      name="is_recurring"
      render={({ field }) => (
        <Switch
          checked={field.value}
          onCheckedChange={field.onChange}
        />
      )}
    />

  </div>

  {watch("is_recurring") && (

    <Controller
      control={control}
      name="recurrence"
      render={({ field }) => (

        <div className="space-y-2">

          <Label>Frequency</Label>

          <Select
            value={field.value}
            onValueChange={(value) => {
  field.onChange(value);

  const months =
    value === "Monthly"
      ? 1
      : value === "Quarterly"
      ? 3
      : value === "Half-Yearly"
      ? 6
      : value === "Yearly"
      ? 12
      : 0;

  setValue("recurrence_interval", months);
}}
          >

            <SelectTrigger>

              <SelectValue />

            </SelectTrigger>

            <SelectContent>

              <SelectItem value="Monthly">
                Monthly
              </SelectItem>

              <SelectItem value="Quarterly">
                Quarterly
              </SelectItem>
              
              <SelectItem value="Half-Yearly">
                Half-Yearly
              </SelectItem>

              <SelectItem value="Yearly">
                Yearly
              </SelectItem>

            </SelectContent>

          </Select>

        </div>

      )}
    />

  )}

</div>
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
              {service ? "Save Changes" : "Add Service"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}