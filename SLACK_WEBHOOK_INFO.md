# Slack Webhook URLs - Quick Reference

## Your Webhook Endpoints

### Local Development (with ngrok)
```
https://YOUR-NGROK-ID.ngrok.io/api/slack/webhook
```

### Production (Vercel)
```
https://your-vercel-domain.vercel.app/api/slack/webhook
```

## Quick Setup Steps

1. **Create Slack App**: https://api.slack.com/apps
2. **Configure Event Subscriptions**: Add webhook URL above
3. **Add Bot Scopes**: `channels:history`, `channels:read`, `files:read`
4. **Get Credentials**:
   - Bot Token (starts with `xoxb-`)
   - Signing Secret
5. **Add to `.env`**:
   ```bash
   SLACK_SIGNING_SECRET=your-secret-here
   SLACK_BOT_TOKEN=xoxb-your-token-here
   ```
6. **Invite bot to channel**: `/invite @Polymarket Requests Bot`
7. **Post a message** in the format:
   ```
   Creative request: New video ad
   Type: creative
   Due: 2024-01-20
   Priority: high
   ```

## Testing

Send this message in your Slack channel:
```
Creative request: Test video for Polymarket
Type: creative
Priority: high
Tags: test, video
```

Check:
- Server logs for webhook activity
- `data/requests/requests.json` for new entry
- Dashboard at `/creative` for the request

## Files Created

- ✅ `server/api/slack/webhook.post.ts` - Webhook handler
- ✅ `docs/SLACK_SETUP.md` - Full setup guide
- ✅ This file - Quick reference

## Need Help?

See full documentation: `docs/SLACK_SETUP.md`
