<!-- components/CreateAdSetForm.vue -->
<script setup lang="ts">
const props = defineProps<{
  campaign: any
}>()

const emit = defineEmits(['close', 'created'])

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

const { createAdSet, loading } = useAdSets()

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

const handleSubmit = async () => {
  try {
    if (!formData.value.name) throw new Error('Ad set name is required')
    
    const adSet = await createAdSet({
      ...formData.value,
      campaign_id: props.campaign.id
    })
    
    emit('created', adSet)
    emit('close')
  } catch (error) {
    console.error('Error creating ad set:', error)
  }
}
</script>

<template>
  <UModal :model-value="true" @update:model-value="emit('close')" :ui="{ width: 'sm:max-w-3xl' }">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold">Create Ad Set</h2>
            <p class="text-sm text-gray-400 mt-1">Campaign: {{ campaign.name }}</p>
          </div>
          <UButton icon="i-heroicons-x-mark" variant="ghost" @click="emit('close')" />
        </div>
      </template>

      <form @submit.prevent="handleSubmit" class="space-y-6">
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
      </form>

      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton color="gray" variant="ghost" @click="emit('close')" :disabled="loading">
            Cancel
          </UButton>
          <UButton color="primary" size="lg" :loading="loading" @click="handleSubmit">
            Create Ad Set
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>