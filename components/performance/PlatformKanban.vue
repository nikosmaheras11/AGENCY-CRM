<template>
  <div class="h-full flex flex-col">
    <!-- Sub-Navigation -->
    <div class="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
      <button 
        @click="selectedPlatform = 'all'"
        class="px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap"
        :class="selectedPlatform === 'all' ? 'bg-white/10 text-white border border-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'"
      >
        All Board
      </button>
      <div class="w-px h-6 bg-white/10 mx-2"></div>
      <button 
        v-for="platform in columns" 
        :key="platform.id"
        @click="selectedPlatform = platform.id"
        class="px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap"
        :class="selectedPlatform === platform.id ? 'bg-white/10 text-white border border-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'"
      >
        <UIcon :name="platform.icon" />
        {{ platform.label }}
        <span class="ml-1 text-xs opacity-60 bg-white/10 px-1.5 rounded-full">
          {{ getCampaignsForPlatform(platform.id).length }}
        </span>
      </button>
    </div>

    <!-- All Board View (Kanban) -->
    <div v-if="selectedPlatform === 'all'" class="flex-1 overflow-x-auto">
      <div class="flex gap-6 min-w-max pb-6">
        <div 
          v-for="column in columns" 
          :key="column.id"
          class="w-80 flex-shrink-0 flex flex-col"
        >
          <!-- Column Header -->
          <div class="flex items-center justify-between mb-4 px-2">
            <div class="flex items-center gap-2">
              <UIcon :name="column.icon" class="text-xl text-slate-400" />
              <h3 class="font-medium text-white">{{ column.label }}</h3>
              <span class="px-2 py-0.5 rounded-full text-xs bg-white/10 text-slate-400">
                {{ getCampaignsForPlatform(column.id).length }}
              </span>
            </div>
          </div>

          <!-- Cards Container -->
          <div class="flex-1 space-y-3">
            <div 
              v-for="campaign in getCampaignsForPlatform(column.id)" 
              :key="campaign.id"
              @click="$emit('select', campaign)"
              class="card-glass p-4 hover:bg-white/10 transition-all cursor-pointer group border border-white/5 hover:border-secondary/30"
            >
              <!-- Header: Name & Date -->
              <div class="flex justify-between items-start mb-3">
                <h4 class="font-medium text-white group-hover:text-primary-400 transition-colors line-clamp-1">
                  {{ campaign.name }}
                </h4>
                <span class="text-xs text-slate-500 whitespace-nowrap ml-2">
                  {{ formatDate(campaign.planned_launch_date) }}
                </span>
              </div>

              <!-- Ad Sets List -->
              <div class="space-y-2 mb-3">
                <div 
                  v-for="adSet in getAdSetsForPlatform(campaign, column.id)" 
                  :key="adSet.id"
                  class="flex items-center gap-2 text-xs bg-white/5 rounded px-2 py-1.5"
                >
                  <div 
                    class="w-2 h-2 rounded-full"
                    :class="getStatusColor(adSet.status)"
                  ></div>
                  <span class="text-slate-300 truncate">{{ adSet.name }}</span>
                </div>
                <div v-if="getAdSetsForPlatform(campaign, column.id).length === 0" class="text-xs text-slate-500 italic px-2">
                  No ad sets created
                </div>
              </div>

              <!-- Footer -->
              <div class="flex items-center justify-between pt-3 border-t border-white/5">
                <!-- Other Platforms -->
                <div class="flex -space-x-1">
                  <div 
                    v-for="platform in campaign.platforms.filter((p: string) => p !== column.id).slice(0, 3)" 
                    :key="platform"
                    class="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center"
                    :title="platform"
                  >
                    <UIcon :name="getPlatformIcon(platform)" class="text-[10px] text-slate-400" />
                  </div>
                  <div v-if="campaign.platforms.filter((p: string) => p !== column.id).length > 3" class="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[8px] text-slate-400">
                    +{{ campaign.platforms.filter((p: string) => p !== column.id).length - 3 }}
                  </div>
                </div>

                <!-- Arrow -->
                <UIcon name="i-heroicons-arrow-right" class="text-slate-600 group-hover:text-primary-400 transition-colors" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Single Platform Grid View -->
    <div v-else class="flex-1">
      <div v-if="getCampaignsForPlatform(selectedPlatform).length === 0" class="text-center py-12 text-slate-400">
        No campaigns found for {{ columns.find(c => c.id === selectedPlatform)?.label }}.
      </div>
      
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div 
          v-for="campaign in getCampaignsForPlatform(selectedPlatform)" 
          :key="campaign.id"
          @click="$emit('select', campaign)"
          class="card-glass p-5 hover:bg-white/10 transition-all cursor-pointer group border border-white/5 hover:border-secondary/30 flex flex-col"
        >
          <!-- Header -->
          <div class="flex justify-between items-start mb-4">
            <div class="flex items-center gap-2">
              <UIcon :name="getPlatformIcon(selectedPlatform)" class="text-xl text-slate-400" />
              <h3 class="text-lg font-medium text-white group-hover:text-primary-400 transition-colors line-clamp-1">
                {{ campaign.name }}
              </h3>
            </div>
            <span class="text-xs text-slate-500 whitespace-nowrap">
              {{ formatDate(campaign.planned_launch_date) }}
            </span>
          </div>

          <!-- Ad Sets List -->
          <div class="flex-1 space-y-2 mb-4">
            <div 
              v-for="adSet in getAdSetsForPlatform(campaign, selectedPlatform)" 
              :key="adSet.id"
              class="flex items-center gap-2 text-sm bg-white/5 rounded-lg px-3 py-2"
            >
              <div 
                class="w-2 h-2 rounded-full"
                :class="getStatusColor(adSet.status)"
              ></div>
              <span class="text-slate-300 truncate">{{ adSet.name }}</span>
            </div>
             <div v-if="getAdSetsForPlatform(campaign, selectedPlatform).length === 0" class="text-sm text-slate-500 italic px-3">
              No ad sets created yet
            </div>
          </div>

          <!-- Footer -->
          <div class="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
            <div class="flex items-center gap-4">
              <div class="flex items-center gap-1">
                <UIcon name="i-heroicons-calendar" />
                <span>{{ campaign.planned_end_date ? formatDate(campaign.planned_end_date) : 'Ongoing' }}</span>
              </div>
            </div>
            
            <!-- Other Platforms Indicator -->
            <div class="flex items-center gap-1" v-if="campaign.platforms.length > 1">
              <span class="text-slate-600">Also on:</span>
              <div class="flex -space-x-1">
                <UIcon 
                  v-for="p in campaign.platforms.filter((p: string) => p !== selectedPlatform).slice(0, 2)" 
                  :key="p"
                  :name="getPlatformIcon(p)" 
                  class="text-slate-400" 
                />
                <span v-if="campaign.platforms.length > 3" class="pl-1">+{{ campaign.platforms.length - 3 }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  campaigns: any[]
}>()

defineEmits(['select'])

const selectedPlatform = ref('all')

const columns = [
  { id: 'meta', label: 'Meta', icon: 'i-simple-icons-meta' },
  { id: 'tiktok', label: 'TikTok', icon: 'i-simple-icons-tiktok' },
  { id: 'google', label: 'Google', icon: 'i-simple-icons-google' },
  { id: 'linkedin', label: 'LinkedIn', icon: 'i-simple-icons-linkedin' },
  { id: 'twitter', label: 'X / Twitter', icon: 'i-simple-icons-x' },
  { id: 'pinterest', label: 'Pinterest', icon: 'i-simple-icons-pinterest' },
  { id: 'snapchat', label: 'Snapchat', icon: 'i-simple-icons-snapchat' }
]

const getCampaignsForPlatform = (platformId: string) => {
  return props.campaigns.filter(c => c.platforms && c.platforms.includes(platformId))
}

const getAdSetsForPlatform = (campaign: any, platformId: string) => {
  if (!campaign.ad_sets) return []
  return campaign.ad_sets.filter((adSet: any) => adSet.platform === platformId)
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'draft': 'bg-slate-500',
    'ready_for_review': 'bg-purple-500',
    'in_review': 'bg-purple-500',
    'approved': 'bg-secondary',
    'changes_requested': 'bg-red-500',
    'live': 'bg-secondary',
    'completed': 'bg-gray-500',
    'archived': 'bg-red-900'
  }
  return colors[status] || 'bg-slate-500'
}

const getStatusBadge = (status: string) => {
  const badges: Record<string, string> = {
    'planning': 'bg-slate-500/20 text-slate-300',
    'in_review': 'bg-purple-500/20 text-purple-300',
    'approved': 'bg-secondary/20 text-secondary',
    'live': 'bg-secondary/20 text-secondary',
    'completed': 'bg-gray-500/20 text-gray-300',
    'archived': 'bg-red-500/20 text-red-300'
  }
  return badges[status] || 'bg-white/10 text-slate-300'
}

const formatStatus = (status: string) => {
  return status?.split('_').join(' ') || ''
}

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric'
  })
}

const getPlatformIcon = (platform: string) => {
  const icons: Record<string, string> = {
    'meta': 'i-simple-icons-meta',
    'tiktok': 'i-simple-icons-tiktok',
    'google': 'i-simple-icons-google',
    'linkedin': 'i-simple-icons-linkedin',
    'twitter': 'i-simple-icons-x',
    'pinterest': 'i-simple-icons-pinterest',
    'snapchat': 'i-simple-icons-snapchat'
  }
  return icons[platform.toLowerCase()] || 'i-heroicons-globe-alt'
}
</script>
