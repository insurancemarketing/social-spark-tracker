// YouTube OAuth 2.0 with Supabase Backend
import { supabase, ensureAuth } from './supabase'

const YOUTUBE_OAUTH_CONFIG = {
  clientId: import.meta.env.VITE_YOUTUBE_CLIENT_ID || '',
  redirectUri: `${window.location.origin}/youtube/callback`,
  scopes: [
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/yt-analytics.readonly',
    'https://www.googleapis.com/auth/yt-analytics-monetary.readonly', // For revenue data
  ],
}

export function getYouTubeAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: YOUTUBE_OAUTH_CONFIG.clientId,
    redirect_uri: YOUTUBE_OAUTH_CONFIG.redirectUri,
    response_type: 'code',
    scope: YOUTUBE_OAUTH_CONFIG.scopes.join(' '),
    access_type: 'offline', // Get refresh token
    prompt: 'consent',
  })

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

export function initiateYouTubeAuth(): void {
  const authUrl = getYouTubeAuthUrl()
  window.location.href = authUrl
}

export async function exchangeCodeForToken(code: string): Promise<{ success: boolean; channelTitle?: string; channelId?: string; error?: string }> {
  try {
    await ensureAuth()

    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      throw new Error('Not authenticated')
    }

    // Call Supabase Edge Function
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const response = await fetch(`${supabaseUrl}/functions/v1/youtube-oauth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        action: 'exchange',
        code,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to exchange code')
    }

    return result
  } catch (error) {
    console.error('Token exchange error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function getYouTubeTokens() {
  try {
    await ensureAuth()

    const { data, error } = await supabase
      .from('youtube_tokens')
      .select('*')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No token found
        return null
      }
      throw error
    }

    // Check if token is expired
    const expiresAt = new Date(data.expires_at)
    const now = new Date()

    if (expiresAt <= now && data.refresh_token) {
      // Token expired, refresh it
      return await refreshYouTubeToken(data.refresh_token)
    }

    return data
  } catch (error) {
    console.error('Error getting YouTube tokens:', error)
    return null
  }
}

async function refreshYouTubeToken(refreshToken: string) {
  try {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      throw new Error('Not authenticated')
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const response = await fetch(`${supabaseUrl}/functions/v1/youtube-oauth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        action: 'refresh',
        refreshToken,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to refresh token')
    }

    // Get updated tokens from database
    return await getYouTubeTokens()
  } catch (error) {
    console.error('Token refresh error:', error)
    return null
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const tokens = await getYouTubeTokens()
  return !!tokens
}

export async function fetchYouTubeAnalytics(startDate: string, endDate: string) {
  const tokens = await getYouTubeTokens()

  if (!tokens) {
    throw new Error('Not authenticated with YouTube')
  }

  // Fetch analytics data
  const analyticsUrl = new URL('https://youtubeanalytics.googleapis.com/v2/reports')
  analyticsUrl.searchParams.set('ids', `channel==${tokens.channel_id}`)
  analyticsUrl.searchParams.set('startDate', startDate)
  analyticsUrl.searchParams.set('endDate', endDate)
  analyticsUrl.searchParams.set('metrics', 'views,estimatedMinutesWatched,averageViewDuration,subscribersGained,likes,comments,shares')
  analyticsUrl.searchParams.set('dimensions', 'day')

  const response = await fetch(analyticsUrl.toString(), {
    headers: {
      'Authorization': `Bearer ${tokens.access_token}`,
    },
  })

  if (!response.ok) {
    // Token might be expired, try to refresh
    if (response.status === 401 && tokens.refresh_token) {
      const refreshedTokens = await refreshYouTubeToken(tokens.refresh_token)
      if (refreshedTokens) {
        // Retry with new token
        const retryResponse = await fetch(analyticsUrl.toString(), {
          headers: {
            'Authorization': `Bearer ${refreshedTokens.access_token}`,
          },
        })
        if (retryResponse.ok) {
          return retryResponse.json()
        }
      }
    }
    throw new Error('Failed to fetch YouTube analytics')
  }

  return response.json()
}

export async function fetchChannelInfo() {
  const tokens = await getYouTubeTokens()

  if (!tokens) {
    throw new Error('Not authenticated with YouTube')
  }

  const response = await fetch(
    'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true',
    {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error('Failed to fetch channel info')
  }

  return response.json()
}

export async function disconnectYouTube() {
  await ensureAuth()

  const { error } = await supabase
    .from('youtube_tokens')
    .delete()
    .eq('user_id', (await supabase.auth.getUser()).data.user?.id)

  if (error) {
    console.error('Error disconnecting YouTube:', error)
    throw error
  }
}
