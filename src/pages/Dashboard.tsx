import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { PlatformCard } from "@/components/dashboard/PlatformCard";
import { AlertCircle, Users, FileText, TrendingUp, Loader2 } from "lucide-react";
import { useFacebookPage, useFacebookPosts } from "@/hooks/useFacebookData";
import { useInstagramProfile } from "@/hooks/useInstagramData";
import { useYouTubeChannel } from "@/hooks/useYouTubeData";
import { PlatformStats } from "@/lib/types";

export default function Dashboard() {
  const { data: fbPage, isLoading: fbLoading } = useFacebookPage();
  const { data: fbPosts } = useFacebookPosts();
  const { data: igProfile, isLoading: igLoading } = useInstagramProfile();
  const { data: ytChannel, isLoading: ytLoading } = useYouTubeChannel();

  const isLoading = fbLoading || igLoading || ytLoading;
  const hasAnyPlatform = !!fbPage || !!igProfile || !!ytChannel;

  // Aggregate stats
  const totalFollowers =
    (fbPage?.followersCount || fbPage?.fanCount || 0) +
    (igProfile?.followersCount || 0) +
    (ytChannel?.subscriberCount || 0);

  const totalPosts =
    (fbPosts?.length || 0) +
    (igProfile?.mediaCount || 0) +
    (ytChannel?.videoCount || 0);

  const totalLikes = (fbPosts || []).reduce((sum, p) => sum + (p.likes || 0), 0);
  const totalComments = (fbPosts || []).reduce((sum, p) => sum + (p.comments || 0), 0);

  // Build platform cards
  const platformStats: PlatformStats[] = [];

  if (fbPage) {
    platformStats.push({
      platform: "facebook",
      totalViews: 0,
      totalLikes,
      totalComments,
      totalShares: (fbPosts || []).reduce((s, p) => s + (p.shares || 0), 0),
      followers: fbPage.followersCount || fbPage.fanCount || 0,
      followersDelta: 0,
      engagementRate: 0,
      viewsTrend: 0,
    });
  }

  if (igProfile) {
    platformStats.push({
      platform: "instagram",
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0,
      totalShares: 0,
      followers: igProfile.followersCount || 0,
      followersDelta: 0,
      engagementRate: 0,
      viewsTrend: 0,
    });
  }

  if (ytChannel) {
    platformStats.push({
      platform: "youtube",
      totalViews: ytChannel.viewCount || 0,
      totalLikes: 0,
      totalComments: 0,
      totalShares: 0,
      followers: ytChannel.subscriberCount || 0,
      followersDelta: 0,
      engagementRate: 0,
      viewsTrend: 0,
    });
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview of your social media performance</p>
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading platform data…</span>
          </div>
        )}

        {hasAnyPlatform && (
          <>
            {/* Aggregate Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              <StatsCard
                title="Total Followers"
                value={totalFollowers.toLocaleString()}
                icon={<Users className="h-4 w-4" />}
              />
              <StatsCard
                title="Total Content"
                value={totalPosts.toLocaleString()}
                icon={<FileText className="h-4 w-4" />}
              />
              <StatsCard
                title="Total Engagement"
                value={(totalLikes + totalComments).toLocaleString()}
                icon={<TrendingUp className="h-4 w-4" />}
              />
            </div>

            {/* Per-platform cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {platformStats.map((s) => (
                <PlatformCard key={s.platform} stats={s} />
              ))}
            </div>
          </>
        )}

        {/* Show connect prompt only when no platforms are connected */}
        {!isLoading && !hasAnyPlatform && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Connect Your Platforms</CardTitle>
              </div>
              <CardDescription>
                Connect your social media accounts to see analytics and track your performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Available Platforms:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li><strong>YouTube</strong> - Connect via OAuth to see video analytics</li>
                    <li><strong>Facebook & Instagram</strong> - Connect via Facebook OAuth</li>
                    <li><strong>DM Pipeline</strong> - Track Facebook and Instagram DM outreach</li>
                  </ul>
                </div>
                <p className="text-sm">
                  Use the sidebar to navigate to YouTube, Instagram, or Settings to get started.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
