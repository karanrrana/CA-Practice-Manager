import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

interface DuplicateRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  title: string;
  message: string;

  recordName: string;

  identifiers: {
    label: string;
    value: string;
  }[];
}

export function DuplicateRecordDialog({
  open,
  onOpenChange,
  title,
  message,
  recordName,
  identifiers,
}: DuplicateRecordDialogProps) {
  return (
   <Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent className="max-w-md">

    <DialogHeader>

      <DialogTitle className="text-lg">
        ⚠ {title}
      </DialogTitle>

      <DialogDescription className="pt-2 space-y-4">

        <p>{message}</p>

        <div className="rounded-lg border bg-muted/40 p-4">

          <div>

            <p className="text-xs uppercase text-muted-foreground">
              Existing Record
            </p>

            <p className="font-semibold">
              {recordName}
            </p>

          </div>

          {identifiers.map((item) => (
            <div key={item.label} className="mt-4">

              <p className="text-xs uppercase text-muted-foreground">
                {item.label}
              </p>

              <p className="font-medium">
                {item.value}
              </p>

            </div>
          ))}

        </div>

        <p className="text-sm">
          Please verify the information before creating a new record.
        </p>

      </DialogDescription>

    </DialogHeader>

    <DialogFooter>

      <Button
        onClick={() => onOpenChange(false)}
      >
        OK
      </Button>

    </DialogFooter>

  </DialogContent>
</Dialog>
  );
}