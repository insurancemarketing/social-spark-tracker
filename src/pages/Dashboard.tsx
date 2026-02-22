import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { TimeRangeSelector } from "@/components/dashboard/TimeRangeSelector";
import { PlatformCard } from "@/components/dashboard/PlatformCard";
import { ViewsChart } from "@/components/charts/ViewsChart";
import { EngagementChart } from "@/components/charts/EngagementChart";
import { GrowthChart } from "@/components/charts/GrowthChart";
import { PlatformComparisonChart } from "@/components/charts/PlatformComparisonChart";
import { mockPlatformStats, mockDailyData } from "@/lib/mock-data";
import { TimeRange } from "@/lib/types";
import { Eye, Users, Heart, TrendingUp } from "lucide-react";

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");

  const totalViews = mockPlatformStats.reduce((s, p) => s + p.totalViews, 0);
  const totalFollowers = mockPlatformStats.reduce((s, p) => s + p.followers, 0);
  const totalLikes = mockPlatformStats.reduce((s, p) => s + p.totalLikes, 0);
  const avgEngagement = mockPlatformStats.reduce((s, p) => s + p.engagementRate, 0) / mockPlatformStats.length;
  const avgTrend = mockPlatformStats.reduce((s, p) => s + p.viewsTrend, 0) / mockPlatformStats.length;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Overview of your social media performance</p>
          </div>
          <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Total Views" value={formatNumber(totalViews)} trend={avgTrend} icon={<Eye className="h-4 w-4" />} />
          <StatsCard title="Total Followers" value={formatNumber(totalFollowers)} trend={5.2} icon={<Users className="h-4 w-4" />} />
          <StatsCard title="Total Likes" value={formatNumber(totalLikes)} trend={8.1} icon={<Heart className="h-4 w-4" />} />
          <StatsCard title="Avg Engagement" value={`${avgEngagement.toFixed(1)}%`} trend={2.3} icon={<TrendingUp className="h-4 w-4" />} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {mockPlatformStats.map((stats) => (
            <PlatformCard key={stats.platform} stats={stats} />
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <ViewsChart data={mockDailyData} timeRange={timeRange} />
          <EngagementChart stats={mockPlatformStats} />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <GrowthChart data={mockDailyData} timeRange={timeRange} />
          <PlatformComparisonChart stats={mockPlatformStats} />
        </div>
      </div>
    </AppLayout>
  );
}
