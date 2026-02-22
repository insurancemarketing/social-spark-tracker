import { ContentItem, DailyMetric } from "./types";

const BASE_URL = "https://www.googleapis.com/youtube/v3";

export function getYouTubeApiKey(): string | null {
  return localStorage.getItem("youtube_api_key");
}

export function setYouTubeApiKey(key: string) {
  localStorage.setItem("youtube_api_key", key);
}

export function getYouTubeChannelId(): string | null {
  return localStorage.getItem("youtube_channel_id");
}

export function setYouTubeChannelId(id: string) {
  localStorage.setItem("youtube_channel_id", id);
}

async function ytFetch(endpoint: string, params: Record<string, string>) {
  const apiKey = getYouTubeApiKey();
  if (!apiKey) throw new Error("YouTube API key not set");
  const url = new URL(`${BASE_URL}/${endpoint}`);
  url.searchParams.set("key", apiKey);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `YouTube API error: ${res.status}`);
  }
  return res.json();
}

export interface YouTubeChannelStats {
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
  channelTitle: string;
  channelThumbnail: string;
}

export async function fetchChannelStats(channelId: string): Promise<YouTubeChannelStats> {
  const data = await ytFetch("channels", {
    part: "snippet,statistics",
    id: channelId,
  });
  const ch = data.items?.[0];
  if (!ch) throw new Error("Channel not found");
  return {
    subscriberCount: Number(ch.statistics.subscriberCount),
    viewCount: Number(ch.statistics.viewCount),
    videoCount: Number(ch.statistics.videoCount),
    channelTitle: ch.snippet.title,
    channelThumbnail: ch.snippet.thumbnails?.default?.url || "",
  };
}

export async function fetchRecentVideos(channelId: string, maxResults = 20): Promise<ContentItem[]> {
  const searchData = await ytFetch("search", {
    part: "snippet",
    channelId,
    order: "date",
    maxResults: String(maxResults),
    type: "video",
  });

  const videoIds = searchData.items?.map((item: any) => item.id.videoId).join(",");
  if (!videoIds) return [];

  const statsData = await ytFetch("videos", {
    part: "statistics,contentDetails,snippet",
    id: videoIds,
  });

  return statsData.items?.map((v: any) => {
    const duration = v.contentDetails.duration;
    const isShort = parseDuration(duration) <= 60;
    return {
      id: v.id,
      title: v.snippet.title,
      platform: "youtube" as const,
      contentType: isShort ? "short" as const : "video" as const,
      publishDate: v.snippet.publishedAt.split("T")[0],
      views: Number(v.statistics.viewCount || 0),
      likes: Number(v.statistics.likeCount || 0),
      comments: Number(v.statistics.commentCount || 0),
      shares: 0,
      thumbnailUrl: v.snippet.thumbnails?.medium?.url,
    };
  }) || [];
}

function parseDuration(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  return (Number(match[1] || 0) * 3600) + (Number(match[2] || 0) * 60) + Number(match[3] || 0);
}
