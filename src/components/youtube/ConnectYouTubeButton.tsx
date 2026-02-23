import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { initiateYouTubeAuth, isAuthenticated, getYouTubeTokens } from "@/lib/youtube-oauth-supabase";
import { Youtube, CheckCircle, Loader2 } from "lucide-react";

export function ConnectYouTubeButton() {
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [channelTitle, setChannelTitle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const isAuth = await isAuthenticated();
      setAuthenticated(isAuth);

      if (isAuth) {
        const tokens = await getYouTubeTokens();
        if (tokens?.channel_title) {
          setChannelTitle(tokens.channel_title);
        }
      }
    } catch (error) {
      console.error('Error checking YouTube auth:', error);
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (authenticated) {
    return (
      <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            YouTube Connected
          </CardTitle>
          <CardDescription>
            {channelTitle
              ? `Connected to: ${channelTitle}`
              : 'Your YouTube account is connected'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            We're fetching your personal analytics including watch time, revenue, and traffic sources.
          </p>
        </CardContent>
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
