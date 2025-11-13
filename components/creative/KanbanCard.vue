<template>
  <div 
    class="block bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
    @click="$emit('click', asset)"
  >
    <!-- Thumbnail -->
    <div 
      class="relative rounded-t-lg overflow-hidden"
      style="aspect-ratio: 16/9; min-height: 180px;"
    >
      <!-- Actual Thumbnail Image -->
      <img
        v-if="asset.thumbnail"
        :src="asset.thumbnail"
        :alt="asset.title"
        class="absolute inset-0 w-full h-full object-cover"
      />
      
      <!-- Figma file thumbnail -->
      <div 
        v-else-if="asset.figmaUrl"
        class="absolute inset-0"
      >
        <!-- Loading state -->
        <div v-if="figmaLoading" class="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <div class="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
        </div>
        
        <!-- Figma thumbnail -->
        <img
          v-else-if="figmaThumbnail"
          :src="figmaThumbnail"
          :alt="asset.title"
          class="absolute inset-0 w-full h-full object-cover"
        />
        
        <!-- Error/fallback state -->
        <div v-else class="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500">
          <div class="absolute inset-0 flex items-center justify-center">
            <svg class="w-24 h-24 text-white/90" viewBox="0 0 38 57" fill="currentColor">
              <path d="M19 28.5C19 23.2533 23.2533 19 28.5 19C33.7467 19 38 23.2533 38 28.5C38 33.7467 33.7467 38 28.5 38C23.2533 38 19 33.7467 19 28.5Z"/>
              <path d="M0 47.5C0 42.2533 4.25329 38 9.5 38H19V47.5C19 52.7467 14.7467 57 9.5 57C4.25329 57 0 52.7467 0 47.5Z"/>
              <path d="M19 0V19H28.5C33.7467 19 38 14.7467 38 9.5C38 4.25329 33.7467 0 28.5 0H19Z"/>
              <path d="M0 9.5C0 14.7467 4.25329 19 9.5 19H19V0H9.5C4.25329 0 0 4.25329 0 9.5Z"/>
              <path d="M0 28.5C0 33.7467 4.25329 38 9.5 38H19V19H9.5C4.25329 19 0 23.2533 0 28.5Z"/>
            </svg>
          </div>
        </div>
        
        <!-- Figma badge overlay -->
        <div class="absolute top-2 left-2">
          <div class="bg-purple-600 text-white text-xs font-medium px-2 py-1 rounded flex items-center gap-1">
            <svg class="w-3 h-3" viewBox="0 0 38 57" fill="currentColor">
              <path d="M19 28.5C19 23.2533 23.2533 19 28.5 19C33.7467 19 38 23.2533 38 28.5C38 33.7467 33.7467 38 28.5 38C23.2533 38 19 33.7467 19 28.5Z"/>
            </svg>
            Figma
          </div>
        </div>
      </div>
      
      <!-- Gradient fallback -->
      <div 
        v-else
        class="absolute inset-0"
        :style="{ backgroundImage: gradientFallback }"
      />
      
      <!-- Top-left: Comment count -->
      <div v-if="asset.commentCount > 0" class="absolute top-2 left-2">
        <div class="bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1.5">
          <span class="material-icons text-white text-xs">comment</span>
          <span class="text-white text-xs font-medium">{{ asset.commentCount }}</span>
        </div>
      </div>

      <!-- Bottom-right: Duration (only for videos) -->
      <div v-if="asset.duration && asset.duration !== '0:00'" class="absolute bottom-2 right-2">
        <div class="bg-black/70 backdrop-blur-sm rounded px-2 py-1">
          <span class="text-white text-xs font-medium">{{ asset.duration }}</span>
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
          :class="statusBadgeClass"
        >
          <span>{{ statusEmoji }}</span>
          <span>{{ statusText }}</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Asset {
  id: string
  title: string
  thumbnail?: string
  figmaUrl?: string
  videoUrl?: string
  format: string
  size: string
  dimensions: string
  duration: string
  commentCount: number
  status: string
  metadata: {
    assignee?: string | null
    dueDate?: string | null
    tags?: string | null
    priority?: string | null
  }
}

const props = defineProps<{
  asset: Asset
}>()

defineEmits<{
  click: [asset: Asset]
}>()

// Figma integration
const { fetchFigmaThumbnail } = useFigma()
const figmaThumbnail = ref<string | null>(null)
const figmaLoading = ref(false)

// Fetch Figma thumbnail if asset has Figma URL
if (props.asset.figmaUrl) {
  figmaLoading.value = true
  fetchFigmaThumbnail(props.asset.figmaUrl)
    .then((data: any) => {
      figmaThumbnail.value = data.thumbnailUrl
    })
    .catch((error) => {
      console.error('Failed to fetch Figma thumbnail:', error)
    })
    .finally(() => {
      figmaLoading.value = false
    })
}

const gradientFallback = computed(() => {
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  ]
  const index = parseInt(props.asset.id) % gradients.length
  return gradients[index]
})

const statusBadgeClass = computed(() => {
  const classes: Record<string, string> = {
    'needs-review': 'bg-blue-100 text-blue-700 border border-blue-200',
    'needs-edit': 'bg-orange-100 text-orange-700 border border-orange-200',
    'done': 'bg-green-100 text-green-700 border border-green-200',
    'in-progress': 'bg-amber-100 text-amber-700 border border-amber-200',
    'new-request': 'bg-purple-100 text-purple-700 border border-purple-200'
  }
  return classes[props.asset.status] || 'bg-gray-100 text-gray-700'
})

const statusEmoji = computed(() => {
  const emojis: Record<string, string> = {
    'needs-review': '👀',
    'needs-edit': '✏️',
    'done': '✅',
    'in-progress': '🔄',
    'new-request': '📬'
  }
  return emojis[props.asset.status] || ''
})

const statusText = computed(() => {
  const text: Record<string, string> = {
    'needs-review': 'Needs Review',
    'needs-edit': 'Needs Edit',
    'done': 'Done',
    'in-progress': 'In Progress',
    'new-request': 'New Request'
  }
  return text[props.asset.status] || props.asset.status
})
</script>
