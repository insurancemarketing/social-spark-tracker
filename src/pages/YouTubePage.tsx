import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { TimeRangeSelector } from "@/components/dashboard/TimeRangeSelector";
import { ContentTable } from "@/components/content/ContentTable";
import { ViewsChart } from "@/components/charts/ViewsChart";
import { GrowthChart } from "@/components/charts/GrowthChart";
import { useYouTubeChannel, useYouTubeVideos } from "@/hooks/useYouTubeData";
import { getYouTubeApiKey, getYouTubeChannelId } from "@/lib/youtube-api";
import { mockPlatformStats, mockDailyData, mockContent } from "@/lib/mock-data";
import { TimeRange } from "@/lib/types";
import { Eye, Users, PlayCircle, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

export default function YouTubePage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const navigate = useNavigate();
  const hasApiKey = !!getYouTubeApiKey() && !!getYouTubeChannelId();
  const { data: channel, isLoading: channelLoading, error: channelError } = useYouTubeChannel();
  const { data: videos, isLoading: videosLoading } = useYouTubeVideos();

  const ytStats = mockPlatformStats.find((s) => s.platform === "youtube")!;
  const ytDaily = mockDailyData.filter((d) => d.platform === "youtube");
  const ytContent = hasApiKey && videos ? videos : mockContent.filter((c) => c.platform === "youtube");

  const isLive = hasApiKey && channel;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              <span className="text-youtube">YouTube</span> Analytics
            </h1>
            <p className="text-sm text-muted-foreground">
              {isLive ? `Live data for ${channel.channelTitle}` : "Showing mock data — connect your API key in Settings"}
            </p>
          </div>
          <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
        </div>

        {!hasApiKey && (
          <Card className="border-warning/30 bg-warning/5">
            <CardContent className="flex items-center gap-3 py-4">
              <AlertCircle className="h-5 w-5 text-warning" />
              <p className="text-sm">Connect your YouTube API key to see live data.</p>
              <Button size="sm" variant="outline" className="ml-auto" onClick={() => navigate("/settings")}>
                Go to Settings
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Views"
            value={formatNumber(isLive ? channel.viewCount : ytStats.totalViews)}
            trend={ytStats.viewsTrend}
            icon={<Eye className="h-4 w-4" />}
          />
          <StatsCard
            title="Subscribers"
            value={formatNumber(isLive ? channel.subscriberCount : ytStats.followers)}
            trend={5.2}
            icon={<Users className="h-4 w-4" />}
          />
          <StatsCard
            title="Videos"
            value={isLive ? channel.videoCount.toString() : "156"}
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
      </div>
    </AppLayout>
  );
}
