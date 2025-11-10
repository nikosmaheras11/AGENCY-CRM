# Slack + Supabase Integration Setup Guide

This guide walks you through setting up the Slack message feed using Supabase as the storage backend.

## Architecture Overview

```
Slack Channel → Slack Monitor (Socket Mode) → Supabase Database → Dashboard API → Frontend
```

**Benefits:**
- ✅ Real-time message capture via Socket Mode (no webhooks needed)
- ✅ Persistent storage in Supabase PostgreSQL
- ✅ Fast queries with indexed timestamps
- ✅ Historical message access
- ✅ Real-time subscriptions (optional)

## Prerequisites

- [ ] Supabase account (https://supabase.com)
- [ ] Slack workspace admin access
- [ ] Node.js 20+ and pnpm installed

## Step 1: Set Up Supabase

### 1.1 Create Supabase Project

1. Go to https://supabase.com and create a new project
2. Wait for database provisioning (takes ~2 minutes)
3. Go to **Settings** → **API**
4. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public** key
   - **service_role** key (⚠️ keep this secret!)

### 1.2 Run Database Migration

```bash
# Option 1: Using Supabase CLI (recommended)
npx supabase db push

# Option 2: Manual via SQL Editor
# Go to Supabase Dashboard → SQL Editor
# Copy and run: supabase/migrations/20250110_create_slack_messages_schema.sql
```

### 1.3 Verify Table Creation

In Supabase Dashboard:
1. Go to **Table Editor**
2. You should see `slack_messages` table
3. Check indexes exist: `idx_slack_messages_timestamp`, `idx_slack_messages_channel`

## Step 2: Configure Slack App

### 2.1 Create Slack App

1. Go to https://api.slack.com/apps
2. Click **Create New App** → **From scratch**
3. Name: `Agency Dashboard Monitor`
4. Select your workspace

### 2.2 Enable Socket Mode

1. In your app settings, go to **Socket Mode**
2. Click **Enable Socket Mode**
3. Generate an **App-Level Token**:
   - Token Name: `socket-token`
   - Scope: `connections:write`
   - Copy the token (starts with `xapp-`)

### 2.3 Add Bot Scopes

Go to **OAuth & Permissions** → **Scopes** → **Bot Token Scopes**:

```
channels:history
channels:read
users:read
chat:write (optional - for replying)
reactions:read (optional - for reaction tracking)
```

### 2.4 Subscribe to Events

1. Go to **Event Subscriptions**
2. Click **Subscribe to bot events**
3. Add these events:
   - `message.channels`
   - `reaction_added` (optional)
4. **Save Changes**

### 2.5 Install App to Workspace

1. Go to **OAuth & Permissions**
2. Click **Install to Workspace**
3. Authorize the app
4. Copy the **Bot User OAuth Token** (starts with `xoxb-`)

### 2.6 Invite Bot to Channels

In Slack, for each of these channels:
- `hours-creative-polymarket` (C09HBDKSUGH)
- `hours-performance-polymarket` (C09F44R90UX)
- `polymarket-creative-requests` (C09RDUX4198)
- `polymarket-ugc-hours` (C09RJ82TFPG)

Run:
```
/invite @Agency Dashboard Monitor
```

## Step 3: Configure Environment Variables

Update your `.env` file:

```bash
# Supabase Configuration
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Slack Configuration
SLACK_BOT_TOKEN=xoxb-7560193436759-9881366888885-...
SLACK_APP_TOKEN=xapp-1-A09RYKQBZLN-9888297173092-...
SLACK_SIGNING_SECRET=d5741c1601c0df0a3e0747bc367d942b

# Channel IDs (already configured)
SLACK_CHANNEL_CREATIVE=C09HBDKSUGH
SLACK_CHANNEL_PERFORMANCE=C09F44R90UX
SLACK_CHANNEL_REQUESTS=C09RDUX4198
SLACK_CHANNEL_UGC=C09RJ82TFPG
```

⚠️ **Important:**
- `SLACK_APP_TOKEN` must start with `xapp-` (from Step 2.2)
- `SLACK_BOT_TOKEN` must start with `xoxb-` (from Step 2.5)
- Use `SUPABASE_SERVICE_KEY` for the monitor script (server-side)

## Step 4: Install Dependencies

```bash
pnpm install
```

This will install:
- `@slack/bolt` - Socket Mode support
- `@supabase/supabase-js` - Supabase client

## Step 5: Test the Setup

### 5.1 Start the Slack Monitor

```bash
pnpm slack-monitor
```

You should see:
```
📡 Slack Monitor Configuration:
   Monitored Channels: hours-creative-polymarket, hours-performance-polymarket, ...
⚡️ Slack Message Monitor is running!
   Listening for messages in monitored channels...
```

### 5.2 Send a Test Message

In Slack, post a message in one of the monitored channels:
```
Testing Agency Dashboard integration! 🚀
```

You should see in the monitor console:
```
📨 New message captured:
   Channel: #hours-creative-polymarket
   User: Your Name
   Text: Testing Agency Dashboard integration! 🚀
✅ Message stored in Supabase: ...
```

### 5.3 Verify in Supabase

1. Go to Supabase Dashboard → **Table Editor**
2. Click `slack_messages`
3. You should see your test message

### 5.4 Start the Dashboard

In a separate terminal:
```bash
pnpm dev
```

Go to http://localhost:3000 and check the **Slack Messages** section on the dashboard.

## Step 6: Production Deployment

### 6.1 Monitor Script (Background Process)

For production, run the monitor script as a background service:

**Option 1: PM2 (recommended)**
```bash
npm install -g pm2
pm2 start scripts/slack-monitor.js --name slack-monitor
pm2 save
pm2 startup
```

**Option 2: systemd (Linux)**
Create `/etc/systemd/system/slack-monitor.service`:
```ini
[Unit]
Description=Slack Message Monitor
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/agency-dashboard-os
ExecStart=/usr/bin/node scripts/slack-monitor.js
Restart=always

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl enable slack-monitor
sudo systemctl start slack-monitor
```

### 6.2 Dashboard Deployment

Deploy to Vercel/Netlify as usual:
```bash
pnpm build
```

Make sure to set these environment variables in your deployment platform:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY` (for client-side queries)
- All other Nuxt/Directus variables

## Troubleshooting

### Monitor Script Won't Start

**Error: Missing Supabase credentials**
- Check `.env` has `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`
- Make sure `.env` is in the project root

**Error: Missing Slack credentials**
- Verify `SLACK_BOT_TOKEN` starts with `xoxb-`
- Verify `SLACK_APP_TOKEN` starts with `xapp-`
- Ensure Socket Mode is enabled in Slack app settings

### Messages Not Appearing

**Monitor receives messages but dashboard doesn't show them:**
1. Check Supabase Table Editor - are messages there?
2. Check browser console for API errors
3. Verify `SUPABASE_ANON_KEY` is set in `.env`
4. Check `nuxt.config.ts` exposes Supabase config

**Monitor doesn't receive messages:**
1. Bot must be invited to channels (`/invite @YourBot`)
2. Check Event Subscriptions are saved
3. Verify channel IDs match in `.env`

### Database Errors

**RLS policy errors:**
- Ensure policies allow `SELECT` for anonymous users
- Check service role key is used for inserts (monitor script)

**Duplicate key errors:**
- Normal behavior - message already exists
- Script will log "Message already exists, skipping"

## Monitoring & Maintenance

### View Monitor Logs

```bash
# If using PM2
pm2 logs slack-monitor

# If using systemd
journalctl -u slack-monitor -f
```

### Clear Old Messages (Optional)

To prevent database bloat, consider a cleanup policy:

```sql
-- Delete messages older than 90 days
DELETE FROM slack_messages
WHERE timestamp < NOW() - INTERVAL '90 days';
```

Set this up as a Supabase scheduled function or cron job.

### Monitor Performance

Check Supabase Dashboard → **Database** → **Query Performance** for slow queries.

## Channel Configuration

The current setup monitors these 4 channels:

| Channel Name | Channel ID | Purpose |
|--------------|------------|---------|
| hours-creative-polymarket | C09HBDKSUGH | Creative team hours |
| hours-performance-polymarket | C09F44R90UX | Performance team hours |
| polymarket-creative-requests | C09RDUX4198 | Creative requests |
| polymarket-ugc-hours | C09RJ82TFPG | UGC team hours |

To add more channels:
1. Add channel ID to `.env`: `SLACK_CHANNEL_NEWNAME=C123456789`
2. Update `scripts/slack-monitor.js` MONITORED_CHANNELS object
3. Invite bot to new channel: `/invite @Agency Dashboard Monitor`
4. Restart monitor script

## Support

If issues persist:
1. Check `pnpm slack-monitor` output for errors
2. Verify bot permissions in Slack App settings
3. Test Supabase connection: `npx supabase test db`
4. Review Slack API Events dashboard for webhook failures

---

**Useful Links:**
- Supabase Dashboard: https://supabase.com/dashboard
- Slack API Apps: https://api.slack.com/apps
- Socket Mode Docs: https://api.slack.com/apis/connections/socket
