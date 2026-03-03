

# Deploy dm-webhook Edge Function

## Problem
The `dm-webhook` edge function exists in the codebase but was never deployed. Connecting Supabase to Lovable enables future auto-deploys, but existing functions need a code change to trigger their first deployment.

## Solution
Make a minor update to the edge function to trigger Lovable's auto-deploy. I will also update the CORS headers to match the recommended pattern.

## File Changes

| File | Change |
|------|--------|
| `supabase/functions/dm-webhook/index.ts` | Update CORS `Access-Control-Allow-Headers` to include Supabase client headers (triggers deploy) |

The only change is updating line 6 from:
```
'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret, x-hub-signature',
```
to:
```
'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret, x-hub-signature, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
```

## After Deployment

Once deployed, I will verify the endpoint is live by hitting the verification URL. Then you can go to the **Meta App Dashboard** and complete the webhook setup:

1. Go to **Webhooks** product in your Meta App
2. Set **Callback URL** to: `https://tkavzevkgavcxsvtizlu.supabase.co/functions/v1/dm-webhook`
3. Set **Verify Token** to: `social_spark_tracker_2024`
4. Click **Verify and Save**
5. Subscribe to the `messages` field under `instagram` or `page`

