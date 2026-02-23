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

// DM Pipeline Types
export type DMPlatform = "facebook" | "instagram";

export type ChatStage = "CONNECT" | "QUALIFY" | "CONVERT";

export interface DMEntry {
  id: string;
  date: string;
  day: string; // e.g., "Monday"
  platform: DMPlatform;
  chatsStarted: number;
  activeChats: number;
  triageBooked: number;
  triageShowUp: number;
  strategyBooked: number;
  strategyShowUp: number;
  wins: number;
  nurture: number;
  // Chat stage breakdown
  connectStage: number; // How many in CONNECT stage
  qualifyStage: number; // How many in QUALIFY stage
  convertStage: number; // How many in CONVERT stage
}

export interface DMStats {
  platform: DMPlatform;
  totalChatsStarted: number;
  totalActiveChats: number;
  totalTriageBooked: number;
  totalTriageShowUp: number;
  totalStrategyBooked: number;
  totalStrategyShowUp: number;
  totalWins: number;
  totalNurture: number;
  conversionRate: number; // wins / chatsStarted
  triageShowRate: number; // triageShowUp / triageBooked
  strategyShowRate: number; // strategyShowUp / strategyBooked
}

export const DM_PLATFORM_LABELS: Record<DMPlatform, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
};

export const CHAT_STAGES: Record<ChatStage, string> = {
  CONNECT: "Connect",
  QUALIFY: "Qualify",
  CONVERT: "Convert",
};
