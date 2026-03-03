

# Fix: "Unknown Error" on Facebook Reconnection

## Problem
The error message "unknown error" is thrown from a generic catch block that swallows the real failure reason. Without console logs from the production domain, we can't tell if it's:
- A Row Level Security (RLS) policy blocking the `facebook_tokens` upsert on reconnect
- The Facebook Graph API rejecting the token
- The `saveUserSettings` sync failing and throwing
- The `ensureAuth()` function creating an anonymous user instead of using the real session

## Changes

### 1. Add granular error logging in `handleAuthCallback` (`src/lib/facebook-oauth-simple.ts`)
- Log each step (auth check, Graph API call, DB upsert, settings sync) with labeled console messages
- For the DB upsert error, stringify the full Supabase error object (code, message, details)
- Return the specific step that failed in the error message (e.g., "DB upsert failed: ..." instead of "Unknown error")
- For non-Error objects caught in the catch block, JSON.stringify them so we see the actual shape

### 2. Improve error display in `FacebookCallback.tsx`
- Show the full error message including any nested details
- Add a "Copy error" button so you can easily share the exact message
- Log the raw error object to console before formatting

### 3. Fix potential RLS issue on reconnect
- The upsert to `facebook_tokens` may fail if RLS policies don't allow UPDATE for the user's own row
- Change the upsert to explicitly specify `onConflict: 'user_id'` so Postgres knows to match on user_id
- This ensures reconnection updates the existing row instead of trying to insert a duplicate

### 4. Guard against `ensureAuth()` creating anonymous users
- In `handleAuthCallback`, check that the user from `supabase.auth.getUser()` is not anonymous before proceeding
- If the session was lost during the Facebook redirect, show a clear message: "Please log in first, then try connecting again"

## Expected Outcome
- On next reconnect attempt, the callback page will show the exact error (e.g., "RLS policy violation on facebook_tokens" or "Graph API: invalid token") instead of "unknown error"
- If the root cause is RLS, the onConflict fix will resolve it immediately
- If it's a session issue, the user will see a clear "log in first" message
