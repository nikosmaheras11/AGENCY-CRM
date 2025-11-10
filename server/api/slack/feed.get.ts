import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)
  
  const limit = parseInt(query.limit as string) || 50
  const channel = query.channel as string | undefined
  
  // Get Supabase credentials
  const supabaseUrl = config.public.supabaseUrl || process.env.SUPABASE_URL
  const supabaseKey = config.public.supabaseAnonKey || process.env.SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    throw createError({
      statusCode: 500,
      message: 'Supabase credentials not configured'
    })
  }
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Build query
    let supabaseQuery = supabase
      .from('slack_messages')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit)
    
    // Filter by channel if specified
    if (channel) {
      supabaseQuery = supabaseQuery.eq('channel_name', channel)
    }
    
    const { data, error } = await supabaseQuery
    
    if (error) {
      throw error
    }
    
    // Format messages for frontend (match existing format)
    const messages = (data || []).map((m: any) => ({
      id: m.id,
      user_id: m.user_id,
      user_name: m.user_name,
      user_avatar: undefined, // We don't store avatars in DB currently
      text: m.text,
      ts: m.id, // Use ID as timestamp (it's the Slack timestamp)
      thread_ts: m.thread_ts,
      channel_name: m.channel_name,
      channel_id: m.channel_id,
      attachments: [],
      timestamp: m.timestamp,
      permalink: m.permalink,
      reactions: m.reactions || []
    }))
    
    return {
      ok: true,
      messages,
      total: messages.length
    }
  } catch (error: any) {
    console.error('Error fetching Slack feed from Supabase:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to fetch messages'
    })
  }
})
