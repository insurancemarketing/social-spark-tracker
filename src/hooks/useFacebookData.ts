import { useQuery } from "@tanstack/react-query";
import { fetchFacebookPage, fetchFacebookPosts, getMetaAccessToken, getFacebookPageId } from "@/lib/meta-api";
import { useAuth } from "@/contexts/AuthContext";

export function useFacebookPage() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["facebook-page", user?.id],
    queryFn: async () => {
      const [token, pageId] = await Promise.all([getMetaAccessToken(), getFacebookPageId()]);
      if (!token || !pageId) return null;
      return fetchFacebookPage(pageId);
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
}

export function useFacebookPosts(limit = 20) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["facebook-posts", user?.id, limit],
    queryFn: async () => {
      const [token, pageId] = await Promise.all([getMetaAccessToken(), getFacebookPageId()]);
      if (!token || !pageId) return null;
      return fetchFacebookPosts(pageId, limit);
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
}
