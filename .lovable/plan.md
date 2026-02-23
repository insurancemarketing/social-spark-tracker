

# Instagram + Facebook Live API Integration

## The Big Win

One Meta Developer App gives you **both** Instagram and Facebook live data. Same access token, same setup — two platforms connected at once.

## What Gets Built

### 1. Meta Graph API Library (`src/lib/meta-api.ts`)
- Shared fetch helper for the Meta Graph API (graph.facebook.com)
- **Instagram functions**: fetch profile stats (followers, media count), fetch recent media with metrics (reach, impressions, likes, comments, saves)
- **Facebook functions**: fetch page stats (followers, post reach), fetch recent posts with metrics (reactions, comments, shares, reach)
- Token and ID getters/setters using localStorage (same pattern as YouTube)

### 2. React Query Hooks
- `src/hooks/useInstagramData.ts` — hooks for Instagram profile and media
- `src/hooks/useFacebookData.ts` — hooks for Facebook page and posts

### 3. Settings Page Update
Replace the "Other Platforms" placeholder card with two real configuration sections:
- **Instagram**: Access Token field + Instagram Business Account ID field
- **Facebook**: Uses same access token + Facebook Page ID field
- Each has a "Save & Connect" button that invalidates the relevant queries
- Helpful links to where to find your account/page IDs

### 4. Instagram Page — Live Data
- Same pattern as YouTube: show live data when token is set, fall back to mock data otherwise
- Warning banner with "Go to Settings" button when not connected
- Stats cards: Reach, Followers, Likes, Saves (from real API)
- Recent media table with real engagement numbers

### 5. Facebook Page — Live Data
- Same live/mock pattern
- Stats cards: Reach, Page Followers, Reactions, Shares (from real API)
- Recent posts table with real metrics

## API Endpoints Used

| Platform | Endpoint | Data |
|----------|----------|------|
| Instagram | `GET /{ig-user-id}?fields=followers_count,media_count,username` | Profile stats |
| Instagram | `GET /{ig-user-id}/media?fields=caption,timestamp,like_count,comments_count,media_type,permalink,thumbnail_url,insights.metric(reach,impressions,saved)` | Post-level metrics |
| Facebook | `GET /{page-id}?fields=name,followers_count,fan_count` | Page stats |
| Facebook | `GET /{page-id}/posts?fields=message,created_time,shares,insights.metric(post_impressions,post_reactions_by_type_total)` | Post metrics |

## What You'll Need (one-time setup)

1. A **Meta Developer App** at developers.facebook.com
2. Your **Instagram Professional Account** linked to a **Facebook Page**
3. A **long-lived access token** (valid 60 days, can be refreshed)
4. Your **Instagram Business Account ID** and **Facebook Page ID**

I can walk you through each step after we build this.

## Technical Approach

- Follows the exact same architecture as the YouTube integration
- Access token stored in localStorage (it's a user token, not a secret server key)
- React Query handles caching and refetching (5-minute stale time)
- Graceful fallback to mock data when not connected
- Error handling with user-friendly messages

