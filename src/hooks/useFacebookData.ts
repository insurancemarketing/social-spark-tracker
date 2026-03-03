import { useQuery } from "@tanstack/react-query";
import { fetchFacebookPage, fetchFacebookPosts, getMetaAccessToken, getFacebookPageId } from "@/lib/meta-api";
import { getFacebookTokens } from "@/lib/facebook-oauth-simple";
import { useAuth } from "@/contexts/AuthContext";

async function resolveCredentials(): Promise<{ token: string; pageId: string } | null> {
  // Try OAuth tokens first
  const oauthTokens = await getFacebookTokens();
  if (oauthTokens?.pages?.length > 0) {
    const pageId = oauthTokens.pages[0].id;
    const token = oauthTokens.page_access_token || oauthTokens.access_token;
    if (token && pageId) return { token, pageId };
  }

  // Fall back to manual user_settings
  const [token, pageId] = await Promise.all([getMetaAccessToken(), getFacebookPageId()]);
  if (token && pageId) return { token, pageId };

  return null;
}

export function useFacebookPage() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["facebook-page", user?.id],
    queryFn: async () => {
      const creds = await resolveCredentials();
      if (!creds) return null;
      return fetchFacebookPage(creds.pageId);
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
      const creds = await resolveCredentials();
      if (!creds) return null;
      return fetchFacebookPosts(creds.pageId, limit);
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
}
