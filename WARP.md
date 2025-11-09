# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Agency Dashboard OS is a comprehensive agency management platform built on **Directus** (headless CMS backend) and **Nuxt 3** (Vue.js frontend). It provides unified dashboards across four core modules: Creative, Performance, Design, and Resources (DAM).

**Key Technologies:**
- Frontend: Nuxt 3, TypeScript, Tailwind CSS, Nuxt UI, VueUse
- Backend: Directus CMS, PostgreSQL, Redis
- Integrations: Slack Web API, OpenAI (optional), Directus SDK
- Package Manager: **pnpm** (required)

## Essential Commands

### Development Setup

```bash
# Install dependencies (always use pnpm)
pnpm install

# Start backend services (Directus + PostgreSQL + Redis)
docker-compose up -d

# Access Directus admin panel
# URL: http://localhost:8055
# Default credentials: admin@example.com / admin

# Start Nuxt development server
pnpm dev

# Frontend runs at: http://localhost:3000
```

### Docker Services Management

```bash
# Start all services
docker-compose up -d

# View logs for all services
docker-compose logs -f

# View logs for specific service
docker-compose logs -f directus
docker-compose logs -f postgres

# Stop all services
docker-compose down

# Stop and remove volumes (CAUTION: deletes database)
docker-compose down -v

# Restart a specific service
docker-compose restart directus
```

### Build & Production

```bash
# Build for production
pnpm build

# Preview production build locally
pnpm preview

# Generate static site (if applicable)
pnpm generate
```

### Code Quality

```bash
# Run ESLint
pnpm lint

# Fix ESLint issues automatically
pnpm lint:fix
```

### Directus Schema Management

```bash
# Import schema to Directus instance
cd directus
npx directus-template-cli@latest apply

# Create new Directus extension
cd directus/extensions
npx create-directus-extension@latest
```

## Architecture & Code Organization

### High-Level Architecture

The system follows a **three-tier architecture**:

1. **Frontend Layer** (Nuxt 3): Four independent modules with shared composables
2. **Backend Layer** (Directus): RESTful/GraphQL API, authentication, file storage
3. **Integration Layer**: External services (Slack, AI tagging, analytics)

**Data Flow Pattern:**
```
User Action → Frontend Component → Composable → Directus SDK → Directus API 
→ PostgreSQL → Directus Flows (triggers) → Integrations (Slack/AI)
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
- Directus API interactions use `useDirectus()` composable

### Directus Backend Architecture

**Core Collections:**
- `sectors` - Four main modules (Creative, Performance, Design, Resources)
- `clients` - Client management
- `projects` - Project tracking with sector relationships
- `creative_assets` - Creative files with approval workflows
- `performance_campaigns` - Campaign metrics and analytics
- `design_components` - Design system library
- `resources` - DAM entries with AI-powered tagging
- `tags` - Tagging taxonomy (manual + auto-generated)
- `team_members` - Team directory with Slack integration
- `activity_feed` - Real-time activity across sectors

**Key Relationships:**
- Projects belong to clients and sectors
- All module records (creative_assets, performance_campaigns, etc.) link to projects
- Team members are associated with sectors
- Activity feed tracks changes across all collections

### Integration Patterns

**Slack Integration** (`integrations/slack/`):
- Uses Directus Flows to trigger notifications
- Channel-specific routing by sector
- Webhook endpoints for bidirectional communication

**Smart Tagging** (`integrations/dam/`):
- Triggered on file upload via Directus hooks
- Uses OpenAI Vision API for image analysis
- Stores results in `resources.auto_tags` (JSON field)

**Analytics** (`integrations/analytics/`):
- Aggregates campaign data from `performance_campaigns`
- Provides report generation utilities
- Export functionality for external analysis

## Environment Configuration

**Required Variables:**
- `DIRECTUS_URL` - Directus instance URL (default: http://localhost:8055)
- `DIRECTUS_SERVER_TOKEN` - Admin token for server-side operations

**Slack Integration:**
- `SLACK_BOT_TOKEN` - Bot token (starts with xoxb-)
- `SLACK_SIGNING_SECRET` - For webhook verification
- `SLACK_CHANNEL_*` - Channel IDs for each sector

**Optional Features:**
- `OPENAI_API_KEY` - For AI-powered smart tagging
- `REDIS_HOST` / `REDIS_PORT` - For caching (recommended for production)

**Important:**
- Never commit `.env` file
- Use `.env.example` as template
- Secrets should be managed via environment variables, not hardcoded

## Development Patterns

### Directus SDK Usage

Always use the `useDirectus()` composable for API interactions:

```typescript
const { client } = useDirectus()

// Fetch data
const projects = await client.request(
  readItems('projects', {
    filter: { status: { _eq: 'active' } }
  })
)
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
