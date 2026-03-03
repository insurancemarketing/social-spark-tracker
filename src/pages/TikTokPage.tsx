import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VideoIcon } from "lucide-react";

export default function TikTokPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="text-tiktok">TikTok</span> Analytics
          </h1>
          <p className="text-sm text-muted-foreground">Connect your TikTok account to see analytics</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <VideoIcon className="h-5 w-5 text-muted-foreground" />
              <CardTitle>TikTok API Coming Soon</CardTitle>
              <Badge variant="outline" className="text-xs">Not Available Yet</Badge>
            </div>
            <CardDescription>
              TikTok API requires an approved developer application. Once available, your analytics will appear here automatically.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              The TikTok Content Posting API and Research API require business verification. We'll add support as soon as access is available.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
