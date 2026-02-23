import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle2 } from "lucide-react";
import { YouTubeVideo, VideoAnalytics, TrafficSource } from "@/lib/youtube-analytics-service";

interface InsightsCardProps {
  videos: YouTubeVideo[];
  analytics?: Map<string, VideoAnalytics>;
  trafficSources?: TrafficSource[];
}

export function InsightsCard({ videos, analytics, trafficSources }: InsightsCardProps) {
  const calculateInsights = () => {
    const insights = {
      whatWorking: [] as string[],
      needsWork: [] as string[],
    };

    // Calculate average engagement
    const avgEngagement = videos.reduce((sum, video) => {
      const engagements = video.statistics.likeCount + video.statistics.commentCount;
      return sum + (engagements / Math.max(video.statistics.viewCount, 1)) * 100;
    }, 0) / Math.max(videos.length, 1);

    // Check traffic sources
    if (trafficSources) {
      const searchTraffic = trafficSources.find(s => s.source === 'YouTube Search');
      const suggestedTraffic = trafficSources.find(s => s.source === 'Suggested Videos');
      const browseTraffic = trafficSources.find(s => s.source === 'Browse Features');

      if (searchTraffic && searchTraffic.percentage > 25) {
        insights.whatWorking.push(`🎯 Strong YouTube Search presence (${searchTraffic.percentage.toFixed(1)}%) - Your titles & keywords are working!`);
      } else if (searchTraffic && searchTraffic.percentage < 15) {
        insights.needsWork.push(`⚠️ Low YouTube Search traffic (${searchTraffic.percentage.toFixed(1)}%) - Optimize titles, descriptions, and tags`);
      }

      if (suggestedTraffic && suggestedTraffic.percentage > 30) {
        insights.whatWorking.push(`🚀 High Suggested Video traffic (${suggestedTraffic.percentage.toFixed(1)}%) - YouTube algorithm loves your content!`);
      } else if (suggestedTraffic && suggestedTraffic.percentage < 20) {
        insights.needsWork.push(`⚠️ Low Suggested Video traffic (${suggestedTraffic.percentage.toFixed(1)}%) - Focus on retention and watch time`);
      }

      if (browseTraffic && browseTraffic.percentage > 20) {
        insights.whatWorking.push(`✨ Strong Browse Features traffic (${browseTraffic.percentage.toFixed(1)}%) - YouTube is promoting you!`);
      }
    }

    // Check retention
    if (analytics) {
      const avgRetention = Array.from(analytics.values()).reduce((sum, a) => sum + a.averageViewPercentage, 0) / Math.max(analytics.size, 1);

      if (avgRetention > 50) {
        insights.whatWorking.push(`🔥 Excellent average retention (${avgRetention.toFixed(1)}%) - Your content keeps viewers engaged!`);
      } else if (avgRetention < 35) {
        insights.needsWork.push(`⚠️ Low average retention (${avgRetention.toFixed(1)}%) - Hook viewers faster & trim slow parts`);
      }

      // Check for videos with high retention
      const highRetentionVideos = Array.from(analytics.values()).filter(a => a.averageViewPercentage > 60);
      if (highRetentionVideos.length > 0) {
        insights.whatWorking.push(`💎 ${highRetentionVideos.length} video(s) with 60%+ retention - Study these for patterns!`);
      }
    }

    // Check engagement rate
    if (avgEngagement > 5) {
      insights.whatWorking.push(`💬 High engagement rate (${avgEngagement.toFixed(1)}%) - Audience is active and engaged!`);
    } else if (avgEngagement < 2) {
      insights.needsWork.push(`⚠️ Low engagement rate (${avgEngagement.toFixed(1)}%) - Ask questions, create CTAs, build community`);
    }

    // Check upload consistency
    if (videos.length >= 4) {
      const recentVideos = videos.slice(0, 4);
      const dates = recentVideos.map(v => new Date(v.publishedAt).getTime());
      const avgDaysBetween = dates.reduce((sum, date, i) => {
        if (i === 0) return sum;
        return sum + (dates[i - 1] - date) / (1000 * 60 * 60 * 24);
      }, 0) / Math.max(dates.length - 1, 1);

      if (avgDaysBetween < 10) {
        insights.whatWorking.push(`📅 Consistent upload schedule (every ${Math.round(avgDaysBetween)} days) - Keep it up!`);
      } else if (avgDaysBetween > 21) {
        insights.needsWork.push(`⚠️ Inconsistent uploads (${Math.round(avgDaysBetween)} days between videos) - More consistency = more growth`);
      }
    }

    // Check view distribution
    const topVideo = videos.reduce((max, v) => v.statistics.viewCount > max.statistics.viewCount ? v : max, videos[0]);
    const avgViews = videos.reduce((sum, v) => sum + v.statistics.viewCount, 0) / Math.max(videos.length, 1);

    if (topVideo && topVideo.statistics.viewCount > avgViews * 5) {
      insights.whatWorking.push(`⭐ "${topVideo.title}" is crushing it - Replicate this style/topic!`);
    }

    return insights;
  };

  const insights = calculateInsights();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Insights & Recommendations</CardTitle>
        <CardDescription>AI-powered analysis of your channel performance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* What's Working */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-lg">What's Working</h3>
              <Badge variant="default" className="ml-auto">{insights.whatWorking.length}</Badge>
            </div>
            {insights.whatWorking.length > 0 ? (
              <ul className="space-y-2">
                {insights.whatWorking.map((insight, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
                    <TrendingUp className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Keep uploading to see what works!</p>
            )}
          </div>

          {/* Needs Work */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <h3 className="font-semibold text-lg">Areas to Improve</h3>
              <Badge variant="secondary" className="ml-auto">{insights.needsWork.length}</Badge>
            </div>
            {insights.needsWork.length > 0 ? (
              <ul className="space-y-2">
                {insights.needsWork.map((insight, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900">
                    <TrendingDown className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Great! No major issues found.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
