<template>
  <DashboardLayout>
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
            class="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white shadow-primary rounded-2xl font-medium transition-all"
          >
            + New Campaign
          </button>
        </div>
      </div>

      <!-- View Switcher -->
      <div class="card-glass card-elevated p-5 mb-6">
        <div class="flex items-center justify-between">
          <div class="flex gap-2">
            <button 
              @click="viewMode = 'table'"
              class="px-4 py-2 rounded-xl text-sm font-medium transition-all"
              :class="viewMode === 'table' ? 'bg-primary-500 text-white shadow-primary' : 'text-slate-300 hover:bg-white/10'"
            >
              Table View
            </button>
            <button 
              @click="viewMode = 'kanban'"
              class="px-4 py-2 rounded-xl text-sm font-medium transition-all"
              :class="viewMode === 'kanban' ? 'bg-primary-500 text-white shadow-primary' : 'text-slate-300 hover:bg-white/10'"
            >
              Board View
            </button>
          </div>
          <div class="text-sm text-slate-400 font-light">
            {{ campaigns.length }} campaigns
          </div>
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
          class="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white shadow-primary rounded-2xl font-medium transition-all"
        >
          Create Campaign
        </button>
      </div>

      <!-- Table View -->
      <div v-else-if="viewMode === 'table'" class="card-glass card-elevated overflow-hidden">
        <!-- Table Header -->
        <div class="grid grid-cols-12 gap-4 px-6 py-4 bg-white/5 border-b border-white/10 text-xs font-semibold text-slate-400 uppercase tracking-wide">
          <div class="col-span-4">Campaign Name</div>
          <div class="col-span-2">Client</div>
          <div class="col-span-2">Status</div>
          <div class="col-span-2">Platforms</div>
          <div class="col-span-2">Launch Date</div>
        </div>

        <!-- Table Rows -->
        <div class="divide-y divide-white/10">
          <div 
            v-for="campaign in campaigns" 
            :key="campaign.id"
            @click="navigateTo(`/performance/${campaign.id}`)"
            class="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-white/5 transition-colors cursor-pointer"
          >
            <!-- Campaign Name -->
            <div class="col-span-4">
              <div class="font-medium text-white">{{ campaign.name }}</div>
              <div class="text-xs text-slate-400 mt-1 truncate">{{ campaign.description || 'No description' }}</div>
            </div>

            <!-- Client -->
            <div class="col-span-2 flex items-center gap-2">
              <UAvatar 
                v-if="campaign.client?.logo_url"
                :src="campaign.client.logo_url" 
                size="xs" 
              />
              <span class="text-sm text-slate-300">{{ campaign.client?.name || 'Unknown' }}</span>
            </div>

            <!-- Status -->
            <div class="col-span-2 flex items-center">
              <span 
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="getStatusBadge(campaign.status)"
              >
                {{ formatStatus(campaign.status) }}
              </span>
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
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
const showCreateModal = ref(false)
const viewMode = ref('table')
const { campaigns, fetchCampaigns, loading } = useCampaigns()

onMounted(() => {
  fetchCampaigns()
})

const handleCampaignCreated = () => {
  // fetchCampaigns() // useCampaigns updates local state automatically
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
