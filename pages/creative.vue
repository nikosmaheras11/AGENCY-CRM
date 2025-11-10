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
        <span class="uppercase cursor-pointer hover:text-gray-900 transition-colors">Fitness Intl.</span>
        <span>/</span>
        <span class="uppercase cursor-pointer hover:text-gray-900 transition-colors">LA Fitness</span>
        <span>/</span>
        <span class="uppercase text-gray-900">LAF Media Requests</span>
      </div>
    </div>

    <!-- Page Header -->
    <div class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="flex items-center justify-between">
        <!-- Left: Title & Actions -->
        <div class="flex items-center gap-3">
          <h1 class="text-2xl font-bold text-gray-900">LAF MEDIA REQUESTS</h1>
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
          <select class="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 font-medium bg-white cursor-pointer hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Group by: Status</option>
            <option>Group by: Assignee</option>
            <option>Group by: Priority</option>
          </select>
          <button class="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 font-medium bg-white hover:bg-gray-50 transition-colors">
            Custom sort
          </button>
          <button class="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors" aria-label="Settings">
            <span class="material-icons text-gray-500 text-xl">settings</span>
          </button>
          <div class="flex border border-gray-200 rounded-lg overflow-hidden">
            <button class="px-3 py-2 bg-gray-100 hover:bg-gray-200 transition-colors" aria-label="Grid view">
              <span class="material-icons text-gray-700 text-lg">grid_view</span>
            </button>
            <button class="px-3 py-2 hover:bg-gray-100 transition-colors" aria-label="List view">
              <span class="material-icons text-gray-500 text-lg">view_list</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Kanban Board -->
    <div class="flex-1 overflow-hidden">
      <div class="h-full overflow-x-auto overflow-y-hidden px-6 py-6">
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
            <div class="flex-1 overflow-y-auto space-y-3 pr-1">
              <div
                v-for="asset in column.assets"
                :key="asset.id"
                @click="selectedAssetId = asset.id"
                class="block bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <!-- Thumbnail with actual gradient background -->
                <div 
                  class="relative rounded-t-lg overflow-hidden"
                  style="aspect-ratio: 16/9; min-height: 180px;"
                >
                  <!-- Colorful gradient background layer -->
                  <div 
                    class="absolute inset-0"
                    :style="{ backgroundImage: getAssetGradient(asset.id) }"
                  />
                  
                  <!-- Center play icon -->
                  <div class="absolute inset-0 flex items-center justify-center z-10">
                    <div class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-transform hover:scale-110">
                      <span class="material-icons text-white text-4xl">play_arrow</span>
                    </div>
                  </div>
                  
                  <!-- Top-left overlays -->
                  <div class="absolute top-2 left-2 flex items-center gap-2">
                    <div class="bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1.5">
                      <span class="material-icons text-white text-xs">description</span>
                      <span class="material-icons text-white text-xs">comment</span>
                      <span class="text-white text-xs font-medium">{{ asset.commentCount }}</span>
                    </div>
                  </div>

                  <!-- Bottom-right duration -->
                  <div class="absolute bottom-2 right-2">
                    <div class="bg-black/70 backdrop-blur-sm rounded px-2 py-1">
                      <span class="text-white text-xs font-medium">{{ asset.duration }}</span>
                    </div>
                  </div>

                  <!-- Play overlay on hover -->
                  <div class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div class="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                      <span class="material-icons text-gray-900 text-2xl">play_arrow</span>
                    </div>
                  </div>
                </div>

                <!-- Card Content -->
                <div class="p-3">
                  <!-- Title -->
                  <h3 class="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
                    {{ asset.title }}
                  </h3>

                  <!-- File Info -->
                  <p class="text-xs text-gray-500 mb-3">
                    {{ asset.format }} · {{ asset.size }} · {{ asset.dimensions }}
                  </p>

                  <!-- Metadata Fields -->
                  <div class="space-y-2 mb-3">
                    <div class="flex items-center gap-2 text-xs text-gray-400">
                      <span class="material-icons text-gray-300" style="font-size: 16px;">person</span>
                      <span>{{ asset.metadata.assignee || 'None' }}</span>
                    </div>
                    <div class="flex items-center gap-2 text-xs text-gray-400">
                      <span class="material-icons text-gray-300" style="font-size: 16px;">calendar_today</span>
                      <span>{{ asset.metadata.dueDate || 'None' }}</span>
                    </div>
                    <div class="flex items-center gap-2 text-xs text-gray-400">
                      <span class="material-icons text-gray-300" style="font-size: 16px;">label</span>
                      <span>{{ asset.metadata.tags || 'None' }}</span>
                    </div>
                    <div class="flex items-center gap-2 text-xs text-gray-400">
                      <span class="material-icons text-gray-300" style="font-size: 16px;">flag</span>
                      <span>{{ asset.metadata.priority || 'None' }}</span>
                    </div>
                  </div>

                  <!-- Status Badge -->
                  <div>
                    <span
                      class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium"
                      :class="getStatusBadgeClass(asset.status)"
                    >
                      <span>{{ getStatusEmoji(asset.status) }}</span>
                      <span>{{ getStatusText(asset.status) }}</span>
                    </span>
                  </div>
                </div>
              </div>

              <!-- Empty state -->
              <div v-if="column.assets.length === 0" class="text-center py-8 text-gray-400 text-sm">
                No assets in this column
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Status Bar -->
    <div class="bg-white border-t border-gray-200 px-6 py-4">
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
const selectedAssetId = ref<string | null>(null)

interface Asset {
  id: string
  thumbnail: string
  title: string
  format: 'MOV' | 'MP4'
  size: string
  dimensions: string
  duration: string
  commentCount: number
  status: 'in-progress' | 'needs-review' | 'needs-edit' | 'done'
  metadata: {
    assignee: string | null
    dueDate: string | null
    tags: string | null
    priority: string | null
  }
}

interface Column {
  id: string
  title: string
  emoji?: string
  badgeClass: string
  assets: Asset[]
}

const columns = ref<Column[]>([
  {
    id: 'in-progress',
    title: 'Palm Place In-Progress',
    badgeClass: 'bg-amber-100 text-amber-700 border border-amber-200',
    assets: []
  },
  {
    id: 'needs-review',
    title: 'Needs Review',
    emoji: '👀',
    badgeClass: 'bg-blue-100 text-blue-700 border border-blue-200',
    assets: [
      {
        id: '1',
        thumbnail: '',
        title: 'LA Fitness - Spring Campaign Hero Video',
        format: 'MOV',
        size: '47 MB',
        dimensions: '1080 × 1920',
        duration: '0:15',
        commentCount: 3,
        status: 'needs-review',
        metadata: {
          assignee: null,
          dueDate: null,
          tags: null,
          priority: null
        }
      },
      {
        id: '2',
        thumbnail: '',
        title: 'Gym Equipment Showcase - Vertical Edit',
        format: 'MP4',
        size: '52 MB',
        dimensions: '1080 × 1920',
        duration: '0:30',
        commentCount: 1,
        status: 'needs-review',
        metadata: {
          assignee: 'Sarah J.',
          dueDate: 'Apr 15',
          tags: 'social',
          priority: 'High'
        }
      },
      {
        id: '3',
        thumbnail: '',
        title: 'Member Testimonial - John\'s Fitness Journey',
        format: 'MOV',
        size: '89 MB',
        dimensions: '1920 × 1080',
        duration: '1:45',
        commentCount: 5,
        status: 'needs-review',
        metadata: {
          assignee: 'Mike C.',
          dueDate: 'Apr 12',
          tags: 'testimonial',
          priority: 'Medium'
        }
      }
    ]
  },
  {
    id: 'needs-edit',
    title: 'Needs Edit',
    emoji: '✏️',
    badgeClass: 'bg-orange-100 text-orange-700 border border-orange-200',
    assets: [
      {
        id: '4',
        thumbnail: '',
        title: 'Class Schedule Promo - Morning Sessions',
        format: 'MP4',
        size: '35 MB',
        dimensions: '1080 × 1920',
        duration: '0:10',
        commentCount: 2,
        status: 'needs-edit',
        metadata: {
          assignee: 'Emma D.',
          dueDate: 'Apr 10',
          tags: 'promo',
          priority: 'Critical'
        }
      },
      {
        id: '5',
        thumbnail: '',
        title: 'New Equipment Reveal - Cardio Zone',
        format: 'MOV',
        size: '68 MB',
        dimensions: '1920 × 1080',
        duration: '0:45',
        commentCount: 4,
        status: 'needs-edit',
        metadata: {
          assignee: null,
          dueDate: 'Apr 18',
          tags: 'equipment',
          priority: 'Low'
        }
      }
    ]
  },
  {
    id: 'done',
    title: 'Done',
    emoji: '✅',
    badgeClass: 'bg-green-100 text-green-700 border border-green-200',
    assets: [
      {
        id: '6',
        thumbnail: '',
        title: 'Grand Opening Event Recap',
        format: 'MP4',
        size: '125 MB',
        dimensions: '1920 × 1080',
        duration: '2:30',
        commentCount: 0,
        status: 'done',
        metadata: {
          assignee: 'Sarah J.',
          dueDate: 'Completed',
          tags: 'event',
          priority: null
        }
      },
      {
        id: '7',
        thumbnail: '',
        title: 'Membership Benefits Overview',
        format: 'MOV',
        size: '43 MB',
        dimensions: '1080 × 1920',
        duration: '0:20',
        commentCount: 0,
        status: 'done',
        metadata: {
          assignee: 'Mike C.',
          dueDate: 'Completed',
          tags: 'membership',
          priority: null
        }
      },
      {
        id: '8',
        thumbnail: '',
        title: 'Personal Training Success Stories',
        format: 'MP4',
        size: '76 MB',
        dimensions: '1920 × 1080',
        duration: '1:15',
        commentCount: 0,
        status: 'done',
        metadata: {
          assignee: 'Emma D.',
          dueDate: 'Completed',
          tags: 'testimonial',
          priority: null
        }
      },
      {
        id: '9',
        thumbnail: '',
        title: 'Summer Transformation Challenge Promo',
        format: 'MOV',
        size: '54 MB',
        dimensions: '1080 × 1920',
        duration: '0:25',
        commentCount: 0,
        status: 'done',
        metadata: {
          assignee: 'Sarah J.',
          dueDate: 'Completed',
          tags: 'challenge',
          priority: null
        }
      },
      {
        id: '10',
        thumbnail: '',
        title: 'Facility Tour - Full Walkthrough',
        format: 'MP4',
        size: '189 MB',
        dimensions: '1920 × 1080',
        duration: '3:45',
        commentCount: 0,
        status: 'done',
        metadata: {
          assignee: 'Mike C.',
          dueDate: 'Completed',
          tags: 'tour',
          priority: null
        }
      },
      {
        id: '11',
        thumbnail: '',
        title: 'Group Fitness Class Highlights',
        format: 'MOV',
        size: '92 MB',
        dimensions: '1080 × 1920',
        duration: '1:00',
        commentCount: 0,
        status: 'done',
        metadata: {
          assignee: 'Emma D.',
          dueDate: 'Completed',
          tags: 'fitness',
          priority: null
        }
      }
    ]
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
    'in-progress': 'bg-amber-100 text-amber-700 border border-amber-200'
  }
  return classes[status] || 'bg-gray-100 text-gray-700'
}

function getStatusEmoji(status: string) {
  const emojis: Record<string, string> = {
    'needs-review': '👀',
    'needs-edit': '✏️',
    'done': '✅',
    'in-progress': '🔄'
  }
  return emojis[status] || ''
}

function getStatusText(status: string) {
  const text: Record<string, string> = {
    'needs-review': 'Needs Review',
    'needs-edit': 'Needs Edit',
    'done': 'Done',
    'in-progress': 'In Progress'
  }
  return text[status] || status
}

const router = useRouter()

function openAssetDetail(asset: Asset) {
  router.push(`/creative/asset/${asset.id}`)
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
