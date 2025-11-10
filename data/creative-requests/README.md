# Creative Requests Data Structure

This folder contains creative request submissions for the Polymarket Creative Requests dashboard.

## Folder Structure

```
data/creative-requests/
├── README.md           # This file
├── request-001.json    # Example request
└── [more-requests].json
```

## JSON Schema

Each creative request should be a JSON file with the following structure:

```json
{
  "id": "string (unique)",
  "title": "string",
  "format": "MOV | MP4 | PNG | JPG | PDF",
  "size": "string (e.g., '47 MB')",
  "dimensions": "string (e.g., '1080 × 1920')",
  "duration": "string (for videos, e.g., '0:15')",
  "commentCount": 0,
  "status": "new-request | in-progress | needs-review | needs-edit | done",
  "metadata": {
    "assignee": "string | null",
    "dueDate": "string | null",
    "tags": "string | null",
    "priority": "Low | Medium | High | Critical | null"
  },
  "thumbnail": "string (path or URL)",
  "createdAt": "ISO 8601 datetime",
  "updatedAt": "ISO 8601 datetime"
}
```

## Status Values

- `new-request` - Newly submitted, not yet reviewed
- `in-progress` - Currently being worked on
- `needs-review` - Ready for client review
- `needs-edit` - Requires revisions
- `done` - Completed and approved

## Automated Workflow Setup

### GitHub Actions Example

To automatically add new submissions via Git:

1. **External system** creates a new JSON file in this folder
2. **Commits and pushes** to the repo
3. **Dashboard automatically** reads from this folder on build/load

### Example Workflow (`.github/workflows/add-request.yml`)

```yaml
name: Add Creative Request
on:
  repository_dispatch:
    types: [new-creative-request]

jobs:
  add-request:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Create request file
        run: |
          REQUEST_ID="request-$(date +%s)"
          cat > data/creative-requests/${REQUEST_ID}.json << EOF
          {
            "id": "${REQUEST_ID}",
            "title": "${{ github.event.client_payload.title }}",
            "format": "${{ github.event.client_payload.format }}",
            "size": "${{ github.event.client_payload.size }}",
            "dimensions": "${{ github.event.client_payload.dimensions }}",
            "duration": "${{ github.event.client_payload.duration }}",
            "commentCount": 0,
            "status": "new-request",
            "metadata": {
              "assignee": null,
              "dueDate": null,
              "tags": null,
              "priority": null
            },
            "thumbnail": "${{ github.event.client_payload.thumbnail }}",
            "createdAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
            "updatedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
          }
          EOF
      
      - name: Commit and push
        run: |
          git config user.name "GitHub Actions Bot"
          git config user.email "<>"
          git add data/creative-requests/
          git commit -m "feat: add new creative request ${REQUEST_ID}"
          git push
```

### Triggering from External System

```bash
curl -X POST \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Authorization: token YOUR_GITHUB_TOKEN" \
  https://api.github.com/repos/nikosmaheras11/AGENCY-CRM/dispatches \
  -d '{
    "event_type": "new-creative-request",
    "client_payload": {
      "title": "Summer Campaign Banner",
      "format": "MP4",
      "size": "52 MB",
      "dimensions": "1920 × 1080",
      "duration": "0:30",
      "thumbnail": "https://example.com/thumb.jpg"
    }
  }'
```

## File Naming Convention

Files should be named: `request-{id}.json` or `request-{timestamp}.json`

Examples:
- `request-001.json`
- `request-1673456789.json`
- `request-campaign-summer-2025.json`

## Integration Notes

The dashboard will need to be updated to:
1. Read JSON files from this folder at build time or runtime
2. Parse and display them in the appropriate kanban columns based on `status`
3. Optionally watch for changes and auto-refresh

## Direct Git Push Alternative

You can also directly commit to this folder:

```bash
# Clone repo
git clone https://github.com/nikosmaheras11/AGENCY-CRM.git
cd AGENCY-CRM

# Create new request
cat > data/creative-requests/request-new.json << 'EOF'
{
  "id": "new-request-123",
  "title": "New Campaign Asset",
  "format": "MOV",
  "status": "new-request",
  ...
}
EOF

# Commit and push
git add data/creative-requests/request-new.json
git commit -m "feat: add new creative request"
git push
```
