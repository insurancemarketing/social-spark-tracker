import { ContentItem } from "./types";
import { getUserSettings, saveUserSettings } from "./user-settings-service";
import { refreshPageToken } from "./facebook-oauth-simple";

const BASE_URL = "https://graph.facebook.com/v22.0";

// ── Async getters/setters backed by Supabase ──────────────────

export const getMetaAccessToken = async () => (await getUserSettings()).meta_access_token;
export const setMetaAccessToken = async (t: string) => saveUserSettings({ meta_access_token: t });

export const getInstagramAccountId = async () => (await getUserSettings()).instagram_account_id;
export const setInstagramAccountId = async (id: string) => saveUserSettings({ instagram_account_id: id });

export const getFacebookPageId = async () => (await getUserSettings()).facebook_page_id;
export const setFacebookPageId = async (id: string) => saveUserSettings({ facebook_page_id: id });

// ── Shared fetch helper ───────────────────────────────────────

async function metaFetch(
  endpoint: string,
  params: Record<string, string> = {},
  tokenOverride?: string,
  _isRetry = false
) {
  const token = tokenOverride || (await getMetaAccessToken());
  if (!token) throw new Error("Meta access token not set");

  const url = new URL(`${BASE_URL}/${endpoint}`);
  url.searchParams.set("access_token", token);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString());

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const errorCode = err?.error?.code;

    // Auto-refresh on expired token (code 190) — retry once
    if (errorCode === 190 && !_isRetry) {
      console.log("[metaFetch] Token expired (190), attempting auto-refresh...");
      const freshToken = await refreshPageToken();
      if (freshToken) {
        console.log("[metaFetch] Refresh succeeded, retrying request...");
        return metaFetch(endpoint, params, freshToken, true);
      }
    }

    throw new Error(err?.error?.message || `Meta API error: ${res.status}`);
  }
  return res.json();
}

// ── Instagram ─────────────────────────────────────────────────

export interface InstagramProfile {
  username: string;
  followersCount: number;
  mediaCount: number;
}

export async function fetchInstagramProfile(accountId: string, token?: string): Promise<InstagramProfile> {
  const data = await metaFetch(accountId, {
    fields: "username,followers_count,media_count",
  }, token);
  return {
    username: data.username,
    followersCount: data.followers_count,
    mediaCount: data.media_count,
  };
}

export async function fetchInstagramMedia(accountId: string, limit = 20, token?: string): Promise<ContentItem[]> {
  const data = await metaFetch(`${accountId}/media`, {
    fields: "caption,timestamp,like_count,comments_count,media_type,permalink,thumbnail_url",
    limit: String(limit),
  }, token);

  return (data.data || []).map((item: any) => ({
    id: item.id,
    title: item.caption?.slice(0, 80) || "Untitled",
    platform: "instagram" as const,
    contentType: item.media_type === "VIDEO" ? "reel" as const : "post" as const,
    publishDate: item.timestamp?.split("T")[0] || "",
    views: 0,
    likes: item.like_count || 0,
    comments: item.comments_count || 0,
    shares: 0,
    thumbnailUrl: item.thumbnail_url,
  }));
}

// ── Facebook ──────────────────────────────────────────────────

export interface FacebookPageStats {
  name: string;
  followersCount: number;
  fanCount: number;
}

export async function fetchFacebookPage(pageId: string, token?: string): Promise<FacebookPageStats> {
  const data = await metaFetch(pageId, {
    fields: "name,followers_count,fan_count",
  }, token);
  return {
    name: data.name,
    followersCount: data.followers_count,
    fanCount: data.fan_count,
  };
}

export async function fetchFacebookPosts(pageId: string, limit = 20, token?: string): Promise<ContentItem[]> {
  const data = await metaFetch(`${pageId}/posts`, {
    fields: "message,created_time,shares,likes.summary(true),comments.summary(true)",
    limit: String(limit),
  }, token);

  return (data.data || []).map((item: any) => ({
    id: item.id,
    title: item.message?.slice(0, 80) || "Untitled Post",
    platform: "facebook" as const,
    contentType: "post" as const,
    publishDate: item.created_time?.split("T")[0] || "",
    views: 0,
    likes: item.likes?.summary?.total_count || 0,
    comments: item.comments?.summary?.total_count || 0,
    shares: item.shares?.count || 0,
  }));
}
