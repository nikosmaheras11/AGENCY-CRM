# Agency Dashboard OS

> Operating system and client dashboard for agency management - built on Directus and Nuxt 3

A high-level dashboard providing team and clients with real-time snapshots across all agency sectors: Creative, Performance, Design, and Resources.

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

Built on the foundation of [directus-labs/agency-os](https://github.com/directus-labs/agency-os), extended with:

```
agency-dashboard-os/
├── directus/              # Backend & CMS
│   ├── extensions/        # Custom Directus extensions
│   ├── templates/         # Collection templates
│   └── snapshots/         # Schema snapshots
├── frontend/              # Nuxt 3 application
│   ├── components/
│   │   ├── creative/      # Creative review components
│   │   ├── performance/   # Analytics & reporting
│   │   ├── design/        # Design system components
│   │   └── resources/     # DAM & resource management
│   ├── pages/             # Application routes
│   ├── composables/       # Vue composables
│   └── utils/             # Utility functions
├── integrations/          # Third-party integrations
│   ├── slack/             # Slack bot & webhooks
│   ├── analytics/         # Analytics connectors
│   └── dam/               # DAM utilities
└── docs/                  # Documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (with pnpm)
- Docker & Docker Compose
- Directus Cloud account or local Directus instance
- Slack workspace (for integrations)

### 1. Clone and Install

```bash
git clone <your-repo-url> agency-dashboard-os
cd agency-dashboard-os
pnpm install
```

### 2. Set Up Directus

#### Option A: Using Docker (Recommended for Development)
```bash
docker-compose up -d
```

Access Directus at `http://localhost:8055`

#### Option B: Directus Cloud
1. Create a new project at [directus.cloud](https://directus.cloud)
2. Note your project URL and admin token

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
DIRECTUS_URL=http://localhost:8055
DIRECTUS_SERVER_TOKEN=your-admin-token
SLACK_BOT_TOKEN=xoxb-your-bot-token
# ... other variables
```

### 4. Import Schema

```bash
# Import the agency dashboard schema
cd directus
npx directus-template-cli@latest apply
```

### 5. Run Development Server

```bash
pnpm dev
```

Visit `http://localhost:3000`

## 📦 Tech Stack

### Frontend
- **Nuxt 3**: Vue.js framework
- **Nuxt UI**: Component library with Tailwind CSS
- **VueUse**: Composition utilities
- **Chart.js**: Data visualization

### Backend
- **Directus**: Headless CMS and backend
- **PostgreSQL**: Database
- **Redis**: Caching (optional)

### Integrations
- **Slack Web API**: Team communication
- **OpenAI API**: Smart tagging (optional)
- **Directus SDK**: API client

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

## 📊 Directus Collections

Key collections created:
- `projects`: All agency projects
- `clients`: Client management
- `creative_assets`: Creative review items
- `performance_campaigns`: Campaign tracking
- `design_components`: Design system
- `resources`: DAM entries
- `tags`: Smart tagging taxonomy
- `team_members`: Team directory
- `sectors`: Creative, Performance, Design, Resources

## 🚢 Deployment

### Frontend (Nuxt)
Deploy to Vercel, Netlify, or any Node.js host:
```bash
pnpm build
pnpm preview
```

### Backend (Directus)
- Use Directus Cloud (recommended)
- Self-host with Docker
- Deploy to any Node.js host

## 📝 Development

### Add Custom Directus Extension
```bash
cd directus/extensions
npx create-directus-extension@latest
```

### Create New Module Component
```bash
# Example: new performance widget
touch frontend/components/performance/MetricsWidget.vue
```

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push branch: `git push origin feature/amazing-feature`
4. Open Pull Request

## 📄 License

MIT License - see LICENSE file

## 🔗 Resources

- [Directus Documentation](https://docs.directus.io)
- [Nuxt 3 Documentation](https://nuxt.com/docs)
- [Agency OS Base](https://github.com/directus-labs/agency-os)
- [Project Documentation](./docs/)

## 🆘 Support

For issues and questions:
- Check [Documentation](./docs/)
- Open an issue on GitHub
- Contact team lead

---

Built with ❤️ for agency teams who need a unified operating dashboard
