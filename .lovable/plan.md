

# Fix: Facebook and Instagram Pages Not Loading After OAuth Connection

## Root Cause

The OAuth connection succeeded -- tokens are stored in the `facebook_tokens` table. But the pages don't load because:

1. **`meta-api.ts` still uses Graph API v19.0** (deprecated). This was missed in the previous API version updates. All other files use v22.0 but this core file still has the old version.

2. **Facebook page only reads from `user_settings`** (manual config), ignoring the `facebook_tokens` table entirely. After OAuth, `user_settings` still has `meta_access_token: null` and `facebook_page_id: null`, so the Facebook page shows "Connect your Meta access token."

3. **Instagram page gets stuck on "Loading..."** because it correctly detects the OAuth connection (`isConnected = true`), but the actual data fetch returns `null` -- and the UI shows "Loading..." text instead of actual data when profile is null.

## Changes

### 1. Update `src/lib/meta-api.ts` -- Fix API version
- Change `BASE_URL` from `v19.0` to `v22.0`

### 2. Update `src/hooks/useFacebookData.ts` -- Use OAuth tokens
- Before falling back to `user_settings`, check `facebook_tokens` table via `getFacebookTokens()` from `facebook-oauth-simple.ts`
- Use the page access token and page ID from OAuth tokens to fetch data
- This mirrors how `instagram-api-service.ts` already works

### 3. Update `src/pages/FacebookPage.tsx` -- Also check OAuth connection
- Check both `user_settings` data AND `facebook_tokens` for connection status
- Show live data from whichever source has valid credentials

### 4. Update `src/pages/InstagramPage.tsx` -- Fix loading state
- When `isConnected` is true but profile is null after loading completes, show an error state instead of perpetual "Loading..."
- Add error handling for failed API calls

### 5. Update `src/lib/instagram-api-service.ts` -- Better error surfacing
- When API calls fail, surface the error reason rather than returning null silently
- This helps diagnose whether the issue is permissions, token expiry, or API version

## Technical Details

The key architectural mismatch: the OAuth flow stores everything in `facebook_tokens`, but the Facebook page reads exclusively from `user_settings`. The sync attempt in the OAuth callback (lines 94-102 of `facebook-oauth-simple.ts`) uses `saveUserSettings` with `upsert`, but the upsert sends partial data -- only `meta_access_token`, `instagram_account_id`, and `facebook_page_id` -- while the existing row has other fields. This can cause the upsert to null out existing YouTube settings or fail silently.

The fix makes both Facebook and Instagram pages check `facebook_tokens` first (OAuth path), then fall back to `user_settings` (manual path), matching the pattern Instagram's API service already uses.

