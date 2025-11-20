# Brief to Asset Workflow

## Overview

The creative request system now uses a **two-stage workflow** that separates the brief phase from the asset review phase.

```
┌─────────────────┐       Status Change        ┌─────────────────┐
│  Brief Stage    │  ────────────────────────> │ Asset Review    │
│  (new_requests) │   to "needs-review"        │  (requests)     │
└─────────────────┘                             └─────────────────┘
Status: new-request                             Status: needs-review
        in-progress                                     needs-edit
                                                        done
```

## Stage 1: Brief (new_requests table)

### Purpose
Lightweight brief management before assets are created. Focus on requirements gathering and planning.

### Available Statuses
- `new-request` - Newly submitted, waiting to be started
- `in-progress` - Being worked on, assets being created

### UI Component
**BriefViewModal** - Simplified view showing:
- Form fields as readable brief format
- Platform and ad size chips
- Description and inspiration
- Figma/reference links
- Quick action buttons ("Start Working", "Move to Review")

### Database Schema
```sql
new_requests (
  id UUID PRIMARY KEY,
  title VARCHAR(255),           -- Creative name
  platform TEXT[],              -- ["Meta", "TikTok", "Google"]
  ad_size_format TEXT[],        -- ["1080x1920", "Carousel"]
  priority VARCHAR(20),         -- low, medium, high, urgent
  due_date DATE,
  description TEXT,             -- Creative description
  inspiration TEXT,             -- Optional
  figma_url TEXT,
  reference_urls TEXT[],
  status VARCHAR(50),           -- new-request, in-progress only
  ...metadata fields
)
```

## Stage 2: Asset Review (requests table)

### Purpose
Full asset review workflow with version control, comments, and collaborative feedback.

### Available Statuses
- `needs-review` - Assets uploaded, waiting for review
- `needs-edit` - Revisions requested
- `done` - Approved and completed

### UI Component
**CampaignDetailPanel** - Full-featured view with:
- Asset viewer (images/videos)
- Version history
- Comment threads with @mentions
- Positioned feedback on assets
- Status tracking and approval flow

### How Records Get Here
**Automatic Migration** - When a brief's status changes from `in-progress` to `needs-review`, `needs-edit`, or `done`:

1. Database trigger `migrate_brief_to_requests()` fires
2. All fields map from `new_requests` → `requests`
3. Same UUID is preserved for continuity
4. Record deleted from `new_requests`
5. Activity logged in `activity_log`
6. Asset viewer becomes available

## User Journey

### 1. Submit Request (Intake Form)
```
User fills form → Submits → Record created in new_requests with status "new-request"
```

### 2. Brief Stage
```
Designer opens brief → Clicks "Start Working" → Status changes to "in-progress"
Designer creates assets in Figma/design tools
```

### 3. Graduation to Asset Review
```
Designer clicks "Move to Review" → Status changes to "needs-review"
↓
Automatic migration triggered
↓
Record moves to requests table
↓
Asset viewer becomes available
```

### 4. Review & Approval
```
Reviewer opens asset viewer → Adds comments → Requests edits or approves
Status flows: needs-review → needs-edit → needs-review → done
```

## Implementation Details

### Auto-Migration Trigger
```sql
CREATE TRIGGER trigger_migrate_brief_to_requests
  BEFORE UPDATE OF status ON new_requests
  FOR EACH ROW
  EXECUTE FUNCTION migrate_brief_to_requests();
```

**Trigger Conditions:**
- Fires when `status` column is updated
- Only migrates if NEW status is `needs-review`, `needs-edit`, or `done`
- Only migrates if OLD status was NOT one of those three

### Field Mapping
```
new_requests.title              → requests.title
new_requests.platform[0]        → requests.format (first platform)
new_requests.ad_size_format[0]  → requests.size (first size)
new_requests.description        → requests.description
new_requests.priority           → requests.priority
new_requests.figma_url          → requests.figma_url
new_requests.reference_urls     → requests.reference_urls
new_requests.inspiration        → requests.inspiration
... (all common fields mapped)
```

### Creative Requests Board Logic

**New Request Column** - Fetch from `new_requests` where `status = 'new-request'`
**In Progress Column** - Fetch from `new_requests` where `status = 'in-progress'`
**Needs Review Column** - Fetch from `requests` where `status = 'needs-review'`
**Needs Edit Column** - Fetch from `requests` where `status = 'needs-edit'`
**Done Column** - Fetch from `requests` where `status = 'done'`

## Database Setup

### 1. Run Migration
```bash
# Open Supabase SQL Editor
https://supabase.com/dashboard/project/vzhthefdgumjkhnjpydt/sql

# Copy and run:
supabase/migrations/20250120_create_new_requests_table.sql
```

Or run the helper script:
```bash
node scripts/run-new-requests-migration.js
```

### 2. Verify Tables Created
```sql
-- Check new_requests table
SELECT * FROM new_requests LIMIT 1;

-- Check activity_log table
SELECT * FROM activity_log WHERE action = 'migrated';

-- Test trigger
UPDATE new_requests SET status = 'needs-review' WHERE id = 'test-id';
-- Should auto-migrate to requests table
```

## Component Usage

### Opening Brief Modal
```vue
<template>
  <BriefViewModal 
    v-model="showBriefModal"
    :brief-id="selectedBriefId"
  />
</template>

<script setup>
const showBriefModal = ref(false)
const selectedBriefId = ref(null)

function openBrief(brief) {
  selected BriefId.value = brief.id
  showBriefModal.value = true
}
</script>
```

### Opening Asset Viewer Modal
```vue
<template>
  <CampaignDetailPanel 
    v-model="showAssetModal"
    :request-id="selectedRequestId"
  />
</template>

<script setup>
const showAssetModal = ref(false)
const selectedRequestId = ref(null)

function openAssetReview(request) {
  selectedRequestId.value = request.id
  showAssetModal.value = true
}
</script>
```

## Benefits

### ✅ Cleaner Separation of Concerns
- Brief phase focuses on requirements
- Asset phase focuses on review and approval
- No confusion between planning and execution

### ✅ Better UX
- Simpler interface for early-stage briefs
- Full-featured viewer only when assets exist
- Clear progression from brief → asset review

### ✅ Performance
- Lighter queries for brief-stage items
- Asset viewer only loads when needed
- Automatic cleanup via migration

### ✅ Data Integrity
- Same ID preserved across stages
- Full audit trail in activity_log
- No orphaned records

## Migration Status Tracking

View all migrations:
```sql
SELECT 
  al.created_at,
  al.description,
  r.title,
  r.status
FROM activity_log al
JOIN requests r ON r.id = al.entity_id
WHERE al.action = 'migrated'
ORDER BY al.created_at DESC;
```

## Troubleshooting

### Brief Not Migrating
**Issue:** Status updated to needs-review but still in new_requests table

**Check:**
1. Verify trigger exists:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'trigger_migrate_brief_to_requests';
   ```

2. Check for errors in activity_log
3. Manually trigger migration:
   ```sql
   UPDATE new_requests SET status = 'needs-review' WHERE id = 'your-id';
   ```

### Duplicate Records
**Issue:** Record exists in both tables

**Solution:**
```sql
-- Check for duplicates
SELECT id, title FROM new_requests WHERE id IN (SELECT id FROM requests);

-- Remove from new_requests (if safe)
DELETE FROM new_requests WHERE id IN (SELECT id FROM requests);
```

## Future Enhancements

- [ ] Batch migration tool for existing requests
- [ ] Brief templates for common request types
- [ ] Asset upload directly from brief stage
- [ ] Slack notifications on status changes
- [ ] Analytics on brief → asset conversion time

## Related Files

- `supabase/migrations/20250120_create_new_requests_table.sql` - Database schema
- `components/BriefViewModal.vue` - Brief viewer component
- `components/CampaignDetailPanel.vue` - Asset viewer component
- `composables/useRequests.ts` - Data fetching (needs update)
- `pages/creative-requests.vue` - Board view (needs update)
