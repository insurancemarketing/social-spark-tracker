import { useQuery } from "@tanstack/react-query";
import { fetchChannelStats, fetchRecentVideos, getYouTubeApiKey, getYouTubeChannelId } from "@/lib/youtube-api";
import { useAuth } from "@/contexts/AuthContext";

export function useYouTubeChannel() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["youtube-channel", user?.id],
    queryFn: async () => {
      const [apiKey, channelId] = await Promise.all([getYouTubeApiKey(), getYouTubeChannelId()]);
      if (!apiKey || !channelId) return null;
      return fetchChannelStats(channelId);
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
}

export function useYouTubeVideos(maxResults = 20) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["youtube-videos", user?.id, maxResults],
    queryFn: async () => {
      const [apiKey, channelId] = await Promise.all([getYouTubeApiKey(), getYouTubeChannelId()]);
      if (!apiKey || !channelId) return null;
      return fetchRecentVideos(channelId, maxResults);
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
}
