import { AppLayout } from "@/components/layout/AppLayout";
import { ContentTable } from "@/components/content/ContentTable";
import { useYouTubeVideos } from "@/hooks/useYouTubeData";
import { useFacebookPosts } from "@/hooks/useFacebookData";
import { useInstagramMedia } from "@/hooks/useInstagramData";
import { Card, CardContent } from "@/components/ui/card";
import { LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ContentItem } from "@/lib/types";

export default function ContentTracker() {
  const navigate = useNavigate();
  const { data: ytVideos } = useYouTubeVideos();
  const { data: fbPosts } = useFacebookPosts();
  const { data: igMedia } = useInstagramMedia();

  const allContent: ContentItem[] = [
    ...(ytVideos || []),
    ...(fbPosts || []),
    ...(igMedia || []),
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Content Tracker</h1>
          <p className="text-sm text-muted-foreground">All your posts and videos across platforms</p>
        </div>

        {allContent.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center space-y-3">
                <LinkIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="text-lg font-semibold">No content yet</h3>
                <p className="text-sm text-muted-foreground">
                  Connect your platforms in Settings to see your content here.
                </p>
                <Button variant="outline" onClick={() => navigate("/settings")}>
                  Go to Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <ContentTable data={allContent} />
        )}
      </div>
    </AppLayout>
  );
}
