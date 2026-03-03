import { useQuery } from "@tanstack/react-query";
import { fetchPersonalProfile, fetchPersonalPosts } from "@/lib/meta-api";
import { getFacebookTokens } from "@/lib/facebook-oauth-simple";
import { useAuth } from "@/contexts/AuthContext";

async function resolveUserToken(): Promise<string | null> {
  const oauthTokens = await getFacebookTokens();
  const token = oauthTokens?.access_token || null;
  console.log('[FB Personal] User token resolved:', token ? 'yes' : 'no', 'page_token differs:', token !== oauthTokens?.page_access_token);
  return token;
}

export function usePersonalFacebookProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["facebook-personal-profile", user?.id],
    queryFn: async () => {
      const token = await resolveUserToken();
      if (!token) return null;
      return fetchPersonalProfile(token);
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePersonalFacebookPosts(limit = 20) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["facebook-personal-posts", user?.id, limit],
    queryFn: async () => {
      const token = await resolveUserToken();
      if (!token) return null;
      return fetchPersonalPosts(limit, token);
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
}
