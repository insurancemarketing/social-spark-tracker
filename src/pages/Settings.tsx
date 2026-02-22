import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { getYouTubeApiKey, setYouTubeApiKey, getYouTubeChannelId, setYouTubeChannelId } from "@/lib/youtube-api";
import { Check, Key, Hash } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function Settings() {
  const queryClient = useQueryClient();
  const [apiKey, setApiKey] = useState(getYouTubeApiKey() || "");
  const [channelId, setChannelId] = useState(getYouTubeChannelId() || "");

  const handleSave = () => {
    setYouTubeApiKey(apiKey);
    setYouTubeChannelId(channelId);
    queryClient.invalidateQueries({ queryKey: ["youtube-channel"] });
    queryClient.invalidateQueries({ queryKey: ["youtube-videos"] });
    toast.success("YouTube settings saved! Data will refresh.");
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">Configure your API connections</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-youtube">YouTube</span> API Configuration
            </CardTitle>
            <CardDescription>
              Enter your YouTube Data API v3 key and channel ID to pull live data.
              Get your API key from the{" "}
              <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                Google Cloud Console
              </a>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key" className="flex items-center gap-2">
                <Key className="h-3.5 w-3.5" /> API Key
              </Label>
              <Input
                id="api-key"
                type="password"
                placeholder="AIza..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="channel-id" className="flex items-center gap-2">
                <Hash className="h-3.5 w-3.5" /> Channel ID
              </Label>
              <Input
                id="channel-id"
                placeholder="UC..."
                value={channelId}
                onChange={(e) => setChannelId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Find your channel ID at{" "}
                <a href="https://www.youtube.com/account_advanced" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                  YouTube Advanced Settings
                </a>
              </p>
            </div>
            <Button onClick={handleSave} disabled={!apiKey || !channelId}>
              <Check className="mr-2 h-4 w-4" /> Save & Connect
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Other Platforms</CardTitle>
            <CardDescription>
              TikTok, Instagram, and Facebook APIs require approved developer applications.
              The UI is ready — connect when you have access.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-warning" />
                <span><strong className="text-tiktok">TikTok</strong> — Requires TikTok for Developers approval</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-warning" />
                <span><strong className="text-instagram">Instagram</strong> — Requires Facebook/Meta developer app</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-warning" />
                <span><strong className="text-facebook">Facebook</strong> — Requires Facebook/Meta developer app</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
