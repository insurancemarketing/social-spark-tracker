import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { initiateYouTubeAuth, isAuthenticated } from "@/lib/youtube-oauth";
import { Youtube, CheckCircle } from "lucide-react";

export function ConnectYouTubeButton() {
  const authenticated = isAuthenticated();

  if (authenticated) {
    return (
      <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            YouTube Connected
          </CardTitle>
          <CardDescription>
            Your YouTube account is connected and we're fetching your personal analytics
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Youtube className="h-5 w-5 text-red-600" />
          Connect Your YouTube Account
        </CardTitle>
        <CardDescription>
          Get access to your personal YouTube Analytics data including watch time, revenue, traffic sources, and more
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">With YouTube Analytics, you'll get:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Watch time and retention data</li>
              <li>Traffic sources and demographics</li>
              <li>Revenue and monetization stats</li>
              <li>Detailed engagement metrics</li>
              <li>Real-time analytics</li>
            </ul>
          </div>

          <Button
            onClick={initiateYouTubeAuth}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            <Youtube className="mr-2 h-4 w-4" />
            Connect YouTube Account
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            You'll be redirected to Google to authorize access to your YouTube Analytics
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
