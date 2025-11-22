<template>
  <div class="space-y-6">
    <div v-for="group in statusGroups" :key="group.status" class="card-glass card-elevated overflow-hidden">
      <!-- Group Header -->
      <button 
        @click="toggleGroup(group.status)"
        class="w-full flex items-center justify-between px-6 py-4 bg-white/5 border-b border-white/10 hover:bg-white/10 transition-colors"
      >
        <div class="flex items-center gap-3">
          <UIcon 
            :name="expandedGroups.has(group.status) ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-right'"
            class="text-slate-400"
          />
          <div class="flex items-center gap-2">
            <h3 class="font-medium text-white">{{ formatStatus(group.status) }}</h3>
            <span class="px-2 py-0.5 rounded-full text-xs bg-white/10 text-slate-400">
              {{ group.campaigns.length }}
            </span>
          </div>
        </div>
      </button>

      <!-- Group Content -->
      <div v-show="expandedGroups.has(group.status)">
        <!-- Table Header (only for first item or if we want it per group) -->
        <div class="grid grid-cols-12 gap-4 px-6 py-3 bg-black/20 text-xs font-semibold text-slate-500 uppercase tracking-wide">
          <div class="col-span-6">Campaign Name</div>
          <div class="col-span-2">Platforms</div>
          <div class="col-span-2">Launch Date</div>
          <div class="col-span-2 text-right">Actions</div>
        </div>

        <!-- Table Rows -->
        <div class="divide-y divide-white/10">
          <div 
            v-for="campaign in group.campaigns" 
            :key="campaign.id"
            @click="$emit('select', campaign)"
            class="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-white/5 transition-colors cursor-pointer group"
          >
            <!-- Campaign Name -->
            <div class="col-span-6">
              <div class="font-medium text-white group-hover:text-primary-400 transition-colors">{{ campaign.name }}</div>
              <div class="text-xs text-slate-400 mt-1 truncate">{{ campaign.description || 'No description' }}</div>
            </div>

            <!-- Platforms -->
            <div class="col-span-2 flex items-center gap-1">
              <UIcon 
                v-for="platform in campaign.platforms.slice(0, 3)" 
                :key="platform"
                :name="getPlatformIcon(platform)" 
                class="text-lg text-slate-400" 
              />
              <span v-if="campaign.platforms.length > 3" class="text-xs text-slate-500">
                +{{ campaign.platforms.length - 3 }}
              </span>
            </div>

            <!-- Launch Date -->
            <div class="col-span-2 flex items-center text-sm text-slate-400">
              {{ formatDate(campaign.planned_launch_date) }}
            </div>

            <!-- Actions -->
            <div class="col-span-2 flex items-center justify-end">
              <button class="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                <UIcon name="i-heroicons-arrow-right" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="campaigns.length === 0" class="text-center py-12 text-slate-400">
      No campaigns found.
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  campaigns: any[]
}>()

defineEmits(['select'])

const expandedGroups = ref(new Set(['planning', 'in_progress', 'approved']))

const statusOrder = ['approved', 'in_progress', 'planning', 'completed', 'archived']

const statusGroups = computed(() => {
  const groups: Record<string, any[]> = {}
  
  // Initialize groups
  statusOrder.forEach(status => {
    groups[status] = []
  })

  // Sort campaigns into groups
  props.campaigns.forEach(campaign => {
    const status = campaign.status || 'planning'
    if (!groups[status]) groups[status] = []
    groups[status].push(campaign)
  })

  // Return as array, filtering out empty groups if desired (keeping all for now structure)
  return statusOrder
    .map(status => ({
      status,
      campaigns: groups[status]
    }))
    .filter(group => group.campaigns.length > 0)
})

const toggleGroup = (status: string) => {
  if (expandedGroups.value.has(status)) {
    expandedGroups.value.delete(status)
  } else {
    expandedGroups.value.add(status)
  }
}

const formatStatus = (status: string) => {
  return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return 'Not set'
  return new Date(dateStr).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
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
