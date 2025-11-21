<template>
  <div 
    class="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
    :class="creative.figmaUrl ? 'cursor-pointer' : ''"
    @click="handleClick"
  >
    <!-- Creative Preview -->
    <div class="relative aspect-video bg-gradient-to-br from-blue-100 to-cyan-100 group">
      <div class="absolute inset-0 flex items-center justify-center">
        <span class="material-icons text-6xl text-blue-300">
          {{ getTypeIcon(creative.type) }}
        </span>
      </div>
      
      <!-- Figma hover overlay -->
      <div 
        v-if="creative.figmaUrl" 
        class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
      >
        <span class="text-white font-medium text-sm">Open in Figma</span>
      </div>
      
      <!-- Platform Badge -->
      <div class="absolute top-3 left-3">
        <span class="px-2 py-1 bg-white/95 backdrop-blur-sm rounded text-xs font-medium text-slate-700">
          {{ creative.platform }}
        </span>
      </div>

      <!-- Performance Badge -->
      <div class="absolute top-3 right-3">
        <span 
          class="flex items-center gap-1 px-2 py-1 backdrop-blur-sm rounded text-xs font-medium"
          :class="getPerformanceBadge(creative.status)"
        >
          <span class="w-1.5 h-1.5 rounded-full" :class="getPerformanceDot(creative.status)"></span>
          {{ getStatusLabel(creative.status) }}
        </span>
      </div>
    </div>

    <!-- Metrics -->
    <div class="p-4">
      <h3 class="font-display font-semibold text-slate-900 mb-3 line-clamp-1">
        {{ creative.name }}
      </h3>

      <!-- Key Metrics Grid -->
      <div class="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p class="text-xs text-slate-600 mb-0.5">Impressions</p>
          <p class="text-sm font-semibold text-slate-900">{{ formatNumber(creative.impressions) }}</p>
        </div>
        <div>
          <p class="text-xs text-slate-600 mb-0.5">Clicks</p>
          <p class="text-sm font-semibold text-slate-900">{{ formatNumber(creative.clicks) }}</p>
        </div>
        <div>
          <p class="text-xs text-slate-600 mb-0.5">CTR</p>
          <p class="text-sm font-semibold text-slate-900">{{ creative.ctr }}%</p>
        </div>
        <div>
          <p class="text-xs text-slate-600 mb-0.5">ROAS</p>
          <p 
            class="text-sm font-semibold"
            :class="creative.roas >= 3 ? 'text-secondary' : 'text-orange-600'"
          >
            {{ creative.roas }}x
          </p>
        </div>
      </div>

      <!-- Spend & Conversions -->
      <div class="flex items-center justify-between pt-3 border-t border-slate-200">
        <div>
          <p class="text-xs text-slate-600">Spend</p>
          <p class="text-sm font-semibold text-slate-900">${{ creative.spend.toLocaleString() }}</p>
        </div>
        <div class="text-right">
          <p class="text-xs text-slate-600">Conversions</p>
          <p class="text-sm font-semibold text-slate-900">{{ creative.conversions }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Creative {
  id: number
  name: string
  platform: string
  type: string
  impressions: number
  clicks: number
  ctr: number
  conversions: number
  spend: number
  roas: number
  status: string
  figmaUrl?: string
}

const props = defineProps<{
  creative: Creative
}>()

const handleClick = () => {
  if (props.creative.figmaUrl) {
    window.open(props.creative.figmaUrl, '_blank')
  }
}

const getTypeIcon = (type: string) => {
  const icons: Record<string, string> = {
    video: 'play_circle',
    image: 'image',
    carousel: 'view_carousel',
    story: 'auto_stories',
    figma: 'dashboard'
  }
  return icons[type] || 'campaign'
}

const getPerformanceBadge = (status: string) => {
  const badges: Record<string, string> = {
    'performing': 'bg-secondary/90 text-white',
    'in-progress': 'bg-blue-500/90 text-white',
    'underperforming': 'bg-orange-500/90 text-white'
  }
  return badges[status] || 'bg-orange-500/90 text-white'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    'performing': 'Performing',
    'in-progress': 'In Progress',
    'underperforming': 'Needs Attention'
  }
  return labels[status] || 'Needs Attention'
}

const getPerformanceDot = (status: string) => {
  return status === 'performing' 
    ? 'bg-white' 
    : 'bg-white'
}

const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}
</script>
