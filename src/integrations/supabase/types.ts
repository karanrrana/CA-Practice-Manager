export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_name: string | null
          actor_staff_id: string | null
          created_at: string
          detail: Json | null
          entity: string | null
          entity_id: string | null
          id: string
        }
        Insert: {
          action: string
          actor_name?: string | null
          actor_staff_id?: string | null
          created_at?: string
          detail?: Json | null
          entity?: string | null
          entity_id?: string | null
          id?: string
        }
        Update: {
          action?: string
          actor_name?: string | null
          actor_staff_id?: string | null
          created_at?: string
          detail?: Json | null
          entity?: string | null
          entity_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_staff_id_fkey"
            columns: ["actor_staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_contacts: {
        Row: {
          aadhaar_number: string | null
          company_id: string
          created_at: string
          department: string | null
          designation: string | null
          email: string | null
          employee_id: string | null
          id: string
          name: string
          notes: string | null
          pan_number: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          aadhaar_number?: string | null
          company_id: string
          created_at?: string
          department?: string | null
          designation?: string | null
          email?: string | null
          employee_id?: string | null
          id?: string
          name: string
          notes?: string | null
          pan_number?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          aadhaar_number?: string | null
          company_id?: string
          created_at?: string
          department?: string | null
          designation?: string | null
          email?: string | null
          employee_id?: string | null
          id?: string
          name?: string
          notes?: string | null
          pan_number?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          gst_number: string | null
          id: string
          name: string
          phone: string | null
          status: Database["public"]["Enums"]["company_status"]
          tags: string[]
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          gst_number?: string | null
          id?: string
          name: string
          phone?: string | null
          status?: Database["public"]["Enums"]["company_status"]
          tags?: string[]
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          gst_number?: string | null
          id?: string
          name?: string
          phone?: string | null
          status?: Database["public"]["Enums"]["company_status"]
          tags?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          created_at: string
          id: string
          message: string
          service_id: string
          username: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          service_id: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          service_id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          category: string | null
          company_id: string | null
          contact_id: string | null
          created_at: string
          file_name: string
          file_path: string
          file_type: string | null
          file_url: string | null
          id: string
          service_id: string | null
          uploaded_by_name: string | null
          uploaded_by_staff_id: string | null
        }
        Insert: {
          category?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          file_name: string
          file_path: string
          file_type?: string | null
          file_url?: string | null
          id?: string
          service_id?: string | null
          uploaded_by_name?: string | null
          uploaded_by_staff_id?: string | null
        }
        Update: {
          category?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          file_name?: string
          file_path?: string
          file_type?: string | null
          file_url?: string | null
          id?: string
          service_id?: string | null
          uploaded_by_name?: string | null
          uploaded_by_staff_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "client_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_staff_id_fkey"
            columns: ["uploaded_by_staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          recipient_staff_id: string
          title: string
          type: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          recipient_staff_id: string
          title: string
          type: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          recipient_staff_id?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_recipient_staff_id_fkey"
            columns: ["recipient_staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          created_at: string
          description: string | null
          key: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          key: string
        }
        Update: {
          created_at?: string
          description?: string | null
          key?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          permission_key: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          permission_key: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          permission_key?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_key_fkey"
            columns: ["permission_key"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "role_permissions_role_fkey"
            columns: ["role"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["name"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          description: string | null
          name: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string
          description?: string | null
          name: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string
          description?: string | null
          name?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      service_activity: {
        Row: {
          action: string
          actor_name: string | null
          actor_staff_id: string | null
          created_at: string
          description: string | null
          id: string
          service_id: string
        }
        Insert: {
          action: string
          actor_name?: string | null
          actor_staff_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          service_id: string
        }
        Update: {
          action?: string
          actor_name?: string | null
          actor_staff_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_activity_actor_staff_id_fkey"
            columns: ["actor_staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_activity_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_templates: {
        Row: {
          created_at: string
          created_by_staff_id: string | null
          description: string | null
          id: string
          items: Json
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by_staff_id?: string | null
          description?: string | null
          id?: string
          items?: Json
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by_staff_id?: string | null
          description?: string | null
          id?: string
          items?: Json
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_templates_created_by_staff_id_fkey"
            columns: ["created_by_staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
  Row: {
    assigned_staff_id: string | null
    client_contact_id: string

    completed_at: string | null
    created_at: string
    created_by_staff_id: string | null

    due_date: string | null

    id: string
    name: string
    status: string

    supporting_staff_id: string | null

    updated_at: string

    // -------------------------
    // Recurring Service
    // -------------------------
    is_recurring: boolean
    recurrence: "None" | "Monthly" | "Quarterly" | "Yearly"
    next_due_date: string | null
    last_completed_at: string | null
    parent_service_id: string | null
    recurring_status: string
  }

  Insert: {
    assigned_staff_id?: string | null
    client_contact_id: string

    completed_at?: string | null
    created_at?: string
    created_by_staff_id?: string | null

    due_date?: string | null

    id?: string
    name: string

    status?: string

    supporting_staff_id?: string | null

    updated_at?: string

    // -------------------------
    // Recurring Service
    // -------------------------
    is_recurring?: boolean
    recurrence?: "None" | "Monthly" | "Quarterly" | "Yearly"
    next_due_date?: string | null
    last_completed_at?: string | null
    parent_service_id?: string | null
    recurring_status?: string
  }

  Update: {
    assigned_staff_id?: string | null
    client_contact_id?: string

    completed_at?: string | null
    created_at?: string
    created_by_staff_id?: string | null

    due_date?: string | null

    id?: string
    name?: string

    status?: string

    supporting_staff_id?: string | null

    updated_at?: string

    // -------------------------
    // Recurring Service
    // -------------------------
    is_recurring?: boolean
    recurrence?: "None" | "Monthly" | "Quarterly" | "Yearly"
    next_due_date?: string | null
    last_completed_at?: string | null
    parent_service_id?: string | null
    recurring_status?: string
  }

  Relationships: [
    {
      foreignKeyName: "services_assigned_staff_id_fkey"
      columns: ["assigned_staff_id"]
      isOneToOne: false
      referencedRelation: "staff_profiles"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "services_created_by_staff_id_fkey"
      columns: ["created_by_staff_id"]
      isOneToOne: false
      referencedRelation: "staff_profiles"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "services_employee_id_fkey"
      columns: ["client_contact_id"]
      isOneToOne: false
      referencedRelation: "client_contacts"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "services_supporting_staff_id_fkey"
      columns: ["supporting_staff_id"]
      isOneToOne: false
      referencedRelation: "staff_profiles"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "services_parent_service_id_fkey"
      columns: ["parent_service_id"]
      isOneToOne: false
      referencedRelation: "services"
      referencedColumns: ["id"]
    },
  ]
}
      staff_profiles: {
        Row: {
          auth_user_id: string | null
          created_at: string
          designation: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean
          last_login_at: string | null
          must_change_password: boolean
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string
          designation?: string | null
          email: string
          full_name: string
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          must_change_password?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string
          designation?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          must_change_password?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_staff_id: { Args: never; Returns: string }
      has_role: {
        Args: { _role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      is_active_staff: { Args: never; Returns: boolean }
      is_admin: { Args: never; Returns: boolean }
      is_manager_or_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "Admin" | "Manager" | "Staff"
      company_status: "Active" | "Inactive" | "Archived"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["Admin", "Manager", "Staff"],
      company_status: ["Active", "Inactive", "Archived"],
    },
  },
} as const
