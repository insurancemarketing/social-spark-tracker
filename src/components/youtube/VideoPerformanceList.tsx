import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { YouTubeVideo, VideoAnalytics, parseDuration } from "@/lib/youtube-analytics-service";
import { ArrowUpDown, HelpCircle, Image as ImageIcon } from "lucide-react";

interface VideoPerformanceListProps {
  videos: YouTubeVideo[];
  analytics?: Map<string, VideoAnalytics>;
}

type SortField = "views" | "likes" | "date" | "engagement" | "retention" | "shares";

export function VideoPerformanceList({ videos, analytics }: VideoPerformanceListProps) {
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortAsc, setSortAsc] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);

  const calculateEngagement = (video: YouTubeVideo) => {
    const engagements = video.statistics.likeCount + video.statistics.commentCount;
    return (engagements / Math.max(video.statistics.viewCount, 1)) * 100;
  };

  const getPerformanceBadge = (video: YouTubeVideo, videoAnalytics?: VideoAnalytics) => {
    const engagement = calculateEngagement(video);
    const retention = videoAnalytics?.averageViewPercentage || 0;
    const shares = videoAnalytics?.shares || 0;

    if (retention > 50 && engagement > 5) {
      return <Badge className="bg-green-600">High Performer</Badge>;
    }
    if (shares > 100) {
      return <Badge className="bg-blue-600">Viral Potential</Badge>;
    }
    if (engagement > 5) {
      return <Badge className="bg-purple-600">High Engagement</Badge>;
    }
    if (retention < 30 || engagement < 2) {
      return <Badge variant="destructive">Needs Work</Badge>;
    }
    return <Badge variant="secondary">Average</Badge>;
  };

  const sortedVideos = [...videos].sort((a, b) => {
    let aVal: number, bVal: number;

    switch (sortField) {
      case "views":
        aVal = a.statistics.viewCount;
        bVal = b.statistics.viewCount;
        break;
      case "likes":
        aVal = a.statistics.likeCount;
        bVal = b.statistics.likeCount;
        break;
      case "engagement":
        aVal = calculateEngagement(a);
        bVal = calculateEngagement(b);
        break;
      case "retention":
        aVal = analytics?.get(a.id)?.averageViewPercentage || 0;
        bVal = analytics?.get(b.id)?.averageViewPercentage || 0;
        break;
      case "shares":
        aVal = analytics?.get(a.id)?.shares || 0;
        bVal = analytics?.get(b.id)?.shares || 0;
        break;
      case "date":
      default:
        aVal = new Date(a.publishedAt).getTime();
        bVal = new Date(b.publishedAt).getTime();
        break;
    }

    return sortAsc ? aVal - bVal : bVal - aVal;
  });

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Video Performance</CardTitle>
            <CardDescription>Detailed metrics including CTR and impressions</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={showThumbnails ? "default" : "outline"}
              size="sm"
              onClick={() => setShowThumbnails(!showThumbnails)}
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              {showThumbnails ? "Hide" : "Show"} Thumbnails
            </Button>
            <Select value={sortField} onValueChange={(v) => setSortField(v as SortField)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="views">Views</SelectItem>
                <SelectItem value="retention">Retention</SelectItem>
                <SelectItem value="engagement">Engagement</SelectItem>
                <SelectItem value="shares">Shares</SelectItem>
                <SelectItem value="likes">Likes</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortAsc(!sortAsc)}
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {showThumbnails && <TableHead className="w-[100px]">Thumbnail</TableHead>}
                <TableHead>Video</TableHead>
                <TableHead className="text-right">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="flex items-center justify-end gap-1">
                        Views <HelpCircle className="h-3 w-3" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs max-w-xs">Total number of times your video was watched</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
                <TableHead className="text-right">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="flex items-center justify-end gap-1">
                        Retention <HelpCircle className="h-3 w-3" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs max-w-xs">Average % of video watched. Good: 50%+, Great: 60%+. Higher retention = more recommendations</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
                <TableHead className="text-right">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="flex items-center justify-end gap-1">
                        Engagement <HelpCircle className="h-3 w-3" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs max-w-xs">(Likes + Comments) / Views. Shows how much viewers interact. Good: 3-5%, Great: 5%+</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
                <TableHead className="text-right">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="flex items-center justify-end gap-1">
                        Avg Duration <HelpCircle className="h-3 w-3" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs max-w-xs">Average time each viewer watches. Shows if your video holds attention throughout</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
                <TableHead className="text-right">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="flex items-center justify-end gap-1">
                        Watch Time <HelpCircle className="h-3 w-3" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs max-w-xs">Total minutes watched. YouTube's #1 metric for recommendations</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
                <TableHead className="text-right">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="flex items-center justify-end gap-1">
                        Shares <HelpCircle className="h-3 w-3" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs max-w-xs">How many times viewers shared your video. High shares = viral potential</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
                <TableHead className="text-right">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="flex items-center justify-end gap-1">
                        Subs +/- <HelpCircle className="h-3 w-3" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs max-w-xs">Subscribers gained (green) vs lost (red) from this video. Shows content quality</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
                <TableHead>Performance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedVideos.map((video) => {
                const videoAnalytics = analytics?.get(video.id);
                const engagement = calculateEngagement(video);

                return (
                  <TableRow key={video.id}>
                    {showThumbnails && (
                      <TableCell>
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="w-20 h-auto rounded"
                        />
                      </TableCell>
                    )}
                    <TableCell className="font-medium max-w-md">
                      <div className="space-y-1">
                        <div className="text-sm line-clamp-2">{video.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(video.publishedAt).toLocaleDateString()} • {parseDuration(video.contentDetails.duration)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatNumber(video.statistics.viewCount)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {videoAnalytics?.averageViewPercentage
                        ? `${videoAnalytics.averageViewPercentage.toFixed(0)}%`
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {engagement.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {videoAnalytics?.averageViewDuration
                        ? `${Math.floor(videoAnalytics.averageViewDuration / 60)}:${(videoAnalytics.averageViewDuration % 60).toString().padStart(2, '0')}`
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {videoAnalytics?.watchTime
                        ? `${Math.floor(videoAnalytics.watchTime / 60)}h`
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {videoAnalytics?.shares
                        ? formatNumber(videoAnalytics.shares)
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {videoAnalytics ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-green-600">+{videoAnalytics.subscribersGained}</span>
                          {videoAnalytics.subscribersLost > 0 && (
                            <span className="text-red-600">-{videoAnalytics.subscribersLost}</span>
                          )}
                        </div>
                      ) : "-"}
                    </TableCell>
                    <TableCell>
                      {getPerformanceBadge(video, videoAnalytics)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
