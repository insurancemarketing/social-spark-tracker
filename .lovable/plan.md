

# Update Facebook App ID

The Facebook App ID needs to be updated from `1474987804044568` to `2064832031041409` in the codebase.

## Changes

| File | Change |
|------|--------|
| `src/lib/facebook-oauth-simple.ts` | Update `FACEBOOK_APP_ID` to `2064832031041409` |
| `src/lib/facebook-oauth-supabase.ts` | Update fallback `FACEBOOK_APP_ID` to `2064832031041409` |

Both files hardcode the old app ID. After this change, the OAuth flow will use your new Facebook app. Make sure the new app also has the required permissions configured and `https://social.masonvanmeter.com/facebook/callback` added as a valid OAuth redirect URI.

