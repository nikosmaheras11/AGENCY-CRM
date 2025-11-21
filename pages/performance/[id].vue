<!-- pages/performance/[id].vue -->
<script setup lang="ts">
definePageMeta({ 
  middleware: 'auth',
  layout: 'dashboard'
})

const route = useRoute()
const campaignId = route.params.id as string

const { 
  campaign, 
  loading, 
  fetchCampaignWithHierarchy,
  updateCampaignStatus
} = useCampaigns()

const { createAdSet } = useAdSets()
const { createCreative } = useCreatives()

// Modals
const isCreateAdSetModalOpen = ref(false)
const isCreateCreativeModalOpen = ref(false)
const selectedAdSet = ref(null)
const expandedAdSets = ref(new Set())
const error = ref(null)

// Detail Panels
const showAdSetDetail = ref(false)
const showCreativeDetail = ref(false)
const selectedAdSetForDetail = ref<any>(null)
const selectedCreativeForDetail = ref<any>(null)

// Load campaign with full hierarchy
onMounted(async () => {
  try {
    console.log('Fetching campaign with ID:', campaignId)
    await fetchCampaignWithHierarchy(campaignId)
    console.log('Campaign fetched:', campaign.value)
    // Auto-expand first ad set
    if (campaign.value?.ad_sets?.length > 0) {
      expandedAdSets.value.add(campaign.value.ad_sets[0].id)
    }
  } catch (e) {
    console.error('Error loading campaign:', e)
    error.value = (e as Error)?.message || 'Failed to load campaign'
  }
})

const toggleAdSetExpansion = (adSetId: string) => {
  if (expandedAdSets.value.has(adSetId)) {
    expandedAdSets.value.delete(adSetId)
  } else {
    expandedAdSets.value.add(adSetId)
  }
}

const handleCreateCreative = (adSet: any) => {
  selectedAdSet.value = adSet
  isCreateCreativeModalOpen.value = true
}

const getPlatformIcon = (platform: string) => {
  const icons: Record<string, string> = {
    meta: 'i-simple-icons-meta',
    tiktok: 'i-simple-icons-tiktok',
    google: 'i-simple-icons-google',
    linkedin: 'i-simple-icons-linkedin',
    twitter: 'i-simple-icons-x',
    pinterest: 'i-simple-icons-pinterest',
    snapchat: 'i-simple-icons-snapchat'
  }
  return icons[platform] || 'i-heroicons-megaphone'
}

const getStatusColor = (status: string): any => {
  const colors: Record<string, string> = {
    draft: 'gray',
    planning: 'blue',
    ready_for_review: 'yellow',
    in_review: 'orange',
    approved: 'green',
    changes_requested: 'red',
    ready_to_ship: 'purple',
    live: 'green',
    completed: 'gray'
  }
  return colors[status] || 'gray'
}

const handleAdSetCreated = () => {
  fetchCampaignWithHierarchy(campaignId)
  isCreateAdSetModalOpen.value = false
}

const handleCreativeCreated = () => {
  fetchCampaignWithHierarchy(campaignId)
  isCreateCreativeModalOpen.value = false
  selectedAdSet.value = null
}

const openAdSetDetail = (adSet: any) => {
  selectedAdSetForDetail.value = adSet
  showAdSetDetail.value = true
}

const openCreativeDetail = (creative: any) => {
  selectedCreativeForDetail.value = creative
  showCreativeDetail.value = true
}

const handleDetailUpdated = () => {
  fetchCampaignWithHierarchy(campaignId)
}
</script>

<template>
  <div class="h-screen flex flex-col bg-gray-950">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center h-full">
      <div class="text-center">
        <UIcon name="i-heroicons-arrow-path" class="text-4xl animate-spin text-primary-500 mb-4" />
        <p class="text-gray-400">Loading campaign...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex items-center justify-center h-full">
      <div class="text-center max-w-md">
        <UIcon name="i-heroicons-exclamation-triangle" class="text-6xl text-red-500 mb-4 mx-auto" />
        <h2 class="text-2xl font-bold text-white mb-2">Error Loading Campaign</h2>
        <p class="text-gray-400 mb-6">{{ error }}</p>
        <div class="flex gap-3 justify-center">
          <UButton @click="navigateTo('/performance')" variant="outline">
            Back to Campaigns
          </UButton>
          <UButton @click="() => { error = null; fetchCampaignWithHierarchy(campaignId) }" color="primary">
            Retry
          </UButton>
        </div>
      </div>
    </div>

    <!-- Campaign Content -->
    <template v-else-if="campaign">
      <!-- Header -->
      <div class="border-b border-gray-800 bg-gray-900/80 backdrop-blur sticky top-0 z-10">
        <div class="p-6">
          <!-- Breadcrumb -->
          <div class="flex items-center gap-2 text-sm text-gray-400 mb-4">
            <NuxtLink to="/performance" class="hover:text-white transition-colors">
              Performance
            </NuxtLink>
            <UIcon name="i-heroicons-chevron-right" class="text-xs" />
            <span class="text-white">{{ campaign.name }}</span>
          </div>

          <!-- Campaign Info -->
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <h1 class="text-3xl font-bold">{{ campaign.name }}</h1>
                <UBadge :color="getStatusColor(campaign.status)" size="lg">
                  {{ campaign.status.replace(/_/g, ' ') }}
                </UBadge>
              </div>
              
              <p v-if="campaign.description" class="text-gray-400 mb-4 max-w-3xl">
                {{ campaign.description }}
              </p>

              <div class="flex items-center gap-4 text-sm">
                <!-- Platforms -->
                <div class="flex items-center gap-2">
                  <UIcon 
                    v-for="platform in campaign.platforms" 
                    :key="platform"
                    :name="getPlatformIcon(platform)" 
                    class="text-xl"
                  />
                </div>

                <!-- Client -->
                <div v-if="campaign.client" class="flex items-center gap-2">
                  <UIcon name="i-heroicons-building-office" class="text-gray-500" />
                  <span class="text-gray-400">{{ campaign.client.name }}</span>
                </div>

                <!-- Objective -->
                <div v-if="campaign.objective" class="flex items-center gap-2">
                  <UIcon name="i-heroicons-flag" class="text-gray-500" />
                  <span class="text-gray-400">{{ campaign.objective }}</span>
                </div>

                <!-- Timeline -->
                <div v-if="campaign.planned_launch_date" class="flex items-center gap-2">
                  <UIcon name="i-heroicons-calendar" class="text-gray-500" />
                  <span class="text-gray-400">
                    {{ new Date(campaign.planned_launch_date).toLocaleDateString() }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-3">
              <UButton
                color="primary"
                icon="i-heroicons-plus"
                size="lg"
                @click="isCreateAdSetModalOpen = true"
              >
                Add Ad Set
              </UButton>
              <UDropdown :items="[
                [{ label: 'Edit Campaign', icon: 'i-heroicons-pencil' }],
                [{ label: 'Submit for Review', icon: 'i-heroicons-paper-airplane' }],
                [{ label: 'Archive', icon: 'i-heroicons-archive-box' }]
              ]">
                <UButton
                  icon="i-heroicons-ellipsis-vertical"
                  variant="outline"
                  color="gray"
                />
              </UDropdown>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content - Hierarchical Layout -->
      <div class="flex-1 overflow-auto p-6">
        <!-- Campaign Brief (if exists) -->
        <div v-if="campaign.campaign_brief" class="mb-6">
          <UCard>
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-document-text" />
                <h3 class="font-semibold">Campaign Brief</h3>
              </div>
            </template>
            <p class="text-gray-300 whitespace-pre-wrap">{{ campaign.campaign_brief }}</p>
          </UCard>
        </div>

        <!-- Ad Sets List -->
        <div class="space-y-4">
          <div v-if="!campaign.ad_sets || campaign.ad_sets.length === 0">
            <!-- Empty State -->
            <div class="border-2 border-dashed border-gray-700 rounded-xl p-12 text-center">
              <UIcon name="i-heroicons-folder-plus" class="text-6xl text-gray-600 mb-4 mx-auto" />
              <h3 class="text-xl font-semibold mb-2">No Ad Sets Yet</h3>
              <p class="text-gray-400 mb-6">Create your first ad set to organize your creatives</p>
              <UButton
                color="primary"
                size="lg"
                icon="i-heroicons-plus"
                @click="isCreateAdSetModalOpen = true"
              >
                Create Ad Set
              </UButton>
            </div>
          </div>

          <!-- Ad Set Cards -->
          <UCard
            v-for="(adSet, index) in campaign.ad_sets"
            :key="adSet.id"
            :ui="{ body: { padding: 'p-0' } }"
          >
            <!-- Ad Set Header -->
            <div class="p-4">
              <div class="flex items-center gap-2 mb-2">
                <button
                  @click="toggleAdSetExpansion(adSet.id)"
                  class="p-1 hover:bg-gray-700 rounded transition-colors"
                >
                  <UIcon 
                    :name="expandedAdSets.has(adSet.id) ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-right'"
                    class="text-xl text-gray-400 transition-transform"
                  />
                </button>
                <button
                  @click="openAdSetDetail(adSet)"
                  class="flex-1 text-left hover:bg-gray-800/50 rounded p-2 transition-colors"
                >
                  <div class="flex items-start gap-3">
                    <!-- Ad Set Info -->
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-3 mb-2">
                        <UIcon :name="getPlatformIcon(adSet.platform)" class="text-2xl" />
                        <h3 class="text-lg font-semibold">{{ adSet.name }}</h3>
                        <UBadge :color="getStatusColor(adSet.status)" size="sm">
                          {{ adSet.status.replace(/_/g, ' ') }}
                        </UBadge>
                      </div>

                      <p v-if="adSet.audience_description" class="text-sm text-gray-400 mb-3">
                        {{ adSet.audience_description }}
                      </p>

                      <!-- Ad Set Meta -->
                      <div class="flex items-center gap-4 text-xs text-gray-500">
                        <div v-if="adSet.age_range" class="flex items-center gap-1">
                          <UIcon name="i-heroicons-user-group" />
                          <span>{{ adSet.age_range }}</span>
                        </div>
                        <div v-if="adSet.locations?.length" class="flex items-center gap-1">
                          <UIcon name="i-heroicons-map-pin" />
                          <span>{{ adSet.locations.slice(0, 2).join(', ') }}{{ adSet.locations.length > 2 ? '...' : '' }}</span>
                        </div>
                        <div v-if="adSet.estimated_daily_budget" class="flex items-center gap-1">
                          <UIcon name="i-heroicons-currency-dollar" />
                          <span>${{ adSet.estimated_daily_budget }}/day</span>
                        </div>
                        <div class="flex items-center gap-1">
                          <UIcon name="i-heroicons-photo" />
                          <span>{{ adSet.creatives?.length || 0 }} creative{{ adSet.creatives?.length !== 1 ? 's' : '' }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>

                <!-- Ad Set Actions -->
                <div class="flex items-center gap-2" @click.stop>
                  <UButton
                    icon="i-heroicons-plus"
                    size="sm"
                    color="primary"
                    variant="soft"
                    @click="handleCreateCreative(adSet)"
                  >
                    Add Creative
                  </UButton>
                  <UDropdown :items="[
                    [{ label: 'Edit Ad Set', icon: 'i-heroicons-pencil' }],
                    [{ label: 'Duplicate', icon: 'i-heroicons-document-duplicate' }],
                    [{ label: 'Delete', icon: 'i-heroicons-trash', class: 'text-red-500' }]
                  ]">
                    <UButton
                      icon="i-heroicons-ellipsis-vertical"
                      size="sm"
                      variant="ghost"
                      color="gray"
                    />
                  </UDropdown>
                </div>
              </div>
            </div>

            <!-- Creatives Grid (Expandable) -->
            <div 
              v-if="expandedAdSets.has(adSet.id)"
              class="border-t border-gray-800 bg-gray-900/30"
            >
              <div v-if="!adSet.creatives || adSet.creatives.length === 0" class="p-8 text-center">
                <UIcon name="i-heroicons-photo" class="text-4xl text-gray-600 mb-3 mx-auto" />
                <p class="text-gray-400 mb-4">No creatives in this ad set yet</p>
                <UButton
                  icon="i-heroicons-plus"
                  size="sm"
                  @click="handleCreateCreative(adSet)"
                >
                  Add First Creative
                </UButton>
              </div>

              <div v-else class="p-4">
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  <!-- Creative Cards -->
                  <div
                    v-for="creative in adSet.creatives"
                    :key="creative.id"
                    class="group relative aspect-square rounded-lg overflow-hidden border-2 border-gray-700 hover:border-primary-500 transition-all cursor-pointer"
                    @click="openCreativeDetail(creative)"
                  >
                    <!-- Asset Thumbnail -->
                    <div class="w-full h-full bg-gray-800">
                      <img
                        v-if="creative.asset?.thumbnail_url"
                        :src="creative.asset.thumbnail_url"
                        :alt="creative.name"
                        class="w-full h-full object-cover"
                      />
                      <div v-else class="w-full h-full flex items-center justify-center">
                        <UIcon name="i-heroicons-photo" class="text-4xl text-gray-600" />
                      </div>
                    </div>

                    <!-- Status Badge -->
                    <div class="absolute top-2 right-2">
                      <UBadge :color="getStatusColor(creative.status)" size="xs">
                        {{ creative.status.replace(/_/g, ' ') }}
                      </UBadge>
                    </div>

                    <!-- Hover Overlay -->
                    <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                      <h4 class="font-semibold text-sm mb-1 line-clamp-2">{{ creative.name }}</h4>
                      <p class="text-xs text-gray-400">{{ creative.dimensions }}</p>
                    </div>
                  </div>

                  <!-- Add Creative Button -->
                  <button
                    @click="handleCreateCreative(adSet)"
                    class="aspect-square rounded-lg border-2 border-dashed border-gray-700 hover:border-primary-500 transition-colors flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-primary-500"
                  >
                    <UIcon name="i-heroicons-plus-circle" class="text-3xl" />
                    <span class="text-xs font-medium">Add Creative</span>
                  </button>
                </div>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </template>

    <!-- Modals -->
    <CreateAdSetForm
      v-if="isCreateAdSetModalOpen && campaign"
      :campaign="campaign"
      @close="isCreateAdSetModalOpen = false"
      @created="handleAdSetCreated"
    />

    <CreateCreativeForm
      v-if="isCreateCreativeModalOpen && selectedAdSet"
      :ad-set="selectedAdSet"
      @close="isCreateCreativeModalOpen = false; selectedAdSet = null"
      @created="handleCreativeCreated"
    />

    <!-- Detail Panels -->
    <PerformanceAdSetDetail
      v-model="showAdSetDetail"
      :ad-set="selectedAdSetForDetail"
      @updated="handleDetailUpdated"
    />

    <PerformanceCreativeDetail
      v-model="showCreativeDetail"
      :creative="selectedCreativeForDetail"
      @updated="handleDetailUpdated"
    />
  </div>
</template>
