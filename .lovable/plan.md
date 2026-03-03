

# Plan: Remove Mock Data, Persist API Keys in Supabase, and Secure the App

## Overview

Three changes: (1) eliminate all fake/mock data so pages show real data or an empty "connect" state, (2) move API credential storage from localStorage to Supabase so keys survive logout and cache clears, and (3) lock down security so only you can access your data.

---

## 1. Remove All Mock Data

**Files to delete:**
- `src/lib/mock-data.ts` -- fake platform stats, daily data, content items
- `src/lib/dm-mock-data.ts` -- fake DM entries and stats

**Pages to update (show empty/connect state instead of fake numbers):**

- **TikTokPage.tsx** -- Currently renders entirely from mock data. Replace with a "Connect TikTok" placeholder card (no API available yet), remove all mock stats/charts.
- **FacebookPage.tsx** -- Falls back to mock data when not connected. Remove the mock fallback so it shows a "Connect in Settings" prompt instead of fake numbers.
- **ContentTracker.tsx** -- Renders `mockContent`. Change to show an empty state message ("Connect your platforms to see content here").
- **DMPipeline.tsx** -- Uses `mockDMEntries` and `mockDMStats`. Switch this page to use the Supabase-backed version (`DMPipelineWithSupabase.tsx` already exists and fetches from the database). Route `/dm-pipeline` will point to the Supabase version.

---

## 2. Persist API Keys in Supabase (Not localStorage)

**Problem:** YouTube API key, channel ID, Meta access token, Instagram account ID, and Facebook page ID are all stored in `localStorage`. They vanish when you clear cookies/cache or switch browsers.

**Solution:** Create a `user_settings` table in Supabase to store these per user.

### Database Migration

```text
Table: user_settings
- id (uuid, PK)
- user_id (uuid, FK to auth.users, unique)
- youtube_api_key (text, nullable)
- youtube_channel_id (text, nullable)
- meta_access_token (text, nullable)
- instagram_account_id (text, nullable)
- facebook_page_id (text, nullable)
- created_at / updated_at (timestamps)
```

With RLS policies so each user can only read/write their own row.

### Code Changes

- **New file: `src/lib/user-settings-service.ts`** -- Functions to load/save settings from Supabase, with an in-memory cache so we don't query on every render.
- **Update `src/lib/youtube-api.ts`** -- Replace `localStorage.getItem/setItem` with the new Supabase-backed getters.
- **Update `src/lib/meta-api.ts`** -- Same: replace localStorage helpers with Supabase-backed ones.
- **Update `src/pages/Settings.tsx`** -- Load settings from Supabase on mount, save to Supabase on "Save & Connect".
- **Update hooks** (`useYouTubeData.ts`, `useInstagramData.ts`, `useFacebookData.ts`) -- Make them async-aware of the new settings source.

---

## 3. Security Hardening

### Authentication
- **Disable sign-up on the Login page** -- Remove the "Don't have an account? Sign up" toggle so no one else can create an account. (You already have your account.)
- Alternatively, keep sign-up but add a note that it requires email verification (Supabase default).

### Row-Level Security (RLS)
- **`user_settings` table** -- RLS policy: `auth.uid() = user_id` for SELECT, INSERT, UPDATE, DELETE.
- **`dm_entries` table** (if exists) -- Verify RLS is enabled and scoped to `user_id`.
- **`facebook_tokens` table** -- Verify RLS is enabled and scoped to `user_id`.
- **`youtube_tokens` table** -- Verify RLS is enabled and scoped to `user_id`.

### Other
- The `AuthContext` already properly gates all routes behind `ProtectedRoute`, so unauthenticated users cannot access any data pages.
- The `onAuthStateChange` listener is set up correctly.

---

## Technical Summary of File Changes

| File | Action |
|------|--------|
| `src/lib/mock-data.ts` | Delete |
| `src/lib/dm-mock-data.ts` | Delete |
| `src/pages/TikTokPage.tsx` | Replace mock data with empty "coming soon" card |
| `src/pages/FacebookPage.tsx` | Remove mock fallback, show connect prompt |
| `src/pages/ContentTracker.tsx` | Show empty state when no platforms connected |
| `src/pages/DMPipeline.tsx` | Replace with Supabase-backed version |
| `src/App.tsx` | Point `/dm-pipeline` to Supabase version |
| `supabase/migrations/` | New migration: create `user_settings` table with RLS |
| `src/lib/user-settings-service.ts` | New: CRUD for user settings in Supabase |
| `src/lib/youtube-api.ts` | Replace localStorage with Supabase settings |
| `src/lib/meta-api.ts` | Replace localStorage with Supabase settings |
| `src/pages/Settings.tsx` | Load/save from Supabase instead of localStorage |
| `src/hooks/useYouTubeData.ts` | Adapt to async settings |
| `src/hooks/useFacebookData.ts` | Adapt to async settings |
| `src/hooks/useInstagramData.ts` | Adapt to async settings |
| `src/pages/Login.tsx` | Remove sign-up option |

