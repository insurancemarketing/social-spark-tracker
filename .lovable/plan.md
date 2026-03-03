

# Auto-Refresh Meta Tokens So It Never Breaks

## Problem
`metaFetch()` always reads the token from `user_settings.meta_access_token`, which is a page token that expires. Meanwhile, `useFacebookData.ts` resolves a fresh token from `facebook_tokens` but never passes it to the fetch functions -- they ignore it and read the stale one from `user_settings`.

## Fix (Two Parts)

### 1. Pass token through instead of always reading from DB (`src/lib/meta-api.ts`)
- Add an optional `tokenOverride` parameter to `metaFetch()` so callers can pass a token directly
- Add the same optional `token` parameter to `fetchFacebookPage`, `fetchFacebookPosts`, `fetchInstagramProfile`, `fetchInstagramMedia`
- When provided, use it instead of reading from `user_settings`
- On a 190 error (expired token), attempt auto-refresh: call `/me/accounts` with the long-lived user token from `facebook_tokens`, get a fresh page token, update both `facebook_tokens.page_access_token` and `user_settings.meta_access_token`, then retry the original request once

### 2. Update hooks to pass resolved token (`src/hooks/useFacebookData.ts`, `src/hooks/useInstagramData.ts`)
- `useFacebookData.ts`: pass `creds.token` to `fetchFacebookPage(pageId, token)` and `fetchFacebookPosts(pageId, limit, token)`
- `useInstagramData.ts`: resolve token from `facebook_tokens` first (like `useFacebookData` does), pass it to `fetchInstagramProfile` and `fetchInstagramMedia`

### 3. Add `refreshPageToken()` to `src/lib/facebook-oauth-simple.ts`
- Export a function that reads the long-lived `access_token` from `facebook_tokens`, calls `https://graph.facebook.com/v22.0/me/accounts`, gets a fresh page token, and updates both DB tables
- This is called automatically by `metaFetch` on 190 errors -- no manual action needed

## File Summary

| File | Change |
|------|--------|
| `src/lib/meta-api.ts` | Add token passthrough to `metaFetch` and all fetch functions; auto-refresh on 190 error |
| `src/lib/facebook-oauth-simple.ts` | Add `refreshPageToken()` that uses long-lived token to get fresh page token |
| `src/hooks/useFacebookData.ts` | Pass resolved token to fetch functions |
| `src/hooks/useInstagramData.ts` | Resolve token from `facebook_tokens` first, pass to fetch functions |

