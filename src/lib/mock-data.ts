import { ContentItem, PlatformStats, PlatformDailyData, DailyMetric } from "./types";

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateDailyMetrics(days: number, base: { views: number; likes: number; comments: number; shares: number; subscribers?: number }): DailyMetric[] {
  const metrics: DailyMetric[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const variance = 0.7 + Math.random() * 0.6;
    metrics.push({
      date: date.toISOString().split("T")[0],
      views: Math.round(base.views * variance),
      likes: Math.round(base.likes * variance),
      comments: Math.round(base.comments * variance),
      shares: Math.round(base.shares * variance),
      subscribers: base.subscribers ? Math.round(base.subscribers * (0.9 + Math.random() * 0.2)) : undefined,
    });
  }
  return metrics;
}

export const mockPlatformStats: PlatformStats[] = [
  { platform: "youtube", totalViews: 2450000, totalLikes: 185000, totalComments: 42000, totalShares: 18500, followers: 125000, followersDelta: 3200, engagementRate: 6.8, viewsTrend: 12.5 },
  { platform: "tiktok", totalViews: 8900000, totalLikes: 720000, totalComments: 95000, totalShares: 145000, followers: 340000, followersDelta: 15000, engagementRate: 10.2, viewsTrend: 24.3 },
  { platform: "instagram", totalViews: 1200000, totalLikes: 290000, totalComments: 35000, totalShares: 22000, followers: 89000, followersDelta: 2100, engagementRate: 8.1, viewsTrend: -3.2 },
  { platform: "facebook", totalViews: 680000, totalLikes: 45000, totalComments: 12000, totalShares: 8500, followers: 52000, followersDelta: 800, engagementRate: 4.5, viewsTrend: -1.8 },
];

const ytTitles = ["How I Got 1M Views in 24 Hours", "The Algorithm Secret Nobody Talks About", "My Studio Setup Tour 2025", "Reacting to My First Video", "10 Tips for New Creators", "Behind the Scenes of a Viral Video", "Q&A: Your Questions Answered", "Collab with @CreatorX"];
const ttTitles = ["POV: When the beat drops 🔥", "This trend but make it fashion", "Day in my life as a creator", "Trying viral food hacks", "Storytime: The craziest DM", "Get ready with me ✨", "Unpopular opinions pt.3", "Duet challenge gone wrong"];
const igTitles = ["Golden hour vibes ☀️", "New collection drop!", "Behind the lens 📸", "Travel diary: Tokyo", "Fit check of the week", "Skincare routine that works", "Studio session recap", "Weekend mood board"];
const fbTitles = ["Community Update: Big News!", "Live Q&A Recap", "Our Journey So Far", "Tips & Tricks Thread", "Fan Spotlight: Amazing Creations", "Throwback to our first post", "Poll: What should we do next?", "Weekly roundup"];

function generateContent(titles: string[], platform: ContentItem["platform"], types: ContentItem["contentType"][]): ContentItem[] {
  const now = new Date();
  return titles.map((title, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - randomInt(1, 85));
    return {
      id: `${platform}-${i}`,
      title,
      platform,
      contentType: types[i % types.length],
      publishDate: date.toISOString().split("T")[0],
      views: randomInt(5000, 2000000),
      likes: randomInt(500, 150000),
      comments: randomInt(50, 20000),
      shares: randomInt(20, 50000),
      watchTime: platform === "youtube" ? randomInt(2, 15) : undefined,
      retention: platform === "youtube" || platform === "tiktok" ? randomInt(20, 85) : undefined,
      subscriberDelta: randomInt(-50, 2000),
      saves: platform === "instagram" ? randomInt(100, 15000) : undefined,
      reach: platform === "instagram" || platform === "facebook" ? randomInt(10000, 500000) : undefined,
    };
  });
}

export const mockContent: ContentItem[] = [
  ...generateContent(ytTitles, "youtube", ["video", "short"]),
  ...generateContent(ttTitles, "tiktok", ["video", "short"]),
  ...generateContent(igTitles, "instagram", ["reel", "post", "story"]),
  ...generateContent(fbTitles, "facebook", ["post", "video"]),
];

export const mockDailyData: PlatformDailyData[] = [
  { platform: "youtube", metrics: generateDailyMetrics(90, { views: 28000, likes: 2100, comments: 480, shares: 210, subscribers: 38 }) },
  { platform: "tiktok", metrics: generateDailyMetrics(90, { views: 99000, likes: 8000, comments: 1050, shares: 1600 }) },
  { platform: "instagram", metrics: generateDailyMetrics(90, { views: 13500, likes: 3200, comments: 390, shares: 245 }) },
  { platform: "facebook", metrics: generateDailyMetrics(90, { views: 7600, likes: 500, comments: 135, shares: 95 }) },
];
