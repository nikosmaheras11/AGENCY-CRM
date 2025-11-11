<template>
  <div 
    class="asset-grid"
    :class="[`grid-${density}`, `cols-${columns}`]"
  >
    <!-- Asset Cards -->
    <div 
      v-for="asset in sortedAssets"
      :key="asset.id"
      class="asset-card group cursor-pointer bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all"
      @click="handleAssetClick(asset)"
    >
      <!-- Thumbnail/Preview -->
      <div class="asset-preview relative bg-gray-100 rounded-t-xl overflow-hidden" style="aspect-ratio: 16/9">
        <!-- Video thumbnail -->
        <video
          v-if="asset.videoUrl"
          :src="asset.videoUrl"
          class="w-full h-full object-cover"
          muted
          preload="metadata"
        />
        
        <!-- Figma iframe preview -->
        <iframe
          v-else-if="asset.figmaUrl"
          :src="convertToFigmaEmbedUrl(asset.figmaUrl)"
          class="w-full h-full border-0 pointer-events-none"
        />
        
        <!-- Gradient fallback -->
        <div 
          v-else
          class="w-full h-full"
          :style="{ backgroundImage: getAssetGradient(asset.id) }"
        />
        
        <!-- Duration badge (for videos) -->
        <div v-if="asset.duration" class="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm rounded px-2 py-1">
          <span class="text-white text-xs font-medium">{{ asset.duration }}</span>
        </div>
        
        <!-- Play/Figma icon overlay -->
        <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
          <div class="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
            <span v-if="asset.figmaUrl" class="material-icons text-gray-900 text-2xl">dashboard</span>
            <span v-else class="material-icons text-gray-900 text-2xl">play_arrow</span>
          </div>
        </div>
        
        <!-- Selection checkbox (top-left) -->
        <div 
          v-if="selectionEnabled"
          class="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
          @click.stop
        >
          <input 
            type="checkbox"
            :checked="isSelected(asset.id)"
            @change="toggleSelection(asset.id)"
            class="w-4 h-4 rounded border-2 border-white shadow-sm cursor-pointer"
          />
        </div>
        
        <!-- Status badge (top-right) -->
        <div class="absolute top-2 right-2">
          <span 
            class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium"
            :class="getStatusBadgeClass(asset.status)"
          >
            {{ getStatusEmoji(asset.status) }}
          </span>
        </div>
      </div>
      
      <!-- Metadata -->
      <div class="asset-info p-3">
        <h4 class="asset-title text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
          {{ asset.title }}
        </h4>
        
        <p class="asset-meta text-xs text-gray-500 mb-2">
          {{ asset.format }} • {{ asset.dimensions }} • {{ asset.size }}
        </p>
        
        <!-- Tags -->
        <div v-if="asset.metadata.tags" class="asset-tags flex flex-wrap gap-1 mb-2">
          <span 
            v-for="tag in getDisplayTags(asset.metadata.tags)"
            :key="tag"
            class="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
          >
            {{ tag }}
          </span>
          <span 
            v-if="getExtraTagsCount(asset.metadata.tags) > 0"
            class="px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-xs font-medium"
          >
            +{{ getExtraTagsCount(asset.metadata.tags) }}
          </span>
        </div>
        
        <!-- Footer metadata -->
        <div class="asset-footer flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
          <div class="flex items-center gap-2">
            <!-- Assignee -->
            <div v-if="asset.metadata.assignee" class="text-xs text-gray-500">
              <span class="material-icons text-sm">person</span>
              {{ asset.metadata.assignee }}
            </div>
          </div>
          
          <div class="flex items-center gap-2">
            <!-- Comments count -->
            <div class="flex items-center gap-1 text-xs text-gray-500">
              <span class="material-icons text-sm">comment</span>
              {{ asset.commentCount || 0 }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { convertToFigmaEmbedUrl } from '~/utils/figma'

interface Asset {
  id: string
  title: string
  format: string
  size: string
  dimensions: string
  duration?: string
  status: string
  videoUrl?: string
  figmaUrl?: string
  commentCount: number
  metadata: {
    assignee?: string | null
    tags?: string | null
    [key: string]: any
  }
}

interface Props {
  assets: Asset[]
  density?: 'comfortable' | 'cozy' | 'compact'
  columns?: 3 | 4 | 5 | 6 | 'auto'
  selectionEnabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  density: 'cozy',
  columns: 'auto',
  selectionEnabled: false
})

const emit = defineEmits<{
  assetClick: [asset: Asset]
  selectionChange: [selectedIds: string[]]
}>()

// Selection state
const selectedAssets = ref<Set<string>>(new Set())

const isSelected = (id: string) => selectedAssets.value.has(id)

const toggleSelection = (id: string) => {
  if (selectedAssets.value.has(id)) {
    selectedAssets.value.delete(id)
  } else {
    selectedAssets.value.add(id)
  }
  emit('selectionChange', Array.from(selectedAssets.value))
}

// Sorting (can be enhanced later)
const sortedAssets = computed(() => props.assets)

// Asset click handler
const handleAssetClick = (asset: Asset) => {
  emit('assetClick', asset)
}

// Tag display helpers
const getDisplayTags = (tags: string | null) => {
  if (!tags) return []
  const tagArray = typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : []
  return tagArray.slice(0, 3)
}

const getExtraTagsCount = (tags: string | null) => {
  if (!tags) return 0
  const tagArray = typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : []
  return Math.max(0, tagArray.length - 3)
}

// Status helpers
function getStatusBadgeClass(status: string) {
  const classes: Record<string, string> = {
    'needs-review': 'bg-blue-100 text-blue-700',
    'needs-edit': 'bg-orange-100 text-orange-700',
    'done': 'bg-green-100 text-green-700',
    'in-progress': 'bg-amber-100 text-amber-700',
    'new-request': 'bg-purple-100 text-purple-700'
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

// Gradient fallback
function getAssetGradient(id: string): string {
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  ]
  const index = parseInt(id.substring(0, 8), 16) % gradients.length
  return gradients[index]
}
</script>

<style scoped>
/* Grid density variations */
.grid-comfortable { gap: 24px; }
.grid-cozy { gap: 16px; }
.grid-compact { gap: 8px; }

/* Column configurations */
.asset-grid {
  display: grid;
  padding: 24px;
}

.cols-3 { grid-template-columns: repeat(3, 1fr); }
.cols-4 { grid-template-columns: repeat(4, 1fr); }
.cols-5 { grid-template-columns: repeat(5, 1fr); }
.cols-6 { grid-template-columns: repeat(6, 1fr); }
.cols-auto { 
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); 
}

/* Hover effects */
.asset-card {
  transition: all 0.2s ease;
}

.asset-card:hover {
  transform: translateY(-2px);
}

/* Line clamp utility */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
