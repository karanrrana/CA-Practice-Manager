import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { clientSchema, type ClientFormValues } from "@/lib/validation";
import type { Client } from "@/types";

const SUGGESTED_TAGS = [
  "Priority Client",
  "GST",
  "Audit",
  "TDS",
  "Payroll",
  "ROC",
  "Income Tax",
];

export function ClientForm({
  open,
  onOpenChange,
  client,
  onSubmit,
  submitting,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  client?: Client | null;
  onSubmit: (values: ClientFormValues) => void;
  submitting?: boolean;
}) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      gst_number: "",
      pan_number: "",
      address: "",
      status: "Active",
      tags: [],
    },
  });
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (open) {
      reset({
        name: client?.name ?? "",
        email: client?.email ?? "",
        phone: client?.phone ?? "",
        gst_number: client?.gst_number ?? "",
        pan_number: client?.pan_number ?? "",
        address: client?.address ?? "",
        status: client?.status ?? "Active",
        tags: client?.tags ?? [],
      });
    }
  }, [open, client, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{client ? "Edit Company" : "Add Company"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Field label="Company Name" error={errors.name?.message}>
            <Input {...register("name")} placeholder="Acme Pvt Ltd" />
          </Field>
          <Field label="Email" error={errors.email?.message}>
            <Input {...register("email")} placeholder="contact@acme.com" />
          </Field>
          <Field label="Phone" error={errors.phone?.message}>
            <Input {...register("phone")} placeholder="9876543210" />
          </Field>
          <Field label="GST Number" error={errors.gst_number?.message}>
            <Input
  {...register("gst_number")}
  placeholder="22AAAAA0000A1Z5"
  className="uppercase"
  onChange={(e) => {
    e.target.value = e.target.value
      .toUpperCase()
      .replace(/\s/g, "");

    register("gst_number").onChange(e);
  }}
/>
          </Field>
          <Field label="PAN Number" error={errors.pan_number?.message}>
  <Input
    {...register("pan_number")}
    placeholder="ABCDE1234F"
    className="uppercase"
    onChange={(e) => {
      e.target.value = e.target.value
        .toUpperCase()
        .replace(/\s/g, "");

      register("pan_number").onChange(e);
    }}
  />
</Field>
          <Field label="Address" error={errors.address?.message}>
            <Textarea {...register("address")} placeholder="Registered address" rows={2} />
          </Field>
          <Field label="Status" error={errors.status?.message}>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          <Controller
            control={control}
            name="tags"
            render={({ field }) => (
              <div className="space-y-1.5">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-1.5">
                  {field.value.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                    >
                      {t}
                      <button
                        type="button"
                        onClick={() => field.onChange(field.value.filter((x) => x !== t))}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add tag…"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const t = tagInput.trim();
                        if (t && !field.value.includes(t)) field.onChange([...field.value, t]);
                        setTagInput("");
                      }
                    }}
                  />
                </div>
                <div className="flex flex-wrap gap-1">
                  {SUGGESTED_TAGS.filter((t) => !field.value.includes(t)).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => field.onChange([...field.value, t])}
                      className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground hover:bg-muted"
                    >
                      + {t}
                    </button>
                  ))}
                </div>
              </div>
            )}
          />

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
              {client ? "Save Changes" : "Add Company"}
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
