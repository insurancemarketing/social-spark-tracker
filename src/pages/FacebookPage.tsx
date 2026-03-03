import { AppLayout } from "@/components/layout/AppLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ContentTable } from "@/components/content/ContentTable";
import { usePersonalFacebookProfile, usePersonalFacebookPosts } from "@/hooks/usePersonalFacebookData";
import { Eye, User, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getFacebookTokens } from "@/lib/facebook-oauth-simple";
import { useAuth } from "@/contexts/AuthContext";

export default function FacebookPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = usePersonalFacebookProfile();
  const { data: posts } = usePersonalFacebookPosts();

  const { data: oauthTokens } = useQuery({
    queryKey: ["facebook-oauth-tokens", user?.id],
    queryFn: () => getFacebookTokens(),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const isLive = !!profile;
  const hasOAuth = !!oauthTokens;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="text-facebook">Facebook</span> Analytics
          </h1>
          <p className="text-sm text-muted-foreground">
            {isLive ? `Personal profile: ${profile.name}` : "Connect your Facebook account to see your posts"}
          </p>
        </div>

        {!isLive && !profileLoading && (
          <Card className="border-warning/30 bg-warning/5">
            <CardContent className="flex items-center gap-3 py-4">
              <AlertCircle className="h-5 w-5 text-warning" />
              <p className="text-sm">
                {hasOAuth
                  ? "Connected but unable to load profile data. You may need to disconnect and reconnect to grant the user_posts permission."
                  : "Connect your Facebook account in Settings to track your personal posts."}
              </p>
              <Button size="sm" variant="outline" className="ml-auto" onClick={() => navigate("/settings")}>
                Go to Settings
              </Button>
            </CardContent>
          </Card>
        )}

        {isLive && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <StatsCard title="Profile" value={profile.name} icon={<User className="h-4 w-4" />} />
              <StatsCard title="Posts Loaded" value={String(posts?.length || 0)} icon={<Eye className="h-4 w-4" />} />
            </div>

            {posts && posts.length > 0 && (
              <div>
                <h2 className="mb-4 text-lg font-semibold">Recent Posts</h2>
                <ContentTable data={posts} />
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
