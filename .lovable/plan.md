

# Sync dm-webhook codebase with deployed version

## Problem
The deployed `dm-webhook` edge function on Supabase has additional functionality not reflected in the codebase — specifically a `getSenderInfo` helper that fetches real Facebook user names via the Graph API using `FB_PAGE_ACCESS_TOKEN`.

## Changes

| File | Change |
|------|--------|
| `supabase/functions/dm-webhook/index.ts` | Replace with the deployed version: add `PAGE_ACCESS_TOKEN` env var, add `getSenderInfo()` function, update Facebook message handler to use it |

Key differences from current codebase:
1. Adds `const PAGE_ACCESS_TOKEN = Deno.env.get('FB_PAGE_ACCESS_TOKEN')` 
2. Adds `getSenderInfo(senderId)` function that calls Graph API `/v18.0/{senderId}?fields=name,first_name,last_name`
3. Facebook messaging handler calls `getSenderInfo` instead of hardcoding sender name
4. CORS headers revert to the simpler set (matching deployed version)

## Next Steps
Since the webhook is already deployed and live, after syncing the code I can help you:
- Set up a Make.com scenario to forward Instagram DMs to this webhook
- Or test the webhook directly with Meta's webhook subscription

