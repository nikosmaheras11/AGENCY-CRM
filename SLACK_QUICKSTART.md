# Slack Dashboard Integration - Quick Start

Get your Slack messages appearing in the dashboard in 5 steps.

## What You Need

1. Your Supabase project URL and keys (get from https://supabase.com/dashboard)
2. Your Slack Bot Token (starts with `xoxb-`)
3. 5 minutes ⏱️

## Setup Steps

### 1. Update `.env` File

```bash
# Add your Supabase credentials
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Add your Slack Bot Token (you already have SLACK_APP_TOKEN)
SLACK_BOT_TOKEN=xoxb-your-bot-token-here
```

**Where to get these:**
- Supabase: Dashboard → Settings → API
- Slack Bot Token: api.slack.com/apps → Your App → OAuth & Permissions → Bot User OAuth Token

### 2. Create Supabase Table

Go to Supabase Dashboard → SQL Editor and run:

```sql
-- Copy contents from: supabase/migrations/20250110_create_slack_messages_schema.sql
```

Or use CLI:
```bash
npx supabase db push
```

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Start the Monitor

In one terminal:
```bash
pnpm slack-monitor
```

Leave this running - it captures messages from your 4 Slack channels:
- hours-creative-polymarket
- hours-performance-polymarket  
- polymarket-creative-requests
- polymarket-ugc-hours

### 5. Start the Dashboard

In another terminal:
```bash
pnpm dev
```

Visit http://localhost:3000 - you should see Slack messages in the right sidebar!

## Testing

1. Post a message in any of the 4 monitored channels
2. Check the monitor console - should say "✅ Message stored"
3. Refresh your dashboard - message should appear

## Troubleshooting

**Monitor says "Missing Slack credentials":**
- Make sure `.env` has `SLACK_BOT_TOKEN` starting with `xoxb-`
- Make sure `.env` has `SLACK_APP_TOKEN` starting with `xapp-`

**Monitor says "Missing Supabase credentials":**
- Add `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` to `.env`

**Messages don't appear in dashboard:**
- Check Supabase Table Editor - do you see messages in `slack_messages` table?
- Check browser console for errors
- Verify `SUPABASE_ANON_KEY` is set

**Bot not receiving messages:**
- Invite bot to channels: `/invite @Your Bot Name`
- Check bot has these scopes: `channels:history`, `channels:read`, `users:read`

## Next Steps

See [docs/SLACK_SUPABASE_SETUP.md](docs/SLACK_SUPABASE_SETUP.md) for:
- Production deployment
- Adding more channels
- PM2 setup for running monitor 24/7

## Architecture

```
Slack Channels (4)
    ↓
Slack Monitor Script (Socket Mode)
    ↓
Supabase Database
    ↓
Dashboard API
    ↓
Your Dashboard Frontend ✨
```

---

**Questions?** Check the full setup guide: `docs/SLACK_SUPABASE_SETUP.md`
