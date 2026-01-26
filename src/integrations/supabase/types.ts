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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      commission_history: {
        Row: {
          base_revenue: number
          bonus_value: number
          calculated_at: string
          calculated_by: string | null
          client_count: number
          commission_rate: number
          commission_value: number
          created_at: string
          id: string
          notes: string | null
          paid_at: string | null
          reference_month: string
          status: string
          tier_name: string
          total_value: number
          updated_at: string
          user_id: string
        }
        Insert: {
          base_revenue?: number
          bonus_value?: number
          calculated_at?: string
          calculated_by?: string | null
          client_count?: number
          commission_rate: number
          commission_value?: number
          created_at?: string
          id?: string
          notes?: string | null
          paid_at?: string | null
          reference_month: string
          status?: string
          tier_name: string
          total_value?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          base_revenue?: number
          bonus_value?: number
          calculated_at?: string
          calculated_by?: string | null
          client_count?: number
          commission_rate?: number
          commission_value?: number
          created_at?: string
          id?: string
          notes?: string | null
          paid_at?: string | null
          reference_month?: string
          status?: string
          tier_name?: string
          total_value?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          category: string
          created_at: string
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          is_public: boolean
          name: string
          uploaded_by: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          is_public?: boolean
          name: string
          uploaded_by: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          is_public?: boolean
          name?: string
          uploaded_by?: string
          user_id?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          access_count: number
          commission: number
          created_at: string
          email: string
          id: string
          monthly_value: number
          name: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_count?: number
          commission?: number
          created_at?: string
          email: string
          id?: string
          monthly_value?: number
          name: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_count?: number
          commission?: number
          created_at?: string
          email?: string
          id?: string
          monthly_value?: number
          name?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payouts: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string
          id: string
          method: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string
          id?: string
          method?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string
          id?: string
          method?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pricing_tiers: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          max_access: number | null
          min_access: number
          monthly_price: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          max_access?: number | null
          min_access?: number
          monthly_price: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          max_access?: number | null
          min_access?: number
          monthly_price?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          affiliate_code: string | null
          avatar_url: string | null
          cnpj: string | null
          company_name: string | null
          created_at: string
          deactivated_at: string | null
          deactivated_by: string | null
          full_name: string | null
          id: string
          is_active: boolean
          must_change_password: boolean
          phone: string | null
          tier_level: string
          updated_at: string
          user_id: string
        }
        Insert: {
          affiliate_code?: string | null
          avatar_url?: string | null
          cnpj?: string | null
          company_name?: string | null
          created_at?: string
          deactivated_at?: string | null
          deactivated_by?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          must_change_password?: boolean
          phone?: string | null
          tier_level?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          affiliate_code?: string | null
          avatar_url?: string | null
          cnpj?: string | null
          company_name?: string | null
          created_at?: string
          deactivated_at?: string | null
          deactivated_by?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          must_change_password?: boolean
          phone?: string | null
          tier_level?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sa_commission_history: {
        Row: {
          affiliate_commission_rate: number
          affiliate_commission_value: number
          affiliate_name: string | null
          affiliate_tier: string
          affiliate_user_id: string
          base_value_per_client: number
          calculated_at: string
          client_count: number
          created_at: string
          id: string
          notes: string | null
          paid_at: string | null
          reference_month: string
          sa_commission_rate: number
          sa_commission_value: number
          sa_user_id: string
          status: string
          updated_at: string
        }
        Insert: {
          affiliate_commission_rate: number
          affiliate_commission_value?: number
          affiliate_name?: string | null
          affiliate_tier: string
          affiliate_user_id: string
          base_value_per_client?: number
          calculated_at?: string
          client_count?: number
          created_at?: string
          id?: string
          notes?: string | null
          paid_at?: string | null
          reference_month: string
          sa_commission_rate: number
          sa_commission_value?: number
          sa_user_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          affiliate_commission_rate?: number
          affiliate_commission_value?: number
          affiliate_name?: string | null
          affiliate_tier?: string
          affiliate_user_id?: string
          base_value_per_client?: number
          calculated_at?: string
          client_count?: number
          created_at?: string
          id?: string
          notes?: string | null
          paid_at?: string | null
          reference_month?: string
          sa_commission_rate?: number
          sa_commission_value?: number
          sa_user_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      sa_commission_settings: {
        Row: {
          base_plan_value: number
          commission_ceiling: number
          created_at: string
          id: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          base_plan_value?: number
          commission_ceiling?: number
          created_at?: string
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          base_plan_value?: number
          commission_ceiling?: number
          created_at?: string
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          created_at: string
          id: string
          is_admin_reply: boolean
          message: string
          ticket_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_admin_reply?: boolean
          message: string
          ticket_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_admin_reply?: boolean
          message?: string
          ticket_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          category: string
          created_at: string
          id: string
          message: string
          priority: string
          resolution_notes: string | null
          resolved_at: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          category?: string
          created_at?: string
          id?: string
          message: string
          priority?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          category?: string
          created_at?: string
          id?: string
          message?: string
          priority?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tiers: {
        Row: {
          bonus_amount: number
          client_count: number
          color: string
          commission_percentage: number
          created_at: string
          display_name: string
          icon: string | null
          id: string
          is_active: boolean
          max_revenue: number | null
          min_revenue: number
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          bonus_amount?: number
          client_count?: number
          color: string
          commission_percentage: number
          created_at?: string
          display_name: string
          icon?: string | null
          id?: string
          is_active?: boolean
          max_revenue?: number | null
          min_revenue?: number
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          bonus_amount?: number
          client_count?: number
          color?: string
          commission_percentage?: number
          created_at?: string
          display_name?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          max_revenue?: number | null
          min_revenue?: number
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_monthly_value: {
        Args: { access_count: number }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "super_admin" | "user"
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
      app_role: ["admin", "super_admin", "user"],
    },
  },
} as const
