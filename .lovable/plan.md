

## Plan: Track Personal Facebook Profile Posts

### The Problem
The current Facebook integration is built entirely around **Facebook Pages** (business entities). Your personal profile is different — the Graph API uses `user_posts` permission instead of `pages_*` permissions, and there are no follower/fan count fields.

### What We'll Build

**1. Add `user_posts` to OAuth scopes**
Update `facebook-oauth-simple.ts` to include `user_posts` in the scopes list so the OAuth flow grants permission to read your personal posts.

**2. Add personal profile API functions in `meta-api.ts`**
- `fetchPersonalProfile(token)` — calls `/me?fields=name,id` to get your name
- `fetchPersonalPosts(limit, token)` — calls `/me/posts?fields=message,created_time,shares,likes.summary(true),comments.summary(true)` to get your personal timeline posts with engagement data

**3. Create `usePersonalFacebookData.ts` hook**
A new hook that resolves the user's access token (from `facebook_tokens.access_token` — the *user* token, not the page token) and calls the personal profile endpoints.

**4. Update `FacebookPage.tsx` to show personal posts**
Rework the page to:
- Remove the Page-specific stats (followers, fan count) that don't apply to personal profiles
- Show your name and total posts loaded
- Display your personal posts in the existing `ContentTable` with likes, comments, and shares
- Keep the "connect" prompt if no token exists

**5. Update Settings page label**
Change the Facebook OAuth card description to clarify it now covers personal profile tracking too (no functional change needed — the same OAuth flow works, just with the added `user_posts` scope).

### Important Limitation
After changing scopes, you'll need to **disconnect and reconnect** Facebook in Settings so the new `user_posts` permission gets granted.

### Technical Notes
- Personal profile uses the **user access token** (`access_token`), not the page access token
- The `/me/posts` endpoint returns posts you've made on your own timeline
- Engagement data (likes, comments, shares) is available on your own posts
- No reach/impressions data is available for personal profiles via the API

