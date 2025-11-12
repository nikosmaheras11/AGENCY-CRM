# Database Schema - Quick Reference

> **Full Documentation:** See [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for complete details

---

## ✅ Current Status

- **Database:** Supabase PostgreSQL
- **Project ID:** vzhthefdgumjkhnjpydt
- **Tables:** 30 (all verified ✅)
- **Schema Version:** 2.0 (Video Versioning + Slack Integration)
- **Last Verified:** January 12, 2025

---

## 🎯 Core Architecture

### Request-Centric Model
Everything flows through the **`requests`** table:
- `request_type`: 'creative', 'performance', or 'project'
- Each request can have: assets, comments, tasks, metrics, videos

### Status State Machine
```
new_request → in_progress → needs_review → completed
                  ↓              ↓
              needs_edit ←-------┘
```

---

## 📊 Key Tables

| Table | Purpose | Key Features |
|-------|---------|--------------|
| **requests** | Core work items | Status workflow, priority, assignments |
| **assets** | File attachments | Auto-versioning, rollback support |
| **comments** | Feedback system | Threading, positioned comments |
| **video_versions** | Video uploads | Frame-accurate timecode comments |
| **timecode_comments** | Video feedback | Millisecond precision, reactions |
| **slack_messages** | Slack archive | @mention tracking, bidirectional sync |
| **performance_metrics** | Campaign data | Multi-platform, API sync support |
| **automation_rules** | Workflows | Trigger-based automation |

---

## 🔥 Real-Time Tables

These tables support WebSocket subscriptions:
- `requests`
- `assets`
- `comments`
- `project_tasks`
- `video_versions`
- `timecode_comments`
- `slack_messages`
- `user_mentions`

---

## 🚀 Quick Start

### Query Examples

```javascript
import { useSupabase } from '~/composables/useSupabase'

const { supabase } = useSupabase()

// Get all active requests
const { data: requests } = await supabase
  .from('requests')
  .select('*, client:clients(*), assigned:profiles(*)')
  .eq('status', 'in_progress')

// Create request with tags
const { data: newRequest } = await supabase
  .from('requests')
  .insert({
    title: 'New Campaign',
    request_type: 'creative',
    status: 'new_request',
    priority: 'high'
  })
  .select()
  .single()

// Subscribe to comments
supabase
  .channel('comments')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'comments',
    filter: `request_id=eq.${requestId}`
  }, (payload) => {
    console.log('New comment:', payload)
  })
  .subscribe()

// Upload video and add timecode comment
const { data: version } = await supabase
  .from('video_versions')
  .select()
  .eq('video_asset_id', videoId)
  .single()

await supabase
  .from('timecode_comments')
  .insert({
    video_version_id: version.id,
    timecode_seconds: 45.250, // 45.25 seconds
    content: 'Update logo here',
    author_id: userId
  })
```

---

## 🔐 Row Level Security (RLS)

**Default Policies:**
- ✅ Everyone can **view** all requests, assets, comments
- ✅ Users can **create** requests, assets, comments (as themselves)
- ✅ Users can **update** their own items or assigned requests
- ✅ Users can **delete** only their own items

**Slack Tables:**
- Users can only see messages where they're mentioned

---

## 🛠️ Maintenance Commands

### Verify Schema
```bash
node scripts/verify-schema.js
```

### Archive Old Activities
```sql
SELECT archive_old_activities(90); -- Keep 90 days
```

### Find Slow Queries
```sql
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### Rollback Asset Version
```sql
SELECT set_asset_version_as_current('asset-uuid-here');
```

---

## 📈 Scaling Checklist

**Before Production:**
- [ ] Enable connection pooling
- [ ] Set up performance monitoring
- [ ] Configure automated backups
- [ ] Add schema validation to CI/CD

**When Traffic Grows:**
- [ ] Add materialized views for dashboards (>100k requests)
- [ ] Partition activity_log (>10M rows)
- [ ] Consider read replicas (>70% CPU)

**Optional Enhancements:**
- [ ] Full-text search across requests/comments
- [ ] Real-time presence indicators
- [ ] Advanced analytics with custom metrics

---

## 🔗 Related Files

- **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** - Complete schema documentation
- **[scripts/verify-schema.js](./scripts/verify-schema.js)** - Schema verification script
- **[supabase/migrations/](./supabase/migrations/)** - SQL migration files
- **[composables/useSupabase.ts](./composables/useSupabase.ts)** - Supabase client composable

---

## 📞 Support

- **Supabase Dashboard:** https://supabase.com/dashboard/project/vzhthefdgumjkhnjpydt
- **API URL:** https://vzhthefdgumjkhnjpydt.supabase.co
- **Documentation:** [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)

---

## 🎓 Key Concepts

### Versioning
- Assets automatically version when `storage_path` changes
- All versions retained with `is_current_version` flag
- Rollback anytime with `set_asset_version_as_current()`

### Automation
- Trigger-based rules execute on events (comment, tag, status change)
- Conditions: role, content, timing
- Actions: assign user, change status, send notification

### Slack Integration
- Bidirectional sync between Slack and dashboard
- @mentions tracked in `user_mentions` table
- Messages can become requests via `slack_message_requests`

### Video System
- `video_assets` = project (e.g., "Campaign Video")
- `video_versions` = each upload/revision
- `timecode_comments` = frame-accurate feedback with millisecond precision

---

**Last Updated:** January 12, 2025
