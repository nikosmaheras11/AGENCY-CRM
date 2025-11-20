<template>
  <DashboardLayout>
    <div class="h-full flex flex-col bg-[#F5F5F0] overflow-hidden">
      <!-- Header -->
      <div class="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div class="flex items-center gap-4">
          <NuxtLink to="/performance" class="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
            <span class="material-icons">arrow_back</span>
          </NuxtLink>
          <div>
            <div class="flex items-center gap-3 mb-1">
              <h1 class="text-xl font-display font-bold text-slate-900">
                {{ campaign?.name || 'Loading...' }}
              </h1>
              <span 
                v-if="campaign"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="getStatusBadge(campaign.status)"
              >
                {{ formatStatus(campaign.status) }}
              </span>
            </div>
            <div class="flex items-center gap-3 text-xs text-slate-500">
              <span v-if="campaign?.client" class="flex items-center gap-1">
                <span class="material-icons text-[14px]">business</span>
                {{ campaign.client.name }}
              </span>
              <span class="flex items-center gap-1">
                <span class="material-icons text-[14px]">calendar_today</span>
                {{ formatDate(campaign?.planned_launch_date) }} - {{ formatDate(campaign?.planned_end_date) }}
              </span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button class="px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 rounded-lg text-sm font-medium transition-all flex items-center gap-2">
            <span class="material-icons text-[18px]">edit</span>
            Edit Details
          </button>
          <button 
            @click="showCreateAdSet = true"
            class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white shadow-sm rounded-lg text-sm font-medium transition-all flex items-center gap-2"
          >
            <span class="material-icons text-[18px]">add</span>
            Add Ad Set
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-6 sm:p-8">
        <div v-if="loading && !campaign" class="flex justify-center py-12">
          <div class="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>

        <div v-else-if="campaign" class="max-w-5xl mx-auto space-y-8">
          
          <!-- Campaign Overview Cards -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 class="text-sm font-medium text-slate-500 mb-2">Platforms</h3>
              <div class="flex flex-wrap gap-2">
                <span 
                  v-for="platform in campaign.platforms" 
                  :key="platform"
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 text-slate-600 text-xs font-medium"
                >
                  <UIcon :name="getPlatformIcon(platform)" />
                  {{ platform.charAt(0).toUpperCase() + platform.slice(1) }}
                </span>
              </div>
            </div>
            
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 class="text-sm font-medium text-slate-500 mb-2">Objective</h3>
              <div class="flex items-center gap-2">
                <div class="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <UIcon :name="getObjectiveIcon(campaign.objective)" class="text-xl" />
                </div>
                <span class="font-medium text-slate-900 capitalize">{{ campaign.objective || 'Not set' }}</span>
              </div>
            </div>

            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 class="text-sm font-medium text-slate-500 mb-2">Stats</h3>
              <div class="flex justify-between items-end">
                <div>
                  <div class="text-2xl font-bold text-slate-900">{{ campaign.ad_sets?.length || 0 }}</div>
                  <div class="text-xs text-slate-500">Ad Sets</div>
                </div>
                <div class="text-right">
                  <div class="text-2xl font-bold text-slate-900">
                    {{ campaign.ad_sets?.reduce((acc: number, set: any) => acc + (set.creatives?.length || 0), 0) }}
                  </div>
                  <div class="text-xs text-slate-500">Creatives</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Description/Brief if present -->
          <div v-if="campaign.description || campaign.campaign_brief" class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 class="text-lg font-display font-semibold text-slate-900 mb-4">Campaign Brief</h3>
            <div class="prose prose-sm max-w-none text-slate-600">
              <p v-if="campaign.description" class="mb-4">{{ campaign.description }}</p>
              <div v-if="campaign.campaign_brief" class="p-4 bg-slate-50 rounded-xl whitespace-pre-wrap font-mono text-xs">
                {{ campaign.campaign_brief }}
              </div>
            </div>
          </div>

          <!-- Ad Sets List -->
          <div class="space-y-6">
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-display font-semibold text-slate-900">Ad Sets</h2>
            </div>

            <div v-if="!campaign.ad_sets || campaign.ad_sets.length === 0" class="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center">
              <div class="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="material-icons text-slate-400">layers</span>
              </div>
              <h3 class="text-lg font-medium text-slate-900 mb-1">No ad sets yet</h3>
              <p class="text-slate-500 mb-6 text-sm">Create an ad set to start adding creatives</p>
              <button 
                @click="showCreateAdSet = true"
                class="px-4 py-2 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 rounded-lg text-sm font-medium transition-all"
              >
                Create Ad Set
              </button>
            </div>

            <div v-else class="space-y-6">
              <div 
                v-for="adSet in campaign.ad_sets" 
                :key="adSet.id"
                class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
              >
                <!-- Ad Set Header -->
                <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div class="flex items-center gap-4">
                    <div class="p-2 bg-white border border-slate-100 rounded-lg shadow-sm">
                      <UIcon :name="getPlatformIcon(adSet.platform)" class="text-xl text-slate-600" />
                    </div>
                    <div>
                      <h3 class="font-semibold text-slate-900">{{ adSet.name }}</h3>
                      <div class="flex items-center gap-2 text-xs text-slate-500">
                        <span>{{ adSet.age_range || 'All ages' }}</span>
                        <span>•</span>
                        <span>{{ adSet.gender === 'all' ? 'All genders' : adSet.gender }}</span>
                        <span v-if="adSet.locations?.length">• {{ adSet.locations.length }} locations</span>
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <button 
                      @click="openCreateCreative(adSet)"
                      class="text-xs font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1 px-3 py-1.5 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
                    >
                      <span class="material-icons text-sm">add</span>
                      Add Creative
                    </button>
                    <button class="text-slate-400 hover:text-slate-600">
                      <span class="material-icons">more_horiz</span>
                    </button>
                  </div>
                </div>

                <!-- Creatives Grid -->
                <div class="p-6">
                  <div v-if="!adSet.creatives || adSet.creatives.length === 0" class="text-center py-8">
                    <p class="text-sm text-slate-400">No creatives in this ad set</p>
                  </div>
                  <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div 
                      v-for="creative in adSet.creatives" 
                      :key="creative.id"
                      class="group relative bg-white border border-slate-200 rounded-xl hover:shadow-md transition-all overflow-hidden"
                    >
                      <!-- Preview Image -->
                      <div class="aspect-video bg-slate-100 relative overflow-hidden">
                        <img 
                          v-if="creative.asset?.thumbnail_url"
                          :src="creative.asset.thumbnail_url" 
                          class="w-full h-full object-cover"
                        />
                        <div v-else class="w-full h-full flex items-center justify-center text-slate-300">
                          <span class="material-icons text-4xl">image</span>
                        </div>
                        
                        <!-- Status Overlay -->
                        <div class="absolute top-2 right-2">
                          <span 
                            class="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-white/90 shadow-sm backdrop-blur-sm"
                            :class="getCreativeStatusColor(creative.status)"
                          >
                            {{ creative.status }}
                          </span>
                        </div>
                      </div>

                      <!-- Content -->
                      <div class="p-3">
                        <div class="font-medium text-slate-900 truncate mb-1">{{ creative.name }}</div>
                        <div class="flex items-center justify-between text-xs text-slate-500">
                          <span class="capitalize">{{ creative.format?.replace('_', ' ') }}</span>
                          <span>{{ creative.dimensions }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <CreateAdSetForm
      v-if="showCreateAdSet && campaign"
      :campaign="campaign"
      @close="showCreateAdSet = false"
      @created="refreshCampaign"
    />

    <CreateCreativeForm
      v-if="showCreateCreative && selectedAdSet"
      :ad-set="selectedAdSet"
      @close="showCreateCreative = false"
      @created="refreshCampaign"
    />
  </DashboardLayout>
</template>

<script setup lang="ts">
const route = useRoute()
const { getCampaignById, loading } = useCampaigns()

const campaign = ref<any>(null)
const showCreateAdSet = ref(false)
const showCreateCreative = ref(false)
const selectedAdSet = ref<any>(null)

onMounted(() => {
  loadCampaign()
})

const loadCampaign = async () => {
  const id = route.params.id as string
  if (id) {
    const data = await getCampaignById(id)
    if (data) {
      campaign.value = data
    }
  }
}

const refreshCampaign = () => {
  loadCampaign()
}

const openCreateCreative = (adSet: any) => {
  selectedAdSet.value = adSet
  showCreateCreative.value = true
}

const getStatusBadge = (status: string) => {
  const badges: Record<string, string> = {
    'planning': 'bg-slate-500/20 text-slate-600',
    'in_review': 'bg-purple-500/20 text-purple-600',
    'approved': 'bg-blue-500/20 text-blue-600',
    'live': 'bg-green-500/20 text-green-600',
    'completed': 'bg-gray-500/20 text-gray-600',
    'archived': 'bg-red-500/20 text-red-600'
  }
  return badges[status] || 'bg-slate-100 text-slate-500'
}

const formatStatus = (status: string) => {
  if (!status) return ''
  return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return 'TBD'
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

const getObjectiveIcon = (objective: string) => {
  const icons: Record<string, string> = {
    'awareness': 'i-heroicons-light-bulb',
    'traffic': 'i-heroicons-arrow-trending-up',
    'engagement': 'i-heroicons-heart',
    'leads': 'i-heroicons-users',
    'conversions': 'i-heroicons-cursor-arrow-rays',
    'sales': 'i-heroicons-shopping-cart'
  }
  return icons[objective?.toLowerCase()] || 'i-heroicons-chart-bar'
}

const getCreativeStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'draft': 'text-slate-500',
    'ready_for_review': 'text-purple-500',
    'in_review': 'text-purple-600',
    'approved': 'text-green-600',
    'changes_requested': 'text-orange-600',
    'ready_to_ship': 'text-blue-600'
  }
  return colors[status] || 'text-slate-500'
}
</script>