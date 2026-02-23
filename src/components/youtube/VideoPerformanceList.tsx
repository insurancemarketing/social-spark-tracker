import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { YouTubeVideo, VideoAnalytics, parseDuration } from "@/lib/youtube-analytics-service";
import { Eye, ThumbsUp, MessageSquare, TrendingUp, TrendingDown, Clock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface VideoPerformanceListProps {
  videos: YouTubeVideo[];
  analytics?: Map<string, VideoAnalytics>;
  onVideoClick?: (videoId: string) => void;
}

type SortBy = 'views' | 'likes' | 'date' | 'engagement' | 'retention';

export function VideoPerformanceList({ videos, analytics, onVideoClick }: VideoPerformanceListProps) {
  const [sortBy, setSortBy] = useState<SortBy>('views');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const sortedVideos = [...videos].sort((a, b) => {
    let aValue: number, bValue: number;

    switch (sortBy) {
      case 'views':
        aValue = a.statistics.viewCount;
        bValue = b.statistics.viewCount;
        break;
      case 'likes':
        aValue = a.statistics.likeCount;
        bValue = b.statistics.likeCount;
        break;
      case 'date':
        aValue = new Date(a.publishedAt).getTime();
        bValue = new Date(b.publishedAt).getTime();
        break;
      case 'engagement':
        aValue = (a.statistics.likeCount + a.statistics.commentCount) / Math.max(a.statistics.viewCount, 1);
        bValue = (b.statistics.likeCount + b.statistics.commentCount) / Math.max(b.statistics.viewCount, 1);
        break;
      case 'retention':
        const aAnalytics = analytics?.get(a.id);
        const bAnalytics = analytics?.get(b.id);
        aValue = aAnalytics?.averageViewPercentage || 0;
        bValue = bAnalytics?.averageViewPercentage || 0;
        break;
      default:
        return 0;
    }

    return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
  });

  const toggleSort = (newSortBy: SortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  const calculateEngagementRate = (video: YouTubeVideo): number => {
    const engagements = video.statistics.likeCount + video.statistics.commentCount;
    return (engagements / Math.max(video.statistics.viewCount, 1)) * 100;
  };

  const getPerformanceBadge = (video: YouTubeVideo): { label: string; variant: 'default' | 'secondary' | 'destructive' } => {
    const engagementRate = calculateEngagementRate(video);
    const videoAnalytics = analytics?.get(video.id);

    if (videoAnalytics) {
      const retention = videoAnalytics.averageViewPercentage;

      if (retention > 50 && engagementRate > 5) {
        return { label: '🔥 High Performer', variant: 'default' };
      } else if (retention < 30 || engagementRate < 2) {
        return { label: '⚠️ Needs Work', variant: 'destructive' };
      }
    }

    if (engagementRate > 5) {
      return { label: '✨ Good Engagement', variant: 'default' };
    }

    return { label: '📊 Average', variant: 'secondary' };
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
    return `${Math.floor(diffDays / 365)}y ago`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Video Performance</CardTitle>
            <CardDescription>
              Analyze your videos with detailed metrics and insights
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortBy)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="views">Views</SelectItem>
                <SelectItem value="likes">Likes</SelectItem>
                <SelectItem value="date">Upload Date</SelectItem>
                <SelectItem value="engagement">Engagement Rate</SelectItem>
                {analytics && <SelectItem value="retention">Retention</SelectItem>}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            >
              {sortOrder === 'desc' ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="space-y-4">
            {sortedVideos.map((video) => {
              const videoAnalytics = analytics?.get(video.id);
              const engagementRate = calculateEngagementRate(video);
              const performanceBadge = getPerformanceBadge(video);

              return (
                <div
                  key={video.id}
                  className="flex gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => onVideoClick?.(video.id)}
                >
                  {/* Thumbnail */}
                  <div className="flex-shrink-0">
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-40 h-24 object-cover rounded"
                    />
                    <div className="mt-1 text-xs text-center text-muted-foreground">
                      {parseDuration(video.contentDetails.duration)}
                    </div>
                  </div>

                  {/* Video Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-sm line-clamp-2 flex-1">
                        {video.title}
                      </h3>
                      <Badge variant={performanceBadge.variant}>
                        {performanceBadge.label}
                      </Badge>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{formatNumber(video.statistics.viewCount)}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Total Views: {video.statistics.viewCount.toLocaleString()}</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger>
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="h-4 w-4" />
                            <span>{formatNumber(video.statistics.likeCount)}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Likes: {video.statistics.likeCount.toLocaleString()}</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            <span>{formatNumber(video.statistics.commentCount)}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Comments: {video.statistics.commentCount.toLocaleString()}</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            <span>{engagementRate.toFixed(2)}%</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Engagement Rate: (Likes + Comments) / Views</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Higher is better. Avg: 3-5%
                          </p>
                        </TooltipContent>
                      </Tooltip>

                      {videoAnalytics && (
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{videoAnalytics.averageViewPercentage.toFixed(1)}%</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Avg Retention: How much of the video people watch</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Good: &gt;50%, Great: &gt;60%
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      )}

                      <span className="text-xs">{formatDate(video.publishedAt)}</span>
                    </div>

                    {videoAnalytics && (
                      <div className="mt-3 grid grid-cols-3 gap-4 text-xs">
                        <div>
                          <p className="text-muted-foreground">Watch Time</p>
                          <p className="font-semibold">{formatNumber(videoAnalytics.watchTime)} min</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Avg Duration</p>
                          <p className="font-semibold">
                            {Math.floor(videoAnalytics.averageViewDuration / 60)}:
                            {(videoAnalytics.averageViewDuration % 60).toString().padStart(2, '0')}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Subs Gained</p>
                          <p className="font-semibold text-green-600">
                            +{videoAnalytics.subscribersGained}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
