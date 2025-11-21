<!-- components/CreateAdSetForm.vue -->
<script setup lang="ts">
const props = defineProps<{
  campaign: any
}>()

const emit = defineEmits(['close', 'created'])

const step = ref(1)
const selectedAssets = ref<string[]>([])

const formData = ref({
  name: '',
  description: '',
  platform: props.campaign.platforms[0] || 'meta',
  
  // Audience Planning
  audience_description: '',
  age_range: '',
  gender: 'all',
  locations: [],
  targeting_notes: '',
  
  // Budget Estimates
  estimated_daily_budget: null,
  estimated_total_budget: null,
  
  // Timeline
  planned_start_date: null,
  planned_end_date: null,
  
  // Notes
  internal_notes: ''
})

const { createAdSet, loading: adSetLoading } = useAdSets()
const { createCreative, loading: creativeLoading } = useCreatives()
const { assets } = useAssets()

const loading = computed(() => adSetLoading.value || creativeLoading.value)

const locationInput = ref('')
const addLocation = () => {
  if (locationInput.value.trim()) {
    formData.value.locations.push(locationInput.value.trim())
    locationInput.value = ''
  }
}

const removeLocation = (index: number) => {
  formData.value.locations.splice(index, 1)
}

const handleNext = () => {
  if (!formData.value.name) {
    // You might want to add a toast or error state here
    return
  }
  step.value = 2
}

const handleSubmit = async () => {
  try {
    if (!formData.value.name) throw new Error('Ad set name is required')
    
    // 1. Create Ad Set
    const adSet = await createAdSet({
      ...formData.value,
      campaign_id: props.campaign.id
    })

    // 2. Create Creatives for selected assets
    if (selectedAssets.value.length > 0) {
      const createPromises = selectedAssets.value.map(assetId => {
        const asset = assets.value.find(a => a.id === assetId)
        return createCreative({
          ad_set_id: adSet.id,
          name: asset?.title || asset?.name || 'New Creative',
          asset_id: assetId,
          format: asset?.format || 'single_image', // Default fallback
          status: 'draft'
        })
      })

      await Promise.all(createPromises)
    }
    
    emit('created', adSet)
    emit('close')
  } catch (error) {
    console.error('Error creating ad set and creatives:', error)
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
              {{ step === 1 ? 'Create Ad Set' : 'Select Creatives' }}
            </h2>
            <p class="text-sm text-gray-400 mt-1">
              {{ step === 1 ? `Campaign: ${campaign.name}` : 'Select assets to create ads from' }}
            </p>
          </div>
          <UButton icon="i-heroicons-x-mark" variant="ghost" @click="emit('close')" />
        </div>
      </template>

      <!-- Step 1: Ad Set Details -->
      <div v-show="step === 1" class="space-y-6">
        <!-- Basic Info -->
        <UFormGroup label="Ad Set Name" required>
          <UInput
            v-model="formData.name"
            placeholder="e.g. US Women 25-45 - Fashion"
            size="lg"
          />
        </UFormGroup>

        <UFormGroup label="Platform" required>
          <USelect
            v-model="formData.platform"
            :options="campaign.platforms.map((p: any) => ({ value: p, label: p.charAt(0).toUpperCase() + p.slice(1) }))"
            size="lg"
          />
        </UFormGroup>

        <!-- Audience Description -->
        <UFormGroup label="Audience Description">
          <UTextarea
            v-model="formData.audience_description"
            placeholder="Describe the target audience for this ad set..."
            :rows="3"
            size="lg"
          />
          <template #hint>
            <span class="text-xs text-gray-400">
              e.g., "Women aged 25-45 in urban areas interested in sustainable fashion"
            </span>
          </template>
        </UFormGroup>

        <!-- Demographics -->
        <div class="border-t border-gray-700 pt-6">
          <h3 class="text-lg font-semibold mb-4">Demographics</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormGroup label="Age Range">
              <UInput
                v-model="formData.age_range"
                placeholder="e.g. 25-45"
                size="lg"
              />
            </UFormGroup>

            <UFormGroup label="Gender">
              <USelect
                v-model="formData.gender"
                :options="[
                  { label: 'All', value: 'all' },
                  { label: 'Male', value: 'male' },
                  { label: 'Female', value: 'female' }
                ]"
                size="lg"
              />
            </UFormGroup>
          </div>

          <!-- Locations -->
          <UFormGroup label="Locations" class="mt-4">
            <div class="space-y-3">
              <!-- Location chips -->
              <div v-if="formData.locations.length > 0" class="flex flex-wrap gap-2">
                <UBadge
                  v-for="(location, index) in formData.locations"
                  :key="index"
                  color="blue"
                  variant="soft"
                  size="lg"
                >
                  {{ location }}
                  <button
                    type="button"
                    @click="removeLocation(index)"
                    class="ml-1"
                  >
                    <UIcon name="i-heroicons-x-mark" />
                  </button>
                </UBadge>
              </div>

              <!-- Add location input -->
              <div class="flex gap-2">
                <UInput
                  v-model="locationInput"
                  placeholder="e.g. United States, California, Los Angeles"
                  class="flex-1"
                  size="lg"
                  @keyup.enter="addLocation"
                />
                <UButton
                  icon="i-heroicons-plus"
                  @click="addLocation"
                >
                  Add
                </UButton>
              </div>
            </div>
          </UFormGroup>
        </div>

        <!-- Targeting Notes -->
        <UFormGroup label="Targeting Notes" hint="(optional)">
          <UTextarea
            v-model="formData.targeting_notes"
            placeholder="Additional notes about interests, behaviors, or detailed targeting..."
            :rows="3"
            size="lg"
          />
        </UFormGroup>

        <!-- Budget Estimates -->
        <div class="border-t border-gray-700 pt-6">
          <h3 class="text-lg font-semibold mb-4">Budget Estimates</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormGroup label="Estimated Daily Budget">
              <UInput
                v-model="formData.estimated_daily_budget"
                type="number"
                placeholder="0.00"
                size="lg"
              >
                <template #leading>
                  <span class="text-gray-400">$</span>
                </template>
              </UInput>
            </UFormGroup>

            <UFormGroup label="Estimated Total Budget">
              <UInput
                v-model="formData.estimated_total_budget"
                type="number"
                placeholder="0.00"
                size="lg"
              >
                <template #leading>
                  <span class="text-gray-400">$</span>
                </template>
              </UInput>
            </UFormGroup>
          </div>
        </div>

        <!-- Timeline -->
        <div class="border-t border-gray-700 pt-6">
          <h3 class="text-lg font-semibold mb-4">Timeline</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormGroup label="Planned Start Date">
              <UInput
                v-model="formData.planned_start_date"
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
        </div>

        <!-- Internal Notes -->
        <UFormGroup label="Internal Notes" hint="(optional)">
          <UTextarea
            v-model="formData.internal_notes"
            placeholder="Internal notes for team reference..."
            :rows="2"
            size="lg"
          />
        </UFormGroup>
      </div>

      <!-- Step 2: Creative Selection -->
      <div v-show="step === 2" class="space-y-6">
        <div class="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <h3 class="text-sm font-medium text-gray-300 mb-2">Instructions</h3>
            <p class="text-sm text-gray-400">
                Select the assets you want to include in this ad set. 
                A draft creative will be automatically created for each selected asset.
            </p>
        </div>

        <UFormGroup label="Select Assets">
            <AssetPicker
                v-model="selectedAssets"
                :assets="assets"
                placeholder="Search and select assets..."
                :multiple="true"
            />
        </UFormGroup>

        <div class="text-sm text-gray-400">
            {{ selectedAssets.length }} asset{{ selectedAssets.length !== 1 ? 's' : '' }} selected
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton 
            v-if="step === 1"
            color="gray" 
            variant="ghost" 
            @click="emit('close')" 
            :disabled="loading"
          >
            Cancel
          </UButton>
          
          <UButton 
            v-if="step === 2"
            color="gray" 
            variant="ghost" 
            @click="step = 1" 
            :disabled="loading"
          >
            Back
          </UButton>

          <UButton 
            v-if="step === 1"
            color="primary" 
            size="lg" 
            @click="handleNext"
            :disabled="!formData.name"
          >
            Next: Add Creatives
          </UButton>

          <UButton 
            v-if="step === 2"
            color="primary" 
            size="lg" 
            :loading="loading" 
            @click="handleSubmit"
          >
            Create Ad Set & Creatives
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>