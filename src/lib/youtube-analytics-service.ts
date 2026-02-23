// YouTube Analytics Service - Fetch real data from YouTube APIs
import { getYouTubeTokens } from './youtube-oauth-supabase'

export interface YouTubeVideo {
  id: string
  title: string
  description: string
  publishedAt: string
  thumbnailUrl: string
  statistics: {
    viewCount: number
    likeCount: number
    commentCount: number
  }
  contentDetails: {
    duration: string
  }
}

export interface VideoAnalytics {
  videoId: string
  views: number
  watchTime: number // minutes
  averageViewDuration: number // seconds
  averageViewPercentage: number
  likes: number
  dislikes: number
  comments: number
  shares: number
  subscribersGained: number
  subscribersLost: number
  estimatedRevenue?: number
  impressions: number
  impressionClickThroughRate: number // CTR as percentage
}

export interface TrafficSource {
  source: string
  views: number
  percentage: number
}

export interface DemographicData {
  ageGroup: string
  gender: string
  viewsPercentage: number
}

export interface AnalyticsOverview {
  views: number
  watchTime: number
  averageViewDuration: number
  subscribers: number
  estimatedRevenue?: number
}

// Fetch channel's videos
export async function fetchYouTubeVideos(maxResults: number = 50): Promise<YouTubeVideo[]> {
  const tokens = await getYouTubeTokens()

  if (!tokens) {
    throw new Error('Not authenticated with YouTube')
  }

  // Get channel's uploads playlist
  const channelResponse = await fetch(
    'https://www.googleapis.com/youtube/v3/channels?part=contentDetails&mine=true',
    {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
      },
    }
  )

  const channelData = await channelResponse.json()
  const uploadsPlaylistId = channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads

  if (!uploadsPlaylistId) {
    throw new Error('Could not find uploads playlist')
  }

  // Get videos from uploads playlist
  const playlistResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}`,
    {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
      },
    }
  )

  const playlistData = await playlistResponse.json()
  const videoIds = playlistData.items?.map((item: any) => item.snippet.resourceId.videoId).join(',')

  if (!videoIds) {
    return []
  }

  // Get detailed video statistics
  const videosResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds}`,
    {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
      },
    }
  )

  const videosData = await videosResponse.json()

  return videosData.items?.map((video: any) => ({
    id: video.id,
    title: video.snippet.title,
    description: video.snippet.description,
    publishedAt: video.snippet.publishedAt,
    thumbnailUrl: video.snippet.thumbnails.medium.url,
    statistics: {
      viewCount: parseInt(video.statistics.viewCount || '0'),
      likeCount: parseInt(video.statistics.likeCount || '0'),
      commentCount: parseInt(video.statistics.commentCount || '0'),
    },
    contentDetails: {
      duration: video.contentDetails.duration,
    },
  })) || []
}

// Fetch analytics for channel or specific video
export async function fetchYouTubeAnalytics(
  startDate: string,
  endDate: string,
  videoId?: string
): Promise<AnalyticsOverview> {
  const tokens = await getYouTubeTokens()

  if (!tokens) {
    throw new Error('Not authenticated with YouTube')
  }

  const analyticsUrl = new URL('https://youtubeanalytics.googleapis.com/v2/reports')
  analyticsUrl.searchParams.set('ids', `channel==${tokens.channel_id}`)
  analyticsUrl.searchParams.set('startDate', startDate)
  analyticsUrl.searchParams.set('endDate', endDate)
  analyticsUrl.searchParams.set('metrics', 'views,estimatedMinutesWatched,averageViewDuration,subscribersGained')

  if (videoId) {
    analyticsUrl.searchParams.set('filters', `video==${videoId}`)
  }

  const response = await fetch(analyticsUrl.toString(), {
    headers: {
      'Authorization': `Bearer ${tokens.access_token}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch YouTube analytics')
  }

  const data = await response.json()
  const row = data.rows?.[0] || [0, 0, 0, 0]

  return {
    views: row[0] || 0,
    watchTime: row[1] || 0,
    averageViewDuration: row[2] || 0,
    subscribers: row[3] || 0,
  }
}

// Fetch detailed video analytics
export async function fetchVideoAnalytics(
  videoId: string,
  startDate: string,
  endDate: string
): Promise<VideoAnalytics> {
  const tokens = await getYouTubeTokens()

  if (!tokens) {
    throw new Error('Not authenticated with YouTube')
  }

  // First, try to get basic metrics
  const analyticsUrl = new URL('https://youtubeanalytics.googleapis.com/v2/reports')
  analyticsUrl.searchParams.set('ids', `channel==${tokens.channel_id}`)
  analyticsUrl.searchParams.set('startDate', startDate)
  analyticsUrl.searchParams.set('endDate', endDate)
  analyticsUrl.searchParams.set('filters', `video==${videoId}`)
  analyticsUrl.searchParams.set('metrics', 'views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,likes,comments,shares,subscribersGained,subscribersLost')

  const response = await fetch(analyticsUrl.toString(), {
    headers: {
      'Authorization': `Bearer ${tokens.access_token}`,
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('YouTube Analytics API error:', errorText)
    throw new Error(`Failed to fetch video analytics: ${response.status}`)
  }

  const data = await response.json()
  console.log('Raw API response for video:', videoId, data)

  const row = data.rows?.[0] || Array(9).fill(0)

  return {
    videoId,
    views: row[0] || 0,
    watchTime: row[1] || 0,
    averageViewDuration: row[2] || 0,
    averageViewPercentage: row[3] || 0,
    likes: row[4] || 0,
    dislikes: 0, // YouTube removed dislikes
    comments: row[5] || 0,
    shares: row[6] || 0,
    subscribersGained: row[7] || 0,
    subscribersLost: row[8] || 0,
    impressions: 0, // Not available via API
    impressionClickThroughRate: 0, // Not available via API
  }
}

// Fetch traffic sources
export async function fetchTrafficSources(
  startDate: string,
  endDate: string
): Promise<TrafficSource[]> {
  const tokens = await getYouTubeTokens()

  if (!tokens) {
    throw new Error('Not authenticated with YouTube')
  }

  const analyticsUrl = new URL('https://youtubeanalytics.googleapis.com/v2/reports')
  analyticsUrl.searchParams.set('ids', `channel==${tokens.channel_id}`)
  analyticsUrl.searchParams.set('startDate', startDate)
  analyticsUrl.searchParams.set('endDate', endDate)
  analyticsUrl.searchParams.set('metrics', 'views')
  analyticsUrl.searchParams.set('dimensions', 'insightTrafficSourceType')
  analyticsUrl.searchParams.set('sort', '-views')

  const response = await fetch(analyticsUrl.toString(), {
    headers: {
      'Authorization': `Bearer ${tokens.access_token}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch traffic sources')
  }

  const data = await response.json()
  const totalViews = data.rows?.reduce((sum: number, row: any) => sum + (row[1] || 0), 0) || 1

  return data.rows?.map((row: any) => ({
    source: formatTrafficSource(row[0]),
    views: row[1] || 0,
    percentage: ((row[1] || 0) / totalViews) * 100,
  })) || []
}

// Fetch analytics over time (for charts)
export async function fetchAnalyticsTimeSeries(
  startDate: string,
  endDate: string,
  metric: string = 'views'
): Promise<Array<{ date: string; value: number }>> {
  const tokens = await getYouTubeTokens()

  if (!tokens) {
    throw new Error('Not authenticated with YouTube')
  }

  const analyticsUrl = new URL('https://youtubeanalytics.googleapis.com/v2/reports')
  analyticsUrl.searchParams.set('ids', `channel==${tokens.channel_id}`)
  analyticsUrl.searchParams.set('startDate', startDate)
  analyticsUrl.searchParams.set('endDate', endDate)
  analyticsUrl.searchParams.set('metrics', metric)
  analyticsUrl.searchParams.set('dimensions', 'day')

  const response = await fetch(analyticsUrl.toString(), {
    headers: {
      'Authorization': `Bearer ${tokens.access_token}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch analytics time series')
  }

  const data = await response.json()

  return data.rows?.map((row: any) => ({
    date: row[0],
    value: row[1] || 0,
  })) || []
}

// Helper function to format traffic source names
function formatTrafficSource(source: string): string {
  const sourceNames: Record<string, string> = {
    'YT_SEARCH': 'YouTube Search',
    'SUBSCRIBER': 'Subscribers',
    'SUGGESTED_VIDEO': 'Suggested Videos',
    'PLAYLIST': 'Playlists',
    'YT_OTHER_PAGE': 'Other YouTube Features',
    'EXTERNAL_APP': 'External Apps',
    'EXTERNAL_URL': 'External Websites',
    'NOTIFICATION': 'Notifications',
    'BROWSE': 'Browse Features',
    'ADVERTISING': 'Advertising',
  }

  return sourceNames[source] || source
}

// Parse ISO 8601 duration to readable format
export function parseDuration(duration: string): string {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/)

  if (!match) return '0:00'

  const hours = parseInt(match[1]) || 0
  const minutes = parseInt(match[2]) || 0
  const seconds = parseInt(match[3]) || 0

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
