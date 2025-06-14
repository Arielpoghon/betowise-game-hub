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
      bets: {
        Row: {
          amount: number
          created_at: string
          id: number
          match_id: string
          status: string
          team_choice: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: number
          match_id?: string
          status: string
          team_choice: string
          user_id?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: number
          match_id?: string
          status?: string
          team_choice?: string
          user_id?: string
        }
        Relationships: []
      }
      betslip_payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          payment_date: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          payment_date: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          payment_date?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_verifications: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          verification_code: string
          verified: boolean | null
        }
        Insert: {
          created_at?: string
          email: string
          expires_at: string
          id?: string
          verification_code: string
          verified?: boolean | null
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          verification_code?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      fixed_match_outcomes: {
        Row: {
          created_at: string
          id: string
          match_id: string
          predicted_away_score: number
          predicted_home_score: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          match_id: string
          predicted_away_score: number
          predicted_home_score: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          match_id?: string
          predicted_away_score?: number
          predicted_home_score?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_fixed_outcomes_match"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      match_schedules: {
        Row: {
          created_at: string
          duration_minutes: number
          end_at: string
          go_live_at: string
          id: string
          match_id: string
          start_countdown_at: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number
          end_at: string
          go_live_at: string
          id?: string
          match_id: string
          start_countdown_at: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number
          end_at?: string
          go_live_at?: string
          id?: string
          match_id?: string
          start_countdown_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_schedules_match"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          admin_notes: string | null
          asian_handicap_odds: number | null
          attendance: number | null
          away_odds: number | null
          away_score: number | null
          away_team: string | null
          away_team_logo: string | null
          both_teams_score_odds: number | null
          correct_score_odds: Json | null
          country: string | null
          created_at: string
          draw_odds: number | null
          external_id: string | null
          first_half_result_odds: Json | null
          fixed_away_score: number | null
          fixed_home_score: number | null
          fixed_outcome_set: boolean | null
          home_odds: number | null
          home_score: number | null
          home_team: string | null
          home_team_logo: string | null
          id: string
          is_fixed_match: boolean | null
          league: string | null
          match_date: string | null
          match_notes: string | null
          match_time: string | null
          over_under_odds: number | null
          referee: string | null
          round_info: string | null
          season: string | null
          sport: string | null
          start_time: string
          status: string
          title: string
          total_goals_odds: Json | null
          updated_at: string | null
          venue: string | null
          weather_conditions: string | null
        }
        Insert: {
          admin_notes?: string | null
          asian_handicap_odds?: number | null
          attendance?: number | null
          away_odds?: number | null
          away_score?: number | null
          away_team?: string | null
          away_team_logo?: string | null
          both_teams_score_odds?: number | null
          correct_score_odds?: Json | null
          country?: string | null
          created_at?: string
          draw_odds?: number | null
          external_id?: string | null
          first_half_result_odds?: Json | null
          fixed_away_score?: number | null
          fixed_home_score?: number | null
          fixed_outcome_set?: boolean | null
          home_odds?: number | null
          home_score?: number | null
          home_team?: string | null
          home_team_logo?: string | null
          id?: string
          is_fixed_match?: boolean | null
          league?: string | null
          match_date?: string | null
          match_notes?: string | null
          match_time?: string | null
          over_under_odds?: number | null
          referee?: string | null
          round_info?: string | null
          season?: string | null
          sport?: string | null
          start_time: string
          status: string
          title: string
          total_goals_odds?: Json | null
          updated_at?: string | null
          venue?: string | null
          weather_conditions?: string | null
        }
        Update: {
          admin_notes?: string | null
          asian_handicap_odds?: number | null
          attendance?: number | null
          away_odds?: number | null
          away_score?: number | null
          away_team?: string | null
          away_team_logo?: string | null
          both_teams_score_odds?: number | null
          correct_score_odds?: Json | null
          country?: string | null
          created_at?: string
          draw_odds?: number | null
          external_id?: string | null
          first_half_result_odds?: Json | null
          fixed_away_score?: number | null
          fixed_home_score?: number | null
          fixed_outcome_set?: boolean | null
          home_odds?: number | null
          home_score?: number | null
          home_team?: string | null
          home_team_logo?: string | null
          id?: string
          is_fixed_match?: boolean | null
          league?: string | null
          match_date?: string | null
          match_notes?: string | null
          match_time?: string | null
          over_under_odds?: number | null
          referee?: string | null
          round_info?: string | null
          season?: string | null
          sport?: string | null
          start_time?: string
          status?: string
          title?: string
          total_goals_odds?: Json | null
          updated_at?: string | null
          venue?: string | null
          weather_conditions?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          description: string | null
          email: string | null
          id: string
          merchant_reference: string
          order_tracking_id: string | null
          payment_method: string
          phone_number: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          description?: string | null
          email?: string | null
          id?: string
          merchant_reference: string
          order_tracking_id?: string | null
          payment_method?: string
          phone_number?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          description?: string | null
          email?: string | null
          id?: string
          merchant_reference?: string
          order_tracking_id?: string | null
          payment_method?: string
          phone_number?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sports_leagues: {
        Row: {
          active: boolean | null
          country: string
          created_at: string | null
          id: string
          league_level: number | null
          league_name: string
          season: string | null
          sport_name: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          country: string
          created_at?: string | null
          id?: string
          league_level?: number | null
          league_name: string
          season?: string | null
          sport_name: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          country?: string
          created_at?: string | null
          id?: string
          league_level?: number | null
          league_name?: string
          season?: string | null
          sport_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          auth_user_id: string
          balance: number
          created_at: string
          email: string | null
          email_verified: boolean | null
          id: string
          username: string
        }
        Insert: {
          auth_user_id?: string
          balance: number
          created_at?: string
          email?: string | null
          email_verified?: boolean | null
          id?: string
          username: string
        }
        Update: {
          auth_user_id?: string
          balance?: number
          created_at?: string
          email?: string | null
          email_verified?: boolean | null
          id?: string
          username?: string
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          amount: number
          created_at: string
          id: string
          notes: string | null
          processed_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          notes?: string | null
          processed_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          processed_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      finish_fixed_matches: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      process_bet_outcomes: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_match_status: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_user_balance: {
        Args: { user_id: string; amount_to_add: number }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
