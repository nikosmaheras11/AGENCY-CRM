<template>
  <Transition name="slide">
    <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-end">
      <!-- Backdrop -->
      <div 
        class="absolute inset-0 bg-black/50 transition-opacity"
        @click="$emit('update:modelValue', false)"
      />
      
      <!-- Panel -->
      <div class="relative w-full max-w-2xl h-full bg-gradient-dark text-white shadow-2xl overflow-y-auto">
        <!-- Background pattern overlay -->
        <div class="absolute inset-0 bg-pattern opacity-[0.015] pointer-events-none"></div>
        
        <!-- Header -->
        <div class="sticky top-0 z-10 bg-white/5 backdrop-blur-xl border-b border-white/10 px-6 py-4 relative">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-2xl font-bold">Campaign Details</h2>
            
            <div class="flex items-center gap-2">
              <button 
                @click="$emit('update:modelValue', false)"
                class="w-9 h-9 hover:bg-white/10 rounded-lg flex items-center justify-center transition-colors"
              >
                <UIcon name="i-heroicons-x-mark" class="text-xl text-slate-400" />
              </button>
            </div>
          </div>

          <!-- Tabs -->
          <div class="flex gap-1 border-b border-white/10">
            <button
              @click="activeTab = 'overview'"
              class="px-4 py-2 text-sm font-medium transition-colors relative"
              :class="activeTab === 'overview' ? 'text-white' : 'text-gray-400 hover:text-gray-200'"
            >
              Overview
              <div v-if="activeTab === 'overview'" class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"></div>
            </button>
            <button
              @click="activeTab = 'ad-sets'"
              class="px-4 py-2 text-sm font-medium transition-colors relative"
              :class="activeTab === 'ad-sets' ? 'text-white' : 'text-gray-400 hover:text-gray-200'"
            >
              Ad Sets
              <span v-if="campaignData?.ad_sets?.length" class="ml-1 text-xs text-gray-500">({{ campaignData.ad_sets.length }})</span>
              <div v-if="activeTab === 'ad-sets'" class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"></div>
            </button>
          </div>
        </div>

        <!-- Content -->
        <div v-if="campaign" class="px-6 py-6 relative">
          <!-- Overview Tab -->
          <div v-if="activeTab === 'overview'">
            <h1 class="text-2xl font-semibold mb-6">{{ campaign.name }}</h1>

            <!-- Campaign Details -->
            <div class="space-y-6">
              <!-- Name -->
              <div class="flex items-start gap-4">
                <label class="w-32 text-sm text-gray-400 pt-2">Name</label>
                <div class="flex-1">
                  <input
                    type="text"
                    :value="campaign.name"
                    @blur="(e) => updateField('name', (e.target as HTMLInputElement).value)"
                    class="w-full px-3 py-2 bg-gray-900/50 border border-gray-800 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-gray-700"
                  />
                </div>
              </div>

              <!-- Description -->
              <div class="flex items-start gap-4">
                <label class="w-32 text-sm text-gray-400 pt-2">Description</label>
                <div class="flex-1">
                  <textarea
                    :value="campaign.description || ''"
                    @blur="(e) => updateField('description', (e.target as HTMLTextAreaElement).value)"
                    placeholder="Campaign description..."
                    class="w-full px-3 py-2 bg-gray-900/50 border border-gray-800 rounded-lg text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-gray-700 resize-none"
                    rows="4"
                  />
                </div>
              </div>

              <!-- Status -->
              <div class="flex items-start gap-4">
                <label class="w-32 text-sm text-gray-400 pt-2">Status</label>
                <div class="flex-1">
                  <select
                    :value="campaign.status"
                    @change="(e) => updateField('status', (e.target as HTMLSelectElement).value)"
                    class="w-full px-3 py-2 bg-gray-900/50 border border-gray-800 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-gray-700 cursor-pointer"
                  >
                    <option value="planning">Planning</option>
                    <option value="in_review">In Review</option>
                    <option value="approved">Approved</option>
                    <option value="live">Live</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <!-- Platforms -->
              <div class="flex items-start gap-4">
                <label class="w-32 text-sm text-gray-400 pt-2">Platforms</label>
                <div class="flex-1">
                  <div class="flex flex-wrap gap-2">
                    <span 
                      v-for="platform in campaign.platforms" 
                      :key="platform"
                      class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300"
                    >
                      {{ platform }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Launch Date -->
              <div class="flex items-start gap-4">
                <label class="w-32 text-sm text-gray-400 pt-2">Launch Date</label>
                <div class="flex-1">
                  <input
                    type="date"
                    :value="campaign.planned_launch_date || ''"
                    @change="(e) => updateField('planned_launch_date', (e.target as HTMLInputElement).value)"
                    class="w-full px-3 py-2 bg-gray-900/50 border border-gray-800 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-gray-700"
                  />
                </div>
              </div>

              <!-- Budget -->
              <div class="flex items-start gap-4">
                <label class="w-32 text-sm text-gray-400 pt-2">Budget</label>
                <div class="flex-1">
                  <input
                    type="number"
                    :value="campaign.budget || ''"
                    @blur="(e) => updateField('budget', parseFloat((e.target as HTMLInputElement).value) || null)"
                    placeholder="0.00"
                    step="0.01"
                    class="w-full px-3 py-2 bg-gray-900/50 border border-gray-800 rounded-lg text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-gray-700"
                  />
                </div>
              </div>

              <!-- Objectives -->
              <div class="flex items-start gap-4">
                <label class="w-32 text-sm text-gray-400 pt-2">Objectives</label>
                <div class="flex-1">
                  <textarea
                    :value="campaign.objectives || ''"
                    @blur="(e) => updateField('objectives', (e.target as HTMLTextAreaElement).value)"
                    placeholder="Campaign objectives..."
                    class="w-full px-3 py-2 bg-gray-900/50 border border-gray-800 rounded-lg text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-gray-700 resize-none"
                    rows="3"
                  />
                </div>
              </div>

              <!-- Target Audience -->
              <div class="flex items-start gap-4">
                <label class="w-32 text-sm text-gray-400 pt-2">Target Audience</label>
                <div class="flex-1">
                  <textarea
                    :value="campaign.target_audience || ''"
                    @blur="(e) => updateField('target_audience', (e.target as HTMLTextAreaElement).value)"
                    placeholder="Target audience description..."
                    class="w-full px-3 py-2 bg-gray-900/50 border border-gray-800 rounded-lg text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-gray-700 resize-none"
                    rows="3"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Ad Sets Tab -->
          <div v-else-if="activeTab === 'ad-sets'">
            <div class="flex items-center justify-between mb-6">
              <h1 class="text-2xl font-semibold">Ad Sets</h1>
              <UButton
                icon="i-heroicons-plus"
                color="primary"
                @click="isCreateAdSetModalOpen = true"
              >
                Add Ad Set
              </UButton>
            </div>

            <!-- Empty State -->
            <div v-if="!campaignData?.ad_sets || campaignData.ad_sets.length === 0" class="text-center py-12 border-2 border-dashed border-gray-700 rounded-xl">
              <UIcon name="i-heroicons-squares-plus" class="text-6xl text-gray-600 mb-4 mx-auto" />
              <h3 class="text-xl font-semibold mb-2">No Ad Sets Yet</h3>
              <p class="text-gray-400 mb-6">Create your first ad set to organize your creatives</p>
              <UButton
                icon="i-heroicons-plus"
                color="primary"
                size="lg"
                @click="isCreateAdSetModalOpen = true"
              >
                Create Ad Set
              </UButton>
            </div>

            <!-- Ad Sets List -->
            <div v-else class="space-y-3">
              <div
                v-for="adSet in campaignData.ad_sets"
                :key="adSet.id"
                class="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer"
                @click="openAdSetDetail(adSet)"
              >
                <div class="flex items-center gap-3 flex-1">
                  <div class="p-2 bg-gray-700 rounded-md">
                    <UIcon :name="getPlatformIcon(adSet.platform)" class="text-xl" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <h4 class="font-medium truncate">{{ adSet.name }}</h4>
                    <p class="text-xs text-gray-400 truncate">{{ adSet.audience_description || 'No description' }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <div class="text-xs text-gray-500">
                    {{ adSet.creatives?.length || 0 }} creative{{ adSet.creatives?.length !== 1 ? 's' : '' }}
                  </div>
                  <UIcon name="i-heroicons-chevron-right" class="text-gray-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="absolute bottom-0 left-0 right-0 p-6 bg-gradient-dark border-t border-white/10 flex justify-end gap-3">
          <UButton
            color="gray"
            variant="ghost"
            @click="$emit('update:modelValue', false)"
          >
            Close
          </UButton>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Create Ad Set Modal -->
  <CreateAdSetForm
    v-if="isCreateAdSetModalOpen && campaign"
    :campaign="campaign"
    @close="isCreateAdSetModalOpen = false"
    @created="handleAdSetCreated"
  />

  <!-- Nested Ad Set Detail Panel -->
  <PerformanceAdSetDetail
    v-model="showAdSetDetail"
    :ad-set="selectedAdSet"
    @updated="handleAdSetUpdated"
  />
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  campaign?: any
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'updated'): void
}>()

const { supabase } = useSupabase()
const { fetchCampaigns, fetchCampaignWithHierarchy } = useCampaigns()
const toast = useToast()

// State
const activeTab = ref<'overview' | 'ad-sets'>('overview')
const campaignData = ref<any>(null)
const isCreateAdSetModalOpen = ref(false)
const showAdSetDetail = ref(false)
const selectedAdSet = ref<any>(null)

// Load campaign with hierarchy when opened
watch(() => props.campaign?.id, async (newId) => {
  if (newId) {
    await loadCampaignData()
  }
}, { immediate: true })

const loadCampaignData = async () => {
  if (!props.campaign?.id) return
  
  try {
    console.log('Loading campaign data for:', props.campaign.id)
    const data = await fetchCampaignWithHierarchy(props.campaign.id)
    console.log('Campaign data loaded:', data)
    console.log('Ad sets:', data?.ad_sets)
    campaignData.value = data
  } catch (error) {
    console.error('Failed to load campaign data:', error)
  }
}

// Update field function
const updateField = async (fieldName: string, value: any) => {
  if (!props.campaign?.id) return
  
  try {
    const { error } = await supabase
      .from('campaigns')
      .update({ 
        [fieldName]: value,
        updated_at: new Date().toISOString()
      })
      .eq('id', props.campaign.id)
    
    if (error) throw error
    
    // Refresh campaigns list
    await fetchCampaigns()
    emit('updated')
    
    console.log(`✅ Updated ${fieldName}`)
  } catch (error) {
    console.error(`❌ Failed to update ${fieldName}:`, error)
  }
}

const handleAdSetCreated = async () => {
  isCreateAdSetModalOpen.value = false
  await loadCampaignData()
  emit('updated')
  toast.add({ title: 'Ad Set created successfully', color: 'green' })
}

const openAdSetDetail = (adSet: any) => {
  selectedAdSet.value = adSet
  showAdSetDetail.value = true
}

const handleAdSetUpdated = async () => {
  await loadCampaignData()
  emit('updated')
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
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

.slide-enter-from .absolute,
.slide-leave-to .absolute {
  opacity: 0;
}

.slide-enter-active .absolute,
.slide-leave-active .absolute {
  transition: opacity 0.3s ease;
}
</style>
