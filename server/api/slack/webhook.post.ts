import crypto from 'crypto'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'

interface SlackEvent {
  type: string
  channel: string
  user: string
  text: string
  ts: string
  thread_ts?: string
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

interface Request {
  id: string
  projectType: 'creative' | 'performance' | 'design' | 'ugc'
  status: 'new-request' | 'in-progress' | 'needs-review' | 'needs-edit' | 'done'
  title: string
  format: string
  size: string
  dimensions: string
  duration?: string
  thumbnail: string
  assignee: string | null
  dueDate: string | null
  tags: string[]
  priority: 'high' | 'medium' | 'low' | null
  client: string
  campaign: string
  comments: Array<{
    id: string
    author: string
    text: string
    timestamp: string
  }>
  createdAt: string
  updatedAt: string
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
    
    // Ignore bot messages and message edits
    if (slackEvent.user === 'USLACKBOT' || slackEvent.text?.includes('has joined')) {
      return { ok: true }
    }

    // Parse the message to extract request details
    const request = await parseSlackMessageToRequest(slackEvent)
    
    if (request) {
      // Add to requests.json
      await addRequestToDatabase(request)
      
      return { 
        ok: true, 
        message: 'Request created successfully',
        requestId: request.id 
      }
    }
  }

  return { ok: true }
})

async function parseSlackMessageToRequest(event: SlackEvent): Promise<Request | null> {
  const text = event.text || ''
  
  // Simple parser - you can enhance this based on your needs
  // Example message format: "Creative request: Video ad for Polymarket\nType: creative\nDue: 2024-01-15"
  
  const lines = text.split('\n')
  let title = lines[0].replace(/^(creative|performance|design|ugc)\s+request:\s*/i, '').trim()
  let projectType: 'creative' | 'performance' | 'design' | 'ugc' = 'creative'
  let dueDate: string | null = null
  let priority: 'high' | 'medium' | 'low' | null = null
  let tags: string[] = []

  // Parse message content
  for (const line of lines) {
    const lower = line.toLowerCase()
    
    if (lower.includes('type:')) {
      const typeMatch = line.match(/type:\s*(creative|performance|design|ugc)/i)
      if (typeMatch) projectType = typeMatch[1].toLowerCase() as any
    }
    
    if (lower.includes('due:')) {
      const dateMatch = line.match(/due:\s*(\d{4}-\d{2}-\d{2})/)
      if (dateMatch) dueDate = dateMatch[1]
    }
    
    if (lower.includes('priority:')) {
      const priorityMatch = line.match(/priority:\s*(high|medium|low)/i)
      if (priorityMatch) priority = priorityMatch[1].toLowerCase() as any
    }
    
    if (lower.includes('tags:')) {
      const tagsMatch = line.match(/tags:\s*(.+)/)
      if (tagsMatch) tags = tagsMatch[1].split(',').map(t => t.trim())
    }
  }

  // If no title found, use first line
  if (!title) {
    title = lines[0] || 'New Request from Slack'
  }

  // Handle attachments/files
  let thumbnail = ''
  let format = 'N/A'
  let size = 'N/A'
  let dimensions = 'N/A'
  
  if (event.files && event.files.length > 0) {
    const file = event.files[0]
    thumbnail = file.url_private
    format = file.mimetype.split('/')[1]?.toUpperCase() || 'N/A'
    // Size would need to be fetched from Slack API
  }

  const now = new Date().toISOString()
  const requestId = `slack-${event.ts.replace('.', '-')}`

  return {
    id: requestId,
    projectType,
    status: 'new-request',
    title,
    format,
    size,
    dimensions,
    thumbnail,
    assignee: null,
    dueDate,
    tags,
    priority,
    client: 'Polymarket',
    campaign: 'Slack Import',
    comments: [],
    createdAt: now,
    updatedAt: now
  }
}

async function addRequestToDatabase(request: Request): Promise<void> {
  const dataPath = join(process.cwd(), 'data', 'requests', 'requests.json')
  
  try {
    // Read existing requests
    const fileContent = await readFile(dataPath, 'utf-8')
    const requests: Request[] = JSON.parse(fileContent)
    
    // Add new request at the beginning
    requests.unshift(request)
    
    // Write back to file
    await writeFile(dataPath, JSON.stringify(requests, null, 2), 'utf-8')
    
    console.log(`✅ Added request ${request.id} to database`)
  } catch (error) {
    console.error('Error adding request to database:', error)
    throw error
  }
}
