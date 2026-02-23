import { useQuery } from "@tanstack/react-query";
import {
  fetchInstagramProfile,
  fetchInstagramMedia,
  getMetaAccessToken,
  getInstagramAccountId,
} from "@/lib/meta-api";

export function useInstagramProfile() {
  const token = getMetaAccessToken();
  const accountId = getInstagramAccountId();

  return useQuery({
    queryKey: ["instagram-profile", accountId],
    queryFn: () => fetchInstagramProfile(accountId!),
    enabled: !!token && !!accountId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useInstagramMedia(limit = 20) {
  const token = getMetaAccessToken();
  const accountId = getInstagramAccountId();

  return useQuery({
    queryKey: ["instagram-media", accountId, limit],
    queryFn: () => fetchInstagramMedia(accountId!, limit),
    enabled: !!token && !!accountId,
    staleTime: 5 * 60 * 1000,
  });
}
