import { useQuery } from "@tanstack/react-query";
import { fetchPersonalProfile, fetchPersonalPosts } from "@/lib/meta-api";
import { getFacebookTokens } from "@/lib/facebook-oauth-simple";
import { useAuth } from "@/contexts/AuthContext";

async function resolveUserToken(): Promise<string | null> {
  const oauthTokens = await getFacebookTokens();
  // Use the user access token (not page token) for personal profile
  return oauthTokens?.access_token || null;
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
