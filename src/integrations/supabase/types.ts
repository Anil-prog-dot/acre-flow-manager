export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      assets: {
        Row: {
          cost_of_purchase: number
          created_at: string
          date_of_purchase: string
          id: string
          total: number
          type_of_purchase: string
          updated_at: string
          user_id: string
          weight_area: string | null
        }
        Insert: {
          cost_of_purchase: number
          created_at?: string
          date_of_purchase: string
          id?: string
          total: number
          type_of_purchase: string
          updated_at?: string
          user_id: string
          weight_area?: string | null
        }
        Update: {
          cost_of_purchase?: number
          created_at?: string
          date_of_purchase?: string
          id?: string
          total?: number
          type_of_purchase?: string
          updated_at?: string
          user_id?: string
          weight_area?: string | null
        }
        Relationships: []
      }
      borrowing_records: {
        Row: {
          created_at: string
          current_interest: number
          current_total: number
          date: string
          days_elapsed: number
          id: string
          interest: number
          lender_name: string
          principal_amount: number
          rate_of_interest: number
          status: string
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_interest: number
          current_total: number
          date: string
          days_elapsed?: number
          id?: string
          interest: number
          lender_name: string
          principal_amount: number
          rate_of_interest: number
          status?: string
          total: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_interest?: number
          current_total?: number
          date?: string
          days_elapsed?: number
          id?: string
          interest?: number
          lender_name?: string
          principal_amount?: number
          rate_of_interest?: number
          status?: string
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      customer_records: {
        Row: {
          acres: number
          cost: number
          created_at: string
          customer_id: string
          date: string
          discount: number | null
          id: string
          paid: boolean | null
          total: number
          type: string
          updated_at: string
        }
        Insert: {
          acres: number
          cost: number
          created_at?: string
          customer_id: string
          date: string
          discount?: number | null
          id?: string
          paid?: boolean | null
          total: number
          type: string
          updated_at?: string
        }
        Update: {
          acres?: number
          cost?: number
          created_at?: string
          customer_id?: string
          date?: string
          discount?: number | null
          id?: string
          paid?: boolean | null
          total?: number
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_records_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string
          email: string | null
          id: string
          location: string | null
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          location?: string | null
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          location?: string | null
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          created_at: string
          date: string
          description: string
          id: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          date: string
          description: string
          id?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          date?: string
          description?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      harvestor_records: {
        Row: {
          acres: number
          cost: number
          created_at: string
          customer_name: string
          date: string
          discount: number | null
          id: string
          paid: boolean | null
          total: number
          updated_at: string
        }
        Insert: {
          acres: number
          cost: number
          created_at?: string
          customer_name: string
          date: string
          discount?: number | null
          id?: string
          paid?: boolean | null
          total: number
          updated_at?: string
        }
        Update: {
          acres?: number
          cost?: number
          created_at?: string
          customer_name?: string
          date?: string
          discount?: number | null
          id?: string
          paid?: boolean | null
          total?: number
          updated_at?: string
        }
        Relationships: []
      }
      lending_records: {
        Row: {
          borrower_name: string
          created_at: string
          current_interest: number
          current_total: number
          date: string
          days_elapsed: number
          id: string
          interest: number
          principal_amount: number
          rate_of_interest: number
          status: string
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          borrower_name: string
          created_at?: string
          current_interest: number
          current_total: number
          date: string
          days_elapsed?: number
          id?: string
          interest: number
          principal_amount: number
          rate_of_interest: number
          status?: string
          total: number
          updated_at?: string
          user_id: string
        }
        Update: {
          borrower_name?: string
          created_at?: string
          current_interest?: number
          current_total?: number
          date?: string
          days_elapsed?: number
          id?: string
          interest?: number
          principal_amount?: number
          rate_of_interest?: number
          status?: string
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      miscellaneous: {
        Row: {
          amount: number
          created_at: string
          date: string
          description: string
          id: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          date: string
          description: string
          id?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          date?: string
          description?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      trailer_records: {
        Row: {
          cost: number
          created_at: string
          date: string
          discount: number | null
          id: string
          name: string
          no_of_trips: number
          paid: boolean | null
          total: number
          type: string
          updated_at: string
        }
        Insert: {
          cost: number
          created_at?: string
          date: string
          discount?: number | null
          id?: string
          name: string
          no_of_trips: number
          paid?: boolean | null
          total: number
          type: string
          updated_at?: string
        }
        Update: {
          cost?: number
          created_at?: string
          date?: string
          discount?: number | null
          id?: string
          name?: string
          no_of_trips?: number
          paid?: boolean | null
          total?: number
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
