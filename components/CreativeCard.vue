<template>
  <div class="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group">
    <!-- Large Visual Thumbnail -->
    <div class="relative aspect-video bg-gradient-to-br from-purple-100 to-pink-100 overflow-hidden">
      <!-- Actual Thumbnail Image -->
      <img 
        v-if="asset.thumbnail_url || asset.asset_file_url || asset.thumbnail || asset.assetFileUrl"
        :src="asset.thumbnail_url || asset.asset_file_url || asset.thumbnail || asset.assetFileUrl" 
        :alt="asset.name"
        class="absolute inset-0 w-full h-full object-cover"
      />
      
      <!-- Fallback Icon if no thumbnail -->
      <div v-else class="absolute inset-0 flex items-center justify-center">
        <span class="material-icons text-7xl text-purple-300 group-hover:scale-110 transition-transform">
          {{ asset.type === 'video' ? 'play_circle' : asset.type === 'document' ? 'description' : 'image' }}
        </span>
      </div>
      
      <!-- Overlay Info -->
      <div class="absolute top-3 left-3 flex gap-2">
        <span class="px-2 py-1 bg-white/95 backdrop-blur-sm rounded text-xs font-medium text-slate-700">
          {{ asset.type }}
        </span>
      </div>

      <!-- Comment Badge -->
      <div v-if="asset.comments > 0" class="absolute top-3 right-3">
        <div class="flex items-center gap-1 px-2 py-1 bg-white/95 backdrop-blur-sm rounded">
          <span class="material-icons text-sm text-slate-700">comment</span>
          <span class="text-xs font-medium text-slate-700">{{ asset.comments }}</span>
        </div>
      </div>
    </div>

    <!-- Card Content -->
    <div class="p-4">
      <h3 class="font-display font-semibold text-slate-900 mb-2 line-clamp-2 text-sm">
        {{ asset.name }}
      </h3>

      <div class="flex items-center justify-between text-xs text-slate-600 font-light mb-3">
        <span class="flex items-center gap-1">
          <span class="material-icons text-sm">folder</span>
          {{ asset.project }}
        </span>
        <span>{{ asset.uploadedAt }}</span>
      </div>

      <!-- Status Badge -->
      <div class="flex items-center justify-between">
        <span 
          class="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
          :class="getStatusBadge(asset.status)"
        >
          <span class="w-1.5 h-1.5 rounded-full mr-1.5" :class="getStatusDot(asset.status)"></span>
          {{ getStatusText(asset.status) }}
        </span>

        <!-- Action Buttons for Pending -->
        <div v-if="asset.status === 'pending'" class="flex gap-1">
          <button 
            class="p-1.5 hover:bg-green-50 rounded transition-colors group/btn"
            title="Approve"
          >
            <span class="material-icons text-lg text-slate-400 group-hover/btn:text-green-600">check_circle</span>
          </button>
          <button 
            class="p-1.5 hover:bg-red-50 rounded transition-colors group/btn"
            title="Request Edit"
          >
            <span class="material-icons text-lg text-slate-400 group-hover/btn:text-red-600">cancel</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Asset {
  id: number
  name: string
  type: string
  status: string
  project: string
  uploadedBy: string
  uploadedAt: string
  comments: number
  thumbnail?: string
  assetFileUrl?: string
  thumbnail_url?: string
  asset_file_url?: string
}

defineProps<{
  asset: Asset
}>()

const getStatusBadge = (status: string) => {
  const badges: Record<string, string> = {
    pending: 'bg-blue-50 text-blue-700',
    approved: 'bg-secondary/10 text-secondary',
    rejected: 'bg-orange-50 text-orange-700'
  }
  return badges[status] || 'bg-slate-50 text-slate-700'
}

const getStatusDot = (status: string) => {
  const dots: Record<string, string> = {
    pending: 'bg-blue-500',
    approved: 'bg-secondary',
    rejected: 'bg-orange-500'
  }
  return dots[status] || 'bg-gray-500'
}

const getStatusText = (status: string) => {
  const text: Record<string, string> = {
    pending: 'Needs Review',
    approved: 'Approved',
    rejected: 'Needs Edit'
  }
  return text[status] || status
}
</script>
