<!-- components/CreateCampaignForm.vue -->
<script setup lang="ts">
import CreateAdSetForm from './CreateAdSetForm.vue'

const emit = defineEmits(['close', 'created'])

const step = ref<'details' | 'ad-sets'>('details')
const createdCampaign = ref<any>(null)
const addedAdSets = ref<any[]>([])

// Form Data
const formData = ref({
  name: '',
  description: '',
  platforms: [],
  objective: '',
  campaign_brief: '',
  planned_launch_date: null,
  planned_end_date: null
})

const { createCampaign, loading } = useCampaigns()
const toast = useToast()
const isSubmitting = ref(false)

// Modals
const isCreateAdSetModalOpen = ref(false)

// Options
const platformOptions = [
  { value: 'meta', label: 'Meta', icon: 'i-simple-icons-meta' },
  { value: 'tiktok', label: 'TikTok', icon: 'i-simple-icons-tiktok' },
  { value: 'google', label: 'Google', icon: 'i-simple-icons-google' },
  { value: 'linkedin', label: 'LinkedIn', icon: 'i-simple-icons-linkedin' },
  { value: 'twitter', label: 'X', icon: 'i-simple-icons-x' },
  { value: 'pinterest', label: 'Pinterest', icon: 'i-simple-icons-pinterest' },
  { value: 'snapchat', label: 'Snapchat', icon: 'i-simple-icons-snapchat' }
]

const objectiveOptions = [
  { value: 'awareness', label: 'Awareness', icon: 'i-heroicons-light-bulb' },
  { value: 'traffic', label: 'Traffic', icon: 'i-heroicons-arrow-trending-up' },
  { value: 'engagement', label: 'Engagement', icon: 'i-heroicons-heart' },
  { value: 'leads', label: 'Leads', icon: 'i-heroicons-users' },
  { value: 'conversions', label: 'Conversions', icon: 'i-heroicons-cursor-arrow-rays' },
  { value: 'sales', label: 'Sales', icon: 'i-heroicons-shopping-cart' }
]

const togglePlatform = (platform: string) => {
  const index = formData.value.platforms.indexOf(platform)
  if (index > -1) {
    formData.value.platforms.splice(index, 1)
  } else {
    formData.value.platforms.push(platform)
  }
}

const handleCreateCampaign = async () => {
  if (isSubmitting.value) return
  
  try {
    isSubmitting.value = true
    
    if (!formData.value.name) {
      toast.add({ title: 'Campaign name is required', color: 'red' })
      return
    }
    if (formData.value.platforms.length === 0) {
      toast.add({ title: 'Please select at least one platform', color: 'red' })
      return
    }
    
    const payload = {
      ...formData.value,
      client_id: null,
      status: 'planning'
    }
    
    const campaign = await createCampaign(payload)
    createdCampaign.value = campaign
    step.value = 'ad-sets'
    
    toast.add({ title: 'Campaign created! Now add your ad sets.', color: 'green' })
    emit('created', campaign)
  } catch (error: any) {
    console.error('Error creating campaign:', error)
    console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)))
    toast.add({ 
      title: 'Failed to create campaign', 
      description: error.message || 'An error occurred',
      color: 'red' 
    })
  } finally {
    isSubmitting.value = false
  }
}

const handleAdSetCreated = (adSet: any) => {
  addedAdSets.value.push(adSet)
  isCreateAdSetModalOpen.value = false
  toast.add({ title: 'Ad Set added successfully', color: 'green' })
}

const handleFinish = async () => {
  if (createdCampaign.value?.id) {
    emit('close')
    await navigateTo(`/performance/${createdCampaign.value.id}`)
  }
}
</script>

<template>
  <UModal :model-value="true" @update:model-value="emit('close')" :ui="{ width: 'sm:max-w-3xl' }">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold">
              {{ step === 'details' ? 'Create Campaign' : 'Add Ad Sets' }}
            </h2>
            <p class="text-sm text-gray-400 mt-1">
              {{ step === 'details' ? 'Plan a new advertising campaign' : `Setup structure for "${createdCampaign?.name}"` }}
            </p>
          </div>
          <UButton icon="i-heroicons-x-mark" variant="ghost" color="gray" @click="emit('close')" />
        </div>
      </template>

      <!-- Step 1: Campaign Details -->
      <form v-if="step === 'details'" @submit.prevent="handleCreateCampaign" class="space-y-6">
        <!-- Campaign Name -->
        <UFormGroup label="Campaign Name" required>
          <UInput
            v-model="formData.name"
            placeholder="e.g. Summer Sale 2025"
            size="lg"
          />
        </UFormGroup>

        <!-- Platform Selection -->
        <UFormGroup label="Platforms" required>
          <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
            <button
              v-for="platform in platformOptions"
              :key="platform.value"
              type="button"
              @click="togglePlatform(platform.value)"
              class="p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2"
              :class="formData.platforms.includes(platform.value)
                ? 'border-primary-500 bg-primary-500/10 text-white' 
                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600 text-gray-400 hover:text-gray-200'"
            >
              <UIcon :name="platform.icon" class="text-2xl" />
              <span class="text-xs font-medium">{{ platform.label }}</span>
            </button>
          </div>
        </UFormGroup>

        <!-- Objective -->
        <UFormGroup label="Campaign Objective">
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            <button
              v-for="objective in objectiveOptions"
              :key="objective.value"
              type="button"
              @click="formData.objective = objective.value"
              class="p-3 rounded-lg border-2 transition-all text-left"
              :class="formData.objective === objective.value
                ? 'border-primary-500 bg-primary-500/10 text-white' 
                : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600 hover:text-gray-200'"
            >
              <div class="flex items-center gap-2">
                <UIcon :name="objective.icon" class="text-xl" />
                <span class="font-semibold text-sm">{{ objective.label }}</span>
              </div>
            </button>
          </div>
        </UFormGroup>

        <!-- Description -->
        <UFormGroup label="Description">
          <UTextarea
            v-model="formData.description"
            placeholder="Brief overview of the campaign..."
            :rows="3"
            size="lg"
          />
        </UFormGroup>

        <!-- Campaign Brief -->
        <UFormGroup label="Campaign Brief" hint="(optional)">
          <UTextarea
            v-model="formData.campaign_brief"
            placeholder="Detailed strategy, target audience, key messages, creative direction..."
            :rows="5"
            size="lg"
          />
        </UFormGroup>

        <!-- Timeline -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormGroup label="Planned Launch Date">
            <UInput
              v-model="formData.planned_launch_date"
              type="date"
              size="lg"
            />
          </UFormGroup>

          <UFormGroup label="Planned End Date" hint="(optional)">
            <UInput
              v-model="formData.planned_end_date"
              type="date"
              size="lg"
            />
          </UFormGroup>
        </div>
      </form>

      <!-- Step 2: Add Ad Sets -->
      <div v-else class="space-y-6">
        <div v-if="addedAdSets.length === 0" class="text-center py-8 border-2 border-dashed border-gray-700 rounded-xl">
          <UIcon name="i-heroicons-squares-plus" class="text-5xl text-gray-600 mb-3" />
          <h3 class="text-lg font-semibold mb-2">No Ad Sets Added Yet</h3>
          <p class="text-gray-400 mb-6">Create ad sets to define your audience and placements.</p>
          <UButton
            icon="i-heroicons-plus"
            size="lg"
            color="primary"
            @click="isCreateAdSetModalOpen = true"
          >
            Add First Ad Set
          </UButton>
        </div>

        <div v-else class="space-y-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold">Ad Sets ({{ addedAdSets.length }})</h3>
            <UButton
              icon="i-heroicons-plus"
              size="sm"
              variant="soft"
              @click="isCreateAdSetModalOpen = true"
            >
              Add Another
            </UButton>
          </div>

          <div class="grid gap-3">
            <div 
              v-for="adSet in addedAdSets" 
              :key="adSet.id"
              class="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700"
            >
              <div class="flex items-center gap-3">
                <div class="p-2 bg-gray-700 rounded-md">
                  <UIcon 
                    :name="platformOptions.find(p => p.value === adSet.platform)?.icon || 'i-heroicons-megaphone'" 
                    class="text-xl" 
                  />
                </div>
                <div>
                  <h4 class="font-medium">{{ adSet.name }}</h4>
                  <p class="text-xs text-gray-400">{{ adSet.audience_description || 'No description' }}</p>
                </div>
              </div>
              <UBadge color="blue" variant="subtle" size="xs">Draft</UBadge>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-400">
            <span v-if="step === 'details'">Step 1 of 2</span>
            <span v-else>Step 2 of 2</span>
          </div>
          
          <div class="flex gap-3">
            <UButton
              v-if="step === 'details'"
              color="gray"
              variant="ghost"
              @click="emit('close')"
              :disabled="loading"
            >
              Cancel
            </UButton>
            
            <UButton
              v-if="step === 'details'"
              type="submit"
              color="primary"
              size="lg"
              :loading="loading || isSubmitting"
              :disabled="loading || isSubmitting"
              @click="handleCreateCampaign"
            >
              Create & Continue
            </UButton>

            <UButton
              v-if="step === 'ad-sets'"
              color="gray"
              variant="ghost"
              @click="handleFinish"
            >
              Skip & Finish
            </UButton>

            <UButton
              v-if="step === 'ad-sets'"
              color="primary"
              size="lg"
              @click="handleFinish"
            >
              Finish Setup
            </UButton>
          </div>
        </div>
      </template>
    </UCard>

    <!-- Nested Ad Set Modal -->
    <CreateAdSetForm
      v-if="isCreateAdSetModalOpen && createdCampaign"
      :campaign="createdCampaign"
      @close="isCreateAdSetModalOpen = false"
      @created="handleAdSetCreated"
    />
  </UModal>
</template>