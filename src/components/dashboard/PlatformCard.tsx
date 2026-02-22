import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlatformStats, PLATFORM_LABELS } from "@/lib/types";
import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

const platformColorClass: Record<string, string> = {
  youtube: "border-l-youtube",
  tiktok: "border-l-tiktok",
  instagram: "border-l-instagram",
  facebook: "border-l-facebook",
};

export function PlatformCard({ stats }: { stats: PlatformStats }) {
  const navigate = useNavigate();
  return (
    <Card
      className={cn("cursor-pointer border-l-4 transition-shadow hover:shadow-md", platformColorClass[stats.platform])}
      onClick={() => navigate(`/${stats.platform}`)}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{PLATFORM_LABELS[stats.platform]}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold">{formatNumber(stats.totalViews)}</span>
          <span className={cn("flex items-center gap-0.5 text-xs font-medium", stats.viewsTrend >= 0 ? "text-success" : "text-destructive")}>
            {stats.viewsTrend >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            {Math.abs(stats.viewsTrend).toFixed(1)}%
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div>Followers: <span className="font-medium text-foreground">{formatNumber(stats.followers)}</span></div>
          <div>Engagement: <span className="font-medium text-foreground">{stats.engagementRate}%</span></div>
          <div>Likes: <span className="font-medium text-foreground">{formatNumber(stats.totalLikes)}</span></div>
          <div>Comments: <span className="font-medium text-foreground">{formatNumber(stats.totalComments)}</span></div>
        </div>
      </CardContent>
    </Card>
  );
}
