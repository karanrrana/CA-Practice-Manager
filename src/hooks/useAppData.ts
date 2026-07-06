import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchActivity,
  fetchClientContacts,
  fetchClients,
  fetchComments,
  fetchDocuments,
  fetchNotifications,
  fetchServices,
  fetchStaff,
} from "@/services/api";

export function useAppData() {
  const queryClient = useQueryClient();

  const clientsQuery = useQuery({ queryKey: ["clients"], queryFn: fetchClients });
  const contactsQuery = useQuery({ queryKey: ["client_contacts"], queryFn: fetchClientContacts });
  const servicesQuery = useQuery({ queryKey: ["services"], queryFn: fetchServices });
  const commentsQuery = useQuery({ queryKey: ["comments"], queryFn: fetchComments });
  const staffQuery = useQuery({ queryKey: ["staff"], queryFn: fetchStaff });
  const activityQuery = useQuery({ queryKey: ["activity"], queryFn: fetchActivity });
  const documentsQuery = useQuery({ queryKey: ["documents"], queryFn: fetchDocuments });
  const notificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    refetchInterval: 60000,
  });

  const reload = () => {
    [
      "clients",
      "client_contacts",
      "services",
      "comments",
      "staff",
      "activity",
      "documents",
      "notifications",
    ].forEach((k) => queryClient.invalidateQueries({ queryKey: [k] }));
  };

  return {
    clients: clientsQuery.data ?? [],
    employees: contactsQuery.data ?? [],
    contacts: contactsQuery.data ?? [],
    services: servicesQuery.data ?? [],
    comments: commentsQuery.data ?? [],
    staff: staffQuery.data ?? [],
    activity: activityQuery.data ?? [],
    documents: documentsQuery.data ?? [],
    notifications: notificationsQuery.data ?? [],
    loading:
      clientsQuery.isLoading ||
      contactsQuery.isLoading ||
      servicesQuery.isLoading ||
      commentsQuery.isLoading ||
      staffQuery.isLoading,
    error: clientsQuery.error || contactsQuery.error || servicesQuery.error,
    reload,
  };
}
