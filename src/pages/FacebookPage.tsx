import { AppLayout } from "@/components/layout/AppLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ContentTable } from "@/components/content/ContentTable";
import { useFacebookPage, useFacebookPosts } from "@/hooks/useFacebookData";
import { Eye, Users, ThumbsUp, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

export default function FacebookPage() {
  const navigate = useNavigate();
  const { data: page } = useFacebookPage();
  const { data: posts } = useFacebookPosts();

  const isLive = !!page;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="text-facebook">Facebook</span> Analytics
          </h1>
          <p className="text-sm text-muted-foreground">
            {isLive ? `Live data for ${page.name}` : "Connect your Facebook page to see analytics"}
          </p>
        </div>

        {!isLive && (
          <Card className="border-warning/30 bg-warning/5">
            <CardContent className="flex items-center gap-3 py-4">
              <AlertCircle className="h-5 w-5 text-warning" />
              <p className="text-sm">Connect your Meta access token and Facebook Page ID in Settings to see live data.</p>
              <Button size="sm" variant="outline" className="ml-auto" onClick={() => navigate("/settings")}>
                Go to Settings
              </Button>
            </CardContent>
          </Card>
        )}

        {isLive && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatsCard title="Page Followers" value={formatNumber(page.followersCount)} icon={<Users className="h-4 w-4" />} />
              <StatsCard title="Fan Count" value={formatNumber(page.fanCount)} icon={<ThumbsUp className="h-4 w-4" />} />
              <StatsCard title="Posts Loaded" value={String(posts?.length || 0)} icon={<Eye className="h-4 w-4" />} />
            </div>

            {posts && posts.length > 0 && (
              <div>
                <h2 className="mb-4 text-lg font-semibold">Recent Content</h2>
                <ContentTable data={posts} />
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
