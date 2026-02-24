// Simplified Facebook/Instagram OAuth - No Edge Function Needed
import { supabase, ensureAuth } from './supabase'

const FACEBOOK_APP_ID = '1474987804044568'
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
    response_type: 'token', // Using implicit flow (simpler, no server needed)
    state: Math.random().toString(36).substring(7),
  })

  return `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`
}

export function initiateFacebookAuth(): void {
  const authUrl = getFacebookAuthUrl()
  window.location.href = authUrl
}

export async function handleAuthCallback(accessToken: string): Promise<{ success: boolean; error?: string }> {
  try {
    await ensureAuth()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('No user found')
    }

    // Get user's Facebook pages
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`
    )

    const pagesData = await pagesResponse.json()

    if (pagesData.error) {
      throw new Error(pagesData.error.message)
    }

    const pages = pagesData.data || []

    // Get Instagram Business Account ID from the first page
    let instagramBusinessAccountId = null
    let pageAccessToken = null

    if (pages.length > 0) {
      pageAccessToken = pages[0].access_token
      const page = pages[0]

      const igResponse = await fetch(
        `https://graph.facebook.com/v18.0/${page.id}?fields=instagram_business_account&access_token=${pageAccessToken}`
      )

      const igData = await igResponse.json()
      instagramBusinessAccountId = igData.instagram_business_account?.id || null
    }

    // User access tokens from implicit flow last 60 days
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 60)

    // Store in database
    const { error: dbError } = await supabase
      .from('facebook_tokens')
      .upsert({
        user_id: user.id,
        access_token: accessToken,
        expires_at: expiresAt.toISOString(),
        page_access_token: pageAccessToken,
        instagram_business_account_id: instagramBusinessAccountId,
        pages: pages,
      })

    if (dbError) {
      console.error('Database error:', dbError)
      throw dbError
    }

    return { success: true }
  } catch (error) {
    console.error('Error handling auth callback:', error)
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
      if (error.code === 'PGRST116') {
        // No rows found
        return null
      }
      console.error('Error fetching Facebook tokens:', error)
      return null
    }

    // Check if token is expired
    if (data && new Date(data.expires_at) < new Date()) {
      console.log('Facebook token expired, please reconnect')
      return null
    }

    return data
  } catch (error) {
    console.error('Error getting Facebook tokens:', error)
    return null
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const tokens = await getFacebookTokens()
  return tokens !== null
}

export async function getPageInfo() {
  const tokens = await getFacebookTokens()
  if (!tokens || !tokens.pages || tokens.pages.length === 0) return null

  return {
    pageName: tokens.pages[0].name,
    pageId: tokens.pages[0].id,
    hasInstagram: !!tokens.instagram_business_account_id,
  }
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
