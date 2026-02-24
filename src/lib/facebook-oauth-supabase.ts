// Facebook/Instagram OAuth with Supabase
import { supabase, ensureAuth } from './supabase'

const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID || '1474987804044568'
const FACEBOOK_REDIRECT_URI = 'https://social.masonvanmeter.com/facebook/callback'

// Facebook OAuth scopes for Instagram Business API
const FACEBOOK_SCOPES = [
  'pages_show_list',
  'pages_read_engagement',
  'pages_read_user_content',
  'instagram_basic',
  'instagram_manage_insights',
  'business_management'
].join(',')

export function getFacebookAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: FACEBOOK_APP_ID,
    redirect_uri: FACEBOOK_REDIRECT_URI,
    scope: FACEBOOK_SCOPES,
    response_type: 'code',
    state: Math.random().toString(36).substring(7), // CSRF protection
  })

  return `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`
}

export function initiateFacebookAuth(): void {
  const authUrl = getFacebookAuthUrl()
  window.location.href = authUrl
}

export async function exchangeCodeForToken(code: string): Promise<{ success: boolean; error?: string }> {
  try {
    await ensureAuth()

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      throw new Error('No session found')
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    const response = await fetch(`${supabaseUrl}/functions/v1/facebook-oauth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': supabaseAnonKey,
      },
      body: JSON.stringify({ action: 'exchange', code }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to exchange token')
    }

    return { success: true }
  } catch (error) {
    console.error('Error exchanging code for token:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function getFacebookTokens() {
  try {
    await ensureAuth()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('facebook_tokens')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('Error fetching Facebook tokens:', error)
      return null
    }

    // Check if token is expired
    if (data && new Date(data.expires_at) < new Date()) {
      console.log('Facebook token expired, refreshing...')
      const refreshed = await refreshFacebookToken()
      if (!refreshed) return null

      // Fetch again after refresh
      const { data: refreshedData } = await supabase
        .from('facebook_tokens')
        .select('*')
        .eq('user_id', user.id)
        .single()

      return refreshedData
    }

    return data
  } catch (error) {
    console.error('Error getting Facebook tokens:', error)
    return null
  }
}

async function refreshFacebookToken(): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return false

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    const response = await fetch(`${supabaseUrl}/functions/v1/facebook-oauth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': supabaseAnonKey,
      },
      body: JSON.stringify({ action: 'refresh' }),
    })

    return response.ok
  } catch (error) {
    console.error('Error refreshing Facebook token:', error)
    return false
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const tokens = await getFacebookTokens()
  return tokens !== null
}

export async function disconnectFacebook(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { error } = await supabase
      .from('facebook_tokens')
      .delete()
      .eq('user_id', user.id)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error disconnecting Facebook:', error)
    return false
  }
}
