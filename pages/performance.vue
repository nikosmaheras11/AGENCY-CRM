<template>
  <DashboardLayout>
    <!-- Campaign Detail Panel -->
    <PerformanceCampaignDetail 
      v-model="showCampaignDetail" 
      :campaign="selectedCampaign"
      @updated="handleCampaignUpdated"
    />

    <!-- Create Campaign Modal -->
    <CreateCampaignForm
      v-if="showCreateModal"
      @close="showCreateModal = false"
      @created="handleCampaignCreated"
    />

    <div class="p-6 sm:p-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-4xl font-display font-bold text-white mb-2">
            Campaign Planning
          </h1>
          <p class="text-slate-400 font-light">
            Plan campaigns, manage ad sets, and approve creatives
          </p>
        </div>
        <div class="flex gap-3">
          <button class="px-5 py-2.5 card-glass hover:bg-white/10 text-white rounded-2xl font-medium transition-all">
            Filter
          </button>
          <button 
            @click="showCreateModal = true"
            class="px-5 py-2.5 bg-secondary hover:bg-secondary/90 text-white shadow-primary rounded-2xl font-medium transition-all"
          >
            + New Campaign
          </button>
        </div>
      </div>

      <!-- View Switcher & Filters -->
      <div class="flex items-center justify-between mb-6">
        <!-- Tabs -->
        <div class="flex p-1 bg-white/5 rounded-2xl border border-white/10">
          <button 
            v-for="mode in viewModes" 
            :key="mode.id"
            @click="viewMode = mode.id"
            class="px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
            :class="viewMode === mode.id ? 'bg-secondary text-white shadow-primary' : 'text-slate-400 hover:text-white hover:bg-white/5'"
          >
            <UIcon :name="mode.icon" />
            {{ mode.label }}
          </button>
        </div>

        <div class="text-sm text-slate-400 font-light">
          {{ campaigns.length }} campaigns
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>

      <!-- Empty State -->
      <div v-else-if="campaigns.length === 0" class="flex flex-col items-center justify-center py-12 text-center">
        <div class="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
          <span class="material-icons text-3xl text-slate-500">campaign</span>
        </div>
        <h3 class="text-lg font-medium text-white mb-1">No campaigns yet</h3>
        <p class="text-slate-400 mb-6">Create your first campaign to get started</p>
        <button 
          @click="showCreateModal = true"
          class="px-5 py-2.5 bg-secondary hover:bg-secondary/90 text-white shadow-primary rounded-2xl font-medium transition-all"
        >
          Create Campaign
        </button>
      </div>

      <!-- Views -->
      <div v-else>
        <!-- Status Table View -->
        <PerformanceStatusTable 
          v-if="viewMode === 'status_table'"
          :campaigns="campaigns"
          @select="openCampaignDetail"
        />

        <!-- Platform Kanban View -->
        <PerformancePlatformKanban
          v-else-if="viewMode === 'platform_kanban'"
          :campaigns="campaigns"
          @select="openCampaignDetail"
        />

        <!-- Live Creatives View -->
        <PerformanceLiveCreatives
          v-else-if="viewMode === 'live_creatives'"
        />
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
const showCreateModal = ref(false)
const showCampaignDetail = ref(false)
const selectedCampaign = ref<any>(null)
const viewMode = ref('status_table')

const viewModes = [
  { id: 'status_table', label: 'Status Blocks', icon: 'i-heroicons-table-cells' },
  { id: 'platform_kanban', label: 'Platform Board', icon: 'i-heroicons-view-columns' },
  { id: 'live_creatives', label: 'Live Creatives', icon: 'i-heroicons-play-circle' }
]
const { campaigns, fetchCampaigns, loading } = useCampaigns()

onMounted(() => {
  fetchCampaigns()
})

const handleCampaignCreated = () => {
  fetchCampaigns() 
}

const openCampaignDetail = (campaign: any) => {
  selectedCampaign.value = campaign
  showCampaignDetail.value = true
}

const handleCampaignUpdated = () => {
  fetchCampaigns()
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
