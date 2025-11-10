# Agency OS Framework Knowledge Base

> **Source**: [directus-labs/agency-os](https://github.com/directus-labs/agency-os)  
> **Description**: The open source operating system for digital agencies. Built with Directus and Nuxt.  
> **Demo**: https://agency-os.vercel.app/  
> **Video Tutorials**: [YouTube Playlist](https://www.youtube.com/playlist?list=PLD--x9rY3ZL1tPNZxCTE_-IsFTrFGKHH-)

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Core Philosophy](#core-philosophy)
3. [Architecture](#architecture)
4. [Feature Set](#feature-set)
5. [Tech Stack](#tech-stack)
6. [Installation & Setup](#installation--setup)
7. [Project Structure](#project-structure)
8. [Key Components](#key-components)
9. [Deployment](#deployment)
10. [Customization Guide](#customization-guide)
11. [Integration Patterns](#integration-patterns)

---

## Project Overview

**AgencyOS** is a complete, production-ready solution for running digital agencies. It combines:
- **Nuxt 3**: Frontend website and application
- **Directus**: Backend CMS, API, and database management
- Pre-built agency workflows and tools

### Why AgencyOS Exists

Created by the Directus team (many with agency backgrounds) in partnership with NuxtLabs, AgencyOS addresses the hard parts of running an agency:
- Project management with multiple moving pieces
- Client communication and expectation management
- Payment tracking and invoicing
- Time tracking and billable hours

**Key Principle**: Don't build from scratch or settle for inadequate off-the-shelf tools. AgencyOS is 100% hackable and customizable to YOUR workflow.

---

## Core Philosophy

### Built for Real Agencies
- Not a starter template—a **complete, production-ready project**
- Based on real agency workflows and pain points
- Designed to be customized, not just configured

### Open Source & Hackable
- MIT License
- Full access to source code
- Extensible through Directus extensions and Nuxt modules
- No vendor lock-in

### Integrated Approach
- CRM + Project Management unified (not separate tools)
- Client portal built-in (not bolted on)
- Website and backend share same data layer

---

## Architecture

### Three-Tier System

```
┌─────────────────────────────────────────┐
│         Frontend (Nuxt 3)               │
│  ┌──────────┐  ┌──────────┐  ┌────────┐│
│  │ Website  │  │ Client   │  │  CRM   ││
│  │          │  │ Portal   │  │        ││
│  └──────────┘  └──────────┘  └────────┘│
└─────────────────┬───────────────────────┘
                  │ REST/GraphQL APIs
┌─────────────────▼───────────────────────┐
│         Backend (Directus)              │
│  ┌──────────┐  ┌──────────┐  ┌────────┐│
│  │   CMS    │  │   API    │  │  Auth  ││
│  │          │  │          │  │        ││
│  └──────────┘  └──────────┘  └────────┘│
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│      Database (PostgreSQL)              │
└─────────────────────────────────────────┘
```

### Data Flow Pattern

```
User Action → Component → Composable → Directus SDK 
→ Directus API → PostgreSQL → Directus Flows (automation) 
→ Webhooks/Integrations
```

---

## Feature Set

### 1. **Website** (Public-Facing)

Complete agency website with:

**Content Management**
- Dynamic page builder with live preview
- Blog posts with categories
- Dynamic form generation with validation
- SEO fully configured (meta tags, sitemap, redirects, JSON-LD)

**Technical Features**
- Dynamic OG image generation
- Global search functionality
- Google Fonts support
- Full dark mode support
- Themeable with config file
- ESLint + Prettier pre-configured

### 2. **CRM / Project Tracker** (Internal)

Unified client relationship and project management:

**Client Management**
- Organizations and contacts database
- Sales pipeline tracking
- Activity logging and history

**Project Management**
- Dynamic project proposal builder
- Task management system
- Customizable project templates
- Time tracking

**Financial**
- Invoicing system
- Expense tracking
- Payment processing (Stripe integration)

**Automation**
- Custom dashboards (no-code)
- Process automation via Directus Flows
- Triggers and webhooks

### 3. **Client Portal** (Authenticated)

Private portal for client self-service:

**Client Capabilities**
- View their projects and tasks
- Upload/download files
- Track project progress
- Pay invoices through Stripe
- Receive task assignments

**Communication**
- Reduces email back-and-forth
- Accountability for client deliverables
- Centralized file sharing
- Status transparency

---

## Tech Stack

### Frontend Stack

| Technology | Purpose | Documentation |
|------------|---------|---------------|
| **Nuxt 3** | Vue.js framework with SSR | [nuxt.com](https://nuxt.com) |
| **Nuxt UI** | Component library | [ui.nuxt.com](https://ui.nuxt.com) |
| **Tailwind CSS** | Utility-first styling | [tailwindcss.com](https://tailwindcss.com) |
| **FormKit** | Form handling & validation | [formkit.com](https://formkit.com) |
| **Headless UI** | Unstyled accessible components | [headlessui.dev](https://headlessui.dev) |
| **VueUse** | Composition utilities | [vueuse.org](https://vueuse.org) |
| **VueUse Motion** | Animation composables | [motion.vueuse.org](https://motion.vueuse.org) |
| **Nuxt Icon** | Icon component system | [github.com/nuxt-modules/icon](https://github.com/nuxt-modules/icon) |

### Backend Stack

| Technology | Purpose | Documentation |
|------------|---------|---------------|
| **Directus** | Headless CMS & API platform | [directus.io](https://directus.io) |
| **PostgreSQL** | Database (required) | [postgresql.org](https://www.postgresql.org) |
| **Directus Flows** | Automation & webhooks | [docs.directus.io/flows](https://docs.directus.io) |
| **Directus Extensions** | Custom functionality | [docs.directus.io/extensions](https://docs.directus.io) |

### Integrations

| Service | Purpose | Required |
|---------|---------|----------|
| **Stripe** | Payment processing | Optional |
| **Docker** | Local development | Dev only |
| **Vercel/Netlify** | Frontend hosting | Production |
| **Directus Cloud** | Backend hosting | Production (recommended) |

---

## Installation & Setup

### Prerequisites

- Node.js 18+
- pnpm package manager
- Docker & Docker Compose (for local Directus)
- PostgreSQL database access

### Step-by-Step Setup

#### 1. Backend Setup (Directus)

**Option A: Directus Cloud (Recommended)**
1. Register at https://directus.cloud/register
2. Create new project (90 seconds)
3. 14-day free trial included
4. Note your project URL

**Option B: Self-Host with Docker**
```bash
# Navigate to Directus directory
cd .directus

# Start services
docker compose up

# Access at http://localhost:8055
```

#### 2. Generate Admin Token

1. Go to Directus → User Directory
2. Select Administrative User
3. Scroll to Token field
4. Generate and copy token
5. **IMPORTANT**: Save the user (otherwise "Invalid token" error)

#### 3. Apply AgencyOS Template

```bash
# Run template installer
npx directus-template-cli@latest apply

# Follow prompts:
# 1. Choose "Agency OS" template
# 2. Paste Directus URL
# 3. Paste admin token
# 4. Wait for completion (may take minutes)
```

#### 4. Frontend Setup (Nuxt)

```bash
# Clone repository
git clone https://github.com/directus-community/agency-os.git your-project
cd your-project

# Configure environment
mv env.example .env
# Edit .env with your values

# Install dependencies
pnpm install

# Start development server
pnpm dev
# Access at http://localhost:3000
```

#### 5. Environment Configuration

```env
# Directus Setup
DIRECTUS_URL="https://your-instance.directus.app"
DIRECTUS_SERVER_TOKEN="your_static_token_here"
SITE_URL="http://localhost:3000"

# Stripe Setup (Optional)
STRIPE_SECRET_KEY="sk_test_xxxxx"
STRIPE_PUBLISHABLE_KEY="pk_xxxxx"
STRIPE_WEBHOOK_SECRET="whsec_xxxxx"
```

---

## Project Structure

### High-Level Organization

```
agency-os/
├── .directus/              # Backend configuration
│   └── docker-compose.yaml # Local Directus setup
│
├── components/             # Vue components
│   ├── content/           # Content-related components
│   ├── navigation/        # Navigation elements
│   ├── forms/            # Form components
│   └── ui/               # Reusable UI elements
│
├── composables/           # Vue composables (shared logic)
│   ├── useDirectus.ts    # Directus SDK wrapper
│   ├── useAuth.ts        # Authentication
│   └── useProjects.ts    # Project management
│
├── pages/                 # Nuxt routing (file-based)
│   ├── index.vue         # Homepage
│   ├── blog/             # Blog routes
│   ├── portal/           # Client portal (authenticated)
│   └── crm/              # CRM dashboard
│
├── server/                # Server-side code
│   ├── api/              # API endpoints
│   └── middleware/       # Server middleware
│
├── layers/                # Nuxt layers (modular architecture)
│
├── modules/               # Custom Nuxt modules
│
├── public/                # Static assets
│
├── utils/                 # Utility functions
│
├── types/                 # TypeScript definitions
│
├── app.config.ts          # App configuration
├── nuxt.config.ts         # Nuxt configuration
├── tailwind.config.ts     # Tailwind configuration
└── theme.ts               # Theme customization
```

### Key Configuration Files

| File | Purpose |
|------|---------|
| `nuxt.config.ts` | Nuxt framework configuration, modules, plugins |
| `app.config.ts` | Application-level settings (site name, theme, etc.) |
| `tailwind.config.ts` | Tailwind CSS customization |
| `theme.ts` | Design system tokens and theming |
| `.env` | Environment variables (secrets, API keys) |

---

## Key Components

### Core Directus Collections

AgencyOS creates these collections via the template:

**Client & Organization Management**
- `organizations` - Client companies
- `contacts` - Individual client contacts
- `deals` - Sales pipeline entries

**Project Management**
- `projects` - All agency projects
- `tasks` - Individual task items
- `project_templates` - Reusable project structures
- `time_entries` - Time tracking

**Financial**
- `invoices` - Billing records
- `invoice_items` - Line items
- `expenses` - Expense tracking
- `payments` - Payment history (Stripe)

**Content (Website)**
- `pages` - Dynamic page builder
- `posts` - Blog content
- `categories` - Content categorization
- `forms` - Dynamic form definitions
- `form_submissions` - Form entries

**System**
- `activity` - Audit log
- `settings` - Global configuration
- `users` - Team members

### Key Composables

#### `useDirectus()`
Main composable for Directus API interactions:

```typescript
const { client } = useDirectus()

// Fetch projects
const projects = await client.request(
  readItems('projects', {
    filter: { status: { _eq: 'active' } }
  })
)
```

#### `useAuth()`
Authentication and user management:

```typescript
const { user, login, logout, isAuthenticated } = useAuth()

// Login
await login({ email, password })

// Check auth status
if (isAuthenticated.value) {
  // Show portal
}
```

#### `useProjects()`
Project-specific operations:

```typescript
const { projects, fetchProjects, createProject } = useProjects()

// Fetch client projects
await fetchProjects({ clientId: 'xxx' })

// Create new project
await createProject({
  name: 'New Website',
  client_id: 'xxx',
  status: 'active'
})
```

---

## Deployment

### Frontend (Nuxt) Deployment

**Recommended: Vercel**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fdirectus-community%2Fagency-os)

**Alternative: Netlify**

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/directus-community/agency-os)

**Environment Variables Required**:
- `DIRECTUS_URL`
- `DIRECTUS_SERVER_TOKEN`
- `NUXT_PUBLIC_SITE_URL`
- `STRIPE_SECRET_KEY` (optional)
- `STRIPE_PUBLISHABLE_KEY` (optional)
- `STRIPE_WEBHOOK_SECRET` (optional)

**Build Configuration**:
```bash
# Build command
pnpm build

# Output directory
.output/
```

### Backend (Directus) Deployment

**Recommended: Directus Cloud**
- Production-ready in minutes
- Automatic backups
- Managed updates
- Professional support
- Pricing: https://directus.io/pricing/cloud

**Self-Hosting with Docker**

Use the provided `docker-compose.yaml` as template:

```yaml
services:
  directus:
    image: directus/directus:latest
    ports:
      - 8055:8055
    environment:
      KEY: 'replace-with-secure-key'
      SECRET: 'replace-with-secure-secret'
      DB_CLIENT: 'pg'
      DB_HOST: 'postgres'
      # ... more config
    volumes:
      - ./uploads:/directus/uploads
      - ./extensions:/directus/extensions
```

**Self-Hosting Resources**:
- [Directus Docker Guide](https://docs.directus.io/self-hosted/docker-guide.html)
- [Deploy to DigitalOcean](https://docs.directus.io/blog/deploy-directus-digital-ocean-docker.html)
- [Deploy on Railway](https://railway.app/template/2fy758)

### Database Considerations

- **PostgreSQL is required** (tested and verified)
- Other SQL databases supported by Directus but NOT tested with AgencyOS
- Production: Use managed PostgreSQL (AWS RDS, DigitalOcean, etc.)
- Enable automated backups
- Regular snapshot schedule recommended

---

## Customization Guide

### Theming

Edit `theme.ts` to customize colors, fonts, and design tokens:

```typescript
export default {
  colors: {
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    accent: '#F59E0B',
  },
  fonts: {
    sans: ['Inter', 'sans-serif'],
    mono: ['Fira Code', 'monospace'],
  },
  // ... more configuration
}
```

### Adding Custom Pages

AgencyOS uses file-based routing:

```bash
# Create new page
touch pages/services.vue

# Accessible at /services
```

Example component:
```vue
<template>
  <div>
    <h1>Our Services</h1>
    <!-- Your content -->
  </div>
</template>

<script setup>
// Fetch data from Directus
const { client } = useDirectus()
const services = await client.request(readItems('services'))
</script>
```

### Extending Directus Collections

1. Log into Directus admin (http://localhost:8055)
2. Go to Settings → Data Model
3. Create new collection or modify existing
4. Add fields as needed
5. Set permissions
6. Export schema snapshot: `npx directus schema snapshot`
7. Commit snapshot to version control

### Creating Custom Directus Extensions

```bash
cd .directus/extensions

# Create new extension
npx create-directus-extension@latest

# Choose type:
# - Hook (backend logic)
# - Endpoint (API route)
# - Interface (custom field UI)
# - Display (data visualization)
# - Panel (dashboard widget)
```

### Custom Composables

Create reusable logic:

```typescript
// composables/useAnalytics.ts
export const useAnalytics = () => {
  const { client } = useDirectus()
  
  const trackPageview = async (page: string) => {
    await client.request(
      createItem('analytics', { page, timestamp: new Date() })
    )
  }
  
  return { trackPageview }
}

// Use in component
const { trackPageview } = useAnalytics()
await trackPageview('/services')
```

---

## Integration Patterns

### Directus Flows (Automation)

AgencyOS uses Directus Flows for:
- Email notifications on project updates
- Slack notifications
- Invoice generation triggers
- Task assignment notifications

**Example Flow**: Send email when invoice is created
1. Trigger: Item Created (invoices collection)
2. Condition: Check if status = 'sent'
3. Action: Send email to client contact

### Stripe Integration

Payment processing flow:

```
Client Portal → Payment Intent → Stripe API 
→ Webhook → Directus Flow → Update Invoice → Email Receipt
```

**Setup Steps**:
1. Create Stripe account
2. Get API keys (test/live)
3. Set environment variables
4. Configure webhook endpoint
5. Test with Stripe CLI

### Custom API Endpoints

Create server routes in `server/api/`:

```typescript
// server/api/reports/revenue.get.ts
export default defineEventHandler(async (event) => {
  const directus = useDirectus()
  
  const invoices = await directus.client.request(
    readItems('invoices', {
      filter: { status: { _eq: 'paid' } }
    })
  )
  
  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.amount, 0)
  
  return { totalRevenue }
})
```

Access at `/api/reports/revenue`

### Authentication Patterns

**Public pages** - No auth required
```vue
<script setup>
// No auth check needed
</script>
```

**Protected pages** - Middleware enforces auth
```vue
<script setup>
definePageMeta({
  middleware: 'auth' // Built-in auth middleware
})
</script>
```

**Role-based access**
```vue
<script setup>
const { user } = useAuth()

// Check role
if (user.value?.role !== 'admin') {
  throw createError({ statusCode: 403 })
}
</script>
```

---

## Best Practices

### Development Workflow

1. **Always use pnpm** (not npm/yarn)
2. Keep `.env` out of version control
3. Commit Directus schema snapshots regularly
4. Test locally with Docker before deploying
5. Use TypeScript strict mode
6. Follow Vue 3 Composition API patterns

### Database Management

- PostgreSQL only (officially supported)
- Enable connection pooling in production
- Set up automated backups
- Monitor query performance
- Use Directus migrations for schema changes

### Security Considerations

- Use Directus roles and permissions properly
- Never expose `DIRECTUS_SERVER_TOKEN` in frontend
- Enable HTTPS in production
- Set up CORS policies correctly
- Sanitize user input in custom endpoints
- Keep dependencies updated

### Performance Optimization

- Enable Redis caching (production)
- Use Directus field aliases to reduce payload
- Implement pagination for large collections
- Optimize images (Directus built-in transforms)
- Use Nuxt SSR appropriately (SEO pages)
- Lazy load components where possible

---

## Common Issues & Solutions

### Issue: "Invalid token" error
**Solution**: Make sure you saved the user after generating the token

### Issue: Template apply fails
**Solution**: Verify Directus URL is accessible and token has admin permissions

### Issue: Build fails on Netlify
**Solution**: Increase memory limit or use Vercel (recommended)

### Issue: Directus not starting with Docker
**Solution**: Check PostgreSQL is running and ports aren't in use

### Issue: Stripe webhooks failing
**Solution**: Verify webhook secret and endpoint URL are correct

---

## Resources & Support

### Official Documentation
- [AgencyOS GitHub](https://github.com/directus-labs/agency-os)
- [Directus Documentation](https://docs.directus.io)
- [Nuxt Documentation](https://nuxt.com/docs)
- [Video Tutorials](https://www.youtube.com/playlist?list=PLD--x9rY3ZL1tPNZxCTE_-IsFTrFGKHH-)

### Community Support
- [Directus Discord](https://discord.com/invite/directus) - 10k+ developers
- [Nuxt Discord](https://discord.com/invite/ps2h6QT)
- [GitHub Issues](https://github.com/directus-community/agency-os/issues)

### Contributing
- Open issues for bugs
- Submit PRs for features/fixes
- Follow existing code patterns
- Update documentation

---

## Credits

**Created by**: Bryant Gillespie ([@bryantgillespie](https://twitter.com/bryantgillespie))

**Thanks to**:
- [@rijkvanzanten](https://github.com/rijkvanzanten) and [@benhaynes](https://github.com/benhaynes) - Directus creators
- [@atinux](https://github.com/Atinux) and [@alexchopin](https://github.com/alexchopin) - Nuxt creators
- [@intevel](https://github.com/Intevel) and [@becem-gharbi](https://github.com/becem-gharbi) - `nuxt-directus` module inspiration

**Partnership**: Directus × NuxtLabs

---

## License

MIT License - Free to use, modify, and distribute

---

## Version History

- **v1.0.0** - Initial release with full CRM, portal, and website
- Built on Nuxt 3.x and Directus 10.x
- Continuously updated by community

---

*This knowledge base is based on the official [directus-labs/agency-os](https://github.com/directus-labs/agency-os) repository. For the most up-to-date information, always refer to the official documentation.*
