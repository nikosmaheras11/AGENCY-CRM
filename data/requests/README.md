# Unified Requests System

This folder contains ALL requests (creative, performance, design) for the Polymarket dashboard. Requests are routed to different dashboards based on their `projectType` tag.

## Folder Structure

```
data/requests/
├── README.md           # This file
├── requests.json       # Master table of all requests
└── assets/            # Optional: uploaded files
```

## Master Table Schema (`requests.json`)

```json
{
  "requests": [
    {
      "id": "req-001",
      "projectType": "creative",
      "status": "new-request",
      "title": "Summer Campaign Banner",
      "format": "MP4",
      "size": "52 MB",
      "dimensions": "1920 × 1080",
      "duration": "0:30",
      "thumbnail": "",
      "metadata": {
        "assignee": null,
        "dueDate": null,
        "tags": [],
        "priority": null,
        "client": "Polymarket",
        "campaign": "Summer 2025"
      },
      "comments": [],
      "createdAt": "2025-01-10T10:30:00Z",
      "updatedAt": "2025-01-10T14:45:00Z"
    }
  ]
}
```

## Field Definitions

### Core Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ | Unique identifier (e.g., `req-001`, `req-1673456789`) |
| `projectType` | enum | ✅ | **Routes request to dashboard:** `creative`, `performance`, `design` |
| `status` | enum | ✅ | Current status (see Status Values below) |
| `title` | string | ✅ | Request title |

### Asset Fields (for creative/design)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `format` | string | ⚪ | File format: MOV, MP4, PNG, JPG, PDF, etc. |
| `size` | string | ⚪ | File size (e.g., "47 MB") |
| `dimensions` | string | ⚪ | Dimensions (e.g., "1080 × 1920") |
| `duration` | string | ⚪ | Video duration (e.g., "0:30") |
| `thumbnail` | string | ⚪ | Path or URL to thumbnail |

### Metadata

| Field | Type | Description |
|-------|------|-------------|
| `metadata.assignee` | string \| null | Assigned team member |
| `metadata.dueDate` | string \| null | Due date (ISO 8601) |
| `metadata.tags` | string[] | Custom tags |
| `metadata.priority` | enum \| null | `Low`, `Medium`, `High`, `Critical` |
| `metadata.client` | string | Client name |
| `metadata.campaign` | string | Campaign name |

### Tracking

| Field | Type | Description |
|-------|------|-------------|
| `comments` | array | Comments/feedback on the request |
| `createdAt` | string | ISO 8601 datetime |
| `updatedAt` | string | ISO 8601 datetime |

## Status Values

All requests start with `new-request` and flow through these statuses:

- **`new-request`** ⬅️ **ALL new submissions land here**
- `in-progress` - Being worked on
- `needs-review` - Ready for review
- `needs-edit` - Requires revisions
- `done` - Completed

## Project Type Routing

The `projectType` field determines which dashboard displays the request:

| projectType | Dashboard | URL |
|-------------|-----------|-----|
| `creative` | Polymarket Creative Requests | `/creative` |
| `performance` | Performance Hub | `/performance` |
| `design` | Design Hub | `/design` |

### Example: Creative Request
```json
{
  "id": "req-creative-001",
  "projectType": "creative",
  "status": "new-request",
  "title": "Video Ad for Spring Campaign",
  "format": "MP4"
}
```
→ Shows in `/creative` dashboard, "New Request" column

### Example: Performance Request
```json
{
  "id": "req-perf-001",
  "projectType": "performance",
  "status": "new-request",
  "title": "Q2 Campaign Analytics Review"
}
```
→ Shows in `/performance` dashboard, "New Request" column

### Example: Design Request
```json
{
  "id": "req-design-001",
  "projectType": "design",
  "status": "new-request",
  "title": "Brand Guidelines Update"
}
```
→ Shows in `/design` dashboard, "New Request" column

## Automated Workflow

### Adding New Requests via API

```bash
# Add new creative request
curl -X POST \
  -H "Authorization: token YOUR_GITHUB_TOKEN" \
  https://api.github.com/repos/nikosmaheras11/AGENCY-CRM/dispatches \
  -d '{
    "event_type": "new-request",
    "client_payload": {
      "projectType": "creative",
      "title": "Summer Campaign Video",
      "format": "MP4",
      "size": "52 MB",
      "dimensions": "1920 × 1080",
      "duration": "0:30"
    }
  }'
```

### GitHub Actions Workflow

Create `.github/workflows/add-request.yml`:

```yaml
name: Add New Request
on:
  repository_dispatch:
    types: [new-request]

jobs:
  add-request:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Add request to master table
        run: |
          # Generate unique ID
          REQUEST_ID="req-$(date +%s)"
          TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
          
          # Read existing requests
          REQUESTS=$(cat data/requests/requests.json)
          
          # Add new request (using jq)
          echo "$REQUESTS" | jq \
            --arg id "$REQUEST_ID" \
            --arg type "${{ github.event.client_payload.projectType }}" \
            --arg title "${{ github.event.client_payload.title }}" \
            --arg format "${{ github.event.client_payload.format }}" \
            --arg size "${{ github.event.client_payload.size }}" \
            --arg dimensions "${{ github.event.client_payload.dimensions }}" \
            --arg duration "${{ github.event.client_payload.duration }}" \
            --arg created "$TIMESTAMP" \
            --arg updated "$TIMESTAMP" \
            '.requests += [{
              "id": $id,
              "projectType": $type,
              "status": "new-request",
              "title": $title,
              "format": $format,
              "size": $size,
              "dimensions": $dimensions,
              "duration": $duration,
              "thumbnail": "",
              "metadata": {
                "assignee": null,
                "dueDate": null,
                "tags": [],
                "priority": null,
                "client": "Polymarket",
                "campaign": ""
              },
              "comments": [],
              "createdAt": $created,
              "updatedAt": $updated
            }]' > data/requests/requests.json
      
      - name: Commit and push
        run: |
          git config user.name "GitHub Actions Bot"
          git config user.email "<>"
          git add data/requests/requests.json
          git commit -m "feat: add new ${{ github.event.client_payload.projectType }} request"
          git push
```

## Direct Git Push

```bash
# Clone repo
git clone https://github.com/nikosmaheras11/AGENCY-CRM.git
cd AGENCY-CRM

# Edit requests.json and add your request to the "requests" array
nano data/requests/requests.json

# Commit and push
git add data/requests/requests.json
git commit -m "feat: add new request"
git push
```

## Dashboard Integration

Each dashboard (`/creative`, `/performance`, `/design`) will:

1. Load `data/requests/requests.json`
2. Filter by `projectType` matching that dashboard
3. Group by `status` into kanban columns
4. Display in appropriate column based on status

All new submissions automatically land in the **"New Request"** column of their respective dashboard.

## Example Complete Request

```json
{
  "id": "req-1736472000",
  "projectType": "creative",
  "status": "new-request",
  "title": "Polymarket Spring Campaign - Hero Video",
  "format": "MOV",
  "size": "147 MB",
  "dimensions": "1920 × 1080",
  "duration": "0:45",
  "thumbnail": "https://example.com/thumbnails/req-1736472000.jpg",
  "metadata": {
    "assignee": null,
    "dueDate": "2025-02-15T17:00:00Z",
    "tags": ["video", "campaign", "hero"],
    "priority": "High",
    "client": "Polymarket",
    "campaign": "Spring 2025 Launch"
  },
  "comments": [],
  "createdAt": "2025-01-10T10:30:00Z",
  "updatedAt": "2025-01-10T10:30:00Z"
}
```
