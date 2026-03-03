

# How to Set Up the Instagram DM Webhook

This is a manual setup in your Meta App Dashboard — no code changes needed. Here's the step-by-step:

## Your Webhook URL

Your edge function URL is:

```text
https://tkavzevkgavcxsvtizlu.supabase.co/functions/v1/dm-webhook
```

Your verify token (hardcoded in the edge function) is:

```text
social_spark_tracker_2024
```

## Steps in Meta App Dashboard

1. Go to [developers.facebook.com](https://developers.facebook.com) and open your app (App ID: `2064832041041409`)
2. In the left sidebar, click **Webhooks** (or find it under **Add Product** if not yet added)
3. Select **Instagram** from the dropdown at the top
4. Click **Subscribe to this object**
5. Fill in:
   - **Callback URL**: `https://tkavzevkgavcxsvtizlu.supabase.co/functions/v1/dm-webhook`
   - **Verify Token**: `social_spark_tracker_2024`
6. Click **Verify and Save** — Meta will send a GET request to your edge function, which will respond with the challenge token
7. After verification succeeds, find the **messages** field in the list and toggle the **Subscribe** checkbox next to it

## Important Notes

- Your app is in **Development Mode**, so webhooks will only fire for messages from users who are added as testers/admins in your Meta app
- To receive DMs from all users, your app needs to go through **Meta App Review** for the `instagram_manage_messages` permission
- You also need to **reconnect your Facebook account** in your app's Settings page to grant the new `instagram_manage_messages` permission we just added to the OAuth flow
- Once the webhook is verified, **inbound** DMs will automatically appear in your DM Pipeline. For **outbound** DMs (messages you send), use the "Sync DMs Now" button on the DM Pipeline page

