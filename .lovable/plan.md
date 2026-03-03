

# Fix Dashboard, Facebook Page Tracking, and Instagram Metrics

## Three Issues to Address

### 1. Dashboard is static -- needs to show real data
The Dashboard page (`src/pages/Dashboard.tsx`) is currently a hardcoded placeholder that just says "Connect Your Platforms." Now that Facebook/Instagram are connected, it should pull in real summary data from all connected platforms.

**Changes to `src/pages/Dashboard.tsx`:**
- Import and use `useFacebookPage`, `useFacebookPosts` from `useFacebookData`
- Import and use `useInstagramProfile` from `useInstagramData`
- Import and use `useYouTubeChannel` from `useYouTubeData`
- Show a grid of StatsCards with real numbers: total followers across platforms, total posts, engagement stats
- Show a per-platform summary section (YouTube subscribers, Instagram followers, Facebook fans)
- Keep the "Connect Your Platforms" card only for platforms that aren't connected yet

### 2. Facebook Page -- personal page tracking via public fields
The current `fetchFacebookPage` requests `followers_count` and `fan_count`, which require Page-level permissions. For a personal Facebook profile (not a Page), these fields aren't available the same way.

**The fix:** The user already connected via OAuth and has a **Page** (Business Manager). The `useFacebookData` hook already resolves credentials from OAuth tokens. The issue is that `fetchFacebookPosts` only fetches `message, created_time, shares` -- it doesn't fetch `likes` or `comments` counts, so the ContentTable shows 0 for those.

**Changes to `src/lib/meta-api.ts`:**
- Update `fetchFacebookPosts` to also request `likes.summary(true),comments.summary(true)` fields
- Map `likes.summary.total_count` and `comments.summary.total_count` into the ContentItem

### 3. Instagram metrics not showing on posts
The Instagram page calls `fetchPostInsights` which requests the metric `engagement` -- but this metric was deprecated in newer Instagram API versions. The API returns an error silently, so `postInsights` is always null and no metrics render.

**Changes to `src/lib/instagram-api-service.ts`:**
- Update `fetchPostInsights` to use the correct metrics for the current API version: `impressions,reach,saved,likes,comments,shares` (remove the deprecated `engagement` metric)
- Calculate engagement as `likes + comments + saves` from the individual metrics
- Add error logging to surface which specific metrics fail

**Changes to `src/pages/InstagramPage.tsx`:**
- Show basic like/comment counts from the post data itself (`post.likeCount`, `post.commentsCount` are not currently mapped but are available from the media endpoint) as a fallback when insights fail
- Update the posts fetch to include `like_count,comments_count` (already present in the API call but not used in the grid display)

## Summary of File Changes

| File | What Changes |
|------|-------------|
| `src/pages/Dashboard.tsx` | Replace static placeholder with real data from YouTube, Instagram, Facebook hooks |
| `src/lib/meta-api.ts` | Add `likes.summary(true),comments.summary(true)` to Facebook posts query |
| `src/lib/instagram-api-service.ts` | Remove deprecated `engagement` metric from insights call; calculate from components |
| `src/pages/InstagramPage.tsx` | Show like/comment counts from post data as fallback when insights are unavailable |

