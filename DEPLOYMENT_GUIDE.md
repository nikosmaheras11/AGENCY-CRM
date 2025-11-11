# Agency Dashboard OS - Deployment Guide

This guide walks you through deploying the complete database schema with all automation, Slack integration, and worker service features.

## Prerequisites

- [x] Supabase project created
- [x] Supabase CLI installed and authenticated
- [x] Node.js 18+ installed
- [x] pnpm installed (`npm install -g pnpm`)

## Step 1: Database Schema Deployment

### Option A: Direct Supabase Dashboard (Recommended for First Deployment)

1. Navigate to your Supabase project dashboard
2. Go to **SQL Editor**
3. Open the file `supabase/migrations/20250110_complete_schema.sql`
4. Copy and paste the entire content into the SQL Editor
5. Click **Run** to execute

This approach avoids conflicts with existing tables and applies the schema cleanly.

### Option B: Using Supabase CLI

If you prefer using the CLI and the remote database is empty:

```bash
# Push the migration to remote
supabase db push

# Confirm when prompted
```

If you encounter conflicts with existing tables, use Option A instead.

## Step 2: Verify Schema Deployment

After applying the schema, verify in the Supabase Dashboard:

### Tables Created

Navigate to **Table Editor** and verify these tables exist:

**Core Tables:**
- ✅ `clients`
- ✅ `profiles`
- ✅ `requests`
- ✅ `tags`
- ✅ `request_tags`
- ✅ `assets`
- ✅ `comments`
- ✅ `performance_metrics`
- ✅ `platform_connections`
- ✅ `metric_sync_logs`
- ✅ `project_tasks`
- ✅ `activity_log`
- ✅ `archived_activity_log`

**Automation & Integration Tables:**
- ✅ `status_history`
- ✅ `slack_connected_channels`
- ✅ `slack_message_requests`
- ✅ `slack_comment_threads`
- ✅ `notification_config`
- ✅ `notification_queue`
- ✅ `automation_rule_templates`
- ✅ `automation_rules`
- ✅ `retention_policies`

### Functions Created

Navigate to **Database** → **Functions** and verify:

- ✅ `set_default_request_status()`
- ✅ `check_status_transition()`
- ✅ `log_status_change()`
- ✅ `queue_status_notification()`
- ✅ `handle_asset_versioning()`
- ✅ `process_comment_automation()`
- ✅ `set_asset_version_as_current(uuid)`
- ✅ `archive_old_activities(integer)`
- ✅ `lock_and_get_notifications(integer)`

### Seed Data

Check that default data was inserted:

```sql
-- Should return 2 rows
SELECT * FROM retention_policies;

-- Should return 4 rows
SELECT * FROM automation_rule_templates;

-- Should return 3 rows
SELECT * FROM notification_config;
```

## Step 3: Configure Environment Variables

Create a `.env` file in the project root (if not already present):

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Slack Integration
SLACK_BOT_TOKEN=xoxb-your-slack-bot-token
SLACK_SIGNING_SECRET=your_signing_secret

# Optional: OpenAI for AI-powered features
OPENAI_API_KEY=sk-your-openai-key
```

### Getting Supabase Credentials

1. Go to **Project Settings** → **API**
2. Copy **Project URL** → `SUPABASE_URL`
3. Copy **anon public** key → `SUPABASE_ANON_KEY`
4. Copy **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep secret!)

### Setting up Slack App

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Click **Create New App** → **From scratch**
3. Name it "Agency Dashboard Bot" and select your workspace
4. Navigate to **OAuth & Permissions**
5. Add these **Bot Token Scopes**:
   - `chat:write` - Send messages
   - `chat:write.public` - Send messages to channels without joining
   - `channels:read` - View basic channel info
   - `users:read` - View users in workspace
   - `files:write` - Upload files
6. Click **Install to Workspace**
7. Copy **Bot User OAuth Token** → `SLACK_BOT_TOKEN`
8. Navigate to **Basic Information**
9. Copy **Signing Secret** → `SLACK_SIGNING_SECRET`

## Step 4: Set Up Slack Channels

In your Slack workspace, create channels for different request types:

```bash
#creative-requests
#performance-requests
#project-requests
#agency-general
```

Then, in Supabase SQL Editor, configure channel mappings:

```sql
-- Map channels to request types
INSERT INTO slack_connected_channels (request_type, channel_id, channel_name, notification_types)
VALUES
  ('creative', 'C01234ABC', 'creative-requests', '["status_change", "comment_added", "asset_uploaded"]'::jsonb),
  ('performance', 'C01234DEF', 'performance-requests', '["status_change", "comment_added"]'::jsonb),
  ('project', 'C01234GHI', 'project-requests', '["status_change", "comment_added"]'::jsonb),
  (NULL, 'C01234JKL', 'agency-general', '["status_change"]'::jsonb); -- NULL = all types
```

**To get Channel IDs:**
1. In Slack, right-click on a channel name
2. Select **View channel details**
3. Scroll down and copy the **Channel ID**

## Step 5: Deploy Worker Services

Worker services handle background tasks like sending Slack notifications and syncing metrics.

### Install Worker Dependencies

```bash
pnpm add @supabase/supabase-js @slack/web-api axios uuid dotenv
```

### Create Workers Directory

```bash
mkdir -p workers
```

### Copy Worker Files

Copy the worker implementations from `WORKER_SERVICES.md` to create these files:

1. `workers/notification-worker.js` - Processes Slack notifications
2. `workers/metrics-sync-worker.js` - Syncs platform metrics
3. `workers/retention-worker.js` - Archives old data

### Run Workers Locally (Development)

```bash
# Terminal 1: Notification Worker
node workers/notification-worker.js

# Terminal 2: Metrics Sync Worker
node workers/metrics-sync-worker.js

# Terminal 3: Retention Worker (runs weekly)
node workers/retention-worker.js
```

### Deploy Workers (Production)

#### Option 1: PM2 (Simple VPS/Server)

```bash
# Install PM2
npm install -g pm2

# Start workers
pm2 start workers/notification-worker.js --name "notification-worker"
pm2 start workers/metrics-sync-worker.js --name "metrics-worker"
pm2 start workers/retention-worker.js --name "retention-worker"

# Save and enable auto-start
pm2 save
pm2 startup
```

#### Option 2: Docker

See `WORKER_SERVICES.md` for Docker deployment instructions.

#### Option 3: Cloud Services

- **Render**: Deploy as background workers
- **Railway**: Deploy as services
- **AWS Fargate**: Deploy as ECS tasks
- **Google Cloud Run**: Deploy as jobs

## Step 6: Frontend Setup

### Install Frontend Dependencies

```bash
pnpm install
```

### Configure Nuxt

The Nuxt config should already have the Supabase module. Verify in `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: [
    '@nuxtjs/supabase',
    '@nuxt/ui',
    // ... other modules
  ],
  
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_ANON_KEY,
    redirect: false
  }
})
```

### Start Development Server

```bash
pnpm dev
```

The frontend should now be running at `http://localhost:3000`.

## Step 7: Configure Row Level Security (Optional)

The schema includes basic RLS policies. For production, you may want to enhance them:

```sql
-- Example: Restrict request updates to assigned users and managers
CREATE POLICY "Managers can update any request"
ON requests FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'manager')
  )
);
```

Navigate to **Authentication** → **Policies** in Supabase Dashboard to manage RLS.

## Step 8: Enable Realtime (Optional)

For real-time updates across users:

1. Go to **Database** → **Replication**
2. Enable replication for these tables:
   - `requests`
   - `assets`
   - `comments`
   - `project_tasks`

Then in your frontend code:

```typescript
const { data } = useSupabaseClient()
  .channel('requests-channel')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'requests' },
    (payload) => {
      console.log('Request changed!', payload)
      // Update UI
    }
  )
  .subscribe()
```

## Step 9: Set Up Platform Integrations

### Meta Ads Integration

1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Create a new app
3. Add **Marketing API** product
4. Get your **App ID**, **App Secret**, and **Access Token**
5. In Supabase, insert connection:

```sql
INSERT INTO platform_connections (
  platform,
  account_id,
  account_name,
  credentials,
  sync_frequency
) VALUES (
  'meta',
  'act_1234567890', -- Your Ad Account ID
  'My Company Ads',
  jsonb_build_object(
    'app_id', 'your_app_id',
    'app_secret', 'your_app_secret',
    'access_token', 'your_long_lived_access_token'
  ),
  1440 -- Sync every 24 hours (in minutes)
);
```

### Google Ads Integration

Similar process using Google Ads API. See `WORKER_SERVICES.md` for implementation.

## Step 10: Testing

### Test Status Transitions

```sql
-- Insert a test request
INSERT INTO requests (title, description, request_type, created_by)
VALUES (
  'Test Request',
  'Testing the system',
  'creative',
  auth.uid()
);

-- Try to change status (should succeed)
UPDATE requests
SET status = 'in_progress'
WHERE title = 'Test Request';

-- Try invalid transition (should fail)
UPDATE requests
SET status = 'needs_edit'
WHERE title = 'Test Request';
-- ERROR: Invalid status transition
```

### Test Notifications

```sql
-- Change a request status and check notification_queue
UPDATE requests SET status = 'needs_review' WHERE id = 'some-uuid';

-- Verify notification was queued
SELECT * FROM notification_queue ORDER BY created_at DESC LIMIT 1;
```

The notification worker should pick this up and send to Slack.

### Test Asset Versioning

```typescript
// Upload an asset
const { data: asset } = await supabase
  .from('assets')
  .insert({
    request_id: 'request-uuid',
    name: 'Logo.png',
    storage_path: '/uploads/logo-v1.png',
    file_type: 'image'
  })
  .select()
  .single();

// Update the asset (triggers versioning)
await supabase
  .from('assets')
  .update({
    storage_path: '/uploads/logo-v2.png',
    version_notes: 'Updated colors'
  })
  .eq('id', asset.id);

// Check versions
const { data: versions } = await supabase
  .from('assets')
  .select('*')
  .or(`id.eq.${asset.id},parent_asset_id.eq.${asset.id}`)
  .order('version_number', { ascending: false });

console.log(versions); // Should show v1 and v2
```

## Step 11: Production Checklist

Before going live:

- [ ] All environment variables are set
- [ ] RLS policies are properly configured
- [ ] Workers are running and monitored
- [ ] Slack app is installed and connected
- [ ] Platform integrations are tested
- [ ] Backup strategy is in place
- [ ] Monitoring/logging is configured (Sentry, DataDog, etc.)
- [ ] SSL certificates are valid
- [ ] Domain is configured
- [ ] User roles and permissions are set

## Troubleshooting

### Schema Migration Issues

**Problem**: Existing tables conflict with migration

**Solution**: Use the Supabase Dashboard SQL Editor to run the schema directly instead of CLI.

### Worker Not Processing Notifications

**Problem**: Notifications stay in queue

**Solution**:
- Check worker logs for errors
- Verify `SLACK_BOT_TOKEN` is valid
- Ensure bot has proper scopes
- Check bot is added to target channels

### Assets Not Versioning

**Problem**: Asset updates don't create versions

**Solution**:
- Verify trigger is enabled: `SELECT * FROM pg_trigger WHERE tgname = 'asset_versioning_trigger';`
- Check if `storage_path` is actually changing (trigger only fires on path change)

### Metrics Not Syncing

**Problem**: No data in `performance_metrics` table

**Solution**:
- Check `metric_sync_logs` for errors
- Verify platform API credentials
- Check rate limits on platform APIs
- Ensure `requests.metadata` contains matching IDs (e.g., `meta_ad_id`)

## Next Steps

1. **Build the Frontend UI**: Implement the Nuxt components for the dashboard
2. **Create Automation Rules**: Add custom automation rules via the UI
3. **Set Up User Authentication**: Configure Supabase Auth for team members
4. **Customize Workflows**: Adjust status transitions and automation to fit your agency's process
5. **Add Analytics**: Create dashboards using the performance metrics data

## Support

- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Slack API Docs**: [api.slack.com](https://api.slack.com)
- **Nuxt 3 Docs**: [nuxt.com](https://nuxt.com)

---

**Congratulations!** 🎉 Your Agency Dashboard OS database is now fully deployed with automation, Slack integration, and worker services.
