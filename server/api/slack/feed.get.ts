import { WebClient } from '@slack/web-api'

interface SlackMessage {
  type?: string
  user?: string
  text?: string
  ts: string
  thread_ts?: string
  files?: any[]
  subtype?: string
  channel_id?: string
  channel_name?: string
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)
  
  const limit = parseInt(query.limit as string) || 50
  
  const slackToken = config.slackBotToken || process.env.SLACK_BOT_TOKEN
  
  if (!slackToken) {
    throw createError({
      statusCode: 500,
      message: 'SLACK_BOT_TOKEN not configured'
    })
  }
  
  // All channel IDs
  const channels = [
    { id: 'C09HBDKSUGH', name: '#hours-creative-polymarket' },
    { id: 'C09F44R90UX', name: '#hours-performance-polymarket' },
    { id: 'C09RDUX4198', name: '#polymarket-creative-requests' },
    { id: 'C09RJ82TFPG', name: '#polymarket-ugc-hours' }
  ]
  
  try {
    const client = new WebClient(slackToken)
    
    // Fetch messages from all channels in parallel
    const channelPromises = channels.map(async channel => {
      try {
        const result = await client.conversations.history({
          channel: channel.id,
          limit: 20 // Get more from each to ensure we have enough recent ones
        })
        
        if (result.ok && result.messages) {
          return (result.messages as any[]).map((m: any) => ({
            ...m,
            channel_id: channel.id,
            channel_name: channel.name
          }))
        }
        return []
      } catch (err) {
        console.error(`Error fetching from ${channel.name}:`, err)
        return []
      }
    })
    
    const allChannelMessages = await Promise.all(channelPromises)
    const allMessages = allChannelMessages.flat()
    
    // Sort by timestamp (most recent first)
    allMessages.sort((a, b) => parseFloat(b.ts) - parseFloat(a.ts))
    
    // Take only the requested limit
    const recentMessages = allMessages.slice(0, limit)
    
    // Get unique user IDs
    const userIds = [...new Set(recentMessages.map((m: any) => m.user).filter(Boolean))]
    const userInfoPromises = userIds.map(userId => 
      client.users.info({ user: userId as string }).catch(() => null)
    )
    const userInfos = await Promise.all(userInfoPromises)
    
    // Create user map
    const userMap = new Map()
    userInfos.forEach((info: any) => {
      if (info?.ok && info.user) {
        userMap.set(info.user.id, {
          name: info.user.real_name || info.user.name,
          avatar: info.user.profile?.image_48
        })
      }
    })
    
    // Format messages
    const messages = recentMessages
      .filter((m: any) => m.type === 'message' && m.text && !m.text.includes('has joined') && !m.subtype)
      .map((m: any) => ({
        id: m.ts,
        user_id: m.user || '',
        user_name: userMap.get(m.user)?.name || 'Unknown User',
        user_avatar: userMap.get(m.user)?.avatar,
        text: m.text || '',
        ts: m.ts,
        thread_ts: m.thread_ts,
        channel_name: m.channel_name,
        channel_id: m.channel_id,
        attachments: m.files || [],
        timestamp: new Date(parseFloat(m.ts) * 1000).toISOString()
      }))
    
    return {
      ok: true,
      messages,
      total: messages.length
    }
  } catch (error: any) {
    console.error('Error fetching Slack feed:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to fetch messages'
    })
  }
})
