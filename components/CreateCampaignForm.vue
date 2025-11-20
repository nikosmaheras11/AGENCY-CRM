<!-- components/CreateCampaignForm.vue -->
<script setup lang="ts">
const emit = defineEmits(['close', 'created'])

const formData = ref({
  name: '',
  description: '',
  client_id: '',
  platforms: [],
  objective: '',
  campaign_brief: '',
  planned_launch_date: null,
  planned_end_date: null
})

const { clients, fetchClients } = useClients()
const { createCampaign, loading } = useCampaigns()

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

const handleSubmit = async () => {
  try {
    if (!formData.value.name) throw new Error('Campaign name is required')
    // Client is now optional
    if (formData.value.platforms.length === 0) throw new Error('Please select at least one platform')
    
    // Send null if client_id is empty string to match UUID type
    const payload = {
      ...formData.value,
      client_id: formData.value.client_id || null
    }

    const campaign = await createCampaign(payload)
    emit('created', campaign)
    emit('close')
  } catch (error) {
    console.error('Error creating campaign:', error)
  }
}

onMounted(async () => {
  if (!clients.value.length) {
    await fetchClients()
  }
})
</script>

<template>
  <UModal :model-value="true" @update:model-value="emit('close')" :ui="{ width: 'sm:max-w-3xl' }">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold">Create Campaign</h2>
            <p class="text-sm text-gray-400 mt-1">Plan a new advertising campaign</p>
          </div>
          <UButton icon="i-heroicons-x-mark" variant="ghost" color="gray" @click="emit('close')" />
        </div>
      </template>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Campaign Name -->
        <UFormGroup label="Campaign Name" required>
          <UInput
            v-model="formData.name"
            placeholder="e.g. Summer Sale 2025"
            size="lg"
          />
        </UFormGroup>

        <!-- Client Selection -->
        <UFormGroup label="Client">
          <USelectMenu
            v-model="formData.client_id"
            :options="clients"
            option-attribute="name"
            value-attribute="id"
            placeholder="Select client (optional)"
            size="lg"
          >
            <template #label>
              <div v-if="formData.client_id" class="flex items-center gap-2">
                <UAvatar
                  :src="clients.find(c => c.id === formData.client_id)?.logo_url"
                  size="xs"
                />
                <span>{{ clients.find(c => c.id === formData.client_id)?.name }}</span>
              </div>
              <span v-else class="text-gray-500">Select client (optional)</span>
            </template>
          </USelectMenu>
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

      <template #footer>
        <div class="flex items-center justify-between">
          <p class="text-sm text-gray-400">
            <UIcon name="i-heroicons-information-circle" class="inline" />
            You'll add ad sets and creatives after creating the campaign
          </p>
          <div class="flex gap-3">
            <UButton
              color="gray"
              variant="ghost"
              @click="emit('close')"
              :disabled="loading"
            >
              Cancel
            </UButton>
            <UButton
              color="primary"
              size="lg"
              :loading="loading"
              @click="handleSubmit"
            >
              Create Campaign
            </UButton>
          </div>
        </div>
      </template>
    </UCard>
  </UModal>
</template>