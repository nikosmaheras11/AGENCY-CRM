<template>
  <!-- v3.0 GRADIENTS ENABLED {{ Date.now() }} -->
  <div class="h-full bg-[#F9FAFB] flex flex-col overflow-hidden relative">
    <!-- Asset Viewer Modal Overlay -->
    <div v-if="selectedAssetId" class="absolute inset-0 z-50">
      <AssetViewer :asset-id="selectedAssetId" @close="selectedAssetId = null" />
    </div>
    <!-- Breadcrumb Navigation -->
    <div class="bg-white border-b border-gray-200 px-6 py-3">
      <div class="flex items-center gap-2 text-xs font-medium text-gray-600">
        <div class="w-6 h-6 rounded-full bg-gradient-to-br from-amber-200 to-orange-300 flex-shrink-0" />
        <span class="uppercase cursor-pointer hover:text-gray-900 transition-colors">Clients</span>
        <span>/</span>
        <span class="uppercase cursor-pointer hover:text-gray-900 transition-colors">Polymarket</span>
        <span>/</span>
        <span class="uppercase text-gray-900">Polymarket Creative Requests</span>
      </div>
    </div>

    <!-- Page Header -->
    <div class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="flex items-center justify-between">
        <!-- Left: Title & Actions -->
        <div class="flex items-center gap-3">
          <h1 class="text-2xl font-bold text-gray-900">POLYMARKET CREATIVE REQUESTS</h1>
          <button class="w-8 h-8 rounded hover:bg-gray-100 flex items-center justify-center transition-colors" aria-label="Bookmark">
            <span class="material-icons text-gray-400 text-xl">star_border</span>
          </button>
          <button class="w-8 h-8 rounded hover:bg-gray-100 flex items-center justify-center transition-colors" aria-label="Print">
            <span class="material-icons text-gray-400 text-xl">print</span>
          </button>
          <button class="w-8 h-8 rounded hover:bg-gray-100 flex items-center justify-center transition-colors" aria-label="More options">
            <span class="material-icons text-gray-400 text-xl">more_horiz</span>
          </button>
        </div>

        <!-- Right: Controls -->
        <div class="flex items-center gap-3">
          <button class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <span class="material-icons text-lg">add</span>
            <span>Upload Asset</span>
          </button>
          <select class="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 font-medium bg-white cursor-pointer hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Group by: Status</option>
            <option>Group by: Assignee</option>
            <option>Group by: Priority</option>
          </select>
          <button class="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 font-medium bg-white hover:bg-gray-50 transition-colors">
            Custom sort
          </button>
          <button 
            @click="toggleSelectionMode"
            :class="[
              'w-9 h-9 rounded-lg flex items-center justify-center transition-colors',
              selectionMode ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-500'
            ]" 
            aria-label="Toggle selection mode"
          >
            <span class="material-icons text-xl">checklist</span>
          </button>
          <button 
            @click="showFilters = !showFilters"
            :class="[
              'w-9 h-9 rounded-lg flex items-center justify-center transition-colors',
              showFilters ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-500'
            ]" 
            aria-label="Toggle filters"
          >
            <span class="material-icons text-xl">filter_list</span>
          </button>
          <div class="flex border border-gray-200 rounded-lg overflow-hidden">
            <button 
              @click="currentLayout = 'grid'"
              :class="[
                'px-3 py-2 transition-colors',
                currentLayout === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-100'
              ]" 
              aria-label="Grid view"
            >
              <span 
                class="material-icons text-lg"
                :class="currentLayout === 'grid' ? 'text-gray-700' : 'text-gray-500'"
              >grid_view</span>
            </button>
            <button 
              @click="currentLayout = 'board'"
              :class="[
                'px-3 py-2 transition-colors',
                currentLayout === 'board' ? 'bg-gray-100' : 'hover:bg-gray-100'
              ]" 
              aria-label="Board view"
            >
              <span 
                class="material-icons text-lg"
                :class="currentLayout === 'board' ? 'text-gray-700' : 'text-gray-500'"
              >view_list</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Board or Grid View with Filter Panel -->
    <div class="flex-1 overflow-hidden flex">
      <!-- Filter Panel -->
      <FilterPanel 
        v-if="showFilters"
        :assets="allAssets"
        @update:filters="handleFiltersUpdate"
      />
      
      <!-- Main Content Area -->
      <div class="flex-1 overflow-hidden">
        <!-- Grid View -->
        <div v-if="currentLayout === 'grid'" class="h-full overflow-y-auto">
          <GridView 
            :assets="filteredAssets"
            density="cozy"
            columns="auto"
            :selection-enabled="selectionMode"
            @asset-click="handleAssetClick"
            @selection-change="handleSelectionChange"
          />
        </div>
        
        <!-- Board View (Kanban) -->
        <div v-else class="h-full overflow-x-auto overflow-y-hidden px-6 py-6">
        <div class="flex gap-4 h-full pb-4">
          <!-- Column Component for each status -->
          <div
            v-for="column in columns"
            :key="column.id"
            class="flex-shrink-0 w-80 flex flex-col"
          >
            <!-- Column Header -->
            <div class="bg-white rounded-lg border border-gray-200 p-3 mb-3 shadow-sm">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium"
                    :class="column.badgeClass"
                  >
                    <span v-if="column.emoji">{{ column.emoji }}</span>
                    <span>{{ column.title }}</span>
                    <span class="opacity-60">{{ column.assets.length }}</span>
                  </span>
                </div>
                <div class="flex items-center gap-1">
                  <button class="w-6 h-6 rounded hover:bg-gray-100 flex items-center justify-center transition-colors" aria-label="Minimize">
                    <span class="text-gray-400 text-sm">—</span>
                  </button>
                  <button class="w-6 h-6 rounded hover:bg-gray-100 flex items-center justify-center transition-colors cursor-move" aria-label="Drag column">
                    <span class="text-gray-400 text-xs">⋮⋮</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Cards Container -->
            <div 
              class="flex-1 overflow-y-auto space-y-3 pr-1"
              @dragover.prevent
              @drop="handleDrop($event, column.id)"
            >
              <KanbanCard
                v-for="asset in column.assets"
                :key="asset.id"
                :asset="asset"
                draggable="true"
                @dragstart="handleDragStart($event, asset)"
                @click="handleAssetClick(asset)"
              />

              <!-- Empty state -->
              <div v-if="column.assets.length === 0" class="text-center py-8 text-gray-400 text-sm">
                No assets in this column
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
    
    <!-- Bulk Actions Bar -->
    <BulkActionsBar 
      :selected-assets="selectedAssets"
      @clear-selection="clearSelection"
      @bulk-change-status="handleBulkChangeStatus"
      @bulk-assign="handleBulkAssign"
      @bulk-tag="handleBulkTag"
      @bulk-download="handleBulkDownload"
      @bulk-delete="handleBulkDelete"
    />

    <!-- Bottom Status Bar -->
    <div v-if="selectedAssets.length === 0" class="bg-white border-t border-gray-200 px-6 py-4">
      <div class="flex items-center justify-between">
        <div class="text-sm text-gray-600">
          <span class="font-medium">{{ totalAssets }}</span> assets · 
          <span class="font-medium">{{ totalSize }}</span>
        </div>
        <div class="flex items-center gap-3">
          <button class="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Expand nested content
          </button>
          <button class="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors" aria-label="Download">
            <span class="material-icons text-gray-500 text-xl">download</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { convertToFigmaEmbedUrl } from '~/utils/figma'
import GridView from './components/GridView.vue'
import FilterPanel from './components/FilterPanel.vue'
import BulkActionsBar from './components/BulkActionsBar.vue'
import KanbanCard from '~/components/creative/KanbanCard.vue'

const selectedAssetId = ref<string | null>(null)

// Layout toggle state
type LayoutMode = 'board' | 'grid'
const currentLayout = ref<LayoutMode>('board')

// Selection state
const selectedAssets = ref<string[]>([])
const selectionMode = ref(false)

// Filter panel state
const showFilters = ref(false)

interface Filters {
  search: string
  status: string[]
  fileTypes: string[]
  hasComments: boolean
  hasAssignee: boolean
  priority: string[]
}

const activeFilters = ref<Filters>({
  search: '',
  status: [],
  fileTypes: [],
  hasComments: false,
  hasAssignee: false,
  priority: []
})

const handleFiltersUpdate = (filters: Filters) => {
  activeFilters.value = filters
}

// Use unified request system
const { fetchRequests, getRequestsByTypeAndStatus, requestToAsset, allRequests, loading, error } = useRequests()

// Get creative requests grouped by status
const requestsByStatus = getRequestsByTypeAndStatus('creative')

// Fetch requests on mount
onMounted(async () => {
  console.log('🔄 Fetching requests...')
  try {
    await fetchRequests()
    console.log('✅ Requests fetched!')
    console.log('📦 All requests:', allRequests.value)
    console.log('📊 Creative requests by status:', requestsByStatus.value)
    console.log('🔢 Total creative requests:', 
      Object.values(requestsByStatus.value).reduce((sum, arr) => sum + arr.length, 0)
    )
  } catch (e) {
    console.error('❌ Error fetching requests:', e)
  }
  console.log('⏳ Loading:', loading.value)
  console.log('⚠️ Error:', error.value)
})

// Get all assets flattened for grid view (unfiltered - for filter panel counts)
const allAssets = computed(() => {
  return Object.values(requestsByStatus.value)
    .flat()
    .map(requestToAsset)
})

// Apply filters to assets
const filteredAssets = computed(() => {
  let assets = allAssets.value
  
  // Search filter
  if (activeFilters.value.search) {
    const searchLower = activeFilters.value.search.toLowerCase()
    assets = assets.filter(asset => 
      asset.title.toLowerCase().includes(searchLower) ||
      asset.format.toLowerCase().includes(searchLower) ||
      asset.metadata.tags?.toLowerCase().includes(searchLower)
    )
  }
  
  // Status filter
  if (activeFilters.value.status.length > 0) {
    assets = assets.filter(asset => 
      activeFilters.value.status.includes(asset.status)
    )
  }
  
  // File type filter
  if (activeFilters.value.fileTypes.length > 0) {
    assets = assets.filter(asset => {
      if (activeFilters.value.fileTypes.includes('video') && asset.videoUrl) return true
      if (activeFilters.value.fileTypes.includes('figma') && asset.figmaUrl) return true
      if (activeFilters.value.fileTypes.includes('other') && !asset.videoUrl && !asset.figmaUrl) return true
      return false
    })
  }
  
  // Has comments filter
  if (activeFilters.value.hasComments) {
    assets = assets.filter(asset => asset.commentCount > 0)
  }
  
  // Has assignee filter
  if (activeFilters.value.hasAssignee) {
    assets = assets.filter(asset => asset.metadata.assignee)
  }
  
  // Priority filter
  if (activeFilters.value.priority.length > 0) {
    assets = assets.filter(asset => 
      asset.metadata.priority && activeFilters.value.priority.includes(asset.metadata.priority)
    )
  }
  
  return assets
})

// Convert filtered assets to column format for board view
const columns = computed(() => [
  {
    id: 'new-request',
    title: 'New Request',
    emoji: '📬',
    badgeClass: 'bg-purple-100 text-purple-700 border border-purple-200',
    assets: filteredAssets.value.filter(asset => asset.status === 'new-request')
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    emoji: '🔄',
    badgeClass: 'bg-amber-100 text-amber-700 border border-amber-200',
    assets: filteredAssets.value.filter(asset => asset.status === 'in-progress')
  },
  {
    id: 'needs-review',
    title: 'Needs Review',
    emoji: '👀',
    badgeClass: 'bg-blue-100 text-blue-700 border border-blue-200',
    assets: filteredAssets.value.filter(asset => asset.status === 'needs-review')
  },
  {
    id: 'needs-edit',
    title: 'Needs Edit',
    emoji: '✏️',
    badgeClass: 'bg-orange-100 text-orange-700 border border-orange-200',
    assets: filteredAssets.value.filter(asset => asset.status === 'needs-edit')
  },
  {
    id: 'done',
    title: 'Done',
    emoji: '✅',
    badgeClass: 'bg-green-100 text-green-700 border border-green-200',
    assets: filteredAssets.value.filter(asset => asset.status === 'done')
  }
])

// Original columns (for backward compatibility)
const originalColumns = computed(() => [
  {
    id: 'new-request',
    title: 'New Request',
    emoji: '📬',
    badgeClass: 'bg-purple-100 text-purple-700 border border-purple-200',
    assets: requestsByStatus.value['new-request'].map(requestToAsset)
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    emoji: '🔄',
    badgeClass: 'bg-amber-100 text-amber-700 border border-amber-200',
    assets: requestsByStatus.value['in-progress'].map(requestToAsset)
  },
  {
    id: 'needs-review',
    title: 'Needs Review',
    emoji: '👀',
    badgeClass: 'bg-blue-100 text-blue-700 border border-blue-200',
    assets: requestsByStatus.value['needs-review'].map(requestToAsset)
  },
  {
    id: 'needs-edit',
    title: 'Needs Edit',
    emoji: '✏️',
    badgeClass: 'bg-orange-100 text-orange-700 border border-orange-200',
    assets: requestsByStatus.value['needs-edit'].map(requestToAsset)
  },
  {
    id: 'done',
    title: 'Done',
    emoji: '✅',
    badgeClass: 'bg-green-100 text-green-700 border border-green-200',
    assets: requestsByStatus.value['done'].map(requestToAsset)
  }
])

const totalAssets = computed(() => {
  return columns.value.reduce((sum, col) => sum + col.assets.length, 0)
})

const totalSize = computed(() => {
  const totalMB = columns.value.reduce((sum, col) => {
    return sum + col.assets.reduce((colSum, asset) => {
      const mb = parseFloat(asset.size.replace(' MB', ''))
      return colSum + mb
    }, 0)
  }, 0)
  return `${Math.round(totalMB)} MB`
})

function getStatusBadgeClass(status: string) {
  const classes: Record<string, string> = {
    'needs-review': 'bg-blue-100 text-blue-700 border border-blue-200',
    'needs-edit': 'bg-orange-100 text-orange-700 border border-orange-200',
    'done': 'bg-green-100 text-green-700 border border-green-200',
    'in-progress': 'bg-amber-100 text-amber-700 border border-amber-200',
    'new-request': 'bg-purple-100 text-purple-700 border border-purple-200'
  }
  return classes[status] || 'bg-gray-100 text-gray-700'
}

function getStatusEmoji(status: string) {
  const emojis: Record<string, string> = {
    'needs-review': '👀',
    'needs-edit': '✏️',
    'done': '✅',
    'in-progress': '🔄',
    'new-request': '📬'
  }
  return emojis[status] || ''
}

function getStatusText(status: string) {
  const text: Record<string, string> = {
    'needs-review': 'Needs Review',
    'needs-edit': 'Needs Edit',
    'done': 'Done',
    'in-progress': 'In Progress',
    'new-request': 'New Request'
  }
  return text[status] || status
}

const router = useRouter()

/**
 * Handle asset card click
 * 
 * ROUTING RULES:
 * - Figma assets: Open directly in Figma (new tab)
 * - All other assets (video, image, etc): Open in asset viewer canvas
 */
function handleAssetClick(asset: any) {
  console.log('👁️ Asset clicked:', asset.id, asset.title)
  
  // If it's a Figma link, open directly in new tab
  if (asset.figmaUrl) {
    console.log('🎨 Figma asset detected - Opening in Figma:', asset.figmaUrl)
    window.open(asset.figmaUrl, '_blank')
  } else {
    // All other asset types render in preview canvas
    console.log('📹 Non-Figma asset - Opening in canvas viewer')
    navigateTo(`/creative/asset/${asset.id}`)
  }
}

function openAssetDetail(asset: any) {
  selectedAssetId.value = asset.id
}

// Selection handlers
const toggleSelectionMode = () => {
  selectionMode.value = !selectionMode.value
  if (!selectionMode.value) {
    selectedAssets.value = []
  }
}

const handleSelectionChange = (assetIds: string[]) => {
  selectedAssets.value = assetIds
}

const clearSelection = () => {
  selectedAssets.value = []
}

// Bulk action handlers
const handleBulkChangeStatus = async (assetIds: string[], status: string) => {
  console.log('Bulk change status:', assetIds, 'to', status)
  // TODO: Implement bulk status update to Supabase
  alert(`Would update ${assetIds.length} assets to status: ${status}`)
}

const handleBulkAssign = (assetIds: string[]) => {
  console.log('Bulk assign:', assetIds)
  // TODO: Implement bulk assignment modal
  alert(`Would show assignment modal for ${assetIds.length} assets`)
}

const handleBulkTag = (assetIds: string[]) => {
  console.log('Bulk tag:', assetIds)
  // TODO: Implement bulk tagging modal
  alert(`Would show tagging modal for ${assetIds.length} assets`)
}

const handleBulkDownload = (assetIds: string[]) => {
  console.log('Bulk download:', assetIds)
  // TODO: Implement bulk download
  alert(`Would download ${assetIds.length} assets`)
}

const handleBulkDelete = async (assetIds: string[]) => {
  console.log('Bulk delete:', assetIds)
  // TODO: Implement bulk delete from Supabase
  alert(`Would delete ${assetIds.length} assets`)
  selectedAssets.value = []
}

function getAssetGradient(id: string): string {
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    'linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)',
    'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
  ]
  const index = parseInt(id) % gradients.length
  return gradients[index]
}

// Drag and drop
const draggedAsset = ref<any>(null)

function handleDragStart(event: DragEvent, asset: any) {
  draggedAsset.value = asset
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
  }
}

async function handleDrop(event: DragEvent, newStatus: string) {
  event.preventDefault()
  
  if (!draggedAsset.value) return
  
  const assetId = draggedAsset.value.id
  const oldStatus = draggedAsset.value.status
  
  if (oldStatus === newStatus) {
    draggedAsset.value = null
    return
  }
  
  console.log(`Moving asset ${assetId} from ${oldStatus} to ${newStatus}`)
  
  try {
    const { supabase } = useSupabase()
    const { error } = await supabase
      .from('requests')
      .update({ status: newStatus })
      .eq('id', assetId)
    
    if (error) throw error
    
    // Refresh requests to update UI
    await fetchRequests()
    console.log('✅ Status updated successfully')
  } catch (error) {
    console.error('❌ Error updating status:', error)
    alert('Failed to update status')
  } finally {
    draggedAsset.value = null
  }
}
</script>

<style scoped>
/* Custom scrollbar for columns */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 9999px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.15);
}
</style>
/* Force reload 1762676334 */
