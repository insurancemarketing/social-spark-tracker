// Simplified Facebook/Instagram OAuth - No Edge Function Needed
import { supabase } from './supabase'
import { saveUserSettings } from './user-settings-service'

const FACEBOOK_APP_ID = '2064832031041409'
const FACEBOOK_REDIRECT_URI = 'https://social.masonvanmeter.com/facebook/callback'

// Facebook OAuth scopes for Instagram Business API
const FACEBOOK_SCOPES = [
  'pages_show_list',
  'pages_read_engagement',
  'instagram_basic',
  'instagram_manage_insights',
  'business_management'
].join(',')

export function getFacebookAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: FACEBOOK_APP_ID,
    redirect_uri: FACEBOOK_REDIRECT_URI,
    scope: FACEBOOK_SCOPES,
    response_type: 'token',
    auth_type: 'rerequest',
    state: Math.random().toString(36).substring(7),
  })

  return `https://www.facebook.com/v22.0/dialog/oauth?${params.toString()}`
}

export function initiateFacebookAuth(): void {
  const authUrl = getFacebookAuthUrl()
  window.location.href = authUrl
}

export async function handleAuthCallback(accessToken: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[FB Auth] Step 1: Checking authentication...')
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      // Don't use ensureAuth() here — we need a real logged-in user, not anonymous
      return {
        success: false,
        error: 'No authenticated session found. Please log in first, then try connecting Facebook again.'
      }
    }

    if (user.is_anonymous) {
      return {
        success: false,
        error: 'You are signed in anonymously. Please log in with email first, then try connecting Facebook again.'
      }
    }

    console.log('[FB Auth] Step 1 OK: User', user.id)

    // Get user's Facebook pages
    console.log('[FB Auth] Step 2: Fetching Facebook pages...')
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v22.0/me/accounts?access_token=${accessToken}`
    )

    const pagesData = await pagesResponse.json()

    if (pagesData.error) {
      console.error('[FB Auth] Step 2 FAILED: Graph API error', pagesData.error)
      return {
        success: false,
        error: `Facebook Graph API error: ${pagesData.error.message} (code: ${pagesData.error.code}, type: ${pagesData.error.type})`
      }
    }

    const pages = pagesData.data || []
    console.log('[FB Auth] Step 2 OK: Found', pages.length, 'pages')

    // Step 2b: Check granted permissions
    console.log('[FB Auth] Step 2b: Checking granted permissions...')
    try {
      const permsResponse = await fetch(
        `https://graph.facebook.com/v22.0/me/permissions?access_token=${accessToken}`
      )
      const permsData = await permsResponse.json()
      const granted = (permsData.data || []).filter((p: any) => p.status === 'granted').map((p: any) => p.permission)
      const declined = (permsData.data || []).filter((p: any) => p.status === 'declined').map((p: any) => p.permission)
      console.log('[FB Auth] Step 2b: Granted:', granted.join(', '))
      if (declined.length > 0) console.log('[FB Auth] Step 2b: Declined:', declined.join(', '))

      if (declined.includes('pages_show_list')) {
        return {
          success: false,
          error: 'The "pages_show_list" permission was declined. Please reconnect and grant all requested permissions.'
        }
      }
    } catch (permErr) {
      console.warn('[FB Auth] Step 2b WARNING: Could not check permissions:', permErr)
    }

    // Fail if no pages were shared
    if (pages.length === 0) {
      return {
        success: false,
        error: 'No Facebook Pages were shared. Please reconnect and make sure to select your Facebook Page on the permissions screen. In Development Mode, you must explicitly check the box next to your Page.'
      }
    }

    // Get Instagram Business Account ID from the first page
    let instagramBusinessAccountId = null
    let pageAccessToken = null

    if (pages.length > 0) {
      pageAccessToken = pages[0].access_token
      const page = pages[0]

      console.log('[FB Auth] Step 3: Fetching Instagram business account for page', page.id)
      const igResponse = await fetch(
        `https://graph.facebook.com/v22.0/${page.id}?fields=instagram_business_account&access_token=${pageAccessToken}`
      )

      const igData = await igResponse.json()
      instagramBusinessAccountId = igData.instagram_business_account?.id || null
      console.log('[FB Auth] Step 3 OK: Instagram ID =', instagramBusinessAccountId)
    }

    // User access tokens from implicit flow last 60 days
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 60)

    // Store in database with explicit onConflict to handle reconnection
    console.log('[FB Auth] Step 4: Upserting facebook_tokens...')
    const { error: dbError } = await supabase
      .from('facebook_tokens')
      .upsert({
        user_id: user.id,
        access_token: accessToken,
        expires_at: expiresAt.toISOString(),
        page_access_token: pageAccessToken,
        instagram_business_account_id: instagramBusinessAccountId,
        pages: pages,
      }, { onConflict: 'user_id' })

    if (dbError) {
      console.error('[FB Auth] Step 4 FAILED: DB upsert error', JSON.stringify(dbError))
      return {
        success: false,
        error: `Database error: ${dbError.message} (code: ${dbError.code}, details: ${dbError.details})`
      }
    }
    console.log('[FB Auth] Step 4 OK: Tokens saved')

    // Sync tokens into user_settings so Facebook/Instagram pages work automatically
    console.log('[FB Auth] Step 5: Syncing to user_settings...')
    try {
      await saveUserSettings({
        meta_access_token: pageAccessToken || accessToken,
        instagram_account_id: instagramBusinessAccountId,
        facebook_page_id: pages.length > 0 ? pages[0].id : null,
      })
      console.log('[FB Auth] Step 5 OK: Settings synced')
    } catch (syncError) {
      console.warn('[FB Auth] Step 5 WARNING: Settings sync failed (non-fatal):', syncError)
    }

    return { success: true }
  } catch (error) {
    console.error('[FB Auth] Unexpected error:', error)
    const message = error instanceof Error
      ? error.message
      : typeof error === 'object'
        ? JSON.stringify(error)
        : String(error)
    return {
      success: false,
      error: `Unexpected error: ${message}`
    }
  }
}

export async function getFacebookTokens() {
  try {

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
