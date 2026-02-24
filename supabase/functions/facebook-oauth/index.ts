// Supabase Edge Function for Facebook OAuth
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const FACEBOOK_APP_ID = Deno.env.get('FACEBOOK_APP_ID')!
const FACEBOOK_APP_SECRET = Deno.env.get('FACEBOOK_APP_SECRET')!
const FACEBOOK_REDIRECT_URI = Deno.env.get('FACEBOOK_REDIRECT_URI')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      throw new Error('Not authenticated')
    }

    const { action, code } = await req.json()

    if (action === 'exchange') {
      // Exchange authorization code for access token
      const tokenResponse = await fetch(
        `https://graph.facebook.com/v18.0/oauth/access_token?` +
          `client_id=${FACEBOOK_APP_ID}&` +
          `redirect_uri=${FACEBOOK_REDIRECT_URI}&` +
          `client_secret=${FACEBOOK_APP_SECRET}&` +
          `code=${code}`
      )

      const tokenData = await tokenResponse.json()

      if (tokenData.error) {
        throw new Error(tokenData.error.message)
      }

      // Exchange short-lived token for long-lived token
      const longLivedResponse = await fetch(
        `https://graph.facebook.com/v18.0/oauth/access_token?` +
          `grant_type=fb_exchange_token&` +
          `client_id=${FACEBOOK_APP_ID}&` +
          `client_secret=${FACEBOOK_APP_SECRET}&` +
          `fb_exchange_token=${tokenData.access_token}`
      )

      const longLivedData = await longLivedResponse.json()

      if (longLivedData.error) {
        throw new Error(longLivedData.error.message)
      }

      // Get user's Facebook pages
      const pagesResponse = await fetch(
        `https://graph.facebook.com/v18.0/me/accounts?access_token=${longLivedData.access_token}`
      )

      const pagesData = await pagesResponse.json()
      const pages = pagesData.data || []

      // Get Instagram Business Account ID from the first page
      let instagramBusinessAccountId = null
      let pageAccessToken = null

      if (pages.length > 0) {
        pageAccessToken = pages[0].access_token
        const page = pages[0]

        const igResponse = await fetch(
          `https://graph.facebook.com/v18.0/${page.id}?fields=instagram_business_account&access_token=${pageAccessToken}`
        )

        const igData = await igResponse.json()
        instagramBusinessAccountId = igData.instagram_business_account?.id || null
      }

      // Calculate expiration (long-lived tokens last 60 days)
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 60)

      // Store in database
      const { error: dbError } = await supabaseClient
        .from('facebook_tokens')
        .upsert({
          user_id: user.id,
          access_token: longLivedData.access_token,
          expires_at: expiresAt.toISOString(),
          page_access_token: pageAccessToken,
          instagram_business_account_id: instagramBusinessAccountId,
          pages: JSON.stringify(pages),
        })

      if (dbError) {
        throw dbError
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else if (action === 'refresh') {
      // Refresh existing token
      const { data: tokenData, error: fetchError } = await supabaseClient
        .from('facebook_tokens')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (fetchError || !tokenData) {
        throw new Error('No token found')
      }

      // Exchange for new long-lived token
      const refreshResponse = await fetch(
        `https://graph.facebook.com/v18.0/oauth/access_token?` +
          `grant_type=fb_exchange_token&` +
          `client_id=${FACEBOOK_APP_ID}&` +
          `client_secret=${FACEBOOK_APP_SECRET}&` +
          `fb_exchange_token=${tokenData.access_token}`
      )

      const refreshData = await refreshResponse.json()

      if (refreshData.error) {
        throw new Error(refreshData.error.message)
      }

      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 60)

      const { error: updateError } = await supabaseClient
        .from('facebook_tokens')
        .update({
          access_token: refreshData.access_token,
          expires_at: expiresAt.toISOString(),
        })
        .eq('user_id', user.id)

      if (updateError) {
        throw updateError
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    throw new Error('Invalid action')
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
