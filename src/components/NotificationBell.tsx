import { Bell, Check } from "lucide-react";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { markNotificationRead } from "@/services/api";
import { formatDateTime } from "@/utils/format";
import { useAppData } from "@/hooks/useAppData";
import { useAuth } from "@/context/AuthContext";

export function NotificationBell() {
  const { notifications, reload } = useAppData();
  const { staffId } = useAuth();
  const [open, setOpen] = useState(false);

  const mine = notifications.filter((n) => n.recipient_staff_id === staffId);
  const unread = mine.filter((n) => !n.is_read);

  const markAll = async () => {
    await Promise.all(unread.map((n) => markNotificationRead(n.id)));
    reload();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unread.length > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {unread.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <p className="text-sm font-semibold text-foreground">Notifications</p>
          {unread.length > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={markAll}>
              <Check className="mr-1 h-3 w-3" /> Mark all read
            </Button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {mine.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              No notifications.
            </p>
          ) : (
            mine.slice(0, 30).map((n) => (
              <button
                key={n.id}
                onClick={async () => {
                  if (!n.is_read) {
                    await markNotificationRead(n.id);
                    reload();
                  }
                }}
                className={`block w-full border-b border-border px-3 py-2 text-left last:border-0 hover:bg-muted ${
                  n.is_read ? "opacity-60" : ""
                }`}
              >
                <p className="text-sm font-medium text-foreground">{n.title}</p>
                {n.body && <p className="text-xs text-muted-foreground">{n.body}</p>}
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {formatDateTime(n.created_at)}
                </p>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
