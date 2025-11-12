# Agency Dashboard OS - Database Schema Documentation

**Last Updated:** January 12, 2025  
**Database:** PostgreSQL (Supabase)  
**Project ID:** vzhthefdgumjkhnjpydt

---

## Overview

The Agency Dashboard OS uses a **dual-backend architecture**:
1. **Supabase** (Primary) - Modern PostgreSQL database with real-time capabilities, authentication, and storage
2. **Directus** (Legacy/Optional) - Headless CMS for content management (being phased out in favor of Supabase)

This document focuses on the **Supabase schema**, which is the primary database for all core functionality.

---

## Architecture Philosophy

### Design Principles
- **Request-Centric Model**: All work revolves around `requests` (creative, performance, or project)
- **Version Control Built-In**: Native support for asset versioning and change tracking
- **Real-Time First**: All critical tables support real-time subscriptions
- **Audit Trail**: Complete activity logging and status history
- **Flexible Automation**: Rule-based workflow automation with custom conditions

### Status Workflow
All requests follow a **strict state machine** with enforced transitions:

```
new_request → in_progress → needs_review → completed
                    ↓             ↓
                needs_edit ←------┘
                    ↓
                in_progress (can reopen)
```

---

## Core Tables

### 1. **profiles** (User Management)
Extends Supabase Auth with agency-specific user data.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | References `auth.users` - Supabase managed auth |
| `first_name` | VARCHAR(100) | User's first name |
| `last_name` | VARCHAR(100) | User's last name |
| `avatar_url` | VARCHAR(255) | Profile picture URL |
| `role` | VARCHAR(50) | User role: 'admin', 'user', 'client' |
| `slack_id` | VARCHAR(255) | Unique Slack user ID for integration |
| `slack_access_token` | TEXT | OAuth token for Slack API calls |
| `slack_notification_preferences` | JSONB | Custom notification settings |
| `created_at` | TIMESTAMPTZ | Account creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last profile update |

**Key Features:**
- Directly integrates with Supabase Auth (`auth.users`)
- Unique Slack ID for bidirectional sync
- Stores OAuth tokens securely for user-specific Slack operations

---

### 2. **clients** (Client Management)
Agency client organizations.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique client identifier |
| `name` | VARCHAR(255) | Client company name |
| `logo_url` | VARCHAR(255) | Client logo (Supabase Storage URL) |
| `primary_contact_name` | VARCHAR(255) | Main point of contact |
| `primary_contact_email` | VARCHAR(255) | Contact email |
| `primary_contact_phone` | VARCHAR(50) | Contact phone |
| `status` | VARCHAR(50) | 'active', 'inactive', 'archived' |
| `created_at` | TIMESTAMPTZ | Client onboarding date |
| `updated_at` | TIMESTAMPTZ | Last client data update |

---

### 3. **requests** (Core Work Items)
The **central table** - all agency work items across all boards.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique request identifier |
| `title` | VARCHAR(255) | Request title/name |
| `description` | TEXT | Detailed request description |
| `client_id` | UUID (FK) | References `clients.id` |
| `request_type` | VARCHAR(50) | **'creative', 'performance', 'project'** |
| `status` | request_status (ENUM) | Current status (see state machine) |
| `priority` | request_priority (ENUM) | 'low', 'medium', 'high', 'urgent' |
| `due_date` | TIMESTAMPTZ | Deadline for completion |
| `created_at` | TIMESTAMPTZ | Request creation time |
| `updated_at` | TIMESTAMPTZ | Last update time |
| `created_by` | UUID (FK) | References `auth.users.id` |
| `assigned_to` | UUID (FK) | References `auth.users.id` |
| `metadata` | JSONB | Flexible metadata storage |

**Enums:**
- `request_status`: `new_request`, `in_progress`, `needs_review`, `needs_edit`, `completed`
- `request_priority`: `low`, `medium`, `high`, `urgent`

**Key Features:**
- **Type-based routing**: Single table for all work types (creative/performance/project)
- **Enforced status transitions**: Database triggers validate state changes
- **Automatic audit trail**: All status changes logged to `status_history`

---

### 4. **assets** (File Management & Versioning)
Files attached to requests with **built-in version control**.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique asset identifier |
| `request_id` | UUID (FK) | Parent request |
| `name` | VARCHAR(255) | Asset name/title |
| `file_type` | VARCHAR(50) | 'image', 'video', 'figma', 'document' |
| `original_filename` | VARCHAR(255) | Original uploaded filename |
| `storage_path` | VARCHAR(255) | Supabase Storage path |
| `preview_url` | VARCHAR(255) | Preview/thumbnail URL |
| `thumbnail_url` | VARCHAR(255) | Smaller thumbnail |
| `embed_url` | VARCHAR(255) | Figma/external embed URL |
| `metadata` | JSONB | File metadata (dimensions, duration, etc.) |
| `version_number` | INTEGER | Version number (auto-incremented) |
| `is_current_version` | BOOLEAN | TRUE for latest version |
| `parent_asset_id` | UUID (FK) | References root asset for versioning |
| `version_notes` | TEXT | Change description for this version |
| `version_type` | VARCHAR(50) | 'auto' or 'manual' |
| `created_at` | TIMESTAMPTZ | Upload timestamp |
| `created_by` | UUID (FK) | Uploader user ID |

**Versioning Logic:**
- When an asset's `storage_path` is updated, a **trigger automatically creates a new version**
- All previous versions set `is_current_version = FALSE`
- `parent_asset_id` links versions to the root asset
- Can rollback to any version using `set_asset_version_as_current(asset_id)`

---

### 5. **comments** (Feedback System)
Comments on requests and assets with **threading and positioning**.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique comment ID |
| `request_id` | UUID (FK) | Parent request |
| `asset_id` | UUID (FK) | Specific asset (optional) |
| `user_id` | UUID (FK) | Comment author |
| `content` | TEXT | Comment text |
| `parent_comment_id` | UUID (FK) | For threaded replies |
| `created_at` | TIMESTAMPTZ | Comment creation time |
| `updated_at` | TIMESTAMPTZ | Last edit time |
| `position_x` | FLOAT | X coordinate (for positioned comments) |
| `position_y` | FLOAT | Y coordinate (for positioned comments) |
| `is_resolved` | BOOLEAN | Resolution status |

**Key Features:**
- **Threaded discussions**: `parent_comment_id` creates reply chains
- **Positioned feedback**: `position_x/y` for frame-accurate comments on images/videos
- **Automation trigger**: New comments can trigger workflow automations

---

## Video Versioning System

### 6. **video_assets** (Video Master Records)
Master record for each video project (not individual uploads).

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique video project ID |
| `title` | TEXT | Video title |
| `description` | TEXT | Project description |
| `project_id` | UUID (FK) | Links to `requests` table |
| `current_version_id` | UUID (FK) | Points to active version |
| `created_at` | TIMESTAMPTZ | Project creation |
| `updated_at` | TIMESTAMPTZ | Last update |
| `created_by` | UUID (FK) | Project creator |
| `deleted_at` | TIMESTAMPTZ | Soft delete timestamp |

---

### 7. **video_versions** (Video Uploads)
Each video upload/revision within a video project.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique version ID |
| `video_asset_id` | UUID (FK) | Parent video project |
| `version_number` | INTEGER | Auto-incremented version |
| `version_label` | TEXT | Human label ('v1', 'Final', etc.) |
| `file_url` | TEXT | Supabase Storage URL |
| `file_size_bytes` | BIGINT | File size |
| `mime_type` | TEXT | Video MIME type |
| `duration_seconds` | DECIMAL(10,3) | Video duration (millisecond precision) |
| `width` | INTEGER | Video width in pixels |
| `height` | INTEGER | Video height |
| `frame_rate` | DECIMAL(5,2) | FPS (29.97, 30, 60, etc.) |
| `codec` | TEXT | Video codec |
| `bitrate` | INTEGER | Video bitrate |
| `poster_url` | TEXT | Main thumbnail |
| `thumbnails_sprite_url` | TEXT | Sprite sheet for scrubbing |
| `thumbnails_vtt_url` | TEXT | WebVTT timeline thumbnails |
| `processing_status` | TEXT | 'pending', 'processing', 'completed', 'failed' |
| `created_at` | TIMESTAMPTZ | Upload time |
| `uploaded_by` | UUID (FK) | Uploader |
| `change_notes` | TEXT | Version change description |

**Unique Constraint:** `(video_asset_id, version_number)`

---

### 8. **timecode_comments** (Frame-Accurate Video Comments)
Comments pinned to specific timecodes in videos.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique comment ID |
| `video_version_id` | UUID (FK) | Specific video version |
| `timecode_seconds` | DECIMAL(10,3) | Exact timestamp (millisecond precision) |
| `content` | TEXT | Comment text |
| `author_id` | UUID (FK) | Author user ID |
| `author_name` | TEXT | Denormalized author name |
| `author_avatar_url` | TEXT | Denormalized avatar |
| `parent_comment_id` | UUID (FK) | For threaded replies |
| `thread_root_id` | UUID (FK) | Root comment of thread |
| `status` | TEXT | 'active', 'resolved', 'archived', 'deleted' |
| `resolved_at` | TIMESTAMPTZ | Resolution timestamp |
| `resolved_by` | UUID (FK) | User who resolved |
| `reactions` | JSONB | Emoji reactions array |
| `created_at` | TIMESTAMPTZ | Comment creation |
| `updated_at` | TIMESTAMPTZ | Last edit |
| `edited_at` | TIMESTAMPTZ | Edit timestamp |
| `is_internal` | BOOLEAN | Internal vs client-facing |
| `attachments` | JSONB | File attachments array |

**Example Reactions JSONB:**
```json
[
  {"emoji": "👍", "user_id": "uuid", "created_at": "2025-01-12T..."},
  {"emoji": "🎉", "user_id": "uuid", "created_at": "2025-01-12T..."}
]
```

---

### 9. **comment_mentions** (Video Comment @mentions)
Tracks @mentions in timecode comments for notifications.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique mention ID |
| `comment_id` | UUID (FK) | Parent comment |
| `mentioned_user_id` | UUID (FK) | User mentioned |
| `created_at` | TIMESTAMPTZ | Mention timestamp |

**Unique Constraint:** `(comment_id, mentioned_user_id)`

---

### 10. **comment_notifications** (Video Comment Notifications)
Notification queue for comment events.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique notification ID |
| `user_id` | UUID (FK) | Recipient |
| `comment_id` | UUID (FK) | Related comment |
| `notification_type` | TEXT | 'mention', 'reply', 'resolved', 'new_on_thread' |
| `read_at` | TIMESTAMPTZ | When read (NULL = unread) |
| `created_at` | TIMESTAMPTZ | Notification creation |

---

### 11. **video_playback_sessions** (Video Analytics)
Track who watched what and how far they got.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique session ID |
| `video_version_id` | UUID (FK) | Video watched |
| `user_id` | UUID (FK) | Viewer |
| `started_at` | TIMESTAMPTZ | Session start |
| `last_position_seconds` | DECIMAL(10,3) | Last playback position |
| `completed` | BOOLEAN | Watched to end |
| `updated_at` | TIMESTAMPTZ | Last position update |

---

## Slack Integration Tables

### 12. **slack_messages** (Slack Message Archive)
Stores Slack messages containing @mentions.

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT (PK) | Slack message timestamp (unique ID) |
| `channel_id` | TEXT | Slack channel ID |
| `channel_name` | TEXT | Channel name |
| `user_id` | TEXT | Slack user ID |
| `user_name` | TEXT | Slack username |
| `text` | TEXT | Message content |
| `timestamp` | TIMESTAMPTZ | Message time |
| `permalink` | TEXT | Slack permalink |
| `thread_ts` | TEXT | Thread timestamp |
| `is_thread_reply` | BOOLEAN | Is this a reply? |
| `parent_message_id` | TEXT | Parent message ID |
| `reactions` | JSONB | Emoji reactions |
| `mentions` | JSONB | Array of mentioned users |
| `created_at` | TIMESTAMPTZ | DB insert time |
| `updated_at` | TIMESTAMPTZ | Last update |

---

### 13. **user_mentions** (Slack Mention Tracking)
Tracks which users are mentioned in Slack messages.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique mention ID |
| `message_id` | TEXT (FK) | References `slack_messages.id` |
| `user_slack_id` | TEXT (FK) | References `profiles.slack_id` |
| `is_read` | BOOLEAN | Read status |
| `read_at` | TIMESTAMPTZ | When marked read |
| `created_at` | TIMESTAMPTZ | Mention timestamp |

**Foreign Keys:**
- Links to `profiles` via `slack_id` (not UUID!)
- Automatically sets `read_at` when `is_read` changes to TRUE

---

### 14. **slack_connected_channels** (Channel Configuration)
Configure which Slack channels receive notifications per request type.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique config ID |
| `request_type` | VARCHAR(50) | 'creative', 'performance', 'project', NULL (all) |
| `channel_id` | VARCHAR(255) | Slack channel ID |
| `channel_name` | VARCHAR(255) | Channel name |
| `notification_types` | JSONB | Array of event types to notify |
| `created_at` | TIMESTAMPTZ | Config creation |
| `updated_at` | TIMESTAMPTZ | Last update |

**Unique Constraint:** `(request_type, channel_id)`

---

### 15. **slack_message_requests** (Slack→Request Mapping)
Maps Slack messages that became requests.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique mapping ID |
| `request_id` | UUID (FK) | Created request |
| `slack_channel_id` | VARCHAR(255) | Source channel |
| `slack_thread_ts` | VARCHAR(255) | Thread timestamp |
| `slack_message_ts` | VARCHAR(255) | Message timestamp |
| `slack_user_id` | VARCHAR(255) | Requester Slack ID |
| `message_content` | TEXT | Original message |
| `created_at` | TIMESTAMPTZ | Mapping creation |

---

### 16. **slack_comment_threads** (Slack↔Comment Sync)
Maps Slack threads to request comments for bidirectional sync.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique mapping ID |
| `request_id` | UUID (FK) | Parent request |
| `comment_id` | UUID (FK) | Dashboard comment |
| `slack_channel_id` | VARCHAR(255) | Slack channel |
| `slack_thread_ts` | VARCHAR(255) | Slack thread timestamp |
| `slack_parent_ts` | VARCHAR(255) | Parent message |
| `last_synced_at` | TIMESTAMPTZ | Last sync time |

**Unique Constraint:** `(slack_channel_id, slack_thread_ts)`

---

## Performance & Analytics Tables

### 17. **performance_metrics** (Campaign Analytics)
Granular metrics for performance campaigns.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique metric ID |
| `asset_id` | UUID (FK) | Related asset (optional) |
| `request_id` | UUID (FK) | Parent request |
| `platform` | VARCHAR(50) | 'facebook', 'instagram', 'google', etc. |
| `metric_type` | VARCHAR(50) | 'impressions', 'clicks', 'conversions', etc. |
| `value` | NUMERIC | Metric value |
| `date` | DATE | Metric date |
| `source` | VARCHAR(50) | 'api_sync', 'manual_entry' |
| `source_detail` | JSONB | API details or manual entry info |
| `sync_id` | UUID | Groups metrics from same sync batch |
| `created_at` | TIMESTAMPTZ | Record creation |
| `updated_at` | TIMESTAMPTZ | Last update |

---

### 18. **platform_connections** (Third-Party API Config)
Store API credentials for auto-syncing metrics.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique connection ID |
| `platform` | VARCHAR(50) | Platform name |
| `credentials` | JSONB | Encrypted API credentials |
| `account_id` | VARCHAR(255) | Platform account ID |
| `account_name` | VARCHAR(255) | Account name |
| `is_active` | BOOLEAN | Active status |
| `last_synced_at` | TIMESTAMPTZ | Last successful sync |
| `sync_frequency` | INTEGER | Minutes between syncs (default: 1440) |
| `created_at` | TIMESTAMPTZ | Connection creation |
| `created_by` | UUID (FK) | User who connected |

---

### 19. **metric_sync_logs** (Sync Audit Trail)
Logs of automatic metric sync operations.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique log ID |
| `platform_connection_id` | UUID (FK) | Connection used |
| `status` | VARCHAR(50) | 'success', 'partial', 'failed' |
| `start_time` | TIMESTAMPTZ | Sync start |
| `end_time` | TIMESTAMPTZ | Sync end |
| `metrics_updated` | INTEGER | Count of updated metrics |
| `metrics_created` | INTEGER | Count of new metrics |
| `error_message` | TEXT | Error details (if failed) |
| `details` | JSONB | Additional sync details |

---

## Tagging & Taxonomy

### 20. **tags** (Flexible Tagging System)
Centralized tags for categorizing work.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique tag ID |
| `name` | VARCHAR(100) | Tag name |
| `color` | VARCHAR(20) | Hex color code |
| `board_type` | VARCHAR(50) | 'creative', 'performance', 'project' |
| `category` | VARCHAR(50) | 'client', 'department', 'campaign', etc. |
| `description` | VARCHAR(255) | Tag description |

---

### 21. **request_tags** (Many-to-Many Tagging)
Junction table linking requests to tags.

| Column | Type | Description |
|--------|------|-------------|
| `request_id` | UUID (FK) | Request |
| `tag_id` | UUID (FK) | Tag |

**Primary Key:** `(request_id, tag_id)`

---

## Project Management

### 22. **project_tasks** (Task Breakdown)
Subtasks and checklists within requests.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique task ID |
| `request_id` | UUID (FK) | Parent request |
| `title` | VARCHAR(255) | Task title |
| `description` | TEXT | Task details |
| `status` | VARCHAR(50) | 'todo', 'in_progress', 'done' |
| `due_date` | TIMESTAMPTZ | Task deadline |
| `assigned_to` | UUID (FK) | Assignee |
| `sort_order` | INTEGER | Display order |
| `parent_task_id` | UUID (FK) | For subtasks |
| `created_at` | TIMESTAMPTZ | Task creation |
| `updated_at` | TIMESTAMPTZ | Last update |

**Key Feature:** Hierarchical tasks via `parent_task_id`

---

## Automation & Workflows

### 23. **automation_rule_templates** (Rule Presets)
Pre-built automation rule templates.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique template ID |
| `name` | VARCHAR(255) | Template name |
| `description` | TEXT | Template description |
| `trigger_type` | VARCHAR(50) | Trigger event type |
| `condition_template` | JSONB | Condition JSON schema |
| `action_type` | VARCHAR(50) | Action to execute |
| `action_template` | JSONB | Action parameters |
| `ui_schema` | JSONB | Form generation config |
| `icon` | VARCHAR(50) | Icon/emoji |
| `created_at` | TIMESTAMPTZ | Template creation |

**Seeded Templates:**
- Auto-assign on comment
- Status change on tag
- Due date reminder
- Inactivity alert

---

### 24. **automation_rules** (Active Automation Rules)
User-configured or custom automation rules.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique rule ID |
| `request_type` | VARCHAR(50) | Target request type (NULL = all) |
| `name` | VARCHAR(255) | Rule name |
| `description` | TEXT | Rule description |
| `template_id` | UUID (FK) | Base template (if used) |
| `is_custom` | BOOLEAN | Custom vs template-based |
| `trigger_type` | VARCHAR(50) | 'created', 'commented', 'tagged', etc. |
| `trigger_conditions` | JSONB | Conditions to match |
| `action_type` | VARCHAR(50) | 'change_status', 'assign_user', etc. |
| `action_parameters` | JSONB | Action parameters |
| `is_active` | BOOLEAN | Active status |
| `priority` | INTEGER | Execution order (lower = first) |
| `created_at` | TIMESTAMPTZ | Rule creation |
| `created_by` | UUID (FK) | Rule creator |

**Trigger Example:**
```json
{
  "required_role": "admin",
  "content_contains": "urgent"
}
```

**Action Example:**
```json
{
  "status": "in_progress",
  "assign_to": "{{commenter}}"
}
```

---

### 25. **notification_config** (Notification Templates)
Define notification templates for events.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique config ID |
| `entity_type` | VARCHAR(50) | 'request', 'asset', 'comment', etc. |
| `event_type` | VARCHAR(50) | 'status_change', 'comment_added', etc. |
| `channel_id` | VARCHAR(255) | Slack channel ID (optional) |
| `user_id` | UUID (FK) | Direct message user (optional) |
| `is_active` | BOOLEAN | Active status |
| `template` | TEXT | Message template with {{placeholders}} |
| `created_at` | TIMESTAMPTZ | Config creation |

**Template Example:**
```
🔄 Request *{{request_title}}* status changed from `{{old_status}}` to `{{new_status}}`
```

---

### 26. **notification_queue** (Notification Processing Queue)
Queued notifications with retry logic.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique queue ID |
| `config_id` | UUID (FK) | Notification config used |
| `entity_id` | UUID | Related entity ID |
| `entity_type` | VARCHAR(50) | Entity type |
| `event_data` | JSONB | Event data for template |
| `is_processed` | BOOLEAN | Processing status |
| `attempts` | INTEGER | Retry count |
| `max_attempts` | INTEGER | Max retries (default: 5) |
| `next_attempt_at` | TIMESTAMPTZ | Next retry time |
| `last_error` | TEXT | Last error message |
| `created_at` | TIMESTAMPTZ | Queue time |
| `processed_at` | TIMESTAMPTZ | Processing time |

---

## Audit & History Tables

### 27. **status_history** (Status Change Audit Trail)
Complete history of all status changes.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique history ID |
| `request_id` | UUID (FK) | Request |
| `old_status` | request_status | Previous status |
| `new_status` | request_status | New status |
| `changed_by` | UUID (FK) | User who changed |
| `changed_at` | TIMESTAMPTZ | Change timestamp |
| `comments` | TEXT | Change reason/notes |

**Automatically populated by trigger on `requests` updates**

---

### 28. **activity_log** (General Activity Feed)
Universal activity tracking across all entities.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique log ID |
| `user_id` | UUID (FK) | User who performed action |
| `entity_type` | VARCHAR(50) | 'request', 'asset', 'comment', etc. |
| `entity_id` | UUID | Entity ID |
| `action` | VARCHAR(50) | 'create', 'update', 'delete', 'status_change' |
| `details` | JSONB | Change details |
| `created_at` | TIMESTAMPTZ | Action timestamp |

---

### 29. **archived_activity_log** (Activity Archive)
Long-term storage for old activity logs.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Original log ID |
| `user_id` | UUID | User ID |
| `entity_type` | VARCHAR(50) | Entity type |
| `entity_id` | UUID | Entity ID |
| `action` | VARCHAR(50) | Action type |
| `details` | JSONB | Change details |
| `created_at` | TIMESTAMPTZ | Original timestamp |
| `archived_at` | TIMESTAMPTZ | Archive timestamp |

**Automatic Archival:** `archive_old_activities(days_to_keep)` function

---

### 30. **retention_policies** (Data Retention Config)
Configure data retention and archival rules.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique policy ID |
| `entity_type` | VARCHAR(50) | Entity type |
| `active_retention_days` | INTEGER | Days before archiving |
| `archive_retention_days` | INTEGER | Days before deletion |
| `last_archived_at` | TIMESTAMPTZ | Last archive run |
| `last_purged_at` | TIMESTAMPTZ | Last purge run |
| `created_at` | TIMESTAMPTZ | Policy creation |
| `updated_at` | TIMESTAMPTZ | Last update |

**Default Policies:**
- `activity_log`: 90 days active, 365 days archived
- `notification_queue`: 30 days active, 90 days archived

---

## Database Functions

### Status Management
- `set_default_request_status()` - Ensures all new requests start with 'new_request'
- `check_status_transition()` - Validates status state machine transitions
- `log_status_change()` - Automatically logs status changes to history table

### Notification Processing
- `queue_status_notification()` - Queues notifications on status change
- `lock_and_get_notifications(batch_size)` - Gets notifications for processing with row-level locking

### Asset Versioning
- `handle_asset_versioning()` - Automatically creates new version on storage path change
- `set_asset_version_as_current(asset_id)` - Rolls back to specific version

### Automation
- `process_comment_automation()` - Executes automation rules when comments are created

### Video Comments
- `get_video_comments(video_version_id)` - Retrieves all comments for a video with reply counts
- `get_comment_thread(thread_root_id)` - Retrieves threaded comment tree

### Slack Integration
- `get_unread_mention_count(user_id)` - Gets unread mention count for user
- `mark_all_mentions_read(user_id)` - Marks all mentions as read for user

### Data Management
- `archive_old_activities(days_to_keep)` - Archives old activity log records

---

## Indexes & Performance Optimization

### Critical Indexes
```sql
-- Requests (high-traffic queries)
CREATE INDEX requests_type_idx ON requests(request_type);
CREATE INDEX requests_status_idx ON requests(status);
CREATE INDEX requests_assigned_idx ON requests(assigned_to);

-- Assets (version queries)
CREATE INDEX assets_versioning_idx ON assets(parent_asset_id);
CREATE INDEX assets_current_version_idx ON assets(is_current_version) WHERE is_current_version = TRUE;

-- Comments (real-time lookups)
CREATE INDEX comments_request_idx ON comments(request_id);
CREATE INDEX comments_asset_idx ON comments(asset_id);

-- Timecode comments (video playback)
CREATE INDEX idx_timecode_comments_timecode ON timecode_comments(video_version_id, timecode_seconds);

-- Notification queue (background processing)
CREATE INDEX notification_queue_processing_idx ON notification_queue(is_processed, next_attempt_at) WHERE is_processed = FALSE;

-- Activity log (archival queries)
CREATE INDEX activity_created_idx ON activity_log(created_at);
```

---

## Row Level Security (RLS) Policies

### Profiles
- ✅ **SELECT**: All users can view all profiles
- ✅ **UPDATE**: Users can update own profile

### Requests
- ✅ **SELECT**: All users can view all requests
- ✅ **INSERT**: Users can create requests (as `created_by`)
- ✅ **UPDATE**: Users can update own requests or assigned requests
- ✅ **DELETE**: Users can delete own requests

### Assets
- ✅ **SELECT**: All users can view all assets
- ✅ **INSERT**: Users can upload assets (as `created_by`)
- ✅ **UPDATE**: Users can update own assets

### Comments
- ✅ **SELECT**: All users can view all comments
- ✅ **INSERT**: Users can create comments (as `user_id`)
- ✅ **UPDATE**: Users can update own comments
- ✅ **DELETE**: Users can delete own comments

### Slack Messages & Mentions
- ✅ **SELECT**: Users can only view messages where they're mentioned
- ✅ **UPDATE**: Users can mark own mentions as read

---

## Real-Time Subscriptions

The following tables have **REPLICA IDENTITY FULL** enabled for real-time:
- `requests`
- `assets`
- `comments`
- `project_tasks`
- `slack_messages`
- `user_mentions`
- `video_assets`
- `video_versions`
- `timecode_comments`

---

## Data Relationships

### Primary Relationships
```
clients
  └── requests (1:many)
        ├── assets (1:many)
        │     └── assets (versioning, 1:many via parent_asset_id)
        ├── comments (1:many)
        ├── project_tasks (1:many)
        ├── performance_metrics (1:many)
        ├── video_assets (1:many)
        │     └── video_versions (1:many)
        │           └── timecode_comments (1:many)
        └── request_tags (many:many via tags)

profiles (extends auth.users)
  ├── requests.created_by (1:many)
  ├── requests.assigned_to (1:many)
  ├── comments.user_id (1:many)
  ├── slack_id → user_mentions (1:many)
  └── automation_rules.created_by (1:many)
```

---

## Migration Notes

### From Directus to Supabase
The system was originally designed with Directus but is migrating to Supabase. Key differences:

| Feature | Directus | Supabase |
|---------|----------|----------|
| Auth | Custom system | Built-in `auth.users` |
| File Storage | Directus Files | Supabase Storage |
| Real-time | Flows & Webhooks | Native WebSocket subscriptions |
| API | REST/GraphQL | PostgREST + custom functions |
| Permissions | Directus Roles | PostgreSQL RLS |

**Current State:** Both systems operational, with Supabase as primary

---

## Environment Variables

### Required Supabase Configuration
```env
SUPABASE_URL=https://vzhthefdgumjkhnjpydt.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... # Server-side only
SUPABASE_PUBLISHABLE_KEY=sb_publishable_... # For specific integrations
SUPABASE_SECRET_KEY=sb_secret_... # For specific integrations
```

---

## Best Practices

### 1. **Always Use Transactions for Multi-Step Operations**
```sql
BEGIN;
  -- Update request status
  -- Insert status history
  -- Queue notification
COMMIT;
```

### 2. **Leverage JSONB for Flexible Metadata**
Don't create new columns for one-off fields. Use `metadata`, `details`, or entity-specific JSONB columns.

### 3. **Use Automation Rules Instead of Custom Triggers**
Prefer `automation_rules` table over custom triggers for business logic - easier to debug and manage.

### 4. **Archive Regularly**
Run `archive_old_activities(90)` monthly to keep activity log performant.

### 5. **Monitor Notification Queue**
Set up alerts if `notification_queue` has unprocessed items older than 1 hour.

---

## Support & Maintenance

### Database Access
- **Admin Panel**: https://supabase.com/dashboard/project/vzhthefdgumjkhnjpydt
- **Direct Connection**: `postgres://postgres:[PASSWORD]@db.vzhthefdgumjkhnjpydt.supabase.co:6543/postgres`
- **API URL**: `https://vzhthefdgumjkhnjpydt.supabase.co`

### Monitoring
- Check `metric_sync_logs` for API sync health
- Monitor `notification_queue.attempts` for retry failures
- Review `activity_log` growth rate for archival planning

---

## Schema Version
**Version:** 2.0 (Video Versioning + Slack Integration)  
**Last Migration:** `20251111170928_video_versioning.sql`  
**Last Verified:** January 12, 2025 ✅ All 30 tables confirmed in Supabase  
**Schema Files:**
- `/supabase/migrations/20250110_complete_schema.sql` (Base schema)
- `/supabase/migrations/20251111170928_video_versioning.sql` (Video system)
- `/supabase/migrations/20250111_slack_mentions.sql` (Slack integration)

---

## 📝 Future Enhancements

While the current schema is production-ready, consider these optimizations as your project scales:

### 1. **Database Partitioning for Activity Log**
**When:** Activity log exceeds 10 million rows or queries become slow

```sql
-- Partition activity_log by month for better performance
CREATE TABLE activity_log_partitioned (
  LIKE activity_log INCLUDING ALL
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE activity_log_2025_01 PARTITION OF activity_log_partitioned
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE activity_log_2025_02 PARTITION OF activity_log_partitioned
  FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
-- Continue for each month...

-- Set up automatic partition creation using pg_partman extension
```

**Benefits:**
- Faster queries on recent activity
- Easier data archival (drop old partitions)
- Better index performance

---

### 2. **Materialized Views for Dashboard Metrics**
**When:** Dashboard queries take >2 seconds or you have >100k requests

```sql
-- Materialized view for request statistics by type and status
CREATE MATERIALIZED VIEW request_stats_by_type AS
SELECT 
  request_type,
  status,
  priority,
  COUNT(*) as count,
  AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) as avg_completion_time_seconds,
  COUNT(*) FILTER (WHERE due_date < NOW()) as overdue_count
FROM requests
WHERE created_at > NOW() - INTERVAL '90 days'
GROUP BY request_type, status, priority;

-- Create index on materialized view
CREATE INDEX idx_request_stats_type ON request_stats_by_type(request_type);

-- Refresh strategy (run via cron or Supabase Edge Function)
REFRESH MATERIALIZED VIEW CONCURRENTLY request_stats_by_type;
```

**Additional Materialized Views to Consider:**
```sql
-- Performance metrics rollup
CREATE MATERIALIZED VIEW performance_daily_rollup AS
SELECT 
  date,
  platform,
  request_id,
  SUM(value) FILTER (WHERE metric_type = 'impressions') as total_impressions,
  SUM(value) FILTER (WHERE metric_type = 'clicks') as total_clicks,
  SUM(value) FILTER (WHERE metric_type = 'conversions') as total_conversions
FROM performance_metrics
GROUP BY date, platform, request_id;

-- User activity summary
CREATE MATERIALIZED VIEW user_activity_summary AS
SELECT 
  p.id,
  p.first_name,
  p.last_name,
  COUNT(DISTINCT r.id) FILTER (WHERE r.created_by = p.id) as requests_created,
  COUNT(DISTINCT c.id) as comments_made,
  MAX(al.created_at) as last_active_at
FROM profiles p
LEFT JOIN requests r ON r.created_by = p.id
LEFT JOIN comments c ON c.user_id = p.id
LEFT JOIN activity_log al ON al.user_id = p.id
GROUP BY p.id, p.first_name, p.last_name;
```

**Refresh Strategy:**
```sql
-- Create a function to refresh all materialized views
CREATE OR REPLACE FUNCTION refresh_dashboard_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY request_stats_by_type;
  REFRESH MATERIALIZED VIEW CONCURRENTLY performance_daily_rollup;
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_activity_summary;
END;
$$ LANGUAGE plpgsql;

-- Schedule via pg_cron (if enabled) or Supabase Edge Function
-- Run every 15 minutes:
SELECT cron.schedule('refresh-dashboards', '*/15 * * * *', 'SELECT refresh_dashboard_views();');
```

**Benefits:**
- 10-100x faster dashboard load times
- Reduced database load from repeated complex queries
- Predictable query performance

---

### 3. **Connection Pooling (Production)**
**When:** Deploying to production with multiple frontend instances

**Supabase Built-in Pooler (Recommended):**
```typescript
// Use Supabase's connection pooler for serverless/edge functions
const supabase = createClient(
  'https://vzhthefdgumjkhnjpydt.supabase.co',
  process.env.SUPABASE_ANON_KEY,
  {
    db: {
      schema: 'public',
    },
    auth: {
      persistSession: false, // For server-side
    },
  }
)
```

**For Direct Database Connections (Server-side):**
```javascript
// Use PgBouncer connection string (already included in Supabase)
const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL, // Use pooler URL
  max: 20, // Maximum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Always release connections
try {
  const client = await pool.connect()
  const result = await client.query('SELECT * FROM requests')
  client.release() // Important!
} catch (err) {
  console.error(err)
}
```

**Supabase Connection Limits:**
- Free tier: 60 connections
- Pro tier: 200 connections
- Use transaction pooling mode for serverless
- Use session pooling for traditional servers

**Benefits:**
- Handle 10,000+ concurrent users
- Prevent "too many connections" errors
- Faster connection acquisition

---

### 4. **Full-Text Search (When Needed)**
**When:** Users need to search across requests, comments, and assets

```sql
-- Add full-text search indexes
ALTER TABLE requests ADD COLUMN search_vector tsvector;

-- Create trigger to auto-update search vector
CREATE OR REPLACE FUNCTION requests_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER requests_search_vector_trigger
BEFORE INSERT OR UPDATE ON requests
FOR EACH ROW EXECUTE FUNCTION requests_search_vector_update();

-- Create GIN index for fast text search
CREATE INDEX requests_search_idx ON requests USING GIN(search_vector);

-- Search query example
SELECT id, title, ts_rank(search_vector, query) AS rank
FROM requests, to_tsquery('english', 'urgent & review') query
WHERE search_vector @@ query
ORDER BY rank DESC
LIMIT 10;
```

---

### 5. **Read Replicas (High Traffic)**
**When:** Database CPU consistently >70% or read queries impact write performance

- **Supabase Pro+**: Automatically includes read replicas
- Route read-only queries to replicas
- Keep writes on primary

```typescript
// Example: Use read replica for dashboard queries
const supabaseRead = createClient(
  'https://read-replica.supabase.co', // Read replica URL
  process.env.SUPABASE_ANON_KEY
)

const supabaseWrite = createClient(
  'https://vzhthefdgumjkhnjpydt.supabase.co', // Primary
  process.env.SUPABASE_ANON_KEY
)

// Reads from replica
const { data: requests } = await supabaseRead.from('requests').select('*')

// Writes to primary
const { data: newRequest } = await supabaseWrite.from('requests').insert({...})
```

---

### 6. **Automated Schema Validation**
**Implement Now (Low Effort):**

Add to your CI/CD pipeline:

```bash
# In .github/workflows/validate-schema.yml
name: Validate Database Schema

on:
  pull_request:
    paths:
      - 'supabase/migrations/**'
      - 'DATABASE_SCHEMA.md'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - name: Install dependencies
        run: pnpm install
      - name: Verify schema matches Supabase
        run: node scripts/verify-schema.js
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
```

---

### 7. **Performance Monitoring Setup**
**Implement Now (High Value):**

```sql
-- Enable pg_stat_statements extension (if not enabled)
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Query to find slow queries
SELECT 
  query,
  calls,
  total_exec_time,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 20;

-- Create alerts for long-running queries in Supabase Dashboard
```

**Set up alerts for:**
- Queries taking >5 seconds
- Connection pool exhaustion
- Table bloat (autovacuum issues)
- Replication lag (if using replicas)

---

### Implementation Priority

| Enhancement | Priority | Effort | When to Implement |
|-------------|----------|--------|-------------------|
| Schema Validation CI | 🔴 High | Low | Now |
| Performance Monitoring | 🔴 High | Low | Now |
| Connection Pooling | 🟡 Medium | Low | Before production launch |
| Materialized Views | 🟡 Medium | Medium | When dashboards slow down |
| Full-Text Search | 🟢 Low | Medium | When users request search |
| Activity Log Partitioning | 🟢 Low | High | >10M activity log rows |
| Read Replicas | 🟢 Low | Low | Consistent 70%+ CPU |

---

## Verification

**Schema Verification Script:** `/scripts/verify-schema.js`

Run to verify your database matches this documentation:
```bash
node scripts/verify-schema.js
```

**Last Verification Results:**
- ✅ All 30 tables present and accessible
- ✅ 2 requests in database
- ✅ 1 Slack message tracked
- ✅ All RLS policies working correctly
