# Slack Integration Setup Guide

This guide will help you configure Slack integration to display real-time message feeds in your Agency Dashboard.

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

Your `.env` file has been configured with:

```bash
# Directus
DIRECTUS_URL=http://localhost:8055
DIRECTUS_SERVER_TOKEN=your-directus-admin-token  # Get from Directus admin panel

# Slack Integration
SLACK_BOT_TOKEN=xoxb-your-actual-bot-token  # Get from Step 4
SLACK_CLIENT_SECRET=d015030f6d91a56f2789b520c2e8e78b
SLACK_SIGNING_SECRET=d5741c1601c0df0a3e0747bc367d942b
SLACK_VERIFICATION_TOKEN=N08IDLwEjnJXdtYPSgnVhBxP

# Your Polymarket Slack Channels (replace with actual channel IDs)
SLACK_CHANNEL_CREATIVE=C0123456789  # hours-creative-polymarket
SLACK_CHANNEL_PERFORMANCE=C0456789AB  # hours-performance-polymarket
SLACK_CHANNEL_REQUESTS=C0789ABCDEF  # polymarket-creative-requests
SLACK_CHANNEL_UGC=C0ABCDEF123  # polymarket-ugc-hours
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

## Step 8: Set Up Directus Collection

1. Start Directus:
```bash
docker-compose up -d
```

2. Access Directus admin: http://localhost:8055

3. Get your admin token:
   - Go to **Settings** → **Access Tokens**
   - Create new token: "Slack Integration"
   - Copy token and update `.env` `DIRECTUS_SERVER_TOKEN`

4. Import the slack_messages collection:
```bash
cd directus
npx directus schema apply ../directus/snapshots/slack_messages_collection.yaml
```

Or manually create collection `slack_messages` with fields:
- `id` (UUID, primary key)
- `channel_id` (String, required)
- `channel_name` (String, required) 
- `user_id` (String)
- `user_name` (String)
- `text` (Text, required)
- `thread_ts` (String)
- `ts` (String, required, unique)
- `attachments` (JSON)
- `sector` (String)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

## Step 9: Display Feed in Dashboard

Add the message feed component to any page:

```vue
<template>
  <div>
    <!-- Show creative channel messages -->
    <SlackMessageFeed sector="creative" :limit="20" />
    
    <!-- Show all messages -->
    <SlackMessageFeed :limit="50" />
  </div>
</template>
```

**Component Props:**
- `sector` (optional): Filter by sector ("creative", "performance", "ugc")
- `limit` (optional): Number of messages to display (default: 50)

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

## How It Works

Once configured:
1. Message posted in Slack channel → 
2. Slack sends webhook to your app →
3. App validates signature →
4. Message stored in Directus `slack_messages` collection →
5. Frontend auto-refreshes every 30 seconds →
6. Message appears in dashboard feed ✅

## Additional Troubleshooting

### Messages Not Storing in Directus
- Check `DIRECTUS_SERVER_TOKEN` is valid
- Verify token has permissions for `slack_messages` collection
- Check Directus is running: `docker-compose ps`
- View logs: `docker-compose logs -f directus`

### Channel IDs Not Resolving
- Update channel IDs in `.env` with actual Slack channel IDs (format: `C0123456789`)
- Channel IDs start with `C`, not channel names
- Get IDs from Slack URL or API

### Frontend Not Showing Messages
- Check browser console for errors
- Verify `slack_messages` collection exists in Directus
- Ensure Directus URL is accessible from frontend
- Check network tab for API request failures
