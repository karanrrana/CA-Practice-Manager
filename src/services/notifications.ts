import { supabase } from "@/integrations/supabase/client";
import type { AppNotification } from "@/types";

const db = supabase as unknown as {
  from: (table: string) => any;
};

export async function getNotifications(
  staffId: string,
): Promise<AppNotification[]> {
  const { data, error } = await db
    .from("notifications")
    .select("*")
    .eq("recipient_staff_id", staffId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []) as AppNotification[];
}

export async function createNotification({
  recipientStaffId,
  type,
  title,
  body,
  priority = "Normal",
  entityId,
  entityType,
  link,
}: {
  recipientStaffId: string;
  type: string;
  title: string;
  body?: string;
  priority?: "Low" | "Normal" | "High";
  entityId?: string;
  entityType?: string;
  link?: string;
}): Promise<AppNotification> {
  const { data, error } = await db
    .from("notifications")
    .insert({
      recipient_staff_id: recipientStaffId,
      type,
      title,
      body,
      priority,
      entity_id: entityId,
      entity_type: entityType,
      link,
    })
    .select()
    .single();

  if (error) throw error;

  return data as AppNotification;
}

export async function markAsRead(
  notificationId: string,
): Promise<void> {
  const { error } = await db
    .from("notifications")
    .update({
      is_read: true,
    })
    .eq("id", notificationId);

  if (error) throw error;
}

export async function markAllRead(
  staffId: string,
): Promise<void> {
  const { error } = await db
    .from("notifications")
    .update({
      is_read: true,
    })
    .eq("recipient_staff_id", staffId)
    .eq("is_read", false);

  if (error) throw error;
}

export async function deleteNotification(
  notificationId: string,
): Promise<void> {
  const { error } = await db
    .from("notifications")
    .delete()
    .eq("id", notificationId);

  if (error) throw error;
}

export async function unreadNotificationCount(
  staffId: string,
): Promise<number> {
  const { count, error } = await db
    .from("notifications")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("recipient_staff_id", staffId)
    .eq("is_read", false);

  if (error) throw error;

  return count ?? 0;
}

export async function clearReadNotifications(
  staffId: string,
): Promise<void> {
  const { error } = await db
    .from("notifications")
    .delete()
    .eq("recipient_staff_id", staffId)
    .eq("is_read", true);

  if (error) throw error;
}