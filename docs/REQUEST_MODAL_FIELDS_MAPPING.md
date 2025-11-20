# Request Modal - Database Field Mappings

## ✅ Current System Status (2025-01-20)

### Working Features
- **Supabase Client**: Singleton pattern implemented ✓
- **State Management**: Global state for useRequests ✓
- **TypeScript**: Strict mode disabled for deployment ✓
- **Auth**: Persistent across page navigation ✓

### Database Schema Verified
All fields below are confirmed to exist in the `requests` table in Supabase.

---

## Complete Requests Table Schema

### Core Fields
```typescript
{
  id: string (UUID)                    // Primary key
  title: string                        // Request title
  description: string | null           // Detailed description
  project_type: 'creative' | 'performance' | 'design' | 'ugc' | 'project'
  status: 'new-request' | 'in-progress' | 'needs-review' | 'needs-edit' | 'done'
  priority: 'low' | 'medium' | 'high' | 'urgent'
}
```

### Assignment & Ownership
```typescript
{
  created_by: string (UUID)            // User who created (references auth.users)
  created_by_name: string             // Cached creator name
  assigned_to: string | null (UUID)    // Assigned user (references profiles)
  assignee: string | null              // Legacy text field for assignee name
  assignee_id: string | null (UUID)    // Future: will replace assignee field
  client_id: string | null (UUID)      // References clients table
  client: string | null                // Legacy text field for client name
}
```

### Timeline
```typescript
{
  created_at: string (timestamp)       // Auto-generated
  updated_at: string (timestamp)       // Auto-updated on changes
  start_date: string | null           // Project start date
  due_date: string | null             // Deadline
  completed_date: string | null       // When marked complete
  deleted_at: string | null           // Soft delete timestamp
}
```

### Creative Specifications
```typescript
{
  format: string | null                // Platform: Meta, TikTok, Google, X, LinkedIn
  size: string | null                  // Size category: Small, Medium, Large
  dimensions: string | null            // Pixel dimensions: 1080x1080, 1920x1080
  duration: string | null              // Video length: 15s, 30s, 60s
  figma_url: string | null            // Link to Figma design
  video_url: string | null            // Link to video asset
  thumbnail_url: string | null        // Preview thumbnail URL
  asset_file_url: string | null       // Direct file link
  inspiration: string | null          // Reference/inspiration notes
}
```

### Campaign & Performance
```typescript
{
  campaign: string | null              // Campaign name/identifier
  target_audience: string | null       // Audience description
  campaign_objectives: string | null   // Goals and KPIs
}
```

### Project Management
```typescript
{
  category: string | null              // Project category
  estimate_hours: number | null        // Estimated time
  actual_hours: number | null          // Actual time spent
}
```

### Review Process
```typescript
{
  review_round: number                 // Current review iteration (default: 1)
  review_status: string | null         // Custom review status
  reviewers: any | null                // List of reviewers (JSONB)
  brand_guidelines: string | null      // Brand requirements
  reference_urls: string | null        // Reference links
  required_files: string | null        // Required file list
}
```

### Slack Integration
```typescript
{
  slack_thread_ts: string | null       // Slack thread timestamp
  slack_channel_id: string | null      // Slack channel ID
}
```

### Metadata
```typescript
{
  tags: string[] | null                // Tags array (JSONB)
  form_data: object                    // Form submission data (JSONB, default: {})
  to_user: string | null               // Legacy field (purpose unclear)
}
```

---

## Modal Field Groups Configuration

### 1. Status & Assignment (Always Visible)
```typescript
{
  status: 'select' with options [
    'new-request', 'in-progress', 'needs-review', 'needs-edit', 'done'
  ],
  priority: 'select' with options [
    'low', 'medium', 'high', 'urgent'
  ],
  assignee_id: 'user-select',  // Future: use this
  assigned_to: 'user-select',  // Current: use this
  client_id: 'client-select'
}
```

### 2. Timeline (Always Visible)
```typescript
{
  start_date: 'date',
  due_date: 'date',
  completed_date: 'date'
}
```

### 3. Creative Specifications (If project_type === 'creative')
```typescript
{
  format: 'select' with options ['Meta', 'Tik Tok', 'Google', 'X', 'LinkedIn'],
  size: 'text',
  dimensions: 'text',
  duration: 'text'
}
```

### 4. Design Resources (If project_type === 'creative')
```typescript
{
  figma_url: 'url',
  video_url: 'url',
  thumbnail_url: 'url',
  asset_file_url: 'url',
  inspiration: 'text'
}
```

### 5. Campaign Details (If project_type === 'performance' OR campaign exists)
```typescript
{
  format: 'select' with options ['Meta', 'Tik Tok', 'Google', 'X'],
  campaign: 'text',
  target_audience: 'textarea',
  campaign_objectives: 'textarea'
}
```

### 6. Project Management (If project_type === 'project')
```typescript
{
  category: 'text',
  estimate_hours: 'number',
  actual_hours: 'number'
}
```

### 7. Review Process (Always Visible)
```typescript
{
  review_round: 'number',
  review_status: 'text',
  brand_guidelines: 'textarea',
  reference_urls: 'textarea',
  required_files: 'textarea'
}
```

### 8. Description & Notes (Always Visible)
```typescript
{
  description: 'textarea' (rows: 6),
  form_data: 'json-editor' (advanced)
}
```

### 9. Organization (Always Visible)
```typescript
{
  tags: 'tag-input',
  category: 'text'
}
```

---

## Request Comments Table Schema

**Separate from asset comments** - this is for task-level discussion.

```sql
CREATE TABLE request_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES request_comments(id) ON DELETE CASCADE,
  
  content TEXT NOT NULL,
  
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_avatar_url TEXT,
  
  is_edited BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## Field Validation Rules

### Required Fields
- `title` - Cannot be empty
- `project_type` - Must be one of: creative, performance, design, ugc, project
- `status` - Must be one of: new-request, in-progress, needs-review, needs-edit, done

### Optional But Recommended
- `priority` - Defaults to 'medium' if not set
- `due_date` - Recommended for all requests
- `assigned_to` - Recommended for tracking

### URL Fields (Must be valid URLs if provided)
- `figma_url`
- `video_url`
- `thumbnail_url`
- `asset_file_url`

### Numeric Fields
- `review_round` - Integer >= 1 (default: 1)
- `estimate_hours` - Positive number
- `actual_hours` - Positive number

---

## Migration Notes

### Assignee Fields
Currently there are THREE assignee-related fields:
1. `assignee` (text) - Legacy, being phased out
2. `assigned_to` (UUID) - Current, references profiles table
3. `assignee_id` (UUID) - Future, will replace assigned_to

**Current Recommendation**: Use `assigned_to` field.

### Client Fields
Similarly, two client fields:
1. `client` (text) - Legacy name
2. `client_id` (UUID) - Current, references clients table

**Current Recommendation**: Use `client_id` field.

---

## Real-Time Subscriptions

The modal uses Supabase real-time for:
- Request field updates
- New comments
- Activity log changes

```typescript
supabase
  .channel(`request-modal-${requestId}`)
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'requests',
    filter: `id=eq.${requestId}`
  }, (payload) => {
    // Handle update
  })
  .subscribe()
```

---

## Component File Locations

```
components/
├── CampaignDetailPanel.vue          # Main modal wrapper (existing)
├── projects/
│   ├── RequestDetailModal.vue       # New modal (to implement)
│   ├── RequestDetailFields.vue      # Field groups component
│   ├── RequestFieldGroup.vue        # Single field group
│   ├── RequestCommentThread.vue     # Task comments
│   └── RequestCommentItem.vue       # Single comment (recursive)
└── fields/
    ├── EditableField.vue            # Base editable field component
    ├── UserSelect.vue               # User picker
    ├── ClientSelect.vue             # Client picker
    └── TagInput.vue                 # Tag management
```

---

## Implementation Checklist

- [x] Database schema verified
- [x] Field mappings documented
- [ ] RequestDetailModal.vue component created
- [ ] RequestDetailFields.vue component created
- [ ] EditableField.vue with all types
- [ ] Request comments table created in DB
- [ ] RequestCommentThread.vue component
- [ ] User/Client select components
- [ ] Tag input component
- [ ] Real-time subscriptions
- [ ] Activity logging
- [ ] Keyboard shortcuts
- [ ] Form validation
- [ ] Error handling
- [ ] Loading states

---

## Next Steps

1. **Create request_comments table** in Supabase using the SQL provided
2. **Implement RequestDetailModal.vue** with tabs and field groups
3. **Build EditableField.vue** with support for all field types
4. **Add UserSelect and ClientSelect** components
5. **Implement RequestCommentThread** with real-time updates
6. **Test with different project_types** to ensure conditional fields work
7. **Add keyboard shortcuts** (Escape to close, Cmd+Enter to save)
8. **Implement optimistic updates** for better UX

---

## Database Connection Info

```bash
# Supabase Project
URL: https://vzhthefdgumjkhnjpydt.supabase.co
Project ID: vzhthefdgumjkhnjpydt

# Environment Variables (in .env)
SUPABASE_URL=https://vzhthefdgumjkhnjpydt.supabase.co
SUPABASE_ANON_KEY=[key in .env]
SUPABASE_SERVICE_KEY=[key in .env]
```

---

**Last Updated**: 2025-01-20  
**Status**: Schema verified, ready for implementation  
**Schema Version**: Current (matches production database)
