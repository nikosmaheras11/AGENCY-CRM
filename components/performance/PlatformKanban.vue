<template>
  <div class="h-full overflow-x-auto">
    <div class="flex gap-6 min-w-max pb-6">
      <div 
        v-for="column in visibleColumns" 
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
            class="card-glass p-4 hover:bg-white/10 transition-all cursor-pointer group border border-white/5 hover:border-primary-500/30"
          >
            <!-- Status Badge -->
            <div class="flex justify-between items-start mb-3">
              <span 
                class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider"
                :class="getStatusBadge(campaign.status)"
              >
                {{ formatStatus(campaign.status) }}
              </span>
              
              <!-- Launch Date -->
              <span class="text-xs text-slate-500">
                {{ formatDate(campaign.planned_launch_date) }}
              </span>
            </div>

            <!-- Campaign Info -->
            <h4 class="font-medium text-white mb-1 group-hover:text-primary-400 transition-colors">
              {{ campaign.name }}
            </h4>
            <p class="text-xs text-slate-400 line-clamp-2 mb-3">
              {{ campaign.description || 'No description provided' }}
            </p>

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
</template>

<script setup lang="ts">
const props = defineProps<{
  campaigns: any[]
}>()

defineEmits(['select'])

const columns = [
  { id: 'meta', label: 'Meta', icon: 'i-simple-icons-meta' },
  { id: 'tiktok', label: 'TikTok', icon: 'i-simple-icons-tiktok' },
  { id: 'google', label: 'Google', icon: 'i-simple-icons-google' },
  { id: 'linkedin', label: 'LinkedIn', icon: 'i-simple-icons-linkedin' },
  { id: 'twitter', label: 'X / Twitter', icon: 'i-simple-icons-x' },
  { id: 'pinterest', label: 'Pinterest', icon: 'i-simple-icons-pinterest' },
  { id: 'snapchat', label: 'Snapchat', icon: 'i-simple-icons-snapchat' }
]

// TODO: Add column visibility filter later
const visibleColumns = computed(() => columns)

const getCampaignsForPlatform = (platformId: string) => {
  return props.campaigns.filter(c => c.platforms && c.platforms.includes(platformId))
}

const getStatusBadge = (status: string) => {
  const badges: Record<string, string> = {
    'planning': 'bg-slate-500/20 text-slate-300',
    'in_review': 'bg-purple-500/20 text-purple-300',
    'approved': 'bg-blue-500/20 text-blue-300',
    'live': 'bg-green-500/20 text-green-300',
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
