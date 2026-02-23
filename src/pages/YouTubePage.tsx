import { useState, useEffect } from 'react';
import { ConnectYouTubeButton } from '@/components/youtube/ConnectYouTubeButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { VideoPerformanceList } from '@/components/youtube/VideoPerformanceList';
import { TrafficSourcesChart } from '@/components/youtube/TrafficSourcesChart';
import { AnalyticsCharts } from '@/components/youtube/AnalyticsCharts';
import { InsightsCard } from '@/components/youtube/InsightsCard';
import { DateRangeFilter } from '@/components/youtube/DateRangeFilter';
import { Skeleton } from '@/components/ui/skeleton';
import {
  fetchYouTubeVideos,
  fetchYouTubeAnalytics,
  fetchVideoAnalytics,
  fetchTrafficSources,
  fetchAnalyticsTimeSeries,
  YouTubeVideo,
  VideoAnalytics,
  TrafficSource,
  AnalyticsOverview,
} from '@/lib/youtube-analytics-service';
import { isAuthenticated as isYouTubeAuthenticated } from '@/lib/youtube-oauth-supabase';
import { Eye, Clock, TrendingUp, Users } from 'lucide-react';

export default function YouTubePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [analytics, setAnalytics] = useState<Map<string, VideoAnalytics>>(new Map());
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [trafficSources, setTrafficSources] = useState<TrafficSource[]>([]);
  const [viewsTimeSeries, setViewsTimeSeries] = useState<Array<{ date: string; value: number }>>([]);
  const [watchTimeTimeSeries, setWatchTimeTimeSeries] = useState<Array<{ date: string; value: number }>>([]);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  useEffect(() => {
    if (isAuthenticated && dateRange.startDate && dateRange.endDate) {
      loadAnalyticsData();
    }
  }, [dateRange, isAuthenticated]);

  const checkAuthAndLoadData = async () => {
    try {
      const authenticated = await isYouTubeAuthenticated();
      setIsAuthenticated(authenticated);

      if (authenticated) {
        // Set default date range (last 30 days)
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        setDateRange({
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
        });

        // Load videos
        const videosData = await fetchYouTubeVideos(50);
        setVideos(videosData);

        // Load analytics for each video (limit to 25 to avoid rate limits)
        const analyticsMap = new Map<string, VideoAnalytics>();
        const videoPromises = videosData.slice(0, 25).map(async (video) => {
          try {
            const videoAnalytics = await fetchVideoAnalytics(
              video.id,
              startDate.toISOString().split('T')[0],
              endDate.toISOString().split('T')[0]
            );
            console.log(`Analytics for ${video.title}:`, videoAnalytics);
            analyticsMap.set(video.id, videoAnalytics);
          } catch (error) {
            console.error(`Failed to fetch analytics for video ${video.id}:`, error);
          }
        });

        await Promise.all(videoPromises);
        setAnalytics(analyticsMap);
      }
    } catch (error) {
      console.error('Error loading YouTube data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAnalyticsData = async () => {
    try {
      const [overviewData, trafficData, viewsData, watchTimeData] = await Promise.all([
        fetchYouTubeAnalytics(dateRange.startDate, dateRange.endDate),
        fetchTrafficSources(dateRange.startDate, dateRange.endDate),
        fetchAnalyticsTimeSeries(dateRange.startDate, dateRange.endDate, 'views'),
        fetchAnalyticsTimeSeries(dateRange.startDate, dateRange.endDate, 'estimatedMinutesWatched'),
      ]);

      setOverview(overviewData);
      setTrafficSources(trafficData);
      setViewsTimeSeries(viewsData);
      setWatchTimeTimeSeries(watchTimeData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    }
  };

  const handleDateRangeChange = (startDate: string, endDate: string) => {
    setDateRange({ startDate, endDate });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>YouTube Analytics</CardTitle>
            <CardDescription>
              Connect your YouTube account to see advanced analytics, video performance, and actionable insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ConnectYouTubeButton />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">YouTube Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your channel performance
          </p>
        </div>
        <ConnectYouTubeButton />
      </div>

      {/* Date Range Filter */}
      <DateRangeFilter onDateRangeChange={handleDateRangeChange} />

      {/* Overview Stats */}
      {overview && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.views.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                In selected date range
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Watch Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.floor(overview.watchTime / 60).toLocaleString()}h
              </div>
              <p className="text-xs text-muted-foreground">
                Total minutes watched
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg View Duration</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.floor(overview.averageViewDuration / 60)}:
                {(overview.averageViewDuration % 60).toString().padStart(2, '0')}
              </div>
              <p className="text-xs text-muted-foreground">
                Minutes per view
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subscribers Gained</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                +{overview.subscribers.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                New subscribers
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Insights Card */}
      <InsightsCard
        videos={videos}
        analytics={analytics}
        trafficSources={trafficSources}
      />

      {/* Time Series Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {viewsTimeSeries.length > 0 && (
          <AnalyticsCharts
            data={viewsTimeSeries}
            metric="views"
            title="Views Over Time"
            description="Daily view trends"
            explanation="Track your video views over time. Spikes indicate viral content or successful promotions. Look for patterns in what days perform best."
          />
        )}
        {watchTimeTimeSeries.length > 0 && (
          <AnalyticsCharts
            data={watchTimeTimeSeries}
            metric="estimatedMinutesWatched"
            title="Watch Time Over Time"
            description="Daily watch time trends"
            explanation="Watch time is crucial for YouTube's algorithm. Higher watch time = more recommendations. This is often more important than view count."
          />
        )}
      </div>

      {/* Traffic Sources */}
      {trafficSources.length > 0 && (
        <TrafficSourcesChart sources={trafficSources} />
      )}

      {/* Video Performance List */}
      {videos.length > 0 && (
        <VideoPerformanceList
          videos={videos}
          analytics={analytics}
        />
      )}
    </div>
  );
}
