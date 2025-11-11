# Creative Kanban Board - Feature Comparison

## Current vs Desired Implementation

This document compares the current Creative Kanban Board implementation with the advanced feature set defined in the BoardViewConfig interface.

---

## Desired Feature Set (Target)

```typescript
// Layout modes with different densities
type LayoutMode = 'grid' | 'list' | 'board' | 'timeline'
type GridDensity = 'comfortable' | 'cozy' | 'compact'

interface BoardViewConfig {
  layout: LayoutMode
  density: GridDensity
  columns: 3 | 4 | 5 | 6 | 'auto'
  sortBy: 'created' | 'modified' | 'name' | 'size' | 'custom'
  sortOrder: 'asc' | 'desc'
  groupBy?: 'status' | 'assignee' | 'campaign' | 'date' | 'type'
}
```

---

## Feature Matrix

| Feature | Status | Current Implementation | Notes |
|---------|--------|------------------------|-------|
| **Layout Modes** | | | |
| Board View | ✅ Implemented | Kanban columns with status groups | Fully functional |
| Grid View | ❌ Not Implemented | - | UI toggle exists but not functional |
| List View | ❌ Not Implemented | - | UI toggle exists but not functional |
| Timeline View | ❌ Not Implemented | - | Not in UI |
| **Grid Density** | | | |
| Comfortable | ❌ Not Implemented | - | Fixed card size |
| Cozy | ✅ Partial | Current default | Fixed at ~320px width |
| Compact | ❌ Not Implemented | - | - |
| **Column Configuration** | | | |
| 3 Columns | ❌ Not Implemented | - | - |
| 4 Columns | ❌ Not Implemented | - | - |
| 5 Columns | ✅ Implemented | Fixed 5 status columns | Default and only option |
| 6 Columns | ❌ Not Implemented | - | - |
| Auto Columns | ❌ Not Implemented | - | - |
| **Sorting** | | | |
| Sort by Created | ✅ Partial | Default in DB query | Not user-configurable |
| Sort by Modified | ❌ Not Implemented | - | - |
| Sort by Name | ❌ Not Implemented | - | - |
| Sort by Size | ❌ Not Implemented | - | - |
| Custom Sort | ❌ Not Implemented | - | UI button exists but no function |
| Sort Order Toggle | ❌ Not Implemented | - | Fixed descending |
| **Grouping** | | | |
| Group by Status | ✅ Implemented | Default kanban columns | Only option |
| Group by Assignee | ❌ Not Implemented | - | Dropdown exists but no function |
| Group by Campaign | ❌ Not Implemented | - | - |
| Group by Date | ❌ Not Implemented | - | - |
| Group by Type | ❌ Not Implemented | - | - |

---

## Detailed Feature Analysis

### 1. Layout Modes

#### Current State
```typescript
// Only board view is implemented
const currentLayout = 'board' // Fixed, no switching
```

**Location:** `pages/creative/index.vue` (lines 54-61)
```vue
<div class="flex border border-gray-200 rounded-lg overflow-hidden">
  <button class="px-3 py-2 bg-gray-100 hover:bg-gray-200 transition-colors" aria-label="Grid view">
    <span class="material-icons text-gray-700 text-lg">grid_view</span>
  </button>
  <button class="px-3 py-2 hover:bg-gray-100 transition-colors" aria-label="List view">
    <span class="material-icons text-gray-500 text-lg">view_list</span>
  </button>
</div>
```

**Issue:** UI buttons exist but don't toggle layouts

#### Needed Implementation
```typescript
const layoutMode = ref<LayoutMode>('board')

function setLayout(mode: LayoutMode) {
  layoutMode.value = mode
  // Re-render view based on mode
}
```

**Components Needed:**
- `<GridView />` - Card grid with configurable columns
- `<ListView />` - Compact table view
- `<BoardView />` - Current kanban (already exists)
- `<TimelineView />` - Chronological timeline

---

### 2. Grid Density

#### Current State
```typescript
// Fixed density - cards are 320px width
const cardWidth = 'w-80' // 320px, not configurable
```

**Location:** `pages/creative/index.vue` (line 74)
```vue
<div class="flex-shrink-0 w-80 flex flex-col">
```

#### Needed Implementation
```typescript
const density = ref<GridDensity>('cozy')

const densityConfig = {
  comfortable: { 
    cardWidth: 'w-96',      // 384px
    padding: 'p-4',
    gap: 'gap-4',
    textSize: 'text-base'
  },
  cozy: { 
    cardWidth: 'w-80',      // 320px (current)
    padding: 'p-3',
    gap: 'gap-3',
    textSize: 'text-sm'
  },
  compact: { 
    cardWidth: 'w-64',      // 256px
    padding: 'p-2',
    gap: 'gap-2',
    textSize: 'text-xs'
  }
}
```

**UI Addition:**
```vue
<select v-model="density">
  <option value="comfortable">Comfortable</option>
  <option value="cozy">Cozy</option>
  <option value="compact">Compact</option>
</select>
```

---

### 3. Column Configuration

#### Current State
```typescript
// Fixed 5 columns based on status
const columns = computed(() => [
  { id: 'new-request', ... },
  { id: 'in-progress', ... },
  { id: 'needs-review', ... },
  { id: 'needs-edit', ... },
  { id: 'done', ... }
])
```

**Location:** `pages/creative/index.vue` (lines 274-310)

#### Needed Implementation
```typescript
const columnCount = ref<3 | 4 | 5 | 6 | 'auto'>(5)

const visibleColumns = computed(() => {
  if (columnCount.value === 'auto') {
    // Calculate based on viewport width
    return Math.floor(window.innerWidth / 320)
  }
  return columns.value.slice(0, columnCount.value)
})
```

**UI Addition:**
```vue
<select v-model="columnCount">
  <option :value="3">3 Columns</option>
  <option :value="4">4 Columns</option>
  <option :value="5">5 Columns</option>
  <option :value="6">6 Columns</option>
  <option value="auto">Auto</option>
</select>
```

---

### 4. Sorting

#### Current State
```typescript
// Fixed sort: created_at descending
const { data } = await supabase
  .from('requests')
  .select('*')
  .order('created_at', { ascending: false }) // Fixed
```

**Location:** `composables/useRequests.ts` (line 51)

**Issue:** No user control over sorting

#### Needed Implementation
```typescript
const sortBy = ref<'created' | 'modified' | 'name' | 'size' | 'custom'>('created')
const sortOrder = ref<'asc' | 'desc'>('desc')

const sortedAssets = computed(() => {
  const assets = [...allAssets.value]
  
  return assets.sort((a, b) => {
    let comparison = 0
    
    switch (sortBy.value) {
      case 'created':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        break
      case 'modified':
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        break
      case 'name':
        comparison = a.title.localeCompare(b.title)
        break
      case 'size':
        comparison = parseFloat(a.size) - parseFloat(b.size)
        break
      case 'custom':
        // User-defined sort order (could be manual drag-drop)
        comparison = (a.sortOrder || 0) - (b.sortOrder || 0)
        break
    }
    
    return sortOrder.value === 'asc' ? comparison : -comparison
  })
})
```

**UI Update:**
```vue
<!-- Replace existing "Custom sort" button -->
<select v-model="sortBy" class="...">
  <option value="created">Date Created</option>
  <option value="modified">Last Modified</option>
  <option value="name">Name (A-Z)</option>
  <option value="size">File Size</option>
  <option value="custom">Custom Order</option>
</select>

<button @click="toggleSortOrder">
  <span class="material-icons">
    {{ sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward' }}
  </span>
</button>
```

---

### 5. Grouping

#### Current State
```typescript
// Fixed grouping by status
const requestsByStatus = getRequestsByTypeAndStatus('creative')
```

**Location:** `pages/creative/index.vue` (line 258)

**Issue:** Dropdown exists but only "Group by: Status" works

```vue
<!-- Line 43-47 -->
<select class="...">
  <option>Group by: Status</option>
  <option>Group by: Assignee</option>
  <option>Group by: Priority</option>
</select>
```

#### Needed Implementation
```typescript
const groupBy = ref<'status' | 'assignee' | 'campaign' | 'date' | 'type'>('status')

const groupedAssets = computed(() => {
  switch (groupBy.value) {
    case 'status':
      return groupByStatus(allAssets.value)
    case 'assignee':
      return groupByAssignee(allAssets.value)
    case 'campaign':
      return groupByCampaign(allAssets.value)
    case 'date':
      return groupByDate(allAssets.value)
    case 'type':
      return groupByType(allAssets.value)
  }
})

function groupByAssignee(assets: Asset[]) {
  const groups: Record<string, Asset[]> = {}
  assets.forEach(asset => {
    const assignee = asset.metadata.assignee || 'Unassigned'
    if (!groups[assignee]) groups[assignee] = []
    groups[assignee].push(asset)
  })
  return groups
}

function groupByCampaign(assets: Asset[]) {
  const groups: Record<string, Asset[]> = {}
  assets.forEach(asset => {
    const campaign = asset.metadata.campaign || 'No Campaign'
    if (!groups[campaign]) groups[campaign] = []
    groups[campaign].push(asset)
  })
  return groups
}

function groupByDate(assets: Asset[]) {
  const groups: Record<string, Asset[]> = {
    'Today': [],
    'This Week': [],
    'This Month': [],
    'Older': []
  }
  
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
  
  assets.forEach(asset => {
    const date = new Date(asset.createdAt)
    if (date >= today) groups['Today'].push(asset)
    else if (date >= weekAgo) groups['This Week'].push(asset)
    else if (date >= monthAgo) groups['This Month'].push(asset)
    else groups['Older'].push(asset)
  })
  
  return groups
}

function groupByType(assets: Asset[]) {
  const groups: Record<string, Asset[]> = {}
  assets.forEach(asset => {
    const type = asset.figmaUrl ? 'Figma' : asset.videoUrl ? 'Video' : 'Image'
    if (!groups[type]) groups[type] = []
    groups[type].push(asset)
  })
  return groups
}
```

**UI Update:**
```vue
<select v-model="groupBy" class="...">
  <option value="status">Group by: Status</option>
  <option value="assignee">Group by: Assignee</option>
  <option value="campaign">Group by: Campaign</option>
  <option value="date">Group by: Date</option>
  <option value="type">Group by: Type</option>
</select>
```

---

## Implementation Priority

### Phase 1: Core View Controls (High Priority)
- [ ] **Sorting Controls** - Enable user-selectable sort options
- [ ] **Group by Assignee** - Most requested after status
- [ ] **Density Toggle** - Allow comfortable/cozy/compact views

### Phase 2: Alternative Layouts (Medium Priority)
- [ ] **Grid View** - Card grid without status columns
- [ ] **List View** - Compact table view
- [ ] **Column Configuration** - Allow hiding/showing columns

### Phase 3: Advanced Features (Low Priority)
- [ ] **Timeline View** - Chronological visualization
- [ ] **Custom Sort** - Drag-drop manual ordering
- [ ] **Advanced Grouping** - Campaign, date, type groups
- [ ] **Save View Preferences** - Persist user settings

---

## Code Structure for Implementation

### Recommended File Organization

```
composables/
├── useRequests.ts          # Existing - data fetching
├── useBoardView.ts         # NEW - view state management
└── useSupabase.ts          # Existing - DB client

pages/creative/
├── index.vue               # Main board container
└── components/             # NEW directory
    ├── BoardView.vue       # Extract current kanban
    ├── GridView.vue        # NEW - card grid
    ├── ListView.vue        # NEW - table view
    └── TimelineView.vue    # NEW - timeline
```

### New Composable: `useBoardView.ts`

```typescript
export const useBoardView = () => {
  // View configuration
  const config = ref<BoardViewConfig>({
    layout: 'board',
    density: 'cozy',
    columns: 5,
    sortBy: 'created',
    sortOrder: 'desc',
    groupBy: 'status'
  })
  
  // Save to localStorage
  watch(config, (newConfig) => {
    localStorage.setItem('boardViewConfig', JSON.stringify(newConfig))
  }, { deep: true })
  
  // Load from localStorage
  onMounted(() => {
    const saved = localStorage.getItem('boardViewConfig')
    if (saved) {
      config.value = JSON.parse(saved)
    }
  })
  
  return {
    config,
    setLayout: (mode: LayoutMode) => config.value.layout = mode,
    setDensity: (density: GridDensity) => config.value.density = density,
    setSort: (by: string, order: string) => {
      config.value.sortBy = by
      config.value.sortOrder = order
    },
    setGroupBy: (group: string) => config.value.groupBy = group
  }
}
```

---

## Migration Path

### Step 1: Extract Current Board into Component
Move existing kanban view to `components/BoardView.vue` to prepare for multiple view types.

### Step 2: Add View State Management
Create `useBoardView.ts` composable to manage view configuration.

### Step 3: Implement Controls One-by-One
Add functionality to existing UI controls in this order:
1. Sorting dropdown → wire to `sortBy/sortOrder`
2. Grouping dropdown → wire to `groupBy`
3. Density selector → create UI and wire to `density`
4. Layout toggles → create view components and wire to `layout`

### Step 4: Persist Preferences
Save user preferences to localStorage so settings persist across sessions.

---

## Estimated Development Time

| Feature | Effort | Time Estimate |
|---------|--------|---------------|
| Sorting Controls | Low | 2-4 hours |
| Group by Assignee | Low | 2-3 hours |
| Density Toggle | Medium | 4-6 hours |
| Grid View | Medium | 6-8 hours |
| List View | Medium | 6-8 hours |
| Timeline View | High | 12-16 hours |
| View Persistence | Low | 2-3 hours |
| **Total** | | **34-48 hours** |

---

## Testing Checklist

### Sorting
- [ ] Sort by created date (asc/desc)
- [ ] Sort by modified date (asc/desc)
- [ ] Sort by name (asc/desc)
- [ ] Sort by size (asc/desc)
- [ ] Custom sort persists after drag-drop

### Grouping
- [ ] Group by status (5 columns)
- [ ] Group by assignee (dynamic columns)
- [ ] Group by campaign (dynamic columns)
- [ ] Group by date (4 time buckets)
- [ ] Group by type (Figma/Video/Image)

### Layout
- [ ] Board view displays kanban columns
- [ ] Grid view displays card grid
- [ ] List view displays compact table
- [ ] Timeline view displays chronological
- [ ] Toggle between layouts works smoothly

### Density
- [ ] Comfortable shows larger cards
- [ ] Cozy shows medium cards (current)
- [ ] Compact shows smaller cards
- [ ] Text size adjusts accordingly

### Persistence
- [ ] Settings save to localStorage
- [ ] Settings restore on page load
- [ ] Settings persist across sessions

---

## Conclusion

**Current Implementation:** Basic kanban board with status columns
**Target Implementation:** Fully configurable view system with 4 layouts, 3 densities, 5 sort options, and 5 grouping options

**Gap:** ~70% of desired features not yet implemented
**Recommendation:** Implement Phase 1 features first (sorting, grouping, density) as they provide the most value with the least effort.

---

**Last Updated:** 2025-01-11
**Status:** Analysis Complete - Ready for Implementation
