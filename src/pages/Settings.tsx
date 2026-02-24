import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { getYouTubeApiKey, setYouTubeApiKey, getYouTubeChannelId, setYouTubeChannelId } from "@/lib/youtube-api";
import {
  getMetaAccessToken, setMetaAccessToken,
  getInstagramAccountId, setInstagramAccountId,
  getFacebookPageId, setFacebookPageId,
} from "@/lib/meta-api";
import { Check, Key, Hash, Facebook, Instagram } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { initiateFacebookAuth, isAuthenticated, getPageInfo, disconnectFacebook } from "@/lib/facebook-oauth-simple";

export default function Settings() {
  const queryClient = useQueryClient();

  // YouTube
  const [apiKey, setApiKey] = useState(getYouTubeApiKey() || "");
  const [channelId, setChannelId] = useState(getYouTubeChannelId() || "");

  // Meta (shared token)
  const [metaToken, setMetaToken] = useState(getMetaAccessToken() || "");
  const [igAccountId, setIgAccountId] = useState(getInstagramAccountId() || "");
  const [fbPageId, setFbPageId] = useState(getFacebookPageId() || "");

  // Facebook/Instagram OAuth
  const [isFbConnected, setIsFbConnected] = useState(false);
  const [fbPageInfo, setFbPageInfo] = useState<any>(null);
  const [fbLoading, setFbLoading] = useState(true);

  useEffect(() => {
    checkFacebookConnection();
  }, []);

  const checkFacebookConnection = async () => {
    setFbLoading(true);
    const connected = await isAuthenticated();
    setIsFbConnected(connected);
    if (connected) {
      const info = await getPageInfo();
      setFbPageInfo(info);
    }
    setFbLoading(false);
  };

  const handleConnectFacebook = () => {
    initiateFacebookAuth();
  };

  const handleDisconnectFacebook = async () => {
    const success = await disconnectFacebook();
    if (success) {
      toast.success("Disconnected from Facebook & Instagram");
      await checkFacebookConnection();
      queryClient.invalidateQueries({ queryKey: ["instagram-profile"] });
      queryClient.invalidateQueries({ queryKey: ["instagram-media"] });
    } else {
      toast.error("Failed to disconnect");
    }
  };

  const handleSaveYouTube = () => {
    setYouTubeApiKey(apiKey);
    setYouTubeChannelId(channelId);
    queryClient.invalidateQueries({ queryKey: ["youtube-channel"] });
    queryClient.invalidateQueries({ queryKey: ["youtube-videos"] });
    toast.success("YouTube settings saved! Data will refresh.");
  };

  const handleSaveInstagram = () => {
    setMetaAccessToken(metaToken);
    setInstagramAccountId(igAccountId);
    queryClient.invalidateQueries({ queryKey: ["instagram-profile"] });
    queryClient.invalidateQueries({ queryKey: ["instagram-media"] });
    toast.success("Instagram settings saved! Data will refresh.");
  };

  const handleSaveFacebook = () => {
    setMetaAccessToken(metaToken);
    setFacebookPageId(fbPageId);
    queryClient.invalidateQueries({ queryKey: ["facebook-page"] });
    queryClient.invalidateQueries({ queryKey: ["facebook-posts"] });
    toast.success("Facebook settings saved! Data will refresh.");
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">Configure your API connections</p>
        </div>

        {/* YouTube */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-youtube">YouTube</span> API Configuration
            </CardTitle>
            <CardDescription>
              Enter your YouTube Data API v3 key and channel ID.{" "}
              <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                Google Cloud Console
              </a>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="yt-api-key" className="flex items-center gap-2"><Key className="h-3.5 w-3.5" /> API Key</Label>
              <Input id="yt-api-key" type="password" placeholder="AIza..." value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="yt-channel-id" className="flex items-center gap-2"><Hash className="h-3.5 w-3.5" /> Channel ID</Label>
              <Input id="yt-channel-id" placeholder="UC..." value={channelId} onChange={(e) => setChannelId(e.target.value)} />
            </div>
            <Button onClick={handleSaveYouTube} disabled={!apiKey || !channelId}>
              <Check className="mr-2 h-4 w-4" /> Save & Connect
            </Button>
          </CardContent>
        </Card>

        {/* Facebook & Instagram OAuth - NEW METHOD */}
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Facebook className="h-5 w-5 text-facebook" />
              <Instagram className="h-5 w-5 text-instagram" />
              Facebook & Instagram (OAuth)
            </CardTitle>
            <CardDescription>
              Connect with one click using Facebook Login. This is the easiest way to connect both platforms automatically.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {fbLoading ? (
              <div className="text-sm text-muted-foreground">Loading connection status...</div>
            ) : isFbConnected && fbPageInfo ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="font-medium">Connected to {fbPageInfo.pageName}</span>
                </div>
                {fbPageInfo.instagramConnected && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Instagram className="h-4 w-4" />
                    <span>Instagram Business Account linked</span>
                  </div>
                )}
                <Button variant="destructive" onClick={handleDisconnectFacebook}>
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button onClick={handleConnectFacebook} className="w-full">
                <Facebook className="mr-2 h-4 w-4" />
                Connect Facebook & Instagram
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Meta Access Token (shared) - MANUAL METHOD */}
        <Card>
          <CardHeader>
            <CardTitle>Meta Access Token (Manual Setup)</CardTitle>
            <CardDescription>
              Advanced: Use this if you prefer manual token setup. Get yours from the{" "}
              <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                Graph API Explorer
              </a>. Needs <code className="text-xs">instagram_basic</code>, <code className="text-xs">pages_show_list</code>, and <code className="text-xs">pages_read_engagement</code> permissions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label htmlFor="meta-token" className="flex items-center gap-2"><Key className="h-3.5 w-3.5" /> Access Token</Label>
            <Input id="meta-token" type="password" placeholder="EAAGm0PX4ZCps..." value={metaToken} onChange={(e) => setMetaToken(e.target.value)} />
          </CardContent>
        </Card>

        {/* Instagram - MANUAL METHOD */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-instagram">Instagram</span> Configuration (Manual)
            </CardTitle>
            <CardDescription>
              Advanced: Enter your Instagram Business Account ID. Find it via the{" "}
              <a href="https://developers.facebook.com/tools/explorer/?method=GET&path=me%2Faccounts%7Binstagram_business_account%7D" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                Graph API Explorer
              </a>{" "}
              by querying <code className="text-xs">/me/accounts?fields=instagram_business_account</code>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ig-account-id" className="flex items-center gap-2"><Hash className="h-3.5 w-3.5" /> Account ID</Label>
              <Input id="ig-account-id" placeholder="17841400..." value={igAccountId} onChange={(e) => setIgAccountId(e.target.value)} />
            </div>
            <Button onClick={handleSaveInstagram} disabled={!metaToken || !igAccountId}>
              <Check className="mr-2 h-4 w-4" /> Save & Connect
            </Button>
          </CardContent>
        </Card>

        {/* Facebook - MANUAL METHOD */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-facebook">Facebook</span> Configuration (Manual)
            </CardTitle>
            <CardDescription>
              Advanced: Enter your Facebook Page ID. Find it on your Page → About → Page ID, or query <code className="text-xs">/me/accounts</code> in the Graph API Explorer.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fb-page-id" className="flex items-center gap-2"><Hash className="h-3.5 w-3.5" /> Page ID</Label>
              <Input id="fb-page-id" placeholder="100234567890..." value={fbPageId} onChange={(e) => setFbPageId(e.target.value)} />
            </div>
            <Button onClick={handleSaveFacebook} disabled={!metaToken || !fbPageId}>
              <Check className="mr-2 h-4 w-4" /> Save & Connect
            </Button>
          </CardContent>
        </Card>

        {/* TikTok placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>TikTok</CardTitle>
            <CardDescription>TikTok API requires approved developer application access. The UI is ready — connect when you have access.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-warning" />
              <span>Requires TikTok for Developers approval</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
