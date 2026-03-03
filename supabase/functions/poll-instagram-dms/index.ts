import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get the calling user from the JWT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get the user's facebook_tokens
    const { data: fbTokens, error: tokenError } = await supabase
      .from('facebook_tokens')
      .select('page_access_token, instagram_business_account_id')
      .eq('user_id', user.id)
      .single()

    if (tokenError || !fbTokens?.page_access_token || !fbTokens?.instagram_business_account_id) {
      return new Response(JSON.stringify({ error: 'No Facebook/Instagram connection found. Please connect your account first.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { page_access_token: accessToken, instagram_business_account_id: igAccountId } = fbTokens

    // Fetch conversations from Instagram Conversations API
    const convoRes = await fetch(
      `https://graph.facebook.com/v22.0/${igAccountId}/conversations?fields=id,participants,updated_time&limit=20&access_token=${accessToken}`
    )
    const convoData = await convoRes.json()

    if (convoData.error) {
      console.error('[poll-instagram-dms] Conversations API error:', convoData.error)
      return new Response(JSON.stringify({ error: convoData.error.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const conversations = convoData.data || []
    let totalInserted = 0

    for (const convo of conversations) {
      // Fetch messages in each conversation
      const msgRes = await fetch(
        `https://graph.facebook.com/v22.0/${convo.id}/messages?fields=id,message,from,to,created_time&limit=25&access_token=${accessToken}`
      )
      const msgData = await msgRes.json()

      if (msgData.error) {
        console.error(`[poll-instagram-dms] Messages error for convo ${convo.id}:`, msgData.error)
        continue
      }

      const messages = msgData.data || []

      for (const msg of messages) {
        if (!msg.message) continue // skip empty messages

        const isFromMe = msg.from?.id === igAccountId
        const senderUsername = msg.from?.username || msg.from?.name || msg.from?.id || 'unknown'
        const direction = isFromMe ? 'outbound' : 'inbound'

        // Upsert by message_id to deduplicate
        const { error: insertError } = await supabase
          .from('automated_dms')
          .upsert({
            user_id: user.id,
            platform: 'instagram',
            sender_username: senderUsername,
            sender_name: msg.from?.name || senderUsername,
            message_text: msg.message,
            message_id: msg.id,
            conversation_id: convo.id,
            timestamp: msg.created_time,
            status: 'new',
            notes: direction,
          }, { onConflict: 'message_id' })

        if (insertError) {
          // If conflict on message_id, it's a duplicate — skip silently
          if (insertError.code !== '23505') {
            console.error('[poll-instagram-dms] Insert error:', insertError)
          }
        } else {
          totalInserted++
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        conversations_checked: conversations.length,
        messages_synced: totalInserted,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('[poll-instagram-dms] Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
