# Slack App Setup Guide

This guide will help you configure a Slack app to automatically create requests in the Agency Dashboard from Slack messages.

## Prerequisites

- Admin access to your Slack workspace
- Your dashboard deployed (locally or on Vercel)

## Step 1: Create Slack App

1. Go to [https://api.slack.com/apps](https://api.slack.com/apps)
2. Click **"Create New App"**
3. Choose **"From scratch"**
4. Name: `Polymarket Requests Bot`
5. Select your workspace
6. Click **"Create App"**

## Step 2: Configure Event Subscriptions

1. In your app settings, go to **"Event Subscriptions"**
2. Enable Events: **ON**
3. Set Request URL:
   - **Local dev**: `https://your-ngrok-url.ngrok.io/api/slack/webhook`
   - **Production**: `https://your-vercel-domain.vercel.app/api/slack/webhook`

4. Under **"Subscribe to bot events"**, add:
   - `message.channels` - Listen to messages in public channels
   - `file_shared` - Detect when files are uploaded

5. Click **"Save Changes"**

## Step 3: Add Bot Scopes

1. Go to **"OAuth & Permissions"**
2. Under **"Scopes" → "Bot Token Scopes"**, add:
   - `channels:history` - View messages in public channels
   - `channels:read` - View basic channel info
   - `files:read` - View files shared in channels
   - `chat:write` - Send messages as the bot (optional, for confirmations)

## Step 4: Install App to Workspace

1. Go to **"Install App"**
2. Click **"Install to Workspace"**
3. Review permissions and click **"Allow"**
4. Copy the **Bot User OAuth Token** (starts with `xoxb-`)
5. Go to **"Basic Information"** and copy the **Signing Secret**

## Step 5: Configure Environment Variables

Add these to your `.env` file:

```bash
SLACK_BOT_TOKEN=xoxb-your-bot-token-here
SLACK_SIGNING_SECRET=your-signing-secret-here
SLACK_CHANNEL_CREATIVE=C0123456789  # Your creative requests channel ID
```

For Vercel deployment, add these in your project settings:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each variable

## Step 6: Invite Bot to Channel

1. Open the Slack channel where you want to receive requests
2. Type: `/invite @Polymarket Requests Bot`
3. The bot will join the channel

## Step 7: Get Channel ID

To find your channel ID:
1. Open Slack in browser
2. Click on the channel name
3. Copy the ID from the URL: `slack.com/archives/C0123456789`
4. Add it to your `.env` as `SLACK_CHANNEL_CREATIVE`

## Message Format

The bot parses messages in this format:

```
Creative request: Video ad for Polymarket campaign
Type: creative
Due: 2024-01-15
Priority: high
Tags: video, marketing, social
```

**Fields:**
- **First line**: Request title
- `Type:` - `creative`, `performance`, `design`, or `ugc`
- `Due:` - Date in YYYY-MM-DD format
- `Priority:` - `high`, `medium`, or `low`
- `Tags:` - Comma-separated tags

**Simple format also works:**
```
New video needed for Polymarket Instagram campaign
```
(Defaults to creative type, new-request status)

## Testing Locally with ngrok

To test locally before deploying:

1. Install ngrok: `brew install ngrok`
2. Start your dev server: `pnpm dev`
3. In another terminal: `ngrok http 3000`
4. Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)
5. Update Slack Event Subscriptions URL to: `https://abc123.ngrok.io/api/slack/webhook`
6. Send a test message in your Slack channel

## Troubleshooting

### "url_verification failed"
- Make sure your server is running and accessible
- Check that `SLACK_SIGNING_SECRET` is set correctly

### "Messages not creating requests"
- Check server logs for errors
- Verify bot is in the channel (`/invite @bot`)
- Ensure Event Subscriptions are saved

### "Invalid signature"
- Double-check `SLACK_SIGNING_SECRET` matches Slack app settings
- Verify environment variables are loaded

## Auto-Deployment Flow

Once configured:
1. Message posted in Slack channel → 
2. Slack sends webhook to your app →
3. App validates and parses message →
4. Request added to `data/requests/requests.json` →
5. Git commit pushed to GitHub (manual or automated) →
6. Vercel auto-deploys →
7. Request appears in dashboard ✅

## Optional: Slack Confirmation Messages

To have the bot confirm request creation, uncomment this in the webhook handler:

```typescript
// After successful request creation
await fetch('https://slack.com/api/chat.postMessage', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.SLACK_BOT_TOKEN}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    channel: slackEvent.channel,
    text: `✅ Request created: ${request.title} (ID: ${request.id})`
  })
})
```
