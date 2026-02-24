// Instagram API Service - Fetch posts and analytics
import { getFacebookTokens } from './facebook-oauth-simple'
import { getMetaAccessToken, getInstagramAccountId } from './meta-api'

// Helper to get tokens from either OAuth (database) or manual (localStorage)
async function getTokensAndAccountId() {
  // Try OAuth first
  const oauthTokens = await getFacebookTokens()
  if (oauthTokens && oauthTokens.instagram_business_account_id) {
    return {
      accessToken: oauthTokens.page_access_token || oauthTokens.access_token,
      instagramAccountId: oauthTokens.instagram_business_account_id
    }
  }

  // Fall back to manual localStorage
  const manualToken = getMetaAccessToken()
  const manualIgId = getInstagramAccountId()
  if (manualToken && manualIgId) {
    return {
      accessToken: manualToken,
      instagramAccountId: manualIgId
    }
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
}

export interface InstagramInsights {
  postId: string
  impressions: number
  reach: number
  engagement: number // likes + comments + saves
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
  try {
    const tokens = await getTokensAndAccountId()
    if (!tokens) {
      console.log('No Instagram Business Account found')
      return null
    }

    const igAccountId = tokens.instagramAccountId
    const accessToken = tokens.accessToken

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${igAccountId}?fields=id,username,name,biography,followers_count,follows_count,media_count,profile_picture_url&access_token=${accessToken}`
    )

    const data = await response.json()

    if (data.error) {
      console.error('Instagram API error:', data.error)
      return null
    }

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
  } catch (error) {
    console.error('Error fetching Instagram profile:', error)
    return null
  }
}

export async function fetchInstagramPosts(limit: number = 25): Promise<InstagramPost[]> {
  try {
    const tokens = await getTokensAndAccountId()
    if (!tokens) {
      return []
    }

    const igAccountId = tokens.instagramAccountId
    const accessToken = tokens.accessToken

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${igAccountId}/media?fields=id,caption,media_type,media_url,permalink,timestamp,thumbnail_url,username&limit=${limit}&access_token=${accessToken}`
    )

    const data = await response.json()

    if (data.error) {
      console.error('Instagram API error:', data.error)
      return []
    }

    return (data.data || []).map((post: any) => ({
      id: post.id,
      caption: post.caption || '',
      mediaType: post.media_type,
      mediaUrl: post.media_url,
      permalink: post.permalink,
      timestamp: post.timestamp,
      thumbnailUrl: post.thumbnail_url,
      username: post.username,
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

    const accessToken = tokens.accessToken

    // Fetch insights for the post
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${postId}/insights?metric=impressions,reach,engagement,saved,likes,comments&access_token=${accessToken}`
    )

    const data = await response.json()

    if (data.error) {
      console.error('Instagram insights error:', data.error)
      return null
    }

    const insights: any = {}

    data.data?.forEach((metric: any) => {
      insights[metric.name] = metric.values?.[0]?.value || 0
    })

    return {
      postId,
      impressions: insights.impressions || 0,
      reach: insights.reach || 0,
      engagement: insights.engagement || 0,
      likes: insights.likes || 0,
      comments: insights.comments || 0,
      saves: insights.saved || 0,
      shares: 0, // Not available in basic API
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
    if (!tokens) {
      return null
    }

    const igAccountId = tokens.instagramAccountId
    const accessToken = tokens.accessToken

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${igAccountId}/insights?metric=impressions,reach,follower_count,profile_views&period=${period}&access_token=${accessToken}`
    )

    const data = await response.json()

    if (data.error) {
      console.error('Account insights error:', data.error)
      return null
    }

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
