import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, code, refreshToken } = await req.json()

    // Exchange authorization code for tokens
    if (action === 'exchange') {
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: Deno.env.get('YOUTUBE_CLIENT_ID') || '',
          client_secret: Deno.env.get('YOUTUBE_CLIENT_SECRET') || '',
          redirect_uri: Deno.env.get('YOUTUBE_REDIRECT_URI') || '',
          grant_type: 'authorization_code',
        }),
      })

      const tokens = await tokenResponse.json()

      if (!tokens.access_token) {
        throw new Error('Failed to obtain access token')
      }

      // Get channel info
      const channelResponse = await fetch(
        'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true',
        {
          headers: {
            'Authorization': `Bearer ${tokens.access_token}`,
          },
        }
      )

      const channelData = await channelResponse.json()
      const channel = channelData.items?.[0]

      // Calculate token expiration
      const expiresAt = new Date(Date.now() + (tokens.expires_in * 1000)).toISOString()

      // Get user from authorization header
      const authHeader = req.headers.get('Authorization')
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        {
          global: {
            headers: { Authorization: authHeader! },
          },
        }
      )

      const { data: { user } } = await supabaseClient.auth.getUser()

      if (!user) {
        throw new Error('User not authenticated')
      }

      // Store tokens in database
      const { error: dbError } = await supabaseClient
        .from('youtube_tokens')
        .upsert({
          user_id: user.id,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: expiresAt,
          channel_id: channel?.id,
          channel_title: channel?.snippet?.title,
          updated_at: new Date().toISOString(),
        })

      if (dbError) {
        console.error('Database error:', dbError)
        throw dbError
      }

      return new Response(
        JSON.stringify({
          success: true,
          channelTitle: channel?.snippet?.title,
          channelId: channel?.id,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Refresh access token
    if (action === 'refresh') {
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          refresh_token: refreshToken,
          client_id: Deno.env.get('YOUTUBE_CLIENT_ID') || '',
          client_secret: Deno.env.get('YOUTUBE_CLIENT_SECRET') || '',
          grant_type: 'refresh_token',
        }),
      })

      const tokens = await tokenResponse.json()

      if (!tokens.access_token) {
        throw new Error('Failed to refresh token')
      }

      const expiresAt = new Date(Date.now() + (tokens.expires_in * 1000)).toISOString()

      // Get user and update tokens
      const authHeader = req.headers.get('Authorization')
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        {
          global: {
            headers: { Authorization: authHeader! },
          },
        }
      )

      const { data: { user } } = await supabaseClient.auth.getUser()

      if (!user) {
        throw new Error('User not authenticated')
      }

      const { error: dbError } = await supabaseClient
        .from('youtube_tokens')
        .update({
          access_token: tokens.access_token,
          expires_at: expiresAt,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)

      if (dbError) {
        throw dbError
      }

      return new Response(
        JSON.stringify({
          success: true,
          access_token: tokens.access_token,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
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
