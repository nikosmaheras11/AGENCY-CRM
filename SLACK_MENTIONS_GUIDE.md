# Slack Mentions Integration Guide

This guide explains how to set up and use the Slack mentions monitoring feature in your Agency Dashboard OS.

## Overview

The Slack mentions feature allows team members to see all Slack messages where they've been mentioned, directly in the dashboard. It includes:

- ✅ Real-time monitoring of Slack mentions
- ✅ Read/unread status tracking
- ✅ One-click navigation to Slack messages
- ✅ Reaction tracking
- ✅ Thread support
- ✅ Real-time updates via Supabase

## Architecture

```
┌─────────────┐      ┌──────────────────┐      ┌──────────────┐
│   Slack     │─────▶│  Monitor Worker  │─────▶│   Supabase   │
│  Workspace  │      │  (slack-monitor) │      │   Database   │
└─────────────┘      └──────────────────┘      └──────┬───────┘
                                                       │
                                                       │
                                                       ▼
                                              ┌──────────────────┐
                                              │  Nuxt Dashboard  │
                                              │ (MentionsPanel)  │
                                              └──────────────────┘
```

## Setup Instructions

### 1. Deploy Database Schema

Run the Slack mentions migration:

```bash
# Option A: Using Supabase Dashboard
# 1. Open SQL Editor in Supabase Dashboard
# 2. Copy contents of supabase/migrations/20250111_slack_mentions.sql
# 3. Execute

# Option B: Using CLI
supabase db push
```

This creates:
- `slack_messages` table
- `user_mentions` table
- `user_mention_details` view
- Helper functions for marking as read
- RLS policies for security

### 2. Configure Slack App

#### Create Slack App

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Click **Create New App** → **From scratch**
3. Name: "Agency Dashboard Bot"
4. Select your workspace

#### Enable Socket Mode

Socket Mode allows the bot to receive real-time events without exposing a public webhook URL.

1. Go to **Socket Mode** in app settings
2. Enable Socket Mode
3. Generate an app-level token with `connections:write` scope
4. Save as `SLACK_APP_TOKEN`

#### Configure Bot Scopes

Navigate to **OAuth & Permissions** and add these **Bot Token Scopes**:

Required:
- `channels:history` - View messages in public channels
- `channels:read` - View basic channel information
- `groups:history` - View messages in private channels (if needed)
- `groups:read` - View basic private channel info
- `users:read` - View user information
- `chat:write` - Send messages (for bot responses)

Optional (for enhanced features):
- `reactions:read` - View reactions on messages
- `files:read` - Access file information

#### Enable Event Subscriptions

1. Go to **Event Subscriptions**
2. Enable Events
3. **DO NOT** add a Request URL (we're using Socket Mode)
4. Subscribe to these **bot events**:
   - `message.channels` - Messages in channels
   - `message.groups` - Messages in private channels
   - `reaction_added` - When reactions are added
   - `reaction_removed` - When reactions are removed

#### Install to Workspace

1. Click **Install to Workspace**
2. Review permissions and authorize
3. Copy the **Bot User OAuth Token** (starts with `xoxb-`)
4. Save as `SLACK_BOT_TOKEN`

### 3. Update Environment Variables

Add to your `.env` file:

```bash
# Slack Configuration
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_APP_TOKEN=xapp-your-app-token
SLACK_SIGNING_SECRET=your-signing-secret

# Supabase (should already be configured)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Install Dependencies

```bash
pnpm add @slack/bolt
```

### 5. Link User Slack IDs

For mentions to work, users must have their `slack_id` stored in the `profiles` table:

```sql
-- Update a user's Slack ID
UPDATE profiles
SET slack_id = 'U01234ABCDE'
WHERE id = 'user-uuid';
```

**Finding Slack User IDs:**

1. In Slack, click on a user's profile
2. Click **More** → **Copy member ID**
3. The ID starts with `U` (e.g., `U01234ABCDE`)

Or programmatically:

```javascript
// In the Slack monitor worker
const userInfo = await client.users.info({ user: 'U01234ABCDE' });
console.log(userInfo.user);
```

### 6. Start the Monitor Worker

```bash
# Development
node workers/slack-monitor-worker.js

# Production with PM2
pm2 start workers/slack-monitor-worker.js --name "slack-monitor"
pm2 save
```

You should see:

```
⚡️ Slack Message Monitor is running!
📨 Monitoring mentions in all accessible channels
🔗 Connected to Supabase
```

### 7. Add Component to Dashboard

Add the mentions panel to your dashboard layout:

```vue
<!-- pages/index.vue or any dashboard page -->
<template>
  <div class="dashboard">
    <div class="sidebar">
      <!-- Other sidebar content -->
      <SlackMentionsPanel />
    </div>
    
    <!-- Main content -->
  </div>
</template>

<script setup>
// The component auto-loads mentions for authenticated users
</script>
```

Or use it as a standalone page:

```vue
<!-- pages/mentions.vue -->
<template>
  <div class="mentions-page">
    <SlackMentionsPanel />
  </div>
</template>
```

## Usage

### For End Users

1. **View Mentions**: Navigate to the mentions panel in your dashboard
2. **Mark as Read**: Click on a mention to mark it as read
3. **Open in Slack**: Click "Open in Slack" to view the full conversation
4. **Mark All Read**: Click "Mark all read" button to clear all unread mentions

### Real-Time Updates

Mentions appear instantly thanks to Supabase Realtime:
- New mentions show up automatically
- Read status syncs across devices
- Unread count updates in real-time

## Features

### Mention Detection

The monitor automatically detects mentions in these formats:
- Direct mentions: `@username`
- Multiple mentions: `Hey @alice and @bob`
- In threads: Thread replies with mentions

### Reactions

Reactions on messages are tracked and displayed:
- Shows emoji and count
- Updates when reactions are added/removed
- Synced in real-time

### Thread Support

Thread replies are properly tracked:
- Indicates when a mention is in a thread
- Links directly to the thread in Slack
- Shows parent message context

## API Reference

### Composable: `useSlackMentions()`

```typescript
const {
  mentions,        // Ref<UserMention[]> - Array of mentions
  unreadCount,     // Ref<number> - Count of unread mentions
  isLoading,       // Ref<boolean> - Loading state
  error,           // Ref<string | null> - Error message
  fetchMentions,   // (limit?: number) => Promise<void>
  getUnreadCount,  // () => Promise<number>
  markAsRead,      // (mentionId: string) => Promise<void>
  markAllAsRead,   // () => Promise<number>
  formatTimestamp  // (timestamp: string) => string
} = useSlackMentions();
```

### Database Functions

**Get unread count:**
```sql
SELECT get_unread_mention_count('user-uuid');
```

**Mark all as read:**
```sql
SELECT mark_all_mentions_read('user-uuid');
```

**Query mentions:**
```sql
-- Using the convenient view
SELECT * FROM user_mention_details
WHERE profile_id = 'user-uuid'
ORDER BY mention_created_at DESC
LIMIT 50;
```

## Monitoring & Maintenance

### Check Worker Status

```bash
# If using PM2
pm2 status
pm2 logs slack-monitor

# Check recent mentions
psql> SELECT COUNT(*) FROM user_mentions WHERE created_at > NOW() - INTERVAL '24 hours';
```

### Common Issues

**Worker not receiving messages:**
- Verify `SLACK_APP_TOKEN` and `SLACK_BOT_TOKEN` are correct
- Check Socket Mode is enabled in Slack app settings
- Ensure bot has been added to channels you want to monitor

**Mentions not appearing for users:**
- Verify user's `slack_id` is set in profiles table
- Check RLS policies allow user to view mentions
- Ensure Realtime is enabled on `user_mentions` table

**Reactions not updating:**
- Verify bot has `reactions:read` scope
- Check `reaction_added` and `reaction_removed` events are subscribed

### Performance Optimization

For high-volume Slack workspaces:

1. **Add database indexes** (already included):
   ```sql
   CREATE INDEX idx_user_mentions_created ON user_mentions(created_at DESC);
   ```

2. **Limit retention**:
   ```sql
   -- Delete mentions older than 90 days
   DELETE FROM user_mentions
   WHERE created_at < NOW() - INTERVAL '90 days';
   ```

3. **Batch processing**:
   The worker processes messages individually. For very high volumes, consider batching.

## Security Considerations

- ✅ **RLS Policies**: Users can only see their own mentions
- ✅ **Service Role Key**: Only the worker uses the service role key
- ✅ **No Public Webhook**: Socket Mode eliminates webhook security concerns
- ✅ **Slack ID Validation**: Mentions only created for users in profiles table

## Advanced Usage

### Custom Filters

Filter mentions by channel:

```typescript
const { mentions } = useSlackMentions();

const productMentions = computed(() => 
  mentions.value.filter(m => m.channel_name === 'product-team')
);
```

### Notifications

Trigger browser notifications for new mentions:

```typescript
watch(unreadCount, (newCount, oldCount) => {
  if (newCount > oldCount) {
    new Notification('New Slack Mention', {
      body: 'You have a new mention in Slack',
      icon: '/slack-icon.png'
    });
  }
});
```

### Analytics

Track mention engagement:

```sql
-- Most active channels
SELECT channel_name, COUNT(*) as mention_count
FROM slack_messages sm
INNER JOIN user_mentions um ON um.message_id = sm.id
WHERE um.user_slack_id = 'U01234ABCDE'
GROUP BY channel_name
ORDER BY mention_count DESC;

-- Response time (read time)
SELECT AVG(EXTRACT(EPOCH FROM (read_at - created_at))) as avg_seconds
FROM user_mentions
WHERE is_read = TRUE AND read_at IS NOT NULL;
```

## Troubleshooting

### Debug Mode

Enable verbose logging in the worker:

```javascript
// Add to workers/slack-monitor-worker.js
console.log('Processing message:', message);
console.log('Extracted mentions:', mentions);
console.log('Stored message ID:', formattedMessage.id);
```

### Test the Integration

Send a test mention:

1. In Slack, mention a user: `Hey @username, checking if mentions work!`
2. Check worker logs: Should see "Processing message with X mention(s)"
3. Check database:
   ```sql
   SELECT * FROM slack_messages ORDER BY created_at DESC LIMIT 1;
   SELECT * FROM user_mentions ORDER BY created_at DESC LIMIT 1;
   ```
4. Check dashboard: Mention should appear in real-time

## Support

For issues:
1. Check worker logs: `pm2 logs slack-monitor`
2. Verify Slack app configuration at [api.slack.com/apps](https://api.slack.com/apps)
3. Check Supabase dashboard for database errors
4. Review RLS policies in Supabase

---

**Congratulations!** 🎉 Your Slack mentions integration is now complete and users can track all their Slack mentions directly in the dashboard.
