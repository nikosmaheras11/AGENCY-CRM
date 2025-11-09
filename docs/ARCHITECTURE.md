# Architecture Overview

## System Design

The Agency Dashboard OS is built as a modern, modular system with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Nuxt 3)                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │  Creative   │ │ Performance │ │   Design    │          │
│  │   Module    │ │   Module    │ │   Module    │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
│  ┌─────────────────────────────────────────────┐          │
│  │         Resources Module (DAM)              │          │
│  └─────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
                           │
                    ┌──────┴──────┐
                    │             │
        ┌───────────▼──┐    ┌────▼──────────┐
        │  Directus    │    │  Integrations │
        │   Backend    │    │               │
        │              │    │  • Slack      │
        │  • REST API  │    │  • Analytics  │
        │  • GraphQL   │    │  • AI Tagging │
        │  • Auth      │    └───────────────┘
        │  • Storage   │
        └──────────────┘
              │
        ┌─────┴─────┐
        │           │
    ┌───▼───┐   ┌──▼──┐
    │ PostgreSQL│ │Redis│
    └───────┘   └─────┘
```

## Core Components

### 1. Frontend Layer (Nuxt 3)

**Technology Stack:**
- Nuxt 3 (Vue.js framework)
- TypeScript
- Tailwind CSS + Nuxt UI
- VueUse for composition utilities

**Module Structure:**

#### Creative Module
- Visual board for asset review (air.inc-style)
- Drag-and-drop interface
- In-context commenting
- Version management
- Approval workflows

**Key Files:**
- `frontend/components/creative/ReviewBoard.vue`
- `frontend/components/creative/AssetCard.vue`
- `frontend/pages/creative/index.vue`

#### Performance Module
- Analytics dashboard
- Campaign tracking
- Real-time metrics
- Report generation

**Key Files:**
- `frontend/components/performance/Dashboard.vue`
- `frontend/components/performance/CampaignCard.vue`
- `frontend/pages/performance/index.vue`

#### Design Module
- Component library
- Design system documentation
- Brand asset management
- Figma integration

**Key Files:**
- `frontend/components/design/ComponentLibrary.vue`
- `frontend/components/design/BrandAssets.vue`
- `frontend/pages/design/index.vue`

#### Resources Module (DAM)
- Digital asset management
- Smart tagging with AI
- Search and filtering
- Collections and folders
- Access control

**Key Files:**
- `frontend/components/resources/AssetBrowser.vue`
- `frontend/components/resources/SmartTag.vue`
- `frontend/pages/resources/index.vue`

### 2. Backend Layer (Directus)

**Collections:**

```
sectors
├── id (PK)
├── name
├── slug
├── description
├── color
└── icon

clients
├── id (PK)
├── name
├── logo (FK -> directus_files)
├── website
├── industry
└── status

projects
├── id (PK)
├── name
├── client_id (FK -> clients)
├── sector_id (FK -> sectors)
├── status
├── priority
├── start_date
├── due_date
└── budget

creative_assets
├── id (PK)
├── project_id (FK -> projects)
├── title
├── file (FK -> directus_files)
├── version
├── status
├── approval_status
└── feedback (JSON)

performance_campaigns
├── id (PK)
├── project_id (FK -> projects)
├── name
├── platform
├── budget
├── spend
├── impressions
├── clicks
├── conversions
└── metrics (JSON)

design_components
├── id (PK)
├── name
├── category
├── description
├── preview_image (FK -> directus_files)
├── figma_link
├── code_snippet
└── tags (JSON)

resources (DAM)
├── id (PK)
├── title
├── file (FK -> directus_files)
├── type
├── category
├── tags (JSON)
├── auto_tags (JSON)
├── metadata (JSON)
├── client_id (FK -> clients)
└── project_id (FK -> projects)

tags
├── id (PK)
├── name
├── category
├── color
└── auto_generated (boolean)

team_members
├── id (PK)
├── user_id (FK -> directus_users)
├── name
├── email
├── role
├── sector_id (FK -> sectors)
└── slack_id

activity_feed
├── id (PK)
├── action
├── collection
├── item_id
├── user_id (FK -> directus_users)
├── sector_id (FK -> sectors)
├── description
└── metadata (JSON)
```

### 3. Integration Layer

#### Slack Integration
**Location:** `integrations/slack/`

**Features:**
- Real-time notifications
- Channel-specific updates by sector
- Creative review notifications
- Performance alerts
- File sharing

**Implementation:**
- Directus Flows for automation
- Slack Web API
- Webhook endpoints

#### Smart Tagging (AI)
**Location:** `integrations/dam/`

**Features:**
- Automatic image analysis
- Content categorization
- Tag suggestion
- Metadata extraction

**Implementation:**
- OpenAI Vision API (optional)
- Directus hooks for file uploads
- Background processing

#### Analytics
**Location:** `integrations/analytics/`

**Features:**
- Campaign data aggregation
- Report generation
- Data visualization
- Export functionality

## Data Flow

### Example: Creative Asset Upload

1. User uploads file through frontend
2. File sent to Directus storage
3. Directus creates `creative_assets` record
4. Directus Flow triggers:
   - Smart tagging analysis (if enabled)
   - Slack notification to creative channel
   - Activity feed update
5. Frontend updates via real-time subscription
6. Team receives Slack notification with review link

### Example: Performance Metrics Update

1. External system posts metrics to Directus API
2. Directus updates `performance_campaigns` record
3. Directus Flow checks thresholds
4. If alert threshold exceeded:
   - Create Slack notification
   - Log to activity feed
   - Send email (optional)
5. Dashboard updates in real-time

## Security

### Authentication
- Directus handles all authentication
- JWT tokens for API access
- Role-based access control (RBAC)
- SSO integration (optional)

### Permissions
- Granular collection-level permissions
- Field-level access control
- Custom roles for sectors
- Client portal access (limited)

### Data Protection
- Environment variables for secrets
- CORS configuration
- Rate limiting via Redis
- Input validation and sanitization

## Deployment

### Development
```bash
docker-compose up -d    # Start Directus + DB + Redis
pnpm install           # Install dependencies
pnpm dev              # Start frontend
```

### Production

**Backend (Directus):**
- Directus Cloud (recommended)
- Self-hosted with Docker
- PostgreSQL as primary database
- Redis for caching and rate limiting

**Frontend (Nuxt):**
- Vercel (recommended)
- Netlify
- Any Node.js hosting
- Static generation for public pages

## Scalability Considerations

### Database
- PostgreSQL connection pooling
- Read replicas for heavy queries
- Proper indexing on frequently queried fields

### Caching
- Redis for session storage
- API response caching
- Asset CDN for file delivery

### File Storage
- Local storage for development
- S3/GCS for production
- CDN for asset delivery
- Image optimization pipeline

## Monitoring

### Recommended Tools
- Application monitoring: Sentry
- Performance: New Relic / DataDog
- Logs: ELK Stack / CloudWatch
- Uptime: Pingdom / UptimeRobot

### Key Metrics
- API response times
- File upload success rate
- Slack notification delivery
- User activity patterns
- Storage usage

## Future Enhancements

### Phase 2
- Real-time collaboration features
- Advanced search with Elasticsearch
- Mobile app (React Native)
- Automated workflow builder

### Phase 3
- AI-powered insights
- Predictive analytics
- Custom reporting engine
- Third-party app marketplace
