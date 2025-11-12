# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Agency Dashboard OS is a comprehensive agency management platform with a **cloud-first architecture**. The system uses **Supabase** (PostgreSQL database with real-time capabilities) and **Nuxt 3** (Vue.js frontend), deployed via **Vercel**.

**Key Technologies:**
- Frontend: Nuxt 3, TypeScript, Tailwind CSS, Nuxt UI, VueUse
- Database: Supabase PostgreSQL (Project ID: vzhthefdgumjkhnjpydt)
- Deployment: Vercel (GitHub integration)
- Integrations: Slack Web API, Supabase Real-time
- Package Manager: **pnpm** (required)

**Architecture Philosophy:**
- ✅ Cloud-first: GitHub → Vercel pipeline
- ✅ Single database: Supabase (no local DB needed)
- ✅ Minimal local development (staging environment preferred)
- ✅ Real-time features via Supabase subscriptions

## Development Workflow

### Cloud-First Approach (Preferred)

This project uses a **GitHub → Vercel** deployment pipeline. Local development is minimized to avoid conflicts.

**Recommended Workflow:**
1. Make changes in your editor
2. Commit and push to GitHub
3. Vercel automatically deploys to staging
4. Test in staging environment
5. Merge to main for production

**Benefits:**
- No local database setup required
- Consistent environment (staging = production)
- Automatic deployments
- No Docker overhead

### Quick Push Workflow

```bash
# Add and commit changes
git add .
git commit -m "feat: your change description"

# Push to trigger Vercel deployment
git push origin main

# Check deployment status
vercel --prod
```

### Local Development (When Needed)

```bash
# Install dependencies
pnpm install

# Start development server (connects to cloud Supabase)
pnpm dev

# Frontend runs at: http://localhost:3000
# Database: Cloud Supabase (no local DB needed)
```

**Note:** Docker services are no longer required. See `docker-compose.yml.legacy` for historical reference.

### Verification & Testing

```bash
# Verify database schema
node scripts/verify-schema.js

# Run linting
pnpm lint

# Fix lint issues
pnpm lint:fix

# Build for production (runs automatically on Vercel)
pnpm build

# Preview production build locally (optional)
pnpm preview
```

### Vercel Deployment Commands

```bash
# Install Vercel CLI (if not installed)
pnpm add -g vercel

# Link to Vercel project (first time only)
vercel link

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View deployment logs
vercel logs

# List deployments
vercel ls
```

## Architecture & Code Organization

### High-Level Architecture

The system follows a **cloud-native architecture**:

1. **Frontend Layer** (Nuxt 3): Request-centric UI with real-time updates
2. **Database Layer** (Supabase): PostgreSQL with built-in auth, storage, and real-time
3. **Integration Layer**: Slack API, external services

**Data Flow Pattern:**
```
User Action → Frontend Component → useSupabase Composable → Supabase Client
→ PostgreSQL (RLS policies) → Database Triggers → Notifications/Integrations
```

**Deployment Pipeline:**
```
Git Push → GitHub → Vercel Build → Staging/Production
                           ↓
                    Supabase (Database)
```

### Module Structure

The frontend is organized by **functional modules**, each self-contained:

```
frontend/
├── components/
│   ├── creative/      # Creative review board components
│   ├── performance/   # Analytics and campaign tracking
│   ├── design/        # Design system and brand assets
│   └── resources/     # DAM (Digital Asset Management)
├── composables/       # Shared Vue composables (useDirectus, etc.)
├── pages/             # Nuxt routing
└── utils/             # Utility functions
```

**When adding features:**
- Place module-specific components in their respective directories
- Shared logic goes in `composables/`
- **All database interactions use `useSupabase()` composable**

### Supabase Database Architecture

**Core Tables:**
- `requests` - Central table for all work items (creative, performance, project)
- `clients` - Client management
- `assets` - File attachments with automatic versioning
- `comments` - Threaded feedback with positioned annotations
- `video_versions` - Video uploads with timecode comments
- `timecode_comments` - Frame-accurate video feedback
- `slack_messages` - Slack integration with @mention tracking
- `performance_metrics` - Campaign analytics with API sync
- `automation_rules` - Workflow automation engine
- `profiles` - User management (extends Supabase Auth)

**Key Features:**
- **Request-Centric Model**: All work flows through the `requests` table
- **Built-in Versioning**: Assets automatically version on file change
- **Real-Time**: All critical tables support WebSocket subscriptions
- **Status Workflow**: Enforced state machine with audit trail

**See `DATABASE_SCHEMA.md` for complete documentation (30 tables).**

### Integration Patterns

**Slack Integration:**
- Bidirectional sync between Slack and dashboard
- @mentions tracked in `user_mentions` table
- Messages stored in `slack_messages` for search/reference
- Real-time updates via Supabase subscriptions

**Supabase Features Used:**
- **Authentication**: Built-in user management and OAuth
- **Storage**: File uploads for images, videos, documents
- **Real-time**: WebSocket subscriptions for live updates
- **Row Level Security**: Permission policies at database level
- **Database Functions**: Automated workflows and triggers

## Environment Configuration

**Required Variables:**
- `SUPABASE_URL` - Supabase project URL (https://vzhthefdgumjkhnjpydt.supabase.co)
- `SUPABASE_ANON_KEY` - Public anon key (client-side safe)
- `SUPABASE_SERVICE_KEY` - Service role key (server-side only)

**Slack Integration:**
- `SLACK_BOT_TOKEN` - Bot token (starts with xoxb-)
- `SLACK_CLIENT_SECRET` - OAuth client secret
- `SLACK_SIGNING_SECRET` - For webhook verification
- `SLACK_CHANNEL_CREATIVE` - Creative channel ID
- `SLACK_CHANNEL_PERFORMANCE` - Performance channel ID
- `SLACK_CHANNEL_REQUESTS` - Requests channel ID
- `SLACK_CHANNEL_UGC` - UGC channel ID

**Vercel Environment Variables:**
All environment variables must be set in Vercel dashboard for production/staging.

**Important:**
- Never commit `.env` file to Git
- Use `.env.example` as template
- Vercel automatically injects environment variables during build
- Secrets should be stored in Vercel dashboard, not hardcoded

## Development Patterns

### Supabase Client Usage

Always use the `useSupabase()` composable for database operations:

```typescript
import { useSupabase } from '~/composables/useSupabase'

const { supabase } = useSupabase()

// Fetch data with relationships
const { data: requests } = await supabase
  .from('requests')
  .select('*, client:clients(*), assigned:profiles(*)')
  .eq('status', 'in_progress')

// Insert data
const { data: newRequest } = await supabase
  .from('requests')
  .insert({
    title: 'New Campaign',
    request_type: 'creative',
    status: 'new_request'
  })
  .select()
  .single()

// Real-time subscriptions
supabase
  .channel('requests')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'requests'
  }, (payload) => {
    console.log('Change:', payload)
  })
  .subscribe()
```

### Component Conventions

- Use TypeScript with strict mode
- Follow Vue 3 Composition API (`<script setup>`)
- Leverage Nuxt UI components for consistency
- Place module-specific components in their module directory

### Schema Type Definitions

When adding new Directus collections, update the schema interface in `frontend/composables/useDirectus.ts`:

```typescript
interface Schema {
  your_new_collection: CollectionType[]
  // ... existing collections
}
```

### Real-Time Updates

For real-time features, consider using Directus WebSocket subscriptions via the SDK (requires Directus WebSockets extension).

## Common Tasks

### Adding a New Module Component

```bash
# Example: Create new performance widget
touch frontend/components/performance/NewWidget.vue
```

Then import in the appropriate page file.

### Creating Directus Extension

```bash
cd directus/extensions
npx create-directus-extension@latest
# Follow prompts to choose extension type (hook, endpoint, interface, etc.)
```

### Modifying Directus Collections

1. Make changes via Directus admin UI (http://localhost:8055)
2. Export schema snapshot: `npx directus schema snapshot`
3. Commit the snapshot to `directus/snapshots/`

### Slack Integration Setup

1. Create Slack App at api.slack.com
2. Add scopes: `chat:write`, `files:write`, `channels:read`
3. Install to workspace and copy Bot Token
4. Add token to `.env` as `SLACK_BOT_TOKEN`
5. Configure channel IDs for each sector

## Deployment Notes

### Backend (Directus)

**Recommended:** Directus Cloud for production

**Self-hosted:**
- Use `docker-compose.yml` as production template
- Configure persistent volumes for uploads and database
- Enable Redis for caching and rate limiting
- Set up PostgreSQL backups

### Frontend (Nuxt)

**Recommended:** Vercel or Netlify

**Build command:** `pnpm build`
**Output directory:** `.output/public` (for static) or `.output/` (for server)

**Environment variables required:**
- `DIRECTUS_URL` (production Directus URL)
- `DIRECTUS_SERVER_TOKEN`
- All integration tokens (Slack, OpenAI, etc.)

## Important Notes

- **Always use pnpm**, not npm or yarn
- Directus runs on port 8055, frontend on port 3000 (development)
- PostgreSQL connection info is in `docker-compose.yml` (dev) or `.env` (production)
- The project is based on [directus-labs/agency-os](https://github.com/directus-labs/agency-os)
- Smart tagging (AI) is optional and requires OpenAI API key
- TypeScript strict mode is enabled - all code should be type-safe
