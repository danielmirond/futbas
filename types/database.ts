export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type MatchStatus = 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled'
export type EventType = 'goal' | 'own_goal' | 'penalty' | 'missed_penalty' | 'yellow_card' | 'red_card' | 'second_yellow' | 'substitution_in' | 'substitution_out'
export type CommentType = 'passio' | 'prediccio' | 'arbitre'
export type ChronicleStatus = 'draft' | 'published' | 'archived'
export type FavoriteType = 'club' | 'team' | 'competition'
export type UserRole = 'user' | 'admin' | 'moderator'

export interface Database {
  public: {
    PostgrestVersion: '12'
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          display_name: string | null
          avatar_url: string | null
          preferred_language: string
          role: UserRole
          favorite_club_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          avatar_url?: string | null
          preferred_language?: string
          role?: UserRole
          favorite_club_id?: string | null
        }
        Update: {
          display_name?: string | null
          avatar_url?: string | null
          preferred_language?: string
          role?: UserRole
          favorite_club_id?: string | null
        }
      }
      clubs: {
        Row: {
          id: string
          fcf_code: string | null
          name: string
          short_name: string | null
          badge_url: string | null
          primary_color: string
          secondary_color: string
          delegation: string | null
          municipality: string | null
          province: string | null
          stadium_name: string | null
          stadium_address: string | null
          founded_year: number | null
          website: string | null
          scraped_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          fcf_code?: string | null
          name: string
          short_name?: string | null
          badge_url?: string | null
          primary_color?: string
          secondary_color?: string
          delegation?: string | null
          municipality?: string | null
          province?: string | null
          stadium_name?: string | null
          stadium_address?: string | null
          founded_year?: number | null
          website?: string | null
        }
        Update: Partial<Database['public']['Tables']['clubs']['Insert']>
      }
      competitions: {
        Row: {
          id: string
          fcf_id: string | null
          name: string
          category: string
          group_name: string | null
          season: string
          sport_type: string
          total_matchdays: number | null
          scraped_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          fcf_id?: string | null
          name: string
          category: string
          group_name?: string | null
          season: string
          sport_type?: string
          total_matchdays?: number | null
        }
        Update: Partial<Database['public']['Tables']['competitions']['Insert']>
      }
      teams: {
        Row: {
          id: string
          club_id: string
          competition_id: string
          team_name: string
          position: number | null
          points: number
          played: number
          won: number
          drawn: number
          lost: number
          goals_for: number
          goals_against: number
          goal_difference: number
          form: string[] | null
          scraped_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          club_id: string
          competition_id: string
          team_name: string
          position?: number | null
          points?: number
          played?: number
          won?: number
          drawn?: number
          lost?: number
          goals_for?: number
          goals_against?: number
        }
        Update: Partial<Database['public']['Tables']['teams']['Insert']>
      }
      matches: {
        Row: {
          id: string
          competition_id: string
          matchday: number | null
          home_team_id: string
          away_team_id: string
          match_date: string | null
          venue: string | null
          home_score: number | null
          away_score: number | null
          status: MatchStatus
          acta_url: string | null
          acta_data: Json | null
          scraped_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          competition_id: string
          matchday?: number | null
          home_team_id: string
          away_team_id: string
          match_date?: string | null
          venue?: string | null
          home_score?: number | null
          away_score?: number | null
          status?: MatchStatus
          acta_url?: string | null
          acta_data?: Json | null
        }
        Update: Partial<Database['public']['Tables']['matches']['Insert']>
      }
      match_events: {
        Row: {
          id: string
          match_id: string
          team_id: string
          event_type: EventType
          minute: number | null
          player_name: string | null
          player_number: number | null
          related_player_name: string | null
          created_at: string
        }
        Insert: {
          id?: string
          match_id: string
          team_id: string
          event_type: EventType
          minute?: number | null
          player_name?: string | null
          player_number?: number | null
          related_player_name?: string | null
        }
        Update: Partial<Database['public']['Tables']['match_events']['Insert']>
      }
      comments: {
        Row: {
          id: string
          user_id: string
          match_id: string
          text: string
          comment_type: CommentType
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          match_id: string
          text: string
          comment_type?: CommentType
        }
        Update: {
          text?: string
          comment_type?: CommentType
        }
      }
      chronicles: {
        Row: {
          id: string
          match_id: string
          headline: string | null
          body: string | null
          social_summary: string | null
          mvp_player: string | null
          mvp_justification: string | null
          language: string
          status: ChronicleStatus
          generated_at: string | null
          published_at: string | null
          edited_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          match_id: string
          headline?: string | null
          body?: string | null
          social_summary?: string | null
          mvp_player?: string | null
          mvp_justification?: string | null
          language?: string
          status?: ChronicleStatus
        }
        Update: Partial<Database['public']['Tables']['chronicles']['Insert']> & {
          status?: ChronicleStatus
          published_at?: string | null
          edited_by?: string | null
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          favorite_type: FavoriteType
          club_id: string | null
          team_id: string | null
          competition_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          favorite_type: FavoriteType
          club_id?: string | null
          team_id?: string | null
          competition_id?: string | null
        }
        Update: never
      }
      mvp_votes: {
        Row: {
          id: string
          user_id: string
          match_id: string
          player_name: string
          team_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          match_id: string
          player_name: string
          team_id?: string | null
        }
        Update: {
          player_name?: string
          team_id?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      match_status: MatchStatus
      event_type: EventType
      comment_type: CommentType
      chronicle_status: ChronicleStatus
      favorite_type: FavoriteType
    }
  }
}
