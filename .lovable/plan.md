

# Plan: Fix and Unify Meta OAuth for Facebook + Instagram

## Current State

You already have a working Facebook OAuth flow (`facebook-oauth-simple.ts`) that:
- Redirects to Facebook login with the right scopes (pages, instagram, business management)
- Stores tokens in a `facebook_tokens` table in Supabase
- Auto-detects the linked Instagram Business Account

**But there are bugs preventing it from working end-to-end:**

1. `instagram-api-service.ts` calls `getMetaAccessToken()` and `getInstagramAccountId()` as **synchronous** functions, but they were changed to **async** (they now query Supabase). This means the fallback path silently fails.
2. `InstagramPage.tsx` also calls those functions synchronously on line 38-39.
3. After OAuth completes, the token is stored in `facebook_tokens` but never synced to `user_settings` -- so the Facebook page (which reads from `user_settings`) doesn't see it.
4. The two data paths (OAuth via `facebook_tokens` table vs manual via `user_settings` table) are disconnected.

## What This Plan Fixes

### 1. Sync OAuth tokens into user_settings automatically

After the OAuth callback stores tokens in `facebook_tokens`, also write the page access token, Instagram account ID, and Facebook page ID into `user_settings`. This means both the Instagram and Facebook pages will "just work" after OAuth login -- no manual token entry needed.

**File:** `src/lib/facebook-oauth-simple.ts`
- In `handleAuthCallback()`, after upserting to `facebook_tokens`, also call `saveUserSettings()` with the meta access token, Instagram account ID, and Facebook page ID.

### 2. Fix async bugs in instagram-api-service.ts

**File:** `src/lib/instagram-api-service.ts`
- Lines 17-24: `getMetaAccessToken()` and `getInstagramAccountId()` are async but called without `await`. Add `await` to both calls so the fallback path actually works.

### 3. Fix async bugs in InstagramPage.tsx

**File:** `src/pages/InstagramPage.tsx`
- Lines 38-39: Same issue -- these are async calls used synchronously. Fix by awaiting them properly inside the existing async function.

### 4. Clean up Settings page

**File:** `src/pages/Settings.tsx`
- Remove the "User ID for Make.com" card (you said to ignore Make.com)
- Keep the OAuth connect button as the primary method
- Keep manual fields as a secondary "Advanced" fallback

## Files Changed

| File | Change |
|------|--------|
| `src/lib/facebook-oauth-simple.ts` | Sync OAuth tokens to `user_settings` after login |
| `src/lib/instagram-api-service.ts` | Fix 2 missing `await` calls |
| `src/pages/InstagramPage.tsx` | Fix 2 missing `await` calls |
| `src/pages/Settings.tsx` | Remove Make.com card |

## Result

After this, clicking "Connect Facebook and Instagram" on the Settings page will:
1. Redirect to Facebook OAuth
2. Get your Page access token + Instagram Business Account ID
3. Store everything in both `facebook_tokens` and `user_settings`
4. Both the Instagram and Facebook analytics pages will load real data automatically

