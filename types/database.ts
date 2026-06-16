// Supabase type definitions for Ēko
// Run `npx supabase gen types typescript --project-id <id>` to regenerate from schema

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
      profiles: {
        Row: {
          id: string
          clerk_user_id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          clerk_user_id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          clerk_user_id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      teams: {
        Row: {
          id: string
          name: string
          slug: string
          plan: 'free' | 'pro' | 'enterprise'
          plan_expires_at: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          plan?: 'free' | 'pro' | 'enterprise'
          plan_expires_at?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          plan?: 'free' | 'pro' | 'enterprise'
          plan_expires_at?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          id: string
          team_id: string
          profile_id: string | null
          email: string
          role: 'admin' | 'member'
          status: 'pending' | 'active' | 'inactive'
          invited_at: string
          joined_at: string | null
        }
        Insert: {
          id?: string
          team_id: string
          profile_id?: string | null
          email: string
          role?: 'admin' | 'member'
          status?: 'pending' | 'active' | 'inactive'
          invited_at?: string
          joined_at?: string | null
        }
        Update: {
          id?: string
          team_id?: string
          profile_id?: string | null
          email?: string
          role?: 'admin' | 'member'
          status?: 'pending' | 'active' | 'inactive'
          joined_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'team_members_team_id_fkey'
            columns: ['team_id']
            isOneToOne: false
            referencedRelation: 'teams'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'team_members_profile_id_fkey'
            columns: ['profile_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      ai_tools: {
        Row: {
          id: string
          name: string
          slug: string
          tagline: string | null
          description: string | null
          category: string
          use_cases: string[]
          pricing_model: 'free' | 'freemium' | 'paid' | 'enterprise'
          starting_price: number | null
          website_url: string | null
          logo_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          tagline?: string | null
          description?: string | null
          category: string
          use_cases?: string[]
          pricing_model: 'free' | 'freemium' | 'paid' | 'enterprise'
          starting_price?: number | null
          website_url?: string | null
          logo_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          tagline?: string | null
          description?: string | null
          category?: string
          use_cases?: string[]
          pricing_model?: 'free' | 'freemium' | 'paid' | 'enterprise'
          starting_price?: number | null
          website_url?: string | null
          logo_url?: string | null
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      team_subscriptions: {
        Row: {
          id: string
          team_id: string
          ai_tool_id: string | null
          custom_tool_name: string | null
          seats: number
          monthly_cost: number
          next_renewal_date: string | null
          assigned_to: string[]
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          team_id: string
          ai_tool_id?: string | null
          custom_tool_name?: string | null
          seats?: number
          monthly_cost: number
          next_renewal_date?: string | null
          assigned_to?: string[]
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          ai_tool_id?: string | null
          custom_tool_name?: string | null
          seats?: number
          monthly_cost?: number
          next_renewal_date?: string | null
          assigned_to?: string[]
          notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'team_subscriptions_team_id_fkey'
            columns: ['team_id']
            isOneToOne: false
            referencedRelation: 'teams'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'team_subscriptions_ai_tool_id_fkey'
            columns: ['ai_tool_id']
            isOneToOne: false
            referencedRelation: 'ai_tools'
            referencedColumns: ['id']
          }
        ]
      }
      quiz_responses: {
        Row: {
          id: string
          team_id: string
          industry: string | null
          team_size: string | null
          primary_use_cases: string[]
          monthly_budget: string | null
          current_tools: string[]
          created_at: string
        }
        Insert: {
          id?: string
          team_id: string
          industry?: string | null
          team_size?: string | null
          primary_use_cases?: string[]
          monthly_budget?: string | null
          current_tools?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          industry?: string | null
          team_size?: string | null
          primary_use_cases?: string[]
          monthly_budget?: string | null
          current_tools?: string[]
        }
        Relationships: [
          {
            foreignKeyName: 'quiz_responses_team_id_fkey'
            columns: ['team_id']
            isOneToOne: false
            referencedRelation: 'teams'
            referencedColumns: ['id']
          }
        ]
      }
      team_comparisons: {
        Row: {
          id: string
          team_id: string
          tool_ids: string[]
          name: string | null
          verdict: string | null
          created_at: string
        }
        Insert: {
          id?: string
          team_id: string
          tool_ids: string[]
          name?: string | null
          verdict?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          tool_ids?: string[]
          name?: string | null
          verdict?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'team_comparisons_team_id_fkey'
            columns: ['team_id']
            isOneToOne: false
            referencedRelation: 'teams'
            referencedColumns: ['id']
          }
        ]
      }
      overlap_alerts: {
        Row: {
          id: string
          team_id: string
          subscription_ids: string[]
          overlap_category: string
          severity: 'low' | 'medium' | 'high'
          is_dismissed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          team_id: string
          subscription_ids: string[]
          overlap_category: string
          severity?: 'low' | 'medium' | 'high'
          is_dismissed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          subscription_ids?: string[]
          overlap_category?: string
          severity?: 'low' | 'medium' | 'high'
          is_dismissed?: boolean
        }
        Relationships: [
          {
            foreignKeyName: 'overlap_alerts_team_id_fkey'
            columns: ['team_id']
            isOneToOne: false
            referencedRelation: 'teams'
            referencedColumns: ['id']
          }
        ]
      }
      renewal_reminders: {
        Row: {
          id: string
          team_id: string
          subscription_id: string
          reminder_date: string
          sent_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          team_id: string
          subscription_id: string
          reminder_date: string
          sent_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          subscription_id?: string
          reminder_date?: string
          sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'renewal_reminders_team_id_fkey'
            columns: ['team_id']
            isOneToOne: false
            referencedRelation: 'teams'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'renewal_reminders_subscription_id_fkey'
            columns: ['subscription_id']
            isOneToOne: false
            referencedRelation: 'team_subscriptions'
            referencedColumns: ['id']
          }
        ]
      }
      audit_log: {
        Row: {
          id: string
          team_id: string
          actor_profile_id: string | null
          action: string
          resource_type: string
          resource_id: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          team_id: string
          actor_profile_id?: string | null
          action: string
          resource_type: string
          resource_id?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          actor_profile_id?: string | null
          action?: string
          resource_type?: string
          resource_id?: string | null
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: 'audit_log_team_id_fkey'
            columns: ['team_id']
            isOneToOne: false
            referencedRelation: 'teams'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      requesting_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
