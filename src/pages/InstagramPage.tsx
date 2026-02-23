import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { TimeRangeSelector } from "@/components/dashboard/TimeRangeSelector";
import { ContentTable } from "@/components/content/ContentTable";
import { ViewsChart } from "@/components/charts/ViewsChart";
import { useInstagramProfile, useInstagramMedia } from "@/hooks/useInstagramData";
import { getMetaAccessToken, getInstagramAccountId } from "@/lib/meta-api";
import { mockPlatformStats, mockDailyData, mockContent } from "@/lib/mock-data";
import { TimeRange } from "@/lib/types";
import { Eye, Users, Heart, Bookmark, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

export default function InstagramPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const navigate = useNavigate();
  const hasCredentials = !!getMetaAccessToken() && !!getInstagramAccountId();
  const { data: profile } = useInstagramProfile();
  const { data: media } = useInstagramMedia();

  const stats = mockPlatformStats.find((s) => s.platform === "instagram")!;
  const daily = mockDailyData.filter((d) => d.platform === "instagram");
  const content = hasCredentials && media ? media : mockContent.filter((c) => c.platform === "instagram");

  const isLive = hasCredentials && profile;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              <span className="text-instagram">Instagram</span> Analytics
            </h1>
            <p className="text-sm text-muted-foreground">
              {isLive ? `Live data for @${profile.username}` : "Showing mock data — connect in Settings"}
            </p>
          </div>
          <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
        </div>

        {!hasCredentials && (
          <Card className="border-warning/30 bg-warning/5">
            <CardContent className="flex items-center gap-3 py-4">
              <AlertCircle className="h-5 w-5 text-warning" />
              <p className="text-sm">Connect your Meta access token and Instagram Account ID to see live data.</p>
              <Button size="sm" variant="outline" className="ml-auto" onClick={() => navigate("/settings")}>
                Go to Settings
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Reach" value={formatNumber(isLive ? profile.followersCount : stats.totalViews)} trend={stats.viewsTrend} icon={<Eye className="h-4 w-4" />} />
          <StatsCard title="Followers" value={formatNumber(isLive ? profile.followersCount : stats.followers)} trend={3.1} icon={<Users className="h-4 w-4" />} />
          <StatsCard title="Total Likes" value={formatNumber(stats.totalLikes)} trend={6.2} icon={<Heart className="h-4 w-4" />} />
          <StatsCard title="Media Count" value={isLive ? profile.mediaCount.toString() : "12.4K"} trend={14.8} icon={<Bookmark className="h-4 w-4" />} />
        </div>

        <ViewsChart data={daily} timeRange={timeRange} />

        <div>
          <h2 className="mb-4 text-lg font-semibold">Recent Content</h2>
          <ContentTable data={content} />
        </div>
      </div>
    </AppLayout>
  );
}
