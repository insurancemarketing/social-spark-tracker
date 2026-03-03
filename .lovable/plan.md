

# Fix: Empty Pages from Facebook OAuth in Development Mode

## Root Cause

Your Facebook App is in **Development Mode**. In this mode, the `/me/accounts` Graph API endpoint only returns pages that the user **explicitly selects** during the OAuth consent dialog. Facebook shows a "What pages do you want to use?" step — if you skip it or don't check the box next to your page, the API returns `pages: []`, and no Page Access Token or Instagram Business Account can be retrieved.

The current code silently accepts empty pages and stores null tokens, making everything appear "connected" but with no usable data.

## Changes

### 1. Add permissions check after OAuth (`src/lib/facebook-oauth-simple.ts`)
- After receiving the access token, call `GET /me/permissions?access_token=...` to verify which permissions were actually granted
- Log the granted vs. declined permissions
- If `pages_show_list` was declined, return a specific error message

### 2. Handle empty pages as a user-actionable error (`src/lib/facebook-oauth-simple.ts`)
- When `pages.length === 0`, instead of silently continuing with null tokens:
  - Check granted permissions first
  - Return a clear error: **"No Facebook Pages were shared. Please reconnect and make sure to select your Facebook Page on the permissions screen."**
- This prevents storing useless empty records in `facebook_tokens`

### 3. Add `auth_type: rerequest` to OAuth URL (`src/lib/facebook-oauth-simple.ts`)
- Add `auth_type=rerequest` to the OAuth URL parameters
- This forces Facebook to re-show the permissions dialog on reconnect, letting you select your page again
- Without this, Facebook skips the consent screen if it thinks you already authorized

### 4. Show actionable guidance on callback error page (`src/pages/FacebookCallback.tsx`)
- When the error mentions "No Facebook Pages were shared", show step-by-step instructions:
  1. Click "Try Again"
  2. On the Facebook screen, look for "What Pages do you want to use?"
  3. Check the box next to your Page
  4. Click "Done" then "Continue"

## Technical Details

**File: `src/lib/facebook-oauth-simple.ts`**
- In `getFacebookAuthUrl()`: add `auth_type: 'rerequest'` to URL params
- In `handleAuthCallback()`: 
  - After Step 2, add a permissions check via `/me/permissions`
  - If `pages.length === 0`, return error instead of continuing to DB upsert
  
**File: `src/pages/FacebookCallback.tsx`**
- Add conditional UI that shows page-selection instructions when error contains "No Facebook Pages"

## Expected Outcome
- On next reconnect, Facebook will re-show the permissions screen with page selection
- If user doesn't select a page, they'll see clear instructions instead of a silent failure
- If user selects their page, tokens will be stored correctly and Facebook/Instagram data will load
