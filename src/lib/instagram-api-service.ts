// Instagram API Service - Routes all calls through metaFetch for auto-refresh
import { getFacebookTokens } from './facebook-oauth-simple'
import { getMetaAccessToken, getInstagramAccountId } from './meta-api'

// Re-export metaFetch as a module-level helper
import { refreshPageToken } from './facebook-oauth-simple'

const BASE_URL = 'https://graph.facebook.com/v22.0'

// Shared fetch with auto-refresh on 190 errors (mirrors meta-api.ts logic)
async function igFetch(
  endpoint: string,
  params: Record<string, string> = {},
  tokenOverride?: string,
  _isRetry = false
) {
  const tokens = await getTokensAndAccountId()
  const token = tokenOverride || tokens?.accessToken
  if (!token) throw new Error('No Instagram/Meta access token available')

  const url = new URL(`${BASE_URL}/${endpoint}`)
  url.searchParams.set('access_token', token)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))

  const res = await fetch(url.toString())
  const data = await res.json()

  if (data.error) {
    // Auto-refresh on expired token (code 190) — retry once
    if (data.error.code === 190 && !_isRetry) {
      console.log('[igFetch] Token expired (190), attempting auto-refresh...')
      const freshToken = await refreshPageToken()
      if (freshToken) {
        console.log('[igFetch] Refresh succeeded, retrying request...')
        return igFetch(endpoint, params, freshToken, true)
      }
    }
    throw new Error(`Instagram API: ${data.error.message}`)
  }

  return data
}

// Helper to get tokens from either OAuth (database) or manual (localStorage)
async function getTokensAndAccountId() {
  const oauthTokens = await getFacebookTokens()
  if (oauthTokens && oauthTokens.instagram_business_account_id) {
    return {
      accessToken: oauthTokens.page_access_token || oauthTokens.access_token,
      instagramAccountId: oauthTokens.instagram_business_account_id
    }
  }

  const manualToken = await getMetaAccessToken()
  const manualIgId = await getInstagramAccountId()
  if (manualToken && manualIgId) {
    return { accessToken: manualToken, instagramAccountId: manualIgId }
  }

  return null
}

export interface InstagramPost {
  id: string
  caption: string
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  mediaUrl: string
  permalink: string
  timestamp: string
  thumbnailUrl?: string
  username: string
  likeCount: number
  commentsCount: number
}

export interface InstagramInsights {
  postId: string
  impressions: number
  reach: number
  engagement: number
  likes: number
  comments: number
  saves: number
  shares?: number
}

export interface InstagramProfile {
  id: string
  username: string
  name: string
  biography: string
  followersCount: number
  followsCount: number
  mediaCount: number
  profilePictureUrl?: string
}

export async function fetchInstagramProfile(): Promise<InstagramProfile | null> {
  const tokens = await getTokensAndAccountId()
  if (!tokens) {
    console.warn('No Instagram credentials found')
    return null
  }

  const data = await igFetch(tokens.instagramAccountId, {
    fields: 'id,username,name,biography,followers_count,follows_count,media_count,profile_picture_url',
  }, tokens.accessToken)

  return {
    id: data.id,
    username: data.username,
    name: data.name,
    biography: data.biography || '',
    followersCount: data.followers_count || 0,
    followsCount: data.follows_count || 0,
    mediaCount: data.media_count || 0,
    profilePictureUrl: data.profile_picture_url,
  }
}

export async function fetchInstagramPosts(limit: number = 25): Promise<InstagramPost[]> {
  try {
    const tokens = await getTokensAndAccountId()
    if (!tokens) return []

    const data = await igFetch(`${tokens.instagramAccountId}/media`, {
      fields: 'id,caption,media_type,media_url,permalink,timestamp,thumbnail_url,username,like_count,comments_count',
      limit: String(limit),
    }, tokens.accessToken)

    return (data.data || []).map((post: any) => ({
      id: post.id,
      caption: post.caption || '',
      mediaType: post.media_type,
      mediaUrl: post.media_url,
      permalink: post.permalink,
      timestamp: post.timestamp,
      thumbnailUrl: post.thumbnail_url,
      username: post.username,
      likeCount: post.like_count || 0,
      commentsCount: post.comments_count || 0,
    }))
  } catch (error) {
    console.error('Error fetching Instagram posts:', error)
    return []
  }
}

export async function fetchPostInsights(postId: string): Promise<InstagramInsights | null> {
  try {
    const tokens = await getTokensAndAccountId()
    if (!tokens) return null

    const data = await igFetch(`${postId}/insights`, {
      metric: 'impressions,reach,saved,likes,comments,shares',
    }, tokens.accessToken)

    const insights: any = {}
    data.data?.forEach((metric: any) => {
      insights[metric.name] = metric.values?.[0]?.value || 0
    })

    const likes = insights.likes || 0
    const comments = insights.comments || 0
    const saves = insights.saved || 0
    const shares = insights.shares || 0

    return {
      postId,
      impressions: insights.impressions || 0,
      reach: insights.reach || 0,
      engagement: likes + comments + saves,
      likes, comments, saves, shares,
    }
  } catch (error) {
    console.error('Error fetching post insights:', error)
    return null
  }
}

export async function fetchAccountInsights(period: 'day' | 'week' | 'days_28' = 'days_28'): Promise<{
  impressions: number
  reach: number
  followerCount: number
  profileViews: number
} | null> {
  try {
    const tokens = await getTokensAndAccountId()
    if (!tokens) return null

    const data = await igFetch(`${tokens.instagramAccountId}/insights`, {
      metric: 'impressions,reach,follower_count,profile_views',
      period,
    }, tokens.accessToken)

    const insights: any = {}
    data.data?.forEach((metric: any) => {
      insights[metric.name] = metric.values?.[0]?.value || 0
    })

    return {
      impressions: insights.impressions || 0,
      reach: insights.reach || 0,
      followerCount: insights.follower_count || 0,
      profileViews: insights.profile_views || 0,
    }
  } catch (error) {
    console.error('Error fetching account insights:', error)
    return null
  }
}
