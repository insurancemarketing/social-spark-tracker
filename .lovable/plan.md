

# Plan: Create `user_settings` Table on Your Existing Supabase

Since your Supabase project is already connected (credentials hardcoded in `src/lib/supabase.ts`), we just need to create the `user_settings` table directly there. No Lovable Cloud needed -- everything stays free on your Supabase plan.

## What needs to happen

### 1. Create the `user_settings` table via SQL migration

Add a new migration file that creates the table with Row-Level Security so only you can access your own data:

```text
Table: user_settings
- id (uuid, PK)
- user_id (uuid, FK to auth.users, unique, not null)
- youtube_api_key (text, nullable)
- youtube_channel_id (text, nullable)
- meta_access_token (text, nullable)
- instagram_account_id (text, nullable)
- facebook_page_id (text, nullable)
- created_at / updated_at (timestamps)

RLS policies: SELECT, INSERT, UPDATE, DELETE all scoped to auth.uid() = user_id
```

This follows the exact same pattern as your existing `facebook_tokens` table.

### 2. Run the migration on your Supabase project

Since you're using an external Supabase project, you'll need to run this SQL in your Supabase dashboard (SQL Editor). I'll provide the exact SQL to copy-paste.

### 3. No code changes needed

The `user-settings-service.ts` file already exists and references this table. Once the table is created, the Settings page and all API hooks will work automatically.

## Summary

| Step | What |
|------|------|
| New migration file | `supabase/migrations/create_user_settings_table.sql` |
| Manual step | Run the SQL in your Supabase SQL Editor |
| Code changes | None -- service layer already written |

