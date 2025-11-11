# Agency Dashboard OS

> Operating system and client dashboard for agency management - built on Supabase and Nuxt 3

A comprehensive agency management platform providing unified dashboards across Creative, Performance, Design, and Resource management with integrated Slack notifications and automated workflows.

## 🎯 Core Features

### **High-Level Dashboard**
- Unified view across all agency sectors
- Real-time status updates and notifications
- Team activity feed
- Quick access to critical metrics

### **Creative Module**
- Creative review visual board (air.inc-style)
- Project approval workflows
- Asset versioning and feedback loops
- Creative brief management

### **Performance Module**
- Analytics reporting dashboard
- Campaign performance metrics
- KPI tracking and visualization
- Automated performance reports

### **Design Module**
- Design system component library
- Brand asset management
- Design project tracking
- Collaborative design reviews

### **Resources Module**
- **DAM (Digital Asset Management)**: Centralized asset storage with smart organization
- **Smart Tagging**: AI-powered automatic tagging and categorization
- **Slack Integration**: Real-time team communication and notifications
- **File Management**: Version control, metadata, and access management

## 🏗️ Architecture

```
agency-dashboard-os/
├── supabase/              # Database & Backend
│   └── migrations/        # SQL schema migrations
├── workers/               # Background services
│   ├── notification-worker.js
│   ├── metrics-sync-worker.js
│   └── retention-worker.js
├── components/            # Nuxt 3 components
│   ├── creative/          # Creative review components
│   ├── performance/       # Analytics & reporting
│   ├── design/            # Design system components
│   └── resources/         # DAM & resource management
├── pages/                 # Application routes
├── composables/           # Vue composables
├── utils/                 # Utility functions
└── docs/                  # Documentation
```

### Key Technologies
- **Frontend**: Nuxt 3, TypeScript, Tailwind CSS, Nuxt UI
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Real-time)
- **Workers**: Node.js background services
- **Integrations**: Slack Web API, Meta Ads API, Google Ads API

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (with pnpm)
- Supabase project (create at [supabase.com](https://supabase.com))
- Slack workspace (for integrations)

### 1. Clone and Install

```bash
git clone <your-repo-url> agency-dashboard-os
cd agency-dashboard-os
pnpm install
```

### 2. Deploy Database Schema

**Option A - Supabase Dashboard (Recommended):**
1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy contents of `supabase/migrations/20250110_complete_schema.sql`
4. Paste and execute

**Option B - Supabase CLI:**
```bash
supabase db push
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_SIGNING_SECRET=your_signing_secret
```

### 4. Start Worker Services

```bash
# Terminal 1: Notification Worker
node workers/notification-worker.js

# Terminal 2: Metrics Sync Worker
node workers/metrics-sync-worker.js
```

### 5. Run Development Server

```bash
pnpm dev
```

Visit `http://localhost:3000`

## 📚 Detailed Documentation

- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Complete setup walkthrough
- **[WORKER_SERVICES.md](./WORKER_SERVICES.md)** - Background worker implementation
- **[WARP.md](./WARP.md)** - Development guidelines

## 📦 Tech Stack

### Frontend
- **Nuxt 3**: Vue.js framework with TypeScript
- **Nuxt UI**: Component library with Tailwind CSS
- **VueUse**: Composition utilities
- **Supabase JS**: Realtime database client

### Backend
- **Supabase**: PostgreSQL database, Auth, Storage, Real-time
- **Row Level Security**: Database-level permissions
- **PostgreSQL Triggers**: Automated workflows

### Worker Services
- **Node.js**: Background processing
- **Slack Web API**: Team notifications
- **Meta Ads API**: Performance metrics sync

### Integrations
- **Slack**: Real-time notifications and bidirectional sync
- **Meta Ads**: Automated campaign metrics
- **Google Ads**: Performance tracking (ready for implementation)
- **OpenAI API**: Smart tagging (optional)

## 🎨 Key Modules

### Creative Review Board
Visual board for creative asset review and approval, inspired by air.inc:
- Drag-and-drop asset management
- In-context commenting and annotations
- Version comparison
- Approval workflows

### Performance Analytics
Comprehensive analytics dashboard:
- Campaign performance tracking
- Custom report builder
- Automated scheduled reports
- Client-facing analytics portal

### DAM with Smart Tagging
Digital asset management with AI:
- Automatic tagging and categorization
- Advanced search and filtering
- Collections and organization
- Access control and permissions

### Slack Integration
Real-time team collaboration:
- Notifications for project updates
- Approval requests
- File sharing
- Channel-specific updates by sector

## 🔧 Configuration

### Slack Setup
1. Create a Slack App at [api.slack.com](https://api.slack.com)
2. Enable Bot Token Scopes: `chat:write`, `files:write`, `channels:read`
3. Install app to workspace
4. Copy Bot Token to `.env`

### Smart Tagging Setup
1. Get OpenAI API key from [platform.openai.com](https://platform.openai.com)
2. Add to `.env` as `OPENAI_API_KEY`
3. Configure tagging rules in Directus

## 🗄️ Database Schema

### Core Tables
- `requests`: Multi-board request management
- `clients`: Client management
- `assets`: Asset management with versioning
- `comments`: Threaded comments with positioning
- `tags`: Smart tagging taxonomy
- `profiles`: Team member profiles
- `project_tasks`: Task tracking

### Automation & Integration
- `automation_rules`: Configurable workflow automation
- `automation_rule_templates`: Predefined automation patterns
- `notification_queue`: Slack notification processing
- `slack_connected_channels`: Slack channel mappings
- `slack_comment_threads`: Bidirectional comment sync

### Performance Tracking
- `performance_metrics`: Campaign performance data
- `platform_connections`: API integration credentials
- `metric_sync_logs`: Sync history and error tracking

### Data Management
- `activity_log`: Audit trail
- `archived_activity_log`: Historical data
- `retention_policies`: Automated data archival

See [complete schema](./supabase/migrations/20250110_complete_schema.sql) for full details.

## 🚢 Deployment

### Frontend (Nuxt)
Deploy to Vercel, Netlify, or any Node.js host:
```bash
pnpm build
# Deploy .output directory
```

### Backend (Supabase)
Already hosted! Just configure the schema.

### Worker Services

**PM2 (VPS/Server):**
```bash
pm2 start workers/notification-worker.js --name "notification-worker"
pm2 start workers/metrics-sync-worker.js --name "metrics-worker"
pm2 save && pm2 startup
```

**Docker/Cloud:** See [WORKER_SERVICES.md](./WORKER_SERVICES.md)

## 📝 Development

### Create Database Migration
```bash
supabase migration new your_migration_name
# Edit the generated file in supabase/migrations/
supabase db push
```

### Create New Module Component
```bash
# Example: new performance widget
touch components/performance/MetricsWidget.vue
```

### Test Status Transitions
```sql
INSERT INTO requests (title, request_type, created_by)
VALUES ('Test', 'creative', auth.uid());

UPDATE requests SET status = 'in_progress' WHERE title = 'Test'; -- ✅
UPDATE requests SET status = 'needs_edit' WHERE title = 'Test'; -- ❌ Invalid
```

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push branch: `git push origin feature/amazing-feature`
4. Open Pull Request

## 📄 License

MIT License - see LICENSE file

## 🔗 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Nuxt 3 Documentation](https://nuxt.com/docs)
- [Slack API Documentation](https://api.slack.com)
- [Project Documentation](./DEPLOYMENT_GUIDE.md)

## 🆘 Support

For issues and questions:
- Check [Documentation](./docs/)
- Open an issue on GitHub
- Contact team lead

---

Built with ❤️ for agency teams who need a unified operating dashboard
