import { useQuery } from "@tanstack/react-query";
import { fetchChannelStats, fetchRecentVideos, getYouTubeApiKey, getYouTubeChannelId } from "@/lib/youtube-api";

export function useYouTubeChannel() {
  const apiKey = getYouTubeApiKey();
  const channelId = getYouTubeChannelId();

  return useQuery({
    queryKey: ["youtube-channel", channelId],
    queryFn: () => fetchChannelStats(channelId!),
    enabled: !!apiKey && !!channelId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useYouTubeVideos(maxResults = 20) {
  const apiKey = getYouTubeApiKey();
  const channelId = getYouTubeChannelId();

  return useQuery({
    queryKey: ["youtube-videos", channelId, maxResults],
    queryFn: () => fetchRecentVideos(channelId!, maxResults),
    enabled: !!apiKey && !!channelId,
    staleTime: 5 * 60 * 1000,
  });
}
