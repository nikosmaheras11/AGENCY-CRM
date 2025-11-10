import { WebClient } from '@slack/web-api'

interface SlackMessage {
  type: string
  user: string
  text: string
  ts: string
  thread_ts?: string
  files?: any[]
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)
  
  const channelId = query.channel as string
  const limit = parseInt(query.limit as string) || 50
  
  if (!channelId) {
    throw createError({
      statusCode: 400,
      message: 'Channel ID is required'
    })
  }
  
  const slackToken = config.slackBotToken || process.env.SLACK_BOT_TOKEN
  
  if (!slackToken) {
    throw createError({
      statusCode: 500,
      message: 'SLACK_BOT_TOKEN not configured'
    })
  }
  
  try {
    const client = new WebClient(slackToken)
    
    // Fetch conversation history
    const result = await client.conversations.history({
      channel: channelId,
      limit: limit
    })
    
    if (!result.ok || !result.messages) {
      throw new Error('Failed to fetch messages from Slack')
    }
    
    // Get user info for messages
    const userIds = [...new Set(result.messages.map((m: SlackMessage) => m.user).filter(Boolean))]
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
    const messages = result.messages
      .filter((m: SlackMessage) => m.type === 'message' && m.text && !m.text.includes('has joined'))
      .map((m: SlackMessage) => ({
        id: m.ts,
        user_id: m.user,
        user_name: userMap.get(m.user)?.name || 'Unknown User',
        user_avatar: userMap.get(m.user)?.avatar,
        text: m.text,
        ts: m.ts,
        thread_ts: m.thread_ts,
        attachments: m.files || [],
        timestamp: new Date(parseFloat(m.ts) * 1000).toISOString()
      }))
    
    return {
      ok: true,
      messages,
      channel: channelId
    }
  } catch (error: any) {
    console.error('Error fetching Slack messages:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to fetch messages'
    })
  }
})
