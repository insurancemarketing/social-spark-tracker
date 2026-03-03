

# Fix Instagram Token Refresh + Enable DM Tracking

## Two Problems Found

### Problem 1: Instagram page is broken (token expired again)
The auto-refresh we built in `metaFetch()` works -- but `InstagramPage.tsx` doesn't use it. It calls `instagram-api-service.ts` which makes **raw `fetch()` calls** directly to the Graph API, completely bypassing `metaFetch` and its auto-refresh logic. So the expired page token is never refreshed for the Instagram page.

### Problem 2: Instagram DMs aren't tracked
Three things are missing:
1. **OAuth scopes**: The login flow requests `instagram_basic`, `instagram_manage_insights`, etc. but does NOT request `instagram_manage_messages` -- the permission Meta requires to receive DM webhooks.
2. **Webhook not registered**: The `dm-webhook` edge function exists but its URL needs to be registered in your Meta App Dashboard under Webhooks with the `messages` subscription.
3. **Outbound DMs**: Meta webhooks only deliver inbound messages. To track messages *you* send, we need a polling mechanism that periodically calls the Instagram Conversations API to fetch recent threads.

## Plan

### 1. Fix Instagram auto-refresh (`src/lib/instagram-api-service.ts`)
- Replace all raw `fetch()` calls with calls to `metaFetch` from `meta-api.ts` (which already handles 190 errors and auto-refreshes)
- This fixes the "Session has expired" error on the Instagram page without duplicating refresh logic

### 2. Add messaging permission to OAuth flow (`src/lib/facebook-oauth-simple.ts`)
- Add `instagram_manage_messages` to the `FACEBOOK_SCOPES` list
- This will prompt the user to grant messaging access on next reconnect, enabling DM webhooks

### 3. Create a DM polling edge function (`supabase/functions/poll-instagram-dms/index.ts`)
- New edge function that uses the stored page access token to call the Instagram Conversations API (`/{ig-account-id}/conversations` and `/{conversation-id}/messages`)
- Fetches both inbound and outbound messages from recent conversations
- Inserts any new messages into `automated_dms` (deduplicating by `message_id`)
- Can be triggered manually from the UI or scheduled via cron

### 4. Add "Sync DMs" button to the DM Pipeline page (`src/pages/DMPipelineWithSupabase.tsx`)
- Add a "Sync DMs Now" button that invokes the `poll-instagram-dms` edge function
- Shows a loading state while syncing
- Refreshes the DM list after sync completes

### 5. User setup step (no code -- manual action)
After reconnecting Facebook with the new permissions, you'll need to:
- Go to Meta App Dashboard > Webhooks
- Subscribe to `messages` field for your Instagram account
- Set the callback URL to your `dm-webhook` edge function URL

## File Summary

| File | Change |
|------|--------|
| `src/lib/instagram-api-service.ts` | Route all API calls through `metaFetch` for auto-refresh |
| `src/lib/facebook-oauth-simple.ts` | Add `instagram_manage_messages` to OAuth scopes |
| `supabase/functions/poll-instagram-dms/index.ts` | New edge function to poll conversations API for inbound + outbound DMs |
| `src/pages/DMPipelineWithSupabase.tsx` | Add "Sync DMs Now" button to trigger polling |

