import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tkavzevkgavcxsvtizlu.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrYXZ6ZXZrZ2F2Y3hzdnRpemx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NTk2ODMsImV4cCI6MjA4NzQzNTY4M30.yeazWCYSuAMJYz06mHsRqBxycHfaOO0Nfl5MgeIgUJA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface DMEntry {
  id: string
  created_at: string
  user_id: string
  date: string
  day: string
  platform: 'facebook' | 'instagram'
  chats_started: number
  active_chats: number
  triage_booked: number
  triage_show_up: number
  strategy_booked: number
  strategy_show_up: number
  wins: number
  nurture: number
  connect_stage: number
  qualify_stage: number
  convert_stage: number
}

export interface YouTubeToken {
  id: string
  created_at: string
  updated_at: string
  user_id: string
  access_token: string
  refresh_token: string | null
  expires_at: string
  channel_id: string | null
  channel_title: string | null
}

// Helper function to ensure user is authenticated
export async function ensureAuth() {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // Sign in anonymously if no user
    const { data, error } = await supabase.auth.signInAnonymously()
    if (error) {
      console.error('Failed to sign in:', error)
      throw error
    }
    return data.user
  }

  return user
}
