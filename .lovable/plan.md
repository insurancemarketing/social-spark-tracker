

# Fix: Clean Up Stale OAuth State and Improve Settings UI

## Problem
The `facebook_tokens` table has a stale record with `pages: []` from a previous connection before our validation fix. The Settings page doesn't handle this "connected but broken" state well — it shows the Connect button instead of showing the user they need to disconnect and reconnect.

## Changes

### 1. Fix Settings page to handle stale OAuth state (`src/pages/Settings.tsx`)
- When `isFbConnected` is true but `fbPageInfo` is null, show a warning state:
  - "Connected but no Facebook Page was shared. Please disconnect and reconnect, making sure to select your Page."
  - Show both Disconnect and Reconnect buttons
- This replaces the current behavior where it silently falls through to the Connect button

### 2. Add auto-cleanup for stale tokens (`src/lib/facebook-oauth-simple.ts`)
- In `isAuthenticated()`, also check that the token has non-empty `pages` array
- If pages is empty, return `false` — the connection is effectively broken
- This prevents the Instagram page from thinking it's connected when it has no usable credentials

### 3. Update `getFacebookTokens()` to validate completeness
- After fetching the token, check if `page_access_token` is null or `pages` is empty
- If so, log a warning and return null — forcing the user to reconnect
- This makes all downstream consumers (Instagram page, Facebook page) correctly show "not connected"

## Technical Details

**`src/lib/facebook-oauth-simple.ts`** changes:
- `isAuthenticated()`: check `tokens.pages?.length > 0` in addition to token existence
- `getFacebookTokens()`: return null if `page_access_token` is null (stale record)

**`src/pages/Settings.tsx`** changes:
- Add a third state: `isFbConnected && !fbPageInfo` showing a warning card with Disconnect + Reconnect buttons

## Expected Outcome
- Settings page clearly shows "broken connection" state with instructions
- Instagram and Facebook pages correctly show "not connected" instead of loading errors
- After user disconnects and reconnects (selecting their page), everything works
