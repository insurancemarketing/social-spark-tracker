
Root cause from your screenshots is now clear and it’s a two-part failure:

1) Facebook is still receiving a request that includes `pages_read_user_content` (deprecated), which causes the “Invalid Scopes” dialog.  
2) After you click OK, the app callback currently expects only `access_token`, so it falls through to “No access token received from Facebook” instead of showing the real OAuth error details.

I inspected your code and found a mismatch: there are two Facebook OAuth implementations in the repo, and one of them (`facebook-oauth-supabase.ts`) still includes `pages_read_user_content`. The callback page also only handles implicit-token responses.

## Implementation plan

### 1) Normalize OAuth scope + API version everywhere
- Update `src/lib/facebook-oauth-supabase.ts`:
  - Remove `pages_read_user_content` from `FACEBOOK_SCOPES`.
  - Keep only:
    - `pages_show_list`
    - `pages_read_engagement`
    - `instagram_basic`
    - `instagram_manage_insights`
    - `business_management`
- Keep API version consistently at `v22.0` across all Facebook/Instagram files.

### 2) Make callback robust to real Facebook responses
- Update `src/pages/FacebookCallback.tsx` to support all callback shapes:
  - `#access_token=...` (implicit flow)
  - `?code=...` (authorization code flow)
  - `error`, `error_reason`, `error_description` (both in query and hash)
- If Facebook returns an OAuth error, surface the exact decoded message in UI instead of generic “No access token received”.

### 3) Support both flows safely (prevents this from recurring)
- In `FacebookCallback.tsx`:
  - If `access_token` exists → call existing `handleAuthCallback`.
  - If `code` exists → call `exchangeCodeForToken` from `facebook-oauth-supabase.ts`.
- This prevents breakage if any environment still initiates code flow.

### 4) Fix token data consistency for downstream UI
- Update `supabase/functions/facebook-oauth/index.ts`:
  - Use `v22.0`.
  - Store `pages` as JSON (not `JSON.stringify`) to match table type and frontend expectations.
- Ensure connected page info remains readable in Settings/Instagram UI after code-flow exchange.

### 5) Add clearer diagnostics for this exact failure mode
- In callback UI, show actionable error text for:
  - Invalid scopes
  - Missing permissions
  - User-cancelled auth
- This removes “mystery failure” loops and makes future debugging much faster.

## Manual checks required (Facebook dashboard)
For app `2064832031041409`, verify:
- Facebook Login product is added.
- Valid OAuth Redirect URI includes:
  - `https://social.masonvanmeter.com/facebook/callback`
- Required permissions are enabled for the app/use case:
  - `pages_show_list`
  - `pages_read_engagement`
  - `instagram_basic`
  - `instagram_manage_insights`
  - `business_management`
- Your testing account is added as app Admin/Developer/Tester (if app in development mode).

## Expected outcome after these changes
- No more `pages_read_user_content` in OAuth requests.
- If Facebook rejects anything, you’ll see the exact reason on callback page.
- If the response is `code` instead of `access_token`, callback still completes correctly.
- OAuth connection status should become stable across Settings and Instagram pages.
