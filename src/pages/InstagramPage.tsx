import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConnectFacebookButton } from "@/components/instagram/ConnectFacebookButton";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchInstagramProfile,
  fetchInstagramPosts,
  fetchPostInsights,
  fetchAccountInsights,
  InstagramPost,
  InstagramInsights,
  InstagramProfile,
} from "@/lib/instagram-api-service";
import { isAuthenticated } from "@/lib/facebook-oauth-simple";
import { getMetaAccessToken, getInstagramAccountId } from "@/lib/meta-api";
import { Eye, Users, TrendingUp, Heart, MessageCircle, Bookmark, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function InstagramPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<InstagramProfile | null>(null);
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [insights, setInsights] = useState<Map<string, InstagramInsights>>(new Map());
  const [accountInsights, setAccountInsights] = useState<any>(null);

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    try {
      // Check BOTH OAuth (database) AND manual (localStorage) authentication
      const oauthConnected = await isAuthenticated();
      const manualToken = getMetaAccessToken();
      const manualIgId = getInstagramAccountId();
      const connected = oauthConnected || (manualToken && manualIgId);

      setIsConnected(connected);

      if (connected) {
        // Load profile
        const profileData = await fetchInstagramProfile();
        setProfile(profileData);

        // Load posts
        const postsData = await fetchInstagramPosts(25);
        setPosts(postsData);

        // Load account insights
        const accountData = await fetchAccountInsights('days_28');
        setAccountInsights(accountData);

        // Load insights for each post (limit to first 10 to avoid rate limits)
        const insightsMap = new Map<string, InstagramInsights>();
        const insightPromises = postsData.slice(0, 10).map(async (post) => {
          try {
            const postInsights = await fetchPostInsights(post.id);
            if (postInsights) {
              insightsMap.set(post.id, postInsights);
            }
          } catch (error) {
            console.error(`Failed to fetch insights for post ${post.id}:`, error);
          }
        });

        await Promise.all(insightPromises);
        setInsights(insightsMap);
      }
    } catch (error) {
      console.error('Error loading Instagram data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </AppLayout>
    );
  }

  if (!isConnected) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                <span className="text-instagram">Instagram</span> Analytics
              </h1>
              <p className="text-sm text-muted-foreground">
                Connect your Instagram Business account to see analytics
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Connect Instagram</CardTitle>
              <CardDescription>
                Connect your Facebook Page and Instagram Business account to view posts and analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ConnectFacebookButton />
                <div className="text-sm text-muted-foreground">
                  <p><strong>Requirements:</strong></p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Instagram must be a <strong>Business</strong> or <strong>Creator</strong> account</li>
                    <li>Instagram must be connected to a Facebook Page</li>
                    <li>You must have admin access to the Facebook Page</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              <span className="text-instagram">Instagram</span> Analytics
            </h1>
            <p className="text-sm text-muted-foreground">
              {profile ? `@${profile.username}` : 'Loading...'}
            </p>
          </div>
          <ConnectFacebookButton />
        </div>

        {/* Overview Stats */}
        {profile && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Followers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(profile.followersCount)}</div>
                <p className="text-xs text-muted-foreground">Total followers</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Posts</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(profile.mediaCount)}</div>
                <p className="text-xs text-muted-foreground">Total posts</p>
              </CardContent>
            </Card>

            {accountInsights && (
              <>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Reach (28d)</CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(accountInsights.reach)}</div>
                    <p className="text-xs text-muted-foreground">Unique accounts</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(accountInsights.profileViews)}</div>
                    <p className="text-xs text-muted-foreground">Last 28 days</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}

        {/* Posts Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Posts</CardTitle>
            <CardDescription>Your latest Instagram posts with performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => {
                const postInsights = insights.get(post.id);
                const engagementRate = postInsights
                  ? ((postInsights.engagement / postInsights.impressions) * 100).toFixed(1)
                  : '0';

                return (
                  <Card key={post.id} className="overflow-hidden">
                    <div className="relative aspect-square">
                      <img
                        src={post.mediaType === 'VIDEO' ? post.thumbnailUrl : post.mediaUrl}
                        alt={post.caption || 'Instagram post'}
                        className="object-cover w-full h-full"
                      />
                      {post.mediaType === 'VIDEO' && (
                        <Badge className="absolute top-2 right-2">Video</Badge>
                      )}
                      {post.mediaType === 'CAROUSEL_ALBUM' && (
                        <Badge className="absolute top-2 right-2">Carousel</Badge>
                      )}
                    </div>
                    <CardContent className="pt-4">
                      <p className="text-sm line-clamp-2 mb-2">{post.caption || 'No caption'}</p>
                      <p className="text-xs text-muted-foreground mb-3">{formatDate(post.timestamp)}</p>

                      {postInsights && (
                        <div className="space-y-2">
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <div className="flex items-center gap-1">
                                    <Eye className="h-3 w-3" />
                                    <span>{formatNumber(postInsights.impressions)}</span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Impressions</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <div className="flex items-center gap-1">
                                    <Heart className="h-3 w-3" />
                                    <span>{formatNumber(postInsights.likes)}</span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Likes</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <div className="flex items-center gap-1">
                                    <MessageCircle className="h-3 w-3" />
                                    <span>{formatNumber(postInsights.comments)}</span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Comments</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>

                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1">
                              <Bookmark className="h-3 w-3" />
                              <span>{formatNumber(postInsights.saves)} saves</span>
                            </div>
                            <span className="font-medium">{engagementRate}% engagement</span>
                          </div>

                          <div className="text-xs text-muted-foreground">
                            Reach: {formatNumber(postInsights.reach)}
                          </div>
                        </div>
                      )}

                      <a
                        href={post.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 flex items-center gap-1 text-xs text-instagram hover:underline"
                      >
                        View on Instagram <ExternalLink className="h-3 w-3" />
                      </a>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
