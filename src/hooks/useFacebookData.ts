import { useQuery } from "@tanstack/react-query";
import {
  fetchFacebookPage,
  fetchFacebookPosts,
  getMetaAccessToken,
  getFacebookPageId,
} from "@/lib/meta-api";

export function useFacebookPage() {
  const token = getMetaAccessToken();
  const pageId = getFacebookPageId();

  return useQuery({
    queryKey: ["facebook-page", pageId],
    queryFn: () => fetchFacebookPage(pageId!),
    enabled: !!token && !!pageId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useFacebookPosts(limit = 20) {
  const token = getMetaAccessToken();
  const pageId = getFacebookPageId();

  return useQuery({
    queryKey: ["facebook-posts", pageId, limit],
    queryFn: () => fetchFacebookPosts(pageId!, limit),
    enabled: !!token && !!pageId,
    staleTime: 5 * 60 * 1000,
  });
}
