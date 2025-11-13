# Supabase Full API Access Setup

## Overview
I've successfully explored the codebase and set up comprehensive Supabase API access via a CLI tool. This document summarizes the findings and setup.

## ✅ Completed Tasks

1. **Codebase Exploration**: Analyzed the entire project structure, identifying:
   - Real-time commenting system for images and videos
   - Video versioning with frame-accurate timecode comments
   - Collaborative cursor system
   - Database architecture and migrations

2. **Environment Variables Review**: Identified required configuration:
   - `SUPABASE_URL`: Project URL
   - `SUPABASE_ANON_KEY`: Public anonymous key (client-side)
   - `SUPABASE_SERVICE_KEY`: Service role key (server-side, full access)

3. **Supabase CLI Tool Created**: Built `scripts/supabase-cli.ts` with full CRUD capabilities

4. **Database Architecture Mapped**: Documented all tables and their relationships

---

## 📊 Database Architecture Summary

### Core Tables

1. **profiles** - User profiles linked to Supabase Auth
   - Extends `auth.users`
   - Roles: admin, designer, account_manager, client, guest

2. **clients** - Client companies/organizations
   - Basic company info and contact details

3. **requests** - Main creative requests/tasks
   - Fields: title, description, project_type, status, priority
   - Status flow: new-request → in-progress → needs-review → needs-edit → done
   - Types: creative, performance, design, ugc

4. **assets** - File uploads linked to requests
   - Supports versioning (version_number, is_current_version)
   - Stores: images, videos, documents

5. **comments** - Spatial and temporal comments
   - **Spatial**: x_position, y_position (for images)
   - **Temporal**: video_timestamp (for videos)
   - Supports threading via parent_comment_id
   - Status: resolved (boolean)

### Video Versioning Tables

6. **video_assets** - Master video records
   - Links to projects/requests
   - Tracks current_version_id

7. **video_versions** - Individual video uploads
   - Complete metadata: duration, dimensions, codec, bitrate
   - Processing status tracking
   - Thumbnail sprite sheets for scrubbing
   - WebVTT support for timeline previews

8. **timecode_comments** - Frame-accurate video feedback
   - Millisecond precision timecode
   - Threading support (parent_comment_id, thread_root_id)
   - Status: active, resolved, archived, deleted
   - Reactions (JSONB array)
   - Attachments support

### Integration Tables

9. **slack_messages** - Slack integration
   - Bidirectional sync with Slack
   - Thread support
   - Reactions and mentions

10. **user_mentions** - @mentions tracking
11. **comment_notifications** - Notification system
12. **video_playback_sessions** - Playback analytics

---

## 🛠️ Supabase CLI Tool

### Installation
The CLI tool is already added to your `package.json`:
```bash
pnpm db <command>
```

### Available Commands

#### Schema Inspection
```bash
pnpm db tables              # List all tables with row counts
pnpm db describe requests   # Show table structure
pnpm db count requests      # Count rows in table
pnpm db stats              # Database statistics
```

#### Query Operations
```bash
pnpm db query requests 10   # Query 10 most recent requests
pnpm db find requests <id>  # Find request by ID
```

#### Comments Management
```bash
pnpm db comments                          # List all comments
pnpm db comments <request-id>             # Comments for specific request
pnpm db create-comment <req-id> "text"    # Create comment
pnpm db resolve-comment <comment-id>      # Mark as resolved
```

#### Request Management
```bash
pnpm db requests 10                       # List 10 recent requests
pnpm db create-request "Title" creative   # Create new request
pnpm db update-status <id> in-progress    # Update status
```

#### Video Operations
```bash
pnpm db videos                           # List video assets
pnpm db versions <video-asset-id>        # List video versions
pnpm db timecode-comments <version-id>   # List timecode comments
```

---

## 🔐 Required Setup: Environment Variables

To enable full API access, you need to create a `.env` file with your actual Supabase credentials:

### Option 1: From Vercel Dashboard
1. Go to your Vercel project settings
2. Navigate to Environment Variables
3. Copy the values for:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_KEY`

### Option 2: From Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Settings → API
4. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_KEY`

### Create .env file
```bash
# Copy from example
cp .env.example .env

# Edit with your actual credentials
# IMPORTANT: Never commit .env to git!
```

Add these values to `.env`:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🎯 Real-Time Commenting System

### Architecture

The commenting system uses two Supabase real-time mechanisms:

1. **Postgres Changes** (for comments)
   - Database-persisted comments
   - Real-time INSERT/UPDATE/DELETE events
   - Channel: `comments-{requestId}`

2. **Broadcast** (for cursors)
   - Ephemeral collaborative cursors
   - 50ms update interval
   - No database writes (low latency)
   - Channel: `asset:{assetId}:cursors`

### Key Features

- **Spatial Comments** (Images): Click anywhere to place comment with x%, y% coordinates
- **Temporal Comments** (Videos): Timestamp-based comments with ±2s visibility tolerance
- **Optimistic UI**: Comments appear instantly before server confirmation
- **Collaborative Cursors**: Real-time cursor positions from other users
- **Comment Resolution**: Mark comments as resolved with green checkmark
- **Threading**: Nested comment replies support

### Components

- `CommentLayer.vue` - Main overlay for both image/video commenting
- `VideoTimeline.vue` - Timeline markers for video comments
- `CommentCursor.vue` - Collaborative cursor display

### Composables

- `useAssetComments.ts` - Comment management and real-time sync
- `useCollaborativeCursors.ts` - Cursor broadcasting

---

## 📈 Next Steps

1. **Add Credentials**: Create `.env` with your Supabase keys
2. **Test CLI**: Run `pnpm db stats` to verify connection
3. **Review Data**: Use `pnpm db requests` to see existing data
4. **Test Real-time**: Launch the app with `pnpm dev` and test commenting

---

## 🔍 Database Migrations

All migrations are in `supabase/migrations/`:
- `20250112_complete_rebuild.sql` - Core schema
- `20250113_enable_realtime_comments.sql` - Real-time setup
- `20251111170928_video_versioning.sql` - Video versioning system

Key features:
- **Row Level Security (RLS)**: Enabled on all tables
- **Real-time Replication**: Enabled for comments table
- **Indexes**: Optimized for timestamp and position queries
- **Triggers**: Automatic timestamp updates

---

## 📝 Documentation

Comprehensive documentation is in `docs/`:
- `REALTIME_COMMENTING.md` - Full commenting system guide
- `ARCHITECTURE.md` - System architecture
- Migration scripts with detailed comments

---

## ⚡ Quick Reference

### Status Values
- Requests: `new-request`, `in-progress`, `needs-review`, `needs-edit`, `done`
- Comments: `resolved: true/false`
- Video Processing: `pending`, `processing`, `completed`, `failed`

### Project Types
- `creative` - Creative assets
- `performance` - Performance marketing
- `design` - Design work
- `ugc` - User-generated content

### User Roles
- `admin` - Full access
- `designer` - Create and manage assets
- `account_manager` - Client management
- `client` - View and comment only
- `guest` - Limited access

---

## 🚀 CLI Tool Features

The `supabase-cli.ts` tool uses the **SERVICE KEY** for full database access, bypassing RLS policies. This enables:

- ✅ Read any table without restrictions
- ✅ Write/update/delete any record
- ✅ View complete database statistics
- ✅ Execute complex queries
- ✅ Manage comments, requests, videos programmatically

Perfect for:
- Database inspection and debugging
- Bulk operations
- Data migration
- Testing and validation
- Administrative tasks

---

## 🎉 Summary

You now have:
1. ✅ Complete understanding of the codebase architecture
2. ✅ Full Supabase CLI tool for database management
3. ✅ Documentation of all tables and relationships
4. ✅ Understanding of the commenting and versioning systems
5. ✅ Ready-to-use scripts for database operations

**Missing**: Only the actual Supabase credentials in `.env` file to enable the CLI tool.

Once you add the credentials, you'll have full programmatic access to read, write, and manage all data in your Supabase database!
