

# Fix: Disable JWT verification on the dm-webhook Edge Function

## Problem
Supabase Edge Functions enforce JWT authentication by default. When Meta tries to verify the webhook by sending a GET request to your callback URL, it doesn't include any Supabase auth token — so the request gets rejected with a 401 before your verification code even executes.

## Solution
Create a `config.toml` file for the `dm-webhook` function that disables JWT verification, allowing Meta's unauthenticated webhook requests to reach your handler.

## File Changes

| File | Change |
|------|--------|
| `supabase/functions/dm-webhook/config.toml` | New file — set `verify_jwt = false` to allow unauthenticated requests from Meta |

The file contents:

```toml
[functions.dm-webhook]
verify_jwt = false
```

After deploying this change, go back to Meta's webhook configuration page and click **"Verify and save"** again — it should succeed this time.

