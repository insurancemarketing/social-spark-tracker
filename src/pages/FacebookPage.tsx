import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { TimeRangeSelector } from "@/components/dashboard/TimeRangeSelector";
import { ContentTable } from "@/components/content/ContentTable";
import { ViewsChart } from "@/components/charts/ViewsChart";
import { mockPlatformStats, mockDailyData, mockContent } from "@/lib/mock-data";
import { TimeRange } from "@/lib/types";
import { Eye, Users, ThumbsUp, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

export default function FacebookPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const stats = mockPlatformStats.find((s) => s.platform === "facebook")!;
  const daily = mockDailyData.filter((d) => d.platform === "facebook");
  const content = mockContent.filter((c) => c.platform === "facebook");

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              <span className="text-facebook">Facebook</span> Analytics
            </h1>
            <p className="text-sm text-muted-foreground">
              Mock data <Badge variant="outline" className="ml-1 text-xs">API coming soon</Badge>
            </p>
          </div>
          <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Reach" value={formatNumber(stats.totalViews)} trend={stats.viewsTrend} icon={<Eye className="h-4 w-4" />} />
          <StatsCard title="Page Followers" value={formatNumber(stats.followers)} trend={1.5} icon={<Users className="h-4 w-4" />} />
          <StatsCard title="Reactions" value={formatNumber(stats.totalLikes)} trend={-2.3} icon={<ThumbsUp className="h-4 w-4" />} />
          <StatsCard title="Shares" value={formatNumber(stats.totalShares)} trend={4.1} icon={<Share2 className="h-4 w-4" />} />
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
