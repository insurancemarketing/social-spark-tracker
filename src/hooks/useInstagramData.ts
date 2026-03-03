import { useQuery } from "@tanstack/react-query";
import { fetchInstagramProfile, fetchInstagramMedia, getMetaAccessToken, getInstagramAccountId } from "@/lib/meta-api";
import { getFacebookTokens } from "@/lib/facebook-oauth-simple";
import { useAuth } from "@/contexts/AuthContext";

/** Resolve the best available token and Instagram account ID */
async function resolveInstagramCredentials(): Promise<{ token: string; accountId: string } | null> {
  // Try OAuth tokens first (freshest source)
  const oauthTokens = await getFacebookTokens();
  if (oauthTokens?.instagram_business_account_id) {
    const token = oauthTokens.page_access_token || oauthTokens.access_token;
    if (token) {
      return { token, accountId: oauthTokens.instagram_business_account_id };
    }
  }

  // Fall back to manual user_settings
  const [token, accountId] = await Promise.all([getMetaAccessToken(), getInstagramAccountId()]);
  if (token && accountId) return { token, accountId };

  return null;
}

export function useInstagramProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["instagram-profile", user?.id],
    queryFn: async () => {
      const creds = await resolveInstagramCredentials();
      if (!creds) return null;
      return fetchInstagramProfile(creds.accountId, creds.token);
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
}

export function useInstagramMedia(limit = 20) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["instagram-media", user?.id, limit],
    queryFn: async () => {
      const creds = await resolveInstagramCredentials();
      if (!creds) return null;
      return fetchInstagramMedia(creds.accountId, limit, creds.token);
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
}
