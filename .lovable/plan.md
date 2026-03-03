

# Fix: Facebook OAuth "Invalid Scopes" Error

## The Problem

Facebook is rejecting the OAuth request because **the permissions haven't been added to your Facebook App** in the developer dashboard. The error "Invalid Scopes" means the app doesn't recognize those scopes -- they need to be configured in the app settings first. Additionally, the code uses Graph API **v18.0** which is deprecated.

## What Needs to Happen

### Step 1: You configure permissions in Facebook Developer Dashboard (manual)

Go to [developers.facebook.com](https://developers.facebook.com), open your app (ID: `1474987804044568`), then:

1. Go to **App Dashboard > Use Cases** (or **Add Product > Facebook Login**)
2. Under your Facebook Login use case, click **Customize** then **Permissions**
3. Add these permissions:
   - `pages_show_list`
   - `pages_read_engagement`  
   - `instagram_basic`
   - `instagram_manage_insights`
   - `business_management`
4. Remove `pages_read_user_content` (deprecated -- we'll use `pages_read_engagement` instead which covers post data)
5. Make sure **Facebook Login** is added as a product and your redirect URI (`https://social.masonvanmeter.com/facebook/callback`) is listed under **Valid OAuth Redirect URIs**

Since the app is in **Development Mode**, only users with a role on the app (admin/developer/tester) can log in -- which is fine for your use.

### Step 2: Code changes (I will do this)

**File: `src/lib/facebook-oauth-simple.ts`**
- Update Graph API version from `v18.0` to `v22.0`
- Remove deprecated scope `pages_read_user_content`
- Keep the remaining 5 valid scopes

**File: `src/lib/instagram-api-service.ts`**
- Update Graph API endpoint URLs from `v18.0` to `v22.0`

**File: `src/pages/FacebookCallback.tsx`**  
- No changes needed (already correct)

## Summary

| Action | Who |
|--------|-----|
| Add permissions in Facebook App Dashboard | You (manual) |
| Update API version to v22.0 | Code change |
| Remove deprecated `pages_read_user_content` scope | Code change |
| Update all Graph API URLs to v22.0 | Code change |

After both steps, the OAuth flow should work when you click "Connect Facebook and Instagram."

