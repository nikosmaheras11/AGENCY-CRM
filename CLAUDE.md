# Agency Dashboard OS - AI Assistant Guide

**Project:** Agency Dashboard Operating System  
**Repository:** AGENCY-CRM  
**Updated:** November 14, 2025  
**Type:** Full-stack SaaS application for agency management  

---

## Project Overview

Agency Dashboard OS is a comprehensive, cloud-native platform designed for agency teams to manage creative work, performance metrics, design projects, and resources in a unified interface. The system is built on Nuxt 3 (Vue.js) frontend and Supabase (PostgreSQL) backend with real-time capabilities and extensive Slack integration.

**Core Purpose:** Provide internal agency teams and external clients with a collaborative workspace for request management, asset review, feedback, and approval workflows.

---

## Technology Stack

### Frontend
- **Framework:** Nuxt 3 (Vue 3, TypeScript)
- **UI Library:** Nuxt UI, Tailwind CSS
- **State Management:** Vue composables with reactive refs
- **Data Fetching:** Supabase JS client, Real-time WebSocket subscriptions
- **Utilities:** VueUse (composition utilities), VueUse Motion (animations)
- **Rich Editor:** TipTap (Vue 3 contenteditable editor with extensions)
- **Charts:** Chart.js with Vue wrapper (vue-chartjs)
- **Drag & Drop:** Vuedraggable (Vue 3 compatible)
- **Tooltip/Popover:** Tippy.js with Vue integration
- **Package Manager:** pnpm 9.0.0 (required)

### Backend
- **Database:** Supabase PostgreSQL (Project ID: vzhthefdgumjkhnjpydt)
- **Authentication:** Supabase Auth with OAuth support (Slack SSO)
- **Storage:** Supabase Storage (S3-compatible)
- **Real-time:** Supabase Real-time subscriptions (WebSocket)
- **API:** Nuxt server routes (Node.js)
- **Database Features:** Row Level Security (RLS), Triggers, Functions, Migrations

### Integrations
- **Slack:** Web API, OAuth, Message subscriptions, Commands
- **Figma:** API for design comments, screenshots, node data
- **Vercel:** Deployment platform with GitHub integration
- **External APIs:** Meta Ads, Google Ads (prepared infrastructure)

### Development & Testing
- **Test Framework:** Vitest with @vue/test-utils and @nuxt/test-utils
- **DOM Testing:** happy-dom (lightweight)
- **Linting:** ESLint 9.0.0
- **Build:** Nuxt build system with prebuild cleanup
- **TypeScript:** Strict mode enabled
- **CI/CD:** GitHub Actions workflows

---

## Directory Structure

```
AGENCY-CRM/
├── pages/                          # Nuxt route pages (Vue components)
│   ├── index.vue                   # Main dashboard/home
│   ├── login.vue                   # Login page
│   ├── creative/                   # Creative module routes
│   │   ├── index.vue              # Creative board/grid
│   │   ├── asset/[id].vue         # Asset detail viewer
│   │   └── components/             # Creative-specific sub-components
│   ├── performance.vue             # Performance/analytics dashboard
│   ├── projects.vue                # Project management
│   ├── auth/callback.vue           # OAuth callback handler
│   ├── share/[token].vue           # Shareable asset links
│   └── weekly-objectives.vue       # Team objectives planning

├── components/                     # Reusable Vue components
│   ├── tiptap/                     # Rich text editor components
│   │   ├── SlashCommandMenu.vue
│   │   ├── SlashCommandExtension.ts
│   │   └── ObjectiveBlockExtension.ts
│   ├── creative/                   # Creative module components
│   │   ├── KanbanCard.vue
│   │   ├── RequestFormModal.vue
│   │   ├── ImageCommentOverlay.vue
│   │   ├── CommentLayer.vue
│   │   └── RequestsList.vue
│   ├── slack/                      # Slack integration components
│   │   └── MentionsPanel.vue
│   ├── CampaignDetailPanel.vue     # Performance dashboard cards
│   ├── CreativeCard.vue            # Asset card component
│   ├── CommentThread.vue           # Comment system
│   ├── VersionHistory.vue          # Asset version management
│   ├── ActivityFeed.vue            # Activity timeline
│   ├── TaskCard.vue                # Task/request card
│   └── VideoPlayer.vue             # Custom video player (prepared)

├── composables/                    # Vue composition functions
│   ├── useSupabase.ts              # Supabase client initialization & utilities
│   ├── useAuth.ts                  # Authentication & profile management
│   ├── useRequests.ts              # Request data fetching (local & Supabase)
│   ├── useRealtimeRequests.ts      # Real-time subscription for requests
│   ├── useAssetComments.ts         # Asset comment management
│   ├── useSlackMentions.ts         # Slack mention/user tracking
│   ├── useRequestForm.ts           # Request creation form state
│   ├── useFigma.ts                 # Figma integration
│   ├── useFigmaThumbnails.ts       # Figma asset preview generation
│   ├── useCollaborativeCursors.ts  # Real-time cursor presence (prepared)
│   ├── useGlobalSearch.ts          # Full-text search functionality
│   └── useShareLinks.ts            # Shareable link generation

├── server/api/                     # Nuxt server routes (auto-routing)
│   ├── auth/slack/
│   │   ├── callback.ts             # OAuth token exchange
│   │   └── revoke.ts               # Revoke OAuth access
│   ├── slack/
│   │   ├── messages.get.ts         # Fetch Slack messages
│   │   ├── feed.get.ts             # Slack activity feed
│   │   └── webhook.post.ts.disabled# Slack event webhook (disabled)
│   └── figma/
│       ├── comments.get.ts         # Fetch Figma file comments
│       ├── screenshot.post.ts      # Generate Figma node screenshot
│       ├── thumbnail.get.ts        # Get Figma asset thumbnail
│       ├── node-screenshot.get.ts  # Node-specific screenshots
│       └── import-comments.post.ts # Import Figma comments to DB

├── middleware/                     # Nuxt middleware (route guards)
│   ├── auth.ts                     # Authentication middleware
│   └── guest.ts                    # Guest user (client) middleware

├── utils/                          # Utility functions
│   ├── asset-viewer.ts             # Asset viewing utilities
│   ├── design-tokens.ts            # Design system constants
│   └── figma.ts                    # Figma helper functions

├── types/                          # TypeScript type definitions
│   └── components.ts               # Component prop types

├── supabase/                       # Database schema & migrations
│   ├── migrations/                 # SQL migration files
│   │   ├── 20250110_complete_schema.sql         # Core schema
│   │   ├── 20251111170928_video_versioning.sql  # Video features
│   │   ├── 20250114_global_search.sql           # Search indexes
│   │   ├── 20250113_create_share_links.sql      # Sharing feature
│   │   ├── 20250111_slack_mentions.sql          # Slack integration
│   │   └── [other incremental migrations]       # Updates & fixes
│   └── tests/                      # Database function tests

├── tests/                          # Test files
│   ├── setup.ts                    # Global test setup with mocks
│   ├── README.md                   # Testing documentation
│   ├── pages/                      # Page component tests
│   │   └── index.spec.ts           # Dashboard tests (34 tests)
│   ├── database/                   # Database integration tests
│   │   ├── tests/                  # Jest-based DB tests
│   │   ├── jest.config.js
│   │   ├── package.json
│   │   └── README.md
│   └── supabase/                   # Supabase-specific tests
│       ├── db-functions.test.ts
│       └── README.md

├── scripts/                        # Utility & automation scripts
│   ├── supabase-cli.ts             # Supabase CLI wrapper
│   ├── vercel-monitor.ts           # Vercel deployment monitor
│   ├── slack-monitor.cjs           # Slack activity monitor
│   ├── validate-db.ts              # Database schema validation
│   ├── setup-supabase.cjs          # Initial Supabase setup
│   ├── verify-schema.js            # Schema integrity checker
│   ├── check-vercel-deployment.ts  # Build status checker
│   ├── apply-all-migrations.sh     # Run all migrations
│   ├── seed-data.js                # Database seeding
│   └── [other utility scripts]     # Data migration, setup helpers

├── workers/                        # Background service workers
│   └── slack-monitor-worker.js     # Real-time Slack monitoring

├── integrations/                   # Integration modules
│   ├── slack/
│   │   └── client.ts               # Slack API wrapper
│   ├── dam/                        # Digital Asset Management (prepared)
│   └── analytics/                  # Analytics integration (prepared)

├── data/                           # Static data files
│   └── requests/                   # Mock/seed request data

├── docs/                           # Documentation
│   ├── ARCHITECTURE.md             # System architecture overview
│   └── [other docs]

├── assets/                         # Static assets
│   ├── css/                        # Global CSS and Tailwind
│   └── images/                     # Images, logos

├── public/                         # Public static files
│   ├── logo.svg
│   └── logo.png

├── .github/workflows/              # GitHub Actions CI/CD
│   ├── db-validation.yml           # Database migration validation
│   ├── database-tests.yml          # Automated DB testing
│   └── deploy-migrations.yml       # Migration deployment

├── nuxt.config.ts                 # Nuxt 3 configuration
├── tsconfig.json                  # TypeScript configuration
├── vitest.config.ts               # Vitest configuration
├── tailwind.config.ts             # Tailwind CSS configuration
├── package.json                   # Project dependencies
├── pnpm-lock.yaml                 # Dependency lock file

└── [documentation files]          # Guides and references
    ├── README.md                  # Project overview
    ├── CLAUDE.md                  # This file
    ├── DATABASE_SCHEMA.md         # Full database documentation
    ├── SCHEMA_SUMMARY.md          # Quick schema reference
    ├── DEPLOYMENT_GUIDE.md        # Production deployment
    ├── DESIGN_SYSTEM.md           # UI design guidelines
    ├── TESTING_GUIDE.md           # Testing procedures
    ├── WARP.md                    # WARP AI guidance
    ├── SLACK_INTEGRATION_SUMMARY.md
    ├── SLACK_SSO_SETUP.md
    ├── CLIENT_GUEST_SETUP.md      # Multi-user permissions
    └── [other guides]
```

---

## Database Schema Overview

### Request-Centric Architecture
The entire system revolves around **requests** - work items that span across all modules (creative, performance, design, resources).

### Core Tables

#### 1. **profiles** (Users)
- User identity linked to Supabase Auth
- Roles: `admin`, `user`, `client_guest`
- Slack integration fields (slack_id, oauth_token)
- Client relationship for guest users

#### 2. **clients** (Organizations)
- Agency client companies
- Primary contact information
- Status tracking (active, inactive, archived)

#### 3. **requests** (Central Work Items)
- Multi-board request management
- Types: `creative`, `performance`, `project`, `design`
- Status workflow: `new_request` → `in_progress` → `needs_review` → `completed` (with `needs_edit` branch)
- Priority levels: `low`, `medium`, `high`, `urgent`
- Relationships: client, assignee, creator
- JSONB metadata for flexible attributes
- **REAL-TIME enabled** ✓

#### 4. **assets** (File Attachments)
- Request attachments (images, videos, documents)
- Automatic versioning on upload
- Storage path tracking (Supabase Storage)
- Current version flag for rollback support
- Metadata (dimensions, duration, file size)
- **REAL-TIME enabled** ✓

#### 5. **comments** (Feedback & Discussion)
- Threaded comment system
- Supports positioned comments (pixel coordinates for image markup)
- Link to assets and requests
- Author and timestamp tracking
- **REAL-TIME enabled** ✓

#### 6. **video_versions** (Video Asset Versioning)
- Dedicated table for video uploads and revisions
- Tracks multiple versions of video assets
- Status: `uploading`, `processing`, `ready`
- **REAL-TIME enabled** ✓

#### 7. **timecode_comments** (Video Frame Comments)
- Millisecond-precise feedback on videos
- Timecode in seconds (45.250 = 45.25 seconds)
- Attached to video_versions
- Support for reactions
- **REAL-TIME enabled** ✓

#### 8. **tags** & **request_tags** (Categorization)
- Hierarchical tagging system
- Smart tagging prepared for AI integration
- Many-to-many relationship with requests

#### 9. **performance_metrics** (Analytics Data)
- Campaign performance data from external platforms
- Platform connections: Meta Ads, Google Ads, etc.
- Metric sync logs for audit trail
- Raw JSON storage for flexible data

#### 10. **project_tasks** (Task Management)
- Sub-tasks within requests
- Status tracking
- Assignee tracking
- **REAL-TIME enabled** ✓

#### 11. **automation_rules** (Workflow Automation)
- Trigger-based automation configuration
- Conditions: role, content patterns, timing
- Actions: status change, assign user, send notification
- Templates for common workflows

#### 12. **activity_log** (Audit Trail)
- Complete history of changes
- User, action, timestamp, entity tracking
- Automated archival via `archive_old_activities()` function
- Pair table: `archived_activity_log`

#### 13. **slack_connected_channels** (Integration Mapping)
- Maps Slack channels to request types/sectors
- Channel ID, name, and status
- Bidirectional sync configuration

#### 14. **slack_messages** (Message Archive)
- Stores message copies from monitored channels
- User mentions tracking
- Timestamp and permalink for threads
- Reactions and reaction history

#### 15. **user_mentions** (Mention Tracking)
- Records @mentions in Slack and Dashboard
- Mention type (request, comment, direct)
- Read/unread status

#### 16. **share_links** (Secure Sharing)
- Public sharing tokens for assets/requests
- Expiration dates
- Access control (viewer vs editor)
- **REAL-TIME enabled** ✓

### Key Database Features
- **Row Level Security (RLS):** Enforced permission system at DB level
- **Triggers:** Auto-versioning, status validation, audit logging
- **Functions:** Asset versioning, status transitions, notifications
- **Real-time:** 16 tables support WebSocket subscriptions
- **State Machine:** Status transitions are validated by `check_status_transition()`

---

## Development Workflows

### Cloud-First Approach (Recommended)
This project uses a **GitHub → Vercel** deployment pipeline. Local development is optional.

```bash
# Workflow:
1. Make code changes
2. git add . && git commit -m "feat: description"
3. git push origin main
4. Vercel automatically deploys to staging
5. Test in staging
6. Merge to main for production
```

### Local Development Setup

```bash
# Install dependencies (pnpm required)
pnpm install

# Start dev server (connects to cloud Supabase)
pnpm dev
# Frontend: http://localhost:3000
# No local database needed - uses cloud Supabase

# Run tests
pnpm test              # Run all tests
pnpm test:ui           # Open test UI
pnpm test:coverage     # Generate coverage
pnpm test:db           # Database-specific tests

# Linting
pnpm lint              # Check for issues
pnpm lint:fix          # Auto-fix issues

# Build
pnpm build             # Production build
pnpm preview           # Preview production build
```

### Adding Database Migrations

1. **Create migration file:**
   ```bash
   supabase migration new your_feature_name
   ```

2. **Edit `supabase/migrations/[timestamp]_your_feature_name.sql`**

3. **Apply locally (if testing):**
   ```bash
   supabase db push
   ```

4. **Apply to production:**
   - Commit and push to GitHub
   - Vercel builds automatically
   - Manually run migration in Supabase Dashboard if needed

### Vercel Deployment

```bash
# Link to Vercel (first time)
vercel link

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# Check deployment status
pnpm run vercel:status
```

---

## Key Architectural Patterns

### 1. Composable-Based Architecture
All data access and business logic is encapsulated in composables:
- `useSupabase()` - Database client and utilities
- `useAuth()` - Authentication state
- `useRequests()` - Request CRUD operations
- `useRealtimeRequests()` - Real-time subscriptions
- Custom domain composables (useSlackMentions, useFigma, etc.)

**Convention:** Composables are auto-imported by Nuxt; always use `const { supabase } = useSupabase()` to get the client.

### 2. Real-Time-First Approach
Critical tables are subscribed to via Supabase Real-time:
```typescript
// Pattern: Listen to all changes
.on('postgres_changes', {
  event: '*',           // INSERT, UPDATE, DELETE
  schema: 'public',
  table: 'requests'
}, handleChange)
```

### 3. Server-Side API Routes
Backend logic runs on Nuxt server:
- OAuth callback handlers
- External API integrations (Figma, Slack)
- Sensitive operations (token management)

**Convention:** Routes are auto-mounted from `server/api/` directory structure.

### 4. Row Level Security (RLS) Enforcement
Every table has RLS policies:
- Users see only their own data or public data
- Client guests see only their company's requests
- Admin users see everything

**Important:** RLS is enforced at DB level; front-end filtering is secondary.

### 5. Type Safety
- Strict TypeScript mode enabled
- Database types inferred from Supabase schema
- Vue component props are typed
- Test coverage for complex logic

### 6. Form State Management
Request creation uses a composable pattern:
```typescript
// composables/useRequestForm.ts
const {
  formData,
  isSubmitting,
  submit
} = useRequestForm()

// In template:
@submit.prevent="submit"
```

### 7. Asset Versioning Pattern
When assets are updated:
1. New version inserted to `assets` table
2. `is_current_version` flag updated
3. Old versions retained for rollback
4. Comments automatically reference version

### 8. Slack Integration Pattern
- OAuth tokens stored in `profiles` table
- Messages cached in `slack_messages` table
- Bidirectional sync via webhooks
- User mentions tracked in `user_mentions`

---

## Configuration Files

### `nuxt.config.ts`
- Module registration (Nuxt UI, Tailwind, VueUse)
- Runtime config (environment variable mapping)
- TypeScript settings
- Tailwind CSS config path
- DevTools enabled for development

**Important:** Runtime config separates public from private keys:
- Public keys: exposed to browser (e.g., `supabaseUrl`, `slackClientId`)
- Private keys: server-only (e.g., `slackBotToken`, `supabaseServiceKey`)

### `tsconfig.json`
- Strict mode enabled
- Extends `.nuxt/tsconfig.json` (auto-generated)
- Excludes test files from build

### `vitest.config.ts`
- Test environment: `nuxt` with `happy-dom`
- Global test utilities enabled
- Setup files: `tests/setup.ts`

### `tailwind.config.ts`
- **Design System:** "Elevated" glass-morphism theme
- **Color Palette:** Deep navy backgrounds, purple/blue primary, status colors
- **Custom Gradients:** Dark gradient, glass card effects
- **Extensions:** Forms, typography plugins, custom shadows
- **Typography:** Inter Tight (headings), Inter (body)

### `.env.example`
Template environment variables with comments explaining each:
- Slack integration (bot token, app token, signing secret, channel IDs)
- Supabase configuration (URL, keys)
- Vercel monitoring (token, project ID)
- Analytics providers (Directus, Google Analytics)
- DAM settings (storage provider, file limits)

### `.github/workflows/`
- **db-validation.yml:** SQL syntax checks, migration testing, schema integrity
- **database-tests.yml:** Run Vitest on database functions
- **deploy-migrations.yml:** Deploy migrations to production

---

## Authentication & Authorization

### Auth Flow
1. User visits login page
2. Supabase Auth form (email/password or OAuth)
3. On success: session token stored in localStorage
4. `useAuth()` composable fetches user profile from `profiles` table
5. Middleware guards routes based on role

### User Roles
- **admin:** Full system access, create/edit all requests
- **user:** Internal team member, can create/edit assigned requests
- **client_guest:** External client user, limited to company requests

### OAuth Integration (Slack SSO)
1. User clicks "Sign in with Slack"
2. Redirects to `/api/auth/slack/callback` after authorization
3. Backend exchanges code for access token
4. Token stored in `profiles.slack_access_token`
5. User profile updated with Slack ID

### Middleware
- **`middleware/auth.ts`:** Redirects unauthenticated users to login
- **`middleware/guest.ts`:** Enforces RLS policies for client_guest role

---

## API Routes Reference

### Authentication
- **`GET /api/auth/slack/callback`** - OAuth token exchange
  - Query params: `code`, `error`
  - Response: Redirect to home or error page
- **`POST /api/auth/slack/revoke`** - Revoke Slack access
  - Body: `user_id`

### Slack Integration
- **`GET /api/slack/messages`** - Fetch recent messages
  - Query: `channel_id`, `limit`
  - Response: Array of messages
- **`GET /api/slack/feed`** - Activity feed filtered by mentions
  - Response: Messages where user is mentioned

### Figma Integration
- **`GET /api/figma/comments`** - Get file comments
  - Query: `fileKey`
  - Response: Comments array
- **`GET /api/figma/thumbnail`** - Get asset preview image
  - Query: `fileKey`, `nodeId`
  - Response: Image URL
- **`GET /api/figma/node-screenshot`** - Screenshot specific node
  - Query: `fileKey`, `nodeId`
  - Response: Image blob
- **`POST /api/figma/screenshot`** - Generate file screenshot
  - Body: `fileKey`, `nodeId`, `scale`
- **`POST /api/figma/import-comments`** - Import Figma comments to DB
  - Body: `fileKey`, `requestId`

---

## Error Handling Patterns

### API Error Handling
```typescript
// Server routes use createError for proper HTTP responses
if (!fileKey) {
  throw createError({
    statusCode: 400,
    statusMessage: 'Missing required parameter'
  })
}

try {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }
  return await response.json()
} catch (error) {
  console.error('Error:', error)
  throw createError({
    statusCode: 500,
    statusMessage: error.message
  })
}
```

### Database Error Handling
```typescript
const { data, error } = await supabase
  .from('requests')
  .select('*')

if (error) {
  console.error('Database error:', error)
  throw error  // Re-throw for page error boundary
}
return data
```

### Real-time Connection Errors
```typescript
const connectionStatus = ref('connecting')

const handleConnectionError = () => {
  connectionStatus.value = 'disconnected'
  // Show banner to user
  // Auto-reconnect via keepalive
}
```

---

## Testing Strategy

### Unit Tests (Vitest)
Located in `tests/` directory:
- **Page tests:** Test Vue component logic
- **Database tests:** Test Supabase functions and RLS
- Coverage: 34+ tests for critical paths

### Test Examples
```typescript
// tests/pages/index.spec.ts
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import IndexPage from '~/pages/index.vue'

describe('Dashboard', () => {
  it('displays current time', () => {
    vi.setSystemTime(new Date('2024-01-15 09:15:00'))
    const wrapper = mount(IndexPage)
    expect(wrapper.text()).toContain('9:15 AM')
  })
})
```

### Running Tests
```bash
# Run all tests once
pnpm test

# Watch mode (development)
pnpm vitest

# With UI browser
pnpm test:ui

# Coverage report
pnpm test:coverage

# Database tests only
pnpm test:db
```

### What's Tested
- Time formatting and display logic
- Greeting messages based on time of day
- Alert color mapping
- Campaign performance card rendering
- Budget utilization visualization
- Dashboard integration

---

## Design System

### Color Scheme
- **Primary:** `#4318FF` (Purple-blue) and `#7551FF` (lighter)
- **Status:** Green `#01B574`, Red `#E31A1A`
- **Accents:** Teal `#4FD1C5`, Orange `#F6AD55`, Blue `#4299E1`
- **Dark Backgrounds:** `#0B0F29` (main), `#111C44` (cards)
- **Text:** White for primary, Gray `#A0AEC0` for secondary

### Typography
- **Headings:** Inter Tight (600-900 weight)
- **Body:** Inter (400-600 weight)
- **Font Sizes:** Follow Tailwind scale (sm, base, lg, xl, 2xl, etc.)
- **Line Heights:** Tight (1.2), Normal (1.5), Relaxed (1.75)

### Component Patterns
- **Card-glass:** Semi-transparent white with backdrop blur
- **Gradient buttons:** Primary color gradient with hover states
- **Icons:** Material Icons from Google Fonts
- **Spacing:** 8px base grid system
- **Shadows:** Elevated shadows for depth, subtle shadows for cards

---

## Integrations

### Slack
- **Capabilities:**
  - OAuth login (Slack SSO)
  - Message monitoring from configured channels
  - Slack mention tracking (@mentions)
  - Bidirectional comment sync
  - Notification queuing
- **Implementation:** `integrations/slack/client.ts`
- **API Endpoints:** `/api/slack/*`
- **Database Tables:** `slack_connected_channels`, `slack_messages`, `user_mentions`

### Figma
- **Capabilities:**
  - Fetch design file comments
  - Generate thumbnails/screenshots
  - Import comments into dashboard
  - Frame-by-frame node selection
- **Implementation:** `integrations/figma.ts` (utilities), server routes for API
- **API Endpoints:** `/api/figma/*`

### Vercel
- **Deployment:** Automatic on GitHub push
- **Monitoring:** `scripts/vercel-monitor.ts` checks build status
- **Environment Variables:** Set in Vercel dashboard, sync to `.env`

---

## Deployment

### Environment Setup
1. Copy `.env.example` to `.env`
2. Fill in all credentials (Supabase, Slack, Figma, Vercel)
3. **Never commit `.env` to GitHub**

### Database Deployment
1. **First time:** Run complete schema migration
   - Supabase Dashboard → SQL Editor → Paste `supabase/migrations/20250110_complete_schema.sql`
   - OR use CLI: `supabase db push`

2. **Subsequent updates:** Commit migration file
   - Create new migration: `supabase migration new feature_name`
   - Edit SQL file
   - Push: `git push origin main`
   - Vercel auto-deploys and optionally runs migration

### Vercel Deployment
- **Automatic:** Push to main branch → Vercel builds → Deploy to production
- **Manual:** Use `vercel --prod` CLI command
- **Preview:** Create PR → Vercel creates preview URL
- **Rollback:** Use Vercel dashboard to redeploy previous version

### Production Checklist
- [ ] All environment variables set in Vercel
- [ ] Database migrations applied
- [ ] RLS policies verified
- [ ] Slack OAuth app configured
- [ ] Figma API token valid
- [ ] Storage bucket permissions correct
- [ ] CDN cache cleared if needed

---

## Common Development Tasks

### Add a New Request Type
1. Update Supabase enum: `ALTER TYPE request_type ADD VALUE 'new_type'`
2. Update TypeScript types in composables
3. Add new page/components for module
4. Add navigation item in `app.vue`

### Create a New API Endpoint
1. Create file: `server/api/[route].ts`
2. Use `defineEventHandler()` and proper error handling
3. Access runtime config for env vars
4. Return JSON or throw `createError()`

### Add Database Function
1. Create migration file: `supabase/migrations/[timestamp]_function_name.sql`
2. Define function with proper permissions
3. Test in Supabase dashboard
4. Add tests in `tests/supabase/`
5. Commit and push to deploy

### Update Design Tokens
1. Edit `tailwind.config.ts` for new colors/spacing
2. Update `DESIGN_SYSTEM.md` to document
3. Use new tokens in components
4. Commit and let Vercel redeploy

### Add Slack Channel Monitoring
1. Create Slack App at api.slack.com
2. Add bot permissions (chat:write, channels:read)
3. Configure webhook URL: `https://your-domain/api/slack/webhook`
4. Add channel ID to `.env`
5. Update `slack_connected_channels` table

---

## Known Limitations & TODOs

### Implemented Features
✅ Request management (create, read, update status)  
✅ Asset versioning with rollback  
✅ Real-time subscriptions  
✅ Comment threads with positioning  
✅ Slack integration (messages, mentions)  
✅ Video versioning and timecode comments  
✅ Figma design file comments  
✅ Global search with fuzzy matching  
✅ Share links for public access  
✅ Client guest user permissions  

### Prepared But Not Yet Implemented
⚠️ Quality switching for videos (HLS/DASH)  
⚠️ Bulk operations (status, assignment, tagging, download)  
⚠️ Reply functionality in comment threads  
⚠️ Upload flow for version history  
⚠️ AI-powered smart tagging  
⚠️ Advanced analytics with custom metrics  

### Known Issues (See TODOs in code)
- Comment thread reply functionality not yet implemented
- Menu actions (edit, delete) in comment threads need implementation
- Bulk operations UI exists but backend integration pending
- Video player quality switching prepared but not active

---

## Debugging & Troubleshooting

### Enable Debug Logging
Most files have console.log statements with prefixes:
```typescript
console.log('[Component/Feature] What happened')
console.error('[Feature] Error description:', error)
```

Search for `console.log` to see all debug points.

### Check Real-time Connections
```typescript
// Browser DevTools → Network → WS
// Look for Supabase WebSocket connection
// Should show messages flowing in real-time
```

### Database Query Issues
1. **Supabase Dashboard:** SQL Editor → test queries
2. **Check RLS:** Does user have permission?
3. **Check indexes:** Are there N+1 query problems?
4. **Check triggers:** Are automations interfering?

### Vercel Build Issues
```bash
# Check logs
vercel logs

# Check environment variables
vercel env ls

# Check deployment list
vercel ls
```

---

## Best Practices

### Code Organization
- Keep components small and focused
- Extract logic into composables
- Use TypeScript strict mode
- Follow naming conventions (camelCase variables, PascalCase components)

### Database
- Always include proper RLS policies
- Use transactions for multi-step operations
- Add indexes for frequently queried columns
- Document migrations with comments

### Performance
- Lazy-load images and heavy components
- Use real-time subscriptions only when needed
- Implement request debouncing for search
- Profile build size with `pnpm build`

### Security
- Never commit `.env` files
- Validate server-side, not just client
- Use parameterized queries (Supabase handles this)
- Keep OAuth tokens secure in database
- Test RLS policies regularly

### Testing
- Write tests for complex business logic
- Mock external APIs and Supabase
- Test edge cases and error conditions
- Maintain >80% coverage for critical paths

---

## Useful Commands

```bash
# Development
pnpm dev                    # Start dev server
pnpm build                  # Build for production
pnpm preview                # Preview production build

# Testing
pnpm test                   # Run all tests
pnpm test:ui                # Open test UI
pnpm test:coverage          # Generate coverage report
pnpm test:db                # Database tests only

# Linting
pnpm lint                   # Check for issues
pnpm lint:fix               # Auto-fix issues

# Database
pnpm db                     # Interactive Supabase CLI
pnpm validate-db            # Check schema integrity
pnpm slack-monitor          # Monitor Slack integration

# Deployment
pnpm build                  # Prepare for production
git push origin main        # Trigger Vercel deploy
vercel --prod               # Manual deploy
vercel logs                 # View deployment logs
```

---

## Resources & Documentation

### Inside Repository
- `README.md` - Project overview
- `DATABASE_SCHEMA.md` - Complete database documentation
- `SCHEMA_SUMMARY.md` - Quick schema reference
- `DEPLOYMENT_GUIDE.md` - Detailed deployment walkthrough
- `DESIGN_SYSTEM.md` - UI design guidelines
- `TESTING_GUIDE.md` - How to test the system
- `WARP.md` - WARP AI development guide
- `SLACK_INTEGRATION_SUMMARY.md` - Slack setup details
- `CLIENT_GUEST_SETUP.md` - Multi-user permissions

### External Documentation
- [Supabase Docs](https://supabase.com/docs)
- [Nuxt 3 Docs](https://nuxt.com/docs)
- [Vue 3 Docs](https://vuejs.org/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Slack API Docs](https://api.slack.com/)
- [Figma API Docs](https://www.figma.com/developers/api)

---

## Getting Help

### For Code Issues
1. Check browser console for errors (F12)
2. Check Supabase dashboard for data issues
3. Review migration files in `supabase/migrations/`
4. Look at similar components for patterns

### For Database Issues
1. Supabase Dashboard → Table Editor → inspect data
2. Run `pnpm validate-db` to check schema
3. Check `activity_log` table for recent changes
4. Review RLS policies in Database → Authentication

### For Deployment Issues
1. Check `vercel logs` for build/runtime errors
2. Verify environment variables in Vercel dashboard
3. Check GitHub Actions workflows for CI failures
4. Review `.github/workflows/*.yml` files

---

**Last Updated:** November 14, 2025  
**Repository Branch:** claude/claude-md-mhzb599sx27oxjzl-01NT8L8Mw1pjsYgjxSr4qJbq  
**Status:** Production-Ready with Active Development
