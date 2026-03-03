import { useQuery } from "@tanstack/react-query";
import { fetchInstagramProfile, fetchInstagramMedia, getMetaAccessToken, getInstagramAccountId } from "@/lib/meta-api";
import { useAuth } from "@/contexts/AuthContext";

export function useInstagramProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["instagram-profile", user?.id],
    queryFn: async () => {
      const [token, accountId] = await Promise.all([getMetaAccessToken(), getInstagramAccountId()]);
      if (!token || !accountId) return null;
      return fetchInstagramProfile(accountId);
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
      const [token, accountId] = await Promise.all([getMetaAccessToken(), getInstagramAccountId()]);
      if (!token || !accountId) return null;
      return fetchInstagramMedia(accountId, limit);
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
}
