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
      
      <!-- Figma embed iframe -->
      <iframe
        v-else-if="asset.figmaUrl"
        :src="asset.figmaUrl"
        class="absolute inset-0 w-full h-full border-0 pointer-events-none"
        allowfullscreen
      />
      
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
