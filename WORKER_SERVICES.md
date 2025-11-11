# Worker Services Implementation Guide

This document provides implementation guidance for the background worker services required by the Agency Dashboard OS.

## Overview

The system requires two main worker services:

1. **Notification Worker** - Processes queued notifications and sends them to Slack
2. **Metrics Sync Worker** - Syncs performance metrics from connected platforms

Both services should run as separate Node.js processes and can be deployed using Docker, systemd, PM2, or cloud services like AWS ECS/Fargate.

---

## 1. Notification Worker

### Purpose
Processes entries from the `notification_queue` table and sends formatted messages to Slack channels or DMs.

### Setup

#### Install Dependencies

```bash
npm install @supabase/supabase-js @slack/web-api dotenv
```

#### Implementation

Create `workers/notification-worker.js`:

```javascript
import { createClient } from '@supabase/supabase-js';
import { WebClient } from '@slack/web-api';
import 'dotenv/config';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

// Template rendering helper
function renderTemplate(template, data) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] !== undefined ? data[key] : match;
  });
}

// Format Slack message based on notification config
async function formatSlackMessage(notification) {
  const { data: config } = await supabase
    .from('notification_config')
    .select('*')
    .eq('id', notification.config_id)
    .single();

  if (!config) {
    throw new Error(`Notification config ${notification.config_id} not found`);
  }

  // Render template with event data
  const message = renderTemplate(config.template, notification.event_data);

  return {
    channel: config.channel_id || await getUserSlackChannel(config.user_id),
    text: message,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: message
        }
      }
    ]
  };
}

// Get user's Slack channel for DMs
async function getUserSlackChannel(userId) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('slack_id')
    .eq('id', userId)
    .single();

  if (!profile?.slack_id) {
    throw new Error(`User ${userId} does not have Slack connected`);
  }

  return profile.slack_id;
}

// Process a single notification
async function processNotification(notification) {
  try {
    const slackMessage = await formatSlackMessage(notification);
    
    // Send to Slack
    await slack.chat.postMessage(slackMessage);

    // Mark as processed
    await supabase
      .from('notification_queue')
      .update({
        is_processed: true,
        processed_at: new Date().toISOString()
      })
      .eq('id', notification.id);

    console.log(`✅ Processed notification ${notification.id}`);
    
  } catch (error) {
    console.error(`❌ Error processing notification ${notification.id}:`, error.message);

    // Calculate exponential backoff
    const nextRetryDelay = Math.min(900, Math.pow(2, notification.attempts) * 30);
    const nextAttempt = new Date(Date.now() + nextRetryDelay * 1000);

    // Update retry info
    await supabase
      .from('notification_queue')
      .update({
        attempts: notification.attempts + 1,
        next_attempt_at: nextAttempt.toISOString(),
        last_error: error.message
      })
      .eq('id', notification.id);

    // If max attempts reached, mark as failed
    if (notification.attempts + 1 >= 5) {
      console.error(`⚠️ Max attempts reached for notification ${notification.id}`);
    }
  }
}

// Main processing loop
async function processNotificationQueue() {
  try {
    // Lock and fetch batch of notifications
    const { data: notifications, error } = await supabase
      .rpc('lock_and_get_notifications', { batch_size: 50 });

    if (error) {
      console.error('Error fetching notifications:', error);
      return;
    }

    if (!notifications || notifications.length === 0) {
      return;
    }

    console.log(`📬 Processing ${notifications.length} notifications...`);

    // Process each notification
    for (const notification of notifications) {
      await processNotification(notification);
    }

  } catch (error) {
    console.error('Error in notification processing loop:', error);
  }
}

// Start the worker
console.log('🚀 Starting Notification Worker...');
setInterval(processNotificationQueue, 60000); // Run every minute
processNotificationQueue(); // Run immediately on start
```

#### Environment Variables

Add to `.env`:

```bash
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SLACK_BOT_TOKEN=xoxb-your-slack-bot-token
```

#### Running the Worker

**Development:**
```bash
node workers/notification-worker.js
```

**Production (with PM2):**
```bash
pm2 start workers/notification-worker.js --name "notification-worker"
pm2 save
```

**Docker:**
Create `workers/Dockerfile.notification`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY workers/notification-worker.js ./
CMD ["node", "notification-worker.js"]
```

---

## 2. Metrics Sync Worker

### Purpose
Syncs performance metrics from connected advertising platforms (Meta, Google Ads, etc.).

### Setup

#### Install Dependencies

```bash
npm install @supabase/supabase-js axios dotenv uuid
```

#### Implementation

Create `workers/metrics-sync-worker.js`:

```javascript
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import 'dotenv/config';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Meta Ads (Facebook/Instagram) sync
async function syncMetaAdsMetrics(connection) {
  const syncId = uuidv4();
  const logId = uuidv4();

  // Create sync log
  await supabase.from('metric_sync_logs').insert({
    id: logId,
    platform_connection_id: connection.id,
    status: 'in_progress',
    start_time: new Date().toISOString()
  });

  try {
    const adAccountId = connection.account_id;
    const accessToken = connection.credentials.access_token;

    // Fetch insights from Meta Marketing API
    const response = await axios.get(
      `https://graph.facebook.com/v18.0/${adAccountId}/insights`,
      {
        params: {
          fields: 'impressions,clicks,spend,reach,cpm,cpc,ctr',
          date_preset: 'last_30d',
          level: 'ad',
          access_token: accessToken
        }
      }
    );

    let metricsCreated = 0;

    for (const insight of response.data.data) {
      const date = insight.date_start;

      // Find associated requests based on ad metadata
      const { data: requests } = await supabase
        .from('requests')
        .select('id')
        .contains('metadata', { meta_ad_id: insight.ad_id });

      for (const request of (requests || [])) {
        // Store multiple metric types
        const metrics = [
          { type: 'impressions', value: insight.impressions },
          { type: 'clicks', value: insight.clicks },
          { type: 'spend', value: insight.spend },
          { type: 'reach', value: insight.reach },
          { type: 'cpm', value: insight.cpm },
          { type: 'cpc', value: insight.cpc },
          { type: 'ctr', value: insight.ctr }
        ];

        for (const metric of metrics) {
          // Upsert metrics (update if exists for same date)
          await supabase
            .from('performance_metrics')
            .upsert({
              request_id: request.id,
              platform: 'meta',
              metric_type: metric.type,
              value: metric.value,
              date,
              source: 'api_sync',
              source_detail: { ad_id: insight.ad_id, ad_name: insight.ad_name },
              sync_id: syncId
            }, {
              onConflict: 'request_id,platform,metric_type,date',
              ignoreDuplicates: false
            });

          metricsCreated++;
        }
      }
    }

    // Update sync log with success
    await supabase
      .from('metric_sync_logs')
      .update({
        status: 'success',
        end_time: new Date().toISOString(),
        metrics_created: metricsCreated
      })
      .eq('id', logId);

    // Update connection's last synced timestamp
    await supabase
      .from('platform_connections')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('id', connection.id);

    console.log(`✅ Synced ${metricsCreated} metrics from Meta Ads (${connection.account_name})`);

  } catch (error) {
    console.error(`❌ Error syncing Meta Ads for ${connection.account_name}:`, error.message);

    await supabase
      .from('metric_sync_logs')
      .update({
        status: 'failed',
        end_time: new Date().toISOString(),
        error_message: error.message
      })
      .eq('id', logId);
  }
}

// Google Ads sync (placeholder - similar pattern)
async function syncGoogleAdsMetrics(connection) {
  console.log(`ℹ️ Google Ads sync not yet implemented for ${connection.account_name}`);
  // Implement using Google Ads API
}

// Main sync loop
async function syncMetrics() {
  try {
    // Get all active platform connections that need syncing
    const now = new Date();

    const { data: connections, error } = await supabase
      .from('platform_connections')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching platform connections:', error);
      return;
    }

    for (const connection of connections) {
      // Check if sync is due
      const lastSync = connection.last_synced_at ? new Date(connection.last_synced_at) : new Date(0);
      const minutesSinceSync = (now - lastSync) / 1000 / 60;

      if (minutesSinceSync >= connection.sync_frequency) {
        console.log(`🔄 Syncing ${connection.platform} - ${connection.account_name}...`);

        switch (connection.platform) {
          case 'meta':
          case 'facebook':
            await syncMetaAdsMetrics(connection);
            break;
          case 'google_ads':
            await syncGoogleAdsMetrics(connection);
            break;
          default:
            console.log(`⚠️ Unknown platform: ${connection.platform}`);
        }
      }
    }

  } catch (error) {
    console.error('Error in metrics sync loop:', error);
  }
}

// Start the worker
console.log('🚀 Starting Metrics Sync Worker...');
setInterval(syncMetrics, 600000); // Run every 10 minutes
syncMetrics(); // Run immediately on start
```

#### Running the Worker

Same deployment options as notification worker (PM2, Docker, etc.).

---

## 3. Retention/Archival Worker

Create `workers/retention-worker.js`:

```javascript
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function performDataRetention() {
  console.log('🗄️ Starting data retention process...');

  try {
    // Get retention policies
    const { data: policies } = await supabase
      .from('retention_policies')
      .select('*');

    for (const policy of policies) {
      if (policy.entity_type === 'activity_log') {
        // Archive old activities
        const { data: count } = await supabase
          .rpc('archive_old_activities', {
            days_to_keep: policy.active_retention_days
          });

        console.log(`📦 Archived ${count} activity log entries`);

        // Purge old archived data
        const purgeDate = new Date();
        purgeDate.setDate(purgeDate.getDate() - policy.archive_retention_days);

        const { error } = await supabase
          .from('archived_activity_log')
          .delete()
          .lt('created_at', purgeDate.toISOString());

        if (error) {
          console.error('Error purging old archives:', error);
        } else {
          console.log(`🗑️ Purged archives older than ${policy.archive_retention_days} days`);
        }

        // Update policy
        await supabase
          .from('retention_policies')
          .update({
            last_archived_at: new Date().toISOString(),
            last_purged_at: new Date().toISOString()
          })
          .eq('id', policy.id);
      }

      // Handle other entity types similarly
      if (policy.entity_type === 'notification_queue') {
        const purgeDate = new Date();
        purgeDate.setDate(purgeDate.getDate() - policy.active_retention_days);

        await supabase
          .from('notification_queue')
          .delete()
          .lt('created_at', purgeDate.toISOString())
          .eq('is_processed', true);

        console.log(`🗑️ Purged processed notifications older than ${policy.active_retention_days} days`);
      }
    }

  } catch (error) {
    console.error('Error in retention process:', error);
  }
}

// Run weekly (every Sunday at 2 AM)
console.log('🚀 Starting Retention Worker...');
setInterval(performDataRetention, 604800000); // 7 days in milliseconds
performDataRetention(); // Run immediately on start
```

---

## 4. Deployment Strategies

### Option A: PM2 (Simple, Single Server)

```bash
# Install PM2 globally
npm install -g pm2

# Start all workers
pm2 start workers/notification-worker.js --name "notification-worker"
pm2 start workers/metrics-sync-worker.js --name "metrics-sync-worker"
pm2 start workers/retention-worker.js --name "retention-worker"

# Save configuration
pm2 save

# Setup auto-restart on server reboot
pm2 startup
```

### Option B: Docker Compose

Create `docker-compose.workers.yml`:

```yaml
version: '3.8'

services:
  notification-worker:
    build:
      context: .
      dockerfile: workers/Dockerfile.notification
    environment:
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - SLACK_BOT_TOKEN=${SLACK_BOT_TOKEN}
    restart: always

  metrics-sync-worker:
    build:
      context: .
      dockerfile: workers/Dockerfile.metrics
    environment:
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
    restart: always

  retention-worker:
    build:
      context: .
      dockerfile: workers/Dockerfile.retention
    environment:
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
    restart: always
```

### Option C: Cloud Services

**AWS ECS/Fargate:**
- Package each worker as a separate container
- Use CloudWatch Events to trigger retention worker
- Use Application Load Balancer health checks

**Google Cloud Run:**
- Deploy as scheduled jobs using Cloud Scheduler
- Use Cloud Pub/Sub for queue-based processing

**Render/Railway:**
- Deploy as background workers
- Use cron jobs for scheduled tasks

---

## 5. Monitoring & Logging

### Health Checks

Add health check endpoints to each worker:

```javascript
import express from 'express';

const app = express();
let lastProcessedAt = new Date();

app.get('/health', (req, res) => {
  const minutesSinceLastProcess = (new Date() - lastProcessedAt) / 1000 / 60;
  
  if (minutesSinceLastProcess < 5) {
    res.status(200).json({ status: 'healthy', lastProcessedAt });
  } else {
    res.status(503).json({ status: 'unhealthy', lastProcessedAt });
  }
});

app.listen(3001);
```

### Logging

Consider integrating with logging services:
- **Sentry** for error tracking
- **DataDog** or **New Relic** for APM
- **CloudWatch Logs** or **Stackdriver** for cloud deployments

---

## Next Steps

1. ✅ Deploy the database schema using Supabase CLI
2. ✅ Create the worker service files
3. ✅ Configure environment variables
4. ✅ Set up Slack app and obtain bot token
5. ✅ Connect advertising platform accounts
6. ✅ Deploy workers using your preferred method
7. ✅ Set up monitoring and alerts

---

## Troubleshooting

**Notifications not sending:**
- Check Slack bot token is valid
- Ensure bot has `chat:write` scope
- Verify bot is added to target channels

**Metrics not syncing:**
- Check platform API credentials
- Verify account IDs are correct
- Check API rate limits and quotas

**Workers crashing:**
- Check environment variables are set
- Review logs for errors
- Ensure Supabase connection is stable
