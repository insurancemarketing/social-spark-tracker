import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { getUserSettings, saveUserSettings, clearSettingsCache } from "@/lib/user-settings-service";
import { Check, Key, Hash, Facebook, Instagram, Copy, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { initiateFacebookAuth, isAuthenticated, getPageInfo, disconnectFacebook } from "@/lib/facebook-oauth-simple";
import { useAuth } from "@/contexts/AuthContext";

export default function Settings() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  // YouTube
  const [apiKey, setApiKey] = useState("");
  const [channelId, setChannelId] = useState("");

  // Meta (shared token)
  const [metaToken, setMetaToken] = useState("");
  const [igAccountId, setIgAccountId] = useState("");
  const [fbPageId, setFbPageId] = useState("");

  // Facebook/Instagram OAuth
  const [isFbConnected, setIsFbConnected] = useState(false);
  const [fbPageInfo, setFbPageInfo] = useState<any>(null);
  const [fbLoading, setFbLoading] = useState(true);

  // Load settings from Supabase on mount
  useEffect(() => {
    async function load() {
      try {
        const settings = await getUserSettings();
        setApiKey(settings.youtube_api_key || "");
        setChannelId(settings.youtube_channel_id || "");
        setMetaToken(settings.meta_access_token || "");
        setIgAccountId(settings.instagram_account_id || "");
        setFbPageId(settings.facebook_page_id || "");
      } catch (e) {
        console.error("Failed to load settings:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
    checkFacebookConnection();
  }, []);

  const copyUserId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      toast.success("User ID copied to clipboard!");
    }
  };

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

  const handleConnectFacebook = () => { initiateFacebookAuth(); };

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

  const handleSaveYouTube = async () => {
    try {
      await saveUserSettings({ youtube_api_key: apiKey, youtube_channel_id: channelId });
      clearSettingsCache();
      queryClient.invalidateQueries({ queryKey: ["youtube-channel"] });
      queryClient.invalidateQueries({ queryKey: ["youtube-videos"] });
      toast.success("YouTube settings saved! Data will refresh.");
    } catch (e) {
      toast.error("Failed to save YouTube settings");
    }
  };

  const handleSaveInstagram = async () => {
    try {
      await saveUserSettings({ meta_access_token: metaToken, instagram_account_id: igAccountId });
      clearSettingsCache();
      queryClient.invalidateQueries({ queryKey: ["instagram-profile"] });
      queryClient.invalidateQueries({ queryKey: ["instagram-media"] });
      toast.success("Instagram settings saved! Data will refresh.");
    } catch (e) {
      toast.error("Failed to save Instagram settings");
    }
  };

  const handleSaveFacebook = async () => {
    try {
      await saveUserSettings({ meta_access_token: metaToken, facebook_page_id: fbPageId });
      clearSettingsCache();
      queryClient.invalidateQueries({ queryKey: ["facebook-page"] });
      queryClient.invalidateQueries({ queryKey: ["facebook-posts"] });
      toast.success("Facebook settings saved! Data will refresh.");
    } catch (e) {
      toast.error("Failed to save Facebook settings");
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">Configure your API connections (stored securely in the database)</p>
        </div>

        {/* User ID for Make.com */}
        <Card className="border-2 border-primary/20 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
          <CardHeader>
            <CardTitle>Your User ID (for Make.com)</CardTitle>
            <CardDescription>Copy this ID and use it in your Make.com webhook configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Input value={user?.id || ""} readOnly className="font-mono text-sm" />
              <Button onClick={copyUserId} size="sm">
                <Copy className="h-4 w-4 mr-2" /> Copy
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Use this ID in the <code className="bg-muted px-1 rounded">user_id</code> field when setting up Make.com DM automation
            </p>
          </CardContent>
        </Card>

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

        {/* Facebook & Instagram OAuth */}
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Facebook className="h-5 w-5 text-facebook" />
              <Instagram className="h-5 w-5 text-instagram" />
              Facebook & Instagram (OAuth)
            </CardTitle>
            <CardDescription>Connect with one click using Facebook Login.</CardDescription>
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
                <Button variant="destructive" onClick={handleDisconnectFacebook}>Disconnect</Button>
              </div>
            ) : (
              <Button onClick={handleConnectFacebook} className="w-full">
                <Facebook className="mr-2 h-4 w-4" /> Connect Facebook & Instagram
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Meta Access Token (Manual) */}
        <Card>
          <CardHeader>
            <CardTitle>Meta Access Token (Manual Setup)</CardTitle>
            <CardDescription>
              Advanced: Get yours from the{" "}
              <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                Graph API Explorer
              </a>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label htmlFor="meta-token" className="flex items-center gap-2"><Key className="h-3.5 w-3.5" /> Access Token</Label>
            <Input id="meta-token" type="password" placeholder="EAAGm0PX4ZCps..." value={metaToken} onChange={(e) => setMetaToken(e.target.value)} />
          </CardContent>
        </Card>

        {/* Instagram Manual */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-instagram">Instagram</span> Configuration (Manual)
            </CardTitle>
            <CardDescription>Enter your Instagram Business Account ID.</CardDescription>
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

        {/* Facebook Manual */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-facebook">Facebook</span> Configuration (Manual)
            </CardTitle>
            <CardDescription>Enter your Facebook Page ID.</CardDescription>
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
            <CardDescription>TikTok API requires approved developer application access.</CardDescription>
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
