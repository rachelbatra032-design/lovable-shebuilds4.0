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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      agent_runs: {
        Row: {
          company_id: string
          created_at: string
          created_by: string
          finished_at: string | null
          id: string
          role_id: string
          status: string
          summary: string | null
          task: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by: string
          finished_at?: string | null
          id?: string
          role_id: string
          status?: string
          summary?: string | null
          task: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string
          finished_at?: string | null
          id?: string
          role_id?: string
          status?: string
          summary?: string | null
          task?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_runs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_runs_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      change_requests: {
        Row: {
          company_id: string
          created_at: string
          existing_item_id: string | null
          id: string
          is_sample: boolean
          proposed_body: string
          proposed_title: string
          reason: string | null
          role_id: string
          source_input_id: string | null
          status: string
        }
        Insert: {
          company_id: string
          created_at?: string
          existing_item_id?: string | null
          id?: string
          is_sample?: boolean
          proposed_body: string
          proposed_title: string
          reason?: string | null
          role_id: string
          source_input_id?: string | null
          status?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          existing_item_id?: string | null
          id?: string
          is_sample?: boolean
          proposed_body?: string
          proposed_title?: string
          reason?: string | null
          role_id?: string
          source_input_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "change_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "change_requests_existing_item_id_fkey"
            columns: ["existing_item_id"]
            isOneToOne: false
            referencedRelation: "knowledge_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "change_requests_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "change_requests_source_input_id_fkey"
            columns: ["source_input_id"]
            isOneToOne: false
            referencedRelation: "inputs"
            referencedColumns: ["id"]
          },
        ]
      }
      client_errors: {
        Row: {
          created_at: string
          id: string
          last_action: string | null
          message: string
          page: string
          source: string | null
          stack: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          last_action?: string | null
          message: string
          page: string
          source?: string | null
          stack?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          last_action?: string | null
          message?: string
          page?: string
          source?: string | null
          stack?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      companies: {
        Row: {
          created_at: string
          created_by: string
          id: string
          is_sample: boolean
          name: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          is_sample?: boolean
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          is_sample?: boolean
          name?: string
        }
        Relationships: []
      }
      company_members: {
        Row: {
          company_id: string
          created_at: string
          id: string
          member_role: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          member_role?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          member_role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          company_id: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      inputs: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          english_text: string | null
          error: string | null
          frames: Json
          id: string
          is_sample: boolean
          kind: string
          language: string | null
          mime_type: string | null
          original_text: string | null
          role_id: string
          status: string
          storage_path: string | null
          title: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          english_text?: string | null
          error?: string | null
          frames?: Json
          id?: string
          is_sample?: boolean
          kind: string
          language?: string | null
          mime_type?: string | null
          original_text?: string | null
          role_id: string
          status?: string
          storage_path?: string | null
          title?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          english_text?: string | null
          error?: string | null
          frames?: Json
          id?: string
          is_sample?: boolean
          kind?: string
          language?: string | null
          mime_type?: string | null
          original_text?: string | null
          role_id?: string
          status?: string
          storage_path?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inputs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inputs_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      invites: {
        Row: {
          accepted: boolean
          company_id: string
          created_at: string
          email: string
          id: string
          invited_by: string
          role_id: string | null
        }
        Insert: {
          accepted?: boolean
          company_id: string
          created_at?: string
          email: string
          id?: string
          invited_by: string
          role_id?: string | null
        }
        Update: {
          accepted?: boolean
          company_id?: string
          created_at?: string
          email?: string
          id?: string
          invited_by?: string
          role_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invites_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invites_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_items: {
        Row: {
          body: string
          cadence: string | null
          company_id: string
          created_at: string
          id: string
          is_sample: boolean
          kind: string
          last_seen_at: string
          media: Json
          mentions: number
          original_quote: string | null
          role_id: string
          source_input_id: string | null
          status: string
          title: string
          translations: Json
        }
        Insert: {
          body?: string
          cadence?: string | null
          company_id: string
          created_at?: string
          id?: string
          is_sample?: boolean
          kind: string
          last_seen_at?: string
          media?: Json
          mentions?: number
          original_quote?: string | null
          role_id: string
          source_input_id?: string | null
          status?: string
          title: string
          translations?: Json
        }
        Update: {
          body?: string
          cadence?: string | null
          company_id?: string
          created_at?: string
          id?: string
          is_sample?: boolean
          kind?: string
          last_seen_at?: string
          media?: Json
          mentions?: number
          original_quote?: string | null
          role_id?: string
          source_input_id?: string | null
          status?: string
          title?: string
          translations?: Json
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_items_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_items_source_input_id_fkey"
            columns: ["source_input_id"]
            isOneToOne: false
            referencedRelation: "inputs"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_links: {
        Row: {
          company_id: string
          from_item: string
          id: string
          label: string | null
          role_id: string
          to_item: string
        }
        Insert: {
          company_id: string
          from_item: string
          id?: string
          label?: string | null
          role_id: string
          to_item: string
        }
        Update: {
          company_id?: string
          from_item?: string
          id?: string
          label?: string | null
          role_id?: string
          to_item?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_links_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_links_from_item_fkey"
            columns: ["from_item"]
            isOneToOne: false
            referencedRelation: "knowledge_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_links_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_links_to_item_fkey"
            columns: ["to_item"]
            isOneToOne: false
            referencedRelation: "knowledge_items"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          language_setup_done: boolean
          output_language: string | null
          recording_languages: string[]
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          language_setup_done?: boolean
          output_language?: string | null
          recording_languages?: string[]
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          language_setup_done?: boolean
          output_language?: string | null
          recording_languages?: string[]
        }
        Relationships: []
      }
      roles: {
        Row: {
          company_id: string
          created_at: string
          department_id: string
          holder_email: string | null
          holder_name: string | null
          id: string
          onboarding_plan: Json | null
          status: string
          successor_name: string | null
          title: string
        }
        Insert: {
          company_id: string
          created_at?: string
          department_id: string
          holder_email?: string | null
          holder_name?: string | null
          id?: string
          onboarding_plan?: Json | null
          status?: string
          successor_name?: string | null
          title: string
        }
        Update: {
          company_id?: string
          created_at?: string
          department_id?: string
          holder_email?: string | null
          holder_name?: string | null
          id?: string
          onboarding_plan?: Json | null
          status?: string
          successor_name?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "roles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cache_item_translation: {
        Args: {
          expected_body: string
          expected_title: string
          item_id: string
          reading_language: string
          translated_value: Json
        }
        Returns: boolean
      }
      is_company_admin: { Args: { _company: string }; Returns: boolean }
      is_company_member: { Args: { _company: string }; Returns: boolean }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
