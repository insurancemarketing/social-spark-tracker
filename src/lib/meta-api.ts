import { ContentItem } from "./types";

const BASE_URL = "https://graph.facebook.com/v19.0";

// ── localStorage helpers ──────────────────────────────────────

export const getMetaAccessToken = () => localStorage.getItem("meta_access_token");
export const setMetaAccessToken = (t: string) => localStorage.setItem("meta_access_token", t);

export const getInstagramAccountId = () => localStorage.getItem("instagram_account_id");
export const setInstagramAccountId = (id: string) => localStorage.setItem("instagram_account_id", id);

export const getFacebookPageId = () => localStorage.getItem("facebook_page_id");
export const setFacebookPageId = (id: string) => localStorage.setItem("facebook_page_id", id);

// ── Shared fetch helper ───────────────────────────────────────

async function metaFetch(endpoint: string, params: Record<string, string> = {}) {
  const token = getMetaAccessToken();
  if (!token) throw new Error("Meta access token not set");
  const url = new URL(`${BASE_URL}/${endpoint}`);
  url.searchParams.set("access_token", token);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
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

export async function fetchInstagramProfile(accountId: string): Promise<InstagramProfile> {
  const data = await metaFetch(accountId, {
    fields: "username,followers_count,media_count",
  });
  return {
    username: data.username,
    followersCount: data.followers_count,
    mediaCount: data.media_count,
  };
}

export async function fetchInstagramMedia(accountId: string, limit = 20): Promise<ContentItem[]> {
  const data = await metaFetch(`${accountId}/media`, {
    fields: "caption,timestamp,like_count,comments_count,media_type,permalink,thumbnail_url",
    limit: String(limit),
  });

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

export async function fetchFacebookPage(pageId: string): Promise<FacebookPageStats> {
  const data = await metaFetch(pageId, {
    fields: "name,followers_count,fan_count",
  });
  return {
    name: data.name,
    followersCount: data.followers_count,
    fanCount: data.fan_count,
  };
}

export async function fetchFacebookPosts(pageId: string, limit = 20): Promise<ContentItem[]> {
  const data = await metaFetch(`${pageId}/posts`, {
    fields: "message,created_time,shares",
    limit: String(limit),
  });

  return (data.data || []).map((item: any) => ({
    id: item.id,
    title: item.message?.slice(0, 80) || "Untitled Post",
    platform: "facebook" as const,
    contentType: "post" as const,
    publishDate: item.created_time?.split("T")[0] || "",
    views: 0,
    likes: 0,
    comments: 0,
    shares: item.shares?.count || 0,
  }));
}
