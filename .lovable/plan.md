

# Fix 4 Build Errors

All four are simple TypeScript type fixes — no new features, no new files.

## Fixes

### 1. `src/pages/InstagramPage.tsx` (line 41)
`connected` resolves to `string | true` instead of `boolean`. Fix: wrap in `!!` to coerce to boolean.

**Before:** `setIsConnected(connected)`
**After:** `setIsConnected(!!connected)`

### 2. `src/components/dm/AutomatedDMsList.tsx` — stats type mismatch
The `getDMStats()` error path on line 128 returns `{ total, new, responded, archived }` (missing `instagram` and `facebook`), but the component expects all 6 fields. Fix: add `instagram: 0, facebook: 0` to the error return on line 128 of `automated-dms-service.ts`.

**Before:** `return { total: 0, new: 0, responded: 0, archived: 0 }`
**After:** `return { total: 0, new: 0, responded: 0, archived: 0, instagram: 0, facebook: 0 }`

### 3. `supabase/functions/facebook-oauth/index.ts` (line 171)
`error` is typed as `unknown`. Fix: cast it.

**Before:** `error.message`
**After:** `(error as Error).message`

### 4. `supabase/functions/youtube-oauth/index.ts` (line 174)
Same issue.

**Before:** `error.message`
**After:** `(error as Error).message`

## Summary
Four one-line fixes across four files. No new features or dependencies. Build should be clean after these.
