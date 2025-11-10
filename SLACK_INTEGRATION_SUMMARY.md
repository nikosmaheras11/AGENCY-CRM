# Slack Message Feed Integration - Summary

## What Was Set Up

I've configured your Agency Dashboard OS to receive and display real-time Slack messages from your Polymarket channels. Here's what was created:

### 1. **Environment Configuration** (`.env`)
- Added Slack credentials (client secret, signing secret, verification token)
- Configured 4 monitored channels:
  - `hours-creative-polymarket`
  - `hours-performance-polymarket`
  - `polymarket-creative-requests`
  - `polymarket-ugc-hours`
- Added Directus connection settings

### 2. **Database Schema** (`directus/snapshots/slack_messages_collection.yaml`)
- Created `slack_messages` collection to store messages
- Includes fields for: channel, user, text, attachments, timestamps, sector

### 3. **Backend Webhook** (`server/api/slack/webhook.post.ts`)
- Updated webhook handler to store messages in Directus
- Signature verification for security
- Channel-to-sector mapping (creative, performance, ugc)
- Handles file attachments

### 4. **Frontend Component** (`frontend/components/SlackMessageFeed.vue`)
- Reusable Vue component to display messages
- Auto-refreshes every 30 seconds
- Filters by sector
- Shows user, timestamp, message text, and attachments
- Loading and error states

### 5. **Documentation & Tools**
- Updated `docs/SLACK_SETUP.md` with complete setup guide
- Created `scripts/test-slack-webhook.sh` to verify configuration
- Updated Directus schema types

## Next Steps to Complete Setup

### 1. Get Your Bot Token
```bash
# You need to get the actual Bot User OAuth Token from Slack
# Update .env line 6 with: SLACK_BOT_TOKEN=xoxb-your-actual-token
```

### 2. Get Real Channel IDs
Your channels are currently set to placeholder names. Replace them with actual IDs:
```bash
# In Slack, right-click channel → View Details → scroll to bottom
# IDs look like: C0123456789
```

Update in `.env`:
```bash
SLACK_CHANNEL_CREATIVE=C0123456789  # Replace with real ID
SLACK_CHANNEL_PERFORMANCE=C0456789AB
SLACK_CHANNEL_REQUESTS=C0789ABCDEF
SLACK_CHANNEL_UGC=C0ABCDEF123
```

### 3. Set Up Directus
```bash
# Start Directus
docker-compose up -d

# Access admin panel
open http://localhost:8055

# Get admin token:
# Settings → Access Tokens → Create "Slack Integration"
# Copy token and update .env DIRECTUS_SERVER_TOKEN

# Import the slack_messages collection
cd directus
npx directus schema apply ../directus/snapshots/slack_messages_collection.yaml
```

### 4. Configure Slack App
Follow the detailed guide in `docs/SLACK_SETUP.md`:
- Add bot scopes (channels:history, channels:read, files:read)
- Enable Event Subscriptions
- Set webhook URL (use ngrok for local testing)
- Subscribe to `message.channels` event
- Install app to workspace
- Invite bot to your 4 channels

### 5. Test Everything
```bash
# Run the verification script
./scripts/test-slack-webhook.sh

# If all checks pass, post a test message in Slack
# Check: http://localhost:8055 → slack_messages collection
```

### 6. Add Feed to Your Dashboard
In any Vue page/component:
```vue
<template>
  <div>
    <!-- Show creative messages only -->
    <SlackMessageFeed sector="creative" :limit="20" />
    
    <!-- Show performance messages only -->
    <SlackMessageFeed sector="performance" :limit="20" />
    
    <!-- Show all messages -->
    <SlackMessageFeed :limit="50" />
  </div>
</template>
```

## File Changes Made

```
✅ .env - Added Slack & Directus config
✅ directus/snapshots/slack_messages_collection.yaml - New collection schema
✅ server/api/slack/webhook.post.ts - Updated webhook handler
✅ frontend/components/SlackMessageFeed.vue - New feed component
✅ frontend/composables/useDirectus.ts - Added slack_messages to schema
✅ docs/SLACK_SETUP.md - Updated setup guide
✅ scripts/test-slack-webhook.sh - New test script
```

## How Messages Flow

```
User posts in Slack
    ↓
Slack Event API sends webhook
    ↓
Your webhook validates signature
    ↓
Message stored in Directus (slack_messages)
    ↓
Frontend auto-refreshes (30s interval)
    ↓
Message appears in dashboard ✅
```

## Quick Start Commands

```bash
# 1. Start backend
docker-compose up -d

# 2. Start frontend
pnpm dev

# 3. Test setup (in another terminal)
./scripts/test-slack-webhook.sh

# 4. Expose for Slack webhooks
ngrok http 3000
# Copy HTTPS URL → Slack App Event Subscriptions
```

## Configuration Checklist

- [ ] Get Bot Token from Slack and update `.env`
- [ ] Get real Channel IDs and update `.env`
- [ ] Get Directus admin token and update `.env`
- [ ] Start Directus with `docker-compose up -d`
- [ ] Import slack_messages collection schema
- [ ] Configure Slack App bot scopes
- [ ] Enable Event Subscriptions with ngrok URL
- [ ] Invite bot to 4 Slack channels
- [ ] Test with `./scripts/test-slack-webhook.sh`
- [ ] Post test message in Slack
- [ ] Verify message appears in Directus
- [ ] Add `<SlackMessageFeed>` to dashboard page
- [ ] Verify messages display in frontend

## Troubleshooting

**Messages not appearing?**
- Check server console for errors
- Verify Slack Event Subscriptions shows "Verified" status
- Confirm bot is invited to channels: `/invite @your-bot-name`
- Check Directus collection has data: http://localhost:8055

**Signature errors?**
- Ensure `SLACK_SIGNING_SECRET` exactly matches Slack app settings
- No extra spaces or line breaks

**Directus connection errors?**
- Verify `DIRECTUS_SERVER_TOKEN` is valid
- Check token has permissions for `slack_messages` collection
- Ensure Directus is running: `docker-compose ps`

## Support Resources

- 📚 Full Guide: `docs/SLACK_SETUP.md`
- 🧪 Test Script: `./scripts/test-slack-webhook.sh`
- 🔧 Slack API Docs: https://api.slack.com
- 📦 Directus Docs: https://docs.directus.io

---

**Need help?** Check the troubleshooting sections in `docs/SLACK_SETUP.md`
