import crypto from 'crypto'
import { createDirectus, rest, createItem, staticToken } from '@directus/sdk'

interface SlackEvent {
  type: string
  user?: string
  text?: string
  ts: string
  channel: string
  thread_ts?: string
  subtype?: string
  files?: Array<{
    id: string
    name: string
    mimetype: string
    url_private: string
    permalink: string
  }>
}

interface SlackPayload {
  token: string
  team_id: string
  event: SlackEvent
  type: string
  challenge?: string
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  // Get Slack signing secret from environment
  const slackSigningSecret = config.slackSigningSecret || process.env.SLACK_SIGNING_SECRET
  
  if (!slackSigningSecret) {
    throw createError({
      statusCode: 500,
      message: 'SLACK_SIGNING_SECRET not configured'
    })
  }

  // Verify Slack signature
  const signature = getHeader(event, 'x-slack-signature')
  const timestamp = getHeader(event, 'x-slack-request-timestamp')
  const rawBody = await readRawBody(event)
  
  if (!signature || !timestamp || !rawBody) {
    throw createError({
      statusCode: 401,
      message: 'Invalid Slack request'
    })
  }

  // Check timestamp is within 5 minutes
  const currentTime = Math.floor(Date.now() / 1000)
  if (Math.abs(currentTime - parseInt(timestamp)) > 300) {
    throw createError({
      statusCode: 401,
      message: 'Request timestamp too old'
    })
  }

  // Verify signature
  const sigBasestring = `v0:${timestamp}:${rawBody}`
  const mySignature = 'v0=' + crypto
    .createHmac('sha256', slackSigningSecret)
    .update(sigBasestring)
    .digest('hex')

  if (!crypto.timingSafeEqual(Buffer.from(mySignature), Buffer.from(signature))) {
    throw createError({
      statusCode: 401,
      message: 'Invalid signature'
    })
  }

  const body: SlackPayload = await readBody(event)

  // Handle Slack URL verification challenge
  if (body.type === 'url_verification') {
    return { challenge: body.challenge }
  }

  // Handle message events
  if (body.type === 'event_callback' && body.event.type === 'message') {
    const slackEvent = body.event
    
    // Ignore bot messages, message edits, and join messages
    if (slackEvent.user === 'USLACKBOT' || 
        slackEvent.text?.includes('has joined') ||
        slackEvent.subtype === 'message_changed') {
      return { ok: true }
    }

    // Store message in Directus
    try {
      await storeSlackMessageInDirectus(slackEvent)
      
      return { 
        ok: true, 
        message: 'Message stored successfully'
      }
    } catch (error) {
      console.error('Error storing Slack message:', error)
      return { 
        ok: true, // Still return ok to Slack to avoid retries
        error: 'Failed to store message' 
      }
    }
  }

  return { ok: true }
})

// Channel name to sector mapping
const CHANNEL_MAPPING: Record<string, string> = {
  'hours-creative-polymarket': 'creative',
  'hours-performance-polymarket': 'performance',
  'polymarket-creative-requests': 'creative-requests',
  'polymarket-ugc-hours': 'ugc'
}

async function storeSlackMessageInDirectus(event: SlackEvent): Promise<void> {
  const config = useRuntimeConfig()
  const directusUrl = config.directusUrl || process.env.DIRECTUS_URL || 'http://localhost:8055'
  const directusToken = config.directusServerToken || process.env.DIRECTUS_SERVER_TOKEN
  
  if (!directusToken) {
    throw new Error('DIRECTUS_SERVER_TOKEN not configured')
  }
  
  // Initialize Directus client with authentication
  const client = createDirectus(directusUrl).with(rest()).with(staticToken(directusToken))
  
  // Get channel name from environment or mapping
  const channelId = event.channel
  const channelName = getChannelName(channelId)
  const sector = CHANNEL_MAPPING[channelName] || 'unknown'
  
  // Prepare attachments data
  const attachments = event.files ? event.files.map(file => ({
    id: file.id,
    name: file.name,
    mimetype: file.mimetype,
    url: file.url_private,
    permalink: file.permalink
  })) : null
  
  // Create message record in Directus
  await client.request(
    createItem('slack_messages', {
      channel_id: channelId,
      channel_name: channelName,
      user_id: event.user,
      user_name: 'User', // We'll fetch this from Slack API later
      text: event.text,
      thread_ts: event.thread_ts || null,
      ts: event.ts,
      attachments: attachments,
      sector: sector
    })
  )
  
  console.log(`✅ Stored Slack message ${event.ts} from ${channelName}`)
}

function getChannelName(channelId: string): string {
  const config = useRuntimeConfig()
  
  // Map channel IDs to names based on environment variables
  const channelMapping: Record<string, string> = {
    [config.slackChannelCreative || process.env.SLACK_CHANNEL_CREATIVE || '']: 'hours-creative-polymarket',
    [config.slackChannelPerformance || process.env.SLACK_CHANNEL_PERFORMANCE || '']: 'hours-performance-polymarket',
    [config.slackChannelRequests || process.env.SLACK_CHANNEL_REQUESTS || '']: 'polymarket-creative-requests',
    [config.slackChannelUgc || process.env.SLACK_CHANNEL_UGC || '']: 'polymarket-ugc-hours'
  }
  
  return channelMapping[channelId] || channelId
}
