import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { TimeRangeSelector } from "@/components/dashboard/TimeRangeSelector";
import { ContentTable } from "@/components/content/ContentTable";
import { ViewsChart } from "@/components/charts/ViewsChart";
import { GrowthChart } from "@/components/charts/GrowthChart";
import { ConnectYouTubeButton } from "@/components/youtube/ConnectYouTubeButton";
import { getYouTubeTokens, fetchChannelInfo } from "@/lib/youtube-oauth-supabase";
import { mockPlatformStats, mockDailyData, mockContent } from "@/lib/mock-data";
import { TimeRange } from "@/lib/types";
import { Eye, Users, PlayCircle, Loader2 } from "lucide-react";

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

export default function YouTubePage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [channelData, setChannelData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    try {
      const tokens = await getYouTubeTokens();

      if (tokens) {
        setIsAuthenticated(true);

        // Fetch channel info
        const channelInfo = await fetchChannelInfo();
        if (channelInfo?.items?.[0]) {
          setChannelData(channelInfo.items[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching YouTube data:', error);
    } finally {
      setLoading(false);
    }
  };

  const ytStats = mockPlatformStats.find((s) => s.platform === "youtube")!;
  const ytDaily = mockDailyData.filter((d) => d.platform === "youtube");
  const ytContent = mockContent.filter((c) => c.platform === "youtube");

  const stats = channelData?.statistics;
  const snippet = channelData?.snippet;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              <span className="text-youtube">YouTube</span> Analytics
            </h1>
            <p className="text-sm text-muted-foreground">
              {isAuthenticated && snippet
                ? `Connected: ${snippet.title}`
                : "Connect your YouTube account to see personal analytics"}
            </p>
          </div>
          <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
        </div>

        {/* OAuth Connect Button */}
        <ConnectYouTubeButton />

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                title="Total Views"
                value={formatNumber(stats?.viewCount ? parseInt(stats.viewCount) : ytStats.totalViews)}
                trend={ytStats.viewsTrend}
                icon={<Eye className="h-4 w-4" />}
              />
              <StatsCard
                title="Subscribers"
                value={formatNumber(stats?.subscriberCount ? parseInt(stats.subscriberCount) : ytStats.followers)}
                trend={5.2}
                icon={<Users className="h-4 w-4" />}
              />
              <StatsCard
                title="Videos"
                value={stats?.videoCount || "156"}
                icon={<PlayCircle className="h-4 w-4" />}
              />
              <StatsCard
                title="Engagement Rate"
                value={`${ytStats.engagementRate}%`}
                trend={1.4}
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <ViewsChart data={ytDaily} timeRange={timeRange} />
              <GrowthChart data={ytDaily} timeRange={timeRange} />
            </div>

            <div>
              <h2 className="mb-4 text-lg font-semibold">Recent Videos</h2>
              <ContentTable data={ytContent} />
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
