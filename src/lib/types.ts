export type Platform = "youtube" | "tiktok" | "instagram" | "facebook";
export type ContentType = "video" | "reel" | "story" | "post" | "short";
export type TimeRange = "7d" | "30d" | "90d";

export interface ContentItem {
  id: string;
  title: string;
  platform: Platform;
  contentType: ContentType;
  publishDate: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  watchTime?: number; // minutes
  retention?: number; // percentage
  subscriberDelta?: number;
  saves?: number;
  reach?: number;
  thumbnailUrl?: string;
}

export interface PlatformStats {
  platform: Platform;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  followers: number;
  followersDelta: number;
  engagementRate: number;
  viewsTrend: number; // percentage change
}

export interface DailyMetric {
  date: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  subscribers?: number;
}

export interface PlatformDailyData {
  platform: Platform;
  metrics: DailyMetric[];
}

export const PLATFORM_LABELS: Record<Platform, string> = {
  youtube: "YouTube",
  tiktok: "TikTok",
  instagram: "Instagram",
  facebook: "Facebook",
};

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  video: "Video",
  reel: "Reel",
  story: "Story",
  post: "Post",
  short: "Short",
};
