export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          created_by: string
          note: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string
          note?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          note?: string | null
          user_id?: string
        }
        Relationships: []
      }
      checkout_login_redemptions: {
        Row: {
          redeemed_at: string
          session_hash: string
        }
        Insert: {
          redeemed_at?: string
          session_hash: string
        }
        Update: {
          redeemed_at?: string
          session_hash?: string
        }
        Relationships: []
      }
      customer_progress_items: {
        Row: {
          completed_steps: number
          created_at: string
          customer_id: string
          id: string
          label: string
          note: string | null
          percent_label: string
          sort_order: number
          status_label: string
          total_steps: number
          updated_at: string
        }
        Insert: {
          completed_steps?: number
          created_at?: string
          customer_id: string
          id?: string
          label: string
          note?: string | null
          percent_label: string
          sort_order?: number
          status_label: string
          total_steps?: number
          updated_at?: string
        }
        Update: {
          completed_steps?: number
          created_at?: string
          customer_id?: string
          id?: string
          label?: string
          note?: string | null
          percent_label?: string
          sort_order?: number
          status_label?: string
          total_steps?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_progress_items_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_sprint_items: {
        Row: {
          created_at: string
          customer_id: string
          detail: string
          id: string
          item_date: string
          sort_order: number
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          detail: string
          id?: string
          item_date: string
          sort_order?: number
          status: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          detail?: string
          id?: string
          item_date?: string
          sort_order?: number
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_sprint_items_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_updates: {
        Row: {
          body: string
          created_at: string
          customer_id: string
          id: string
          title: string
        }
        Insert: {
          body: string
          created_at?: string
          customer_id: string
          id?: string
          title: string
        }
        Update: {
          body?: string
          created_at?: string
          customer_id?: string
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_updates_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          company_name: string | null
          country: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          improvements: string | null
          next_billing_date: string | null
          phone: string | null
          plan_id: string
          practice_lead: string | null
          status: string
          stripe_cancel_at_period_end: boolean | null
          stripe_current_period_end: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          stripe_subscription_status: string | null
          stripe_synced_at: string | null
          target_market: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          company_name?: string | null
          country?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          improvements?: string | null
          next_billing_date?: string | null
          phone?: string | null
          plan_id: string
          practice_lead?: string | null
          status?: string
          stripe_cancel_at_period_end?: boolean | null
          stripe_current_period_end?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          stripe_subscription_status?: string | null
          stripe_synced_at?: string | null
          target_market?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          company_name?: string | null
          country?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          improvements?: string | null
          next_billing_date?: string | null
          phone?: string | null
          plan_id?: string
          practice_lead?: string | null
          status?: string
          stripe_cancel_at_period_end?: boolean | null
          stripe_current_period_end?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          stripe_subscription_status?: string | null
          stripe_synced_at?: string | null
          target_market?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      plans: {
        Row: {
          billing_period: string
          capabilities: Json
          capabilities_label: string
          created_at: string
          description: string
          highlighted: boolean
          id: string
          name: string
          price_label: string
          sort_order: number
          specs: Json
          stripe_price_id: string | null
          tier_label: string
          updated_at: string
        }
        Insert: {
          billing_period: string
          capabilities?: Json
          capabilities_label: string
          created_at?: string
          description: string
          highlighted?: boolean
          id: string
          name: string
          price_label: string
          sort_order?: number
          specs?: Json
          stripe_price_id?: string | null
          tier_label: string
          updated_at?: string
        }
        Update: {
          billing_period?: string
          capabilities?: Json
          capabilities_label?: string
          created_at?: string
          description?: string
          highlighted?: boolean
          id?: string
          name?: string
          price_label?: string
          sort_order?: number
          specs?: Json
          stripe_price_id?: string | null
          tier_label?: string
          updated_at?: string
        }
        Relationships: []
      }
      rate_limit_buckets: {
        Row: {
          bucket: string
          hits: number
          window_started_at: string
        }
        Insert: {
          bucket: string
          hits: number
          window_started_at: string
        }
        Update: {
          bucket?: string
          hits?: number
          window_started_at?: string
        }
        Relationships: []
      }
      stripe_events: {
        Row: {
          attempts: number
          id: string
          last_error: string | null
          livemode: boolean
          locked_until: string | null
          outcome: string | null
          processed_at: string | null
          received_at: string
          stripe_created_at: string
          type: string
        }
        Insert: {
          attempts?: number
          id: string
          last_error?: string | null
          livemode: boolean
          locked_until?: string | null
          outcome?: string | null
          processed_at?: string | null
          received_at?: string
          stripe_created_at: string
          type: string
        }
        Update: {
          attempts?: number
          id?: string
          last_error?: string | null
          livemode?: boolean
          locked_until?: string | null
          outcome?: string | null
          processed_at?: string | null
          received_at?: string
          stripe_created_at?: string
          type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_stripe_subscription_state: {
        Args: {
          p_cancel_at_period_end: boolean
          p_current_period_end: string
          p_observed_at: string
          p_status: string
          p_stripe_status: string
          p_subscription_id: string
        }
        Returns: string
      }
      article_redirect: { Args: { p_slug: string }; Returns: string }
      begin_stripe_event: {
        Args: {
          p_created: string
          p_id: string
          p_lease_seconds?: number
          p_livemode: boolean
          p_type: string
        }
        Returns: string
      }
      consume_rate_limit: {
        Args: { p_bucket: string; p_limit: number; p_window_seconds: number }
        Returns: boolean
      }
      fail_stripe_event: {
        Args: { p_error: string; p_id: string }
        Returns: undefined
      }
      finish_stripe_event: {
        Args: { p_id: string; p_outcome: string }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
      published_article: { Args: { p_slug: string }; Returns: Json }
      published_articles: { Args: never; Returns: Json }
      published_document: { Args: { p_key: string }; Returns: Json }
      published_documents: { Args: { p_keys: string[] }; Returns: Json }
      sitemap_entries: { Args: never; Returns: Json }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const

