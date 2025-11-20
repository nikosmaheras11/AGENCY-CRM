<!-- components/CreateCreativeForm.vue -->
<script setup lang="ts">
const props = defineProps<{
  adSet: any
}>()

const emit = defineEmits(['close', 'created'])

const formData = ref({
  name: '',
  description: '',
  
  // Asset
  asset_id: null,
  
  // Format
  format: 'single_image',
  dimensions: '',
  
  // Copy
  primary_text: '',
  headline: '',
  cta_type: 'learn_more',
  destination_url: '',
  
  // Notes
  internal_notes: ''
})

const { createCreative, loading } = useCreatives()
const { assets } = useAssets()

const formatOptions = [
  { value: 'single_image', label: 'Single Image' },
  { value: 'single_video', label: 'Single Video' },
  { value: 'carousel', label: 'Carousel' },
  { value: 'story', label: 'Story' }
]

const dimensionOptions = [
  { value: '1080x1920', label: '1080×1920 (Story/Reels)' },
  { value: '1080x1080', label: '1080×1080 (Square)' },
  { value: '1200x628', label: '1200×628 (Landscape)' },
  { value: '1080x1350', label: '1080×1350 (Portrait)' }
]

const ctaOptions = [
  { value: 'learn_more', label: 'Learn More' },
  { value: 'shop_now', label: 'Shop Now' },
  { value: 'sign_up', label: 'Sign Up' },
  { value: 'download', label: 'Download' },
  { value: 'book_now', label: 'Book Now' },
  { value: 'get_quote', label: 'Get Quote' }
]

const handleSubmit = async () => {
  try {
    if (!formData.value.name) throw new Error('Creative name is required')
    if (!formData.value.asset_id) throw new Error('Please select an asset')
    
    const creative = await createCreative({
      ...formData.value,
      ad_set_id: props.adSet.id
    })
    
    emit('created', creative)
    emit('close')
  } catch (error) {
    console.error('Error creating creative:', error)
  }
}
</script>

<template>
  <UModal :model-value="true" @update:model-value="emit('close')" :ui="{ width: 'sm:max-w-3xl' }">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold">Create Creative</h2>
            <p class="text-sm text-gray-400 mt-1">Ad Set: {{ adSet.name }}</p>
          </div>
          <UButton icon="i-heroicons-x-mark" variant="ghost" @click="emit('close')" />
        </div>
      </template>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Creative Name -->
        <UFormGroup label="Creative Name" required>
          <UInput
            v-model="formData.name"
            placeholder="e.g. Summer Sale Hero Image v1"
            size="lg"
          />
        </UFormGroup>

        <!-- Asset Selection -->
        <UFormGroup label="Asset" required>
          <AssetPicker
            v-model="formData.asset_id"
            :assets="assets"
            placeholder="Select or upload an asset"
          />
        </UFormGroup>

        <!-- Format & Dimensions -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormGroup label="Format">
            <USelect
              v-model="formData.format"
              :options="formatOptions"
              size="lg"
            />
          </UFormGroup>

          <UFormGroup label="Dimensions">
            <USelect
              v-model="formData.dimensions"
              :options="dimensionOptions"
              size="lg"
            />
          </UFormGroup>
        </div>

        <!-- Ad Copy -->
        <div class="border-t border-gray-700 pt-6">
          <h3 class="text-lg font-semibold mb-4">Ad Copy</h3>
          
          <div class="space-y-4">
            <UFormGroup label="Primary Text">
              <UTextarea
                v-model="formData.primary_text"
                placeholder="Main ad copy that appears with the creative..."
                :rows="4"
                size="lg"
              />
            </UFormGroup>

            <UFormGroup label="Headline">
              <UInput
                v-model="formData.headline"
                placeholder="Attention-grabbing headline"
                size="lg"
              />
            </UFormGroup>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UFormGroup label="Call to Action">
                <USelect
                  v-model="formData.cta_type"
                  :options="ctaOptions"
                  size="lg"
                />
              </UFormGroup>

              <UFormGroup label="Destination URL">
                <UInput
                  v-model="formData.destination_url"
                  placeholder="https://..."
                  size="lg"
                />
              </UFormGroup>
            </div>
          </div>
        </div>

        <!-- Internal Notes -->
        <UFormGroup label="Internal Notes" hint="(optional)">
          <UTextarea
            v-model="formData.internal_notes"
            placeholder="Notes for team reference..."
            :rows="2"
            size="lg"
          />
        </UFormGroup>
      </form>

      <template #footer>
        <div class="flex justify-between items-center">
          <p class="text-sm text-gray-400">
            <UIcon name="i-heroicons-information-circle" class="inline" />
            Save as draft or submit for client review
          </p>
          <div class="flex gap-3">
            <UButton color="gray" variant="ghost" @click="emit('close')" :disabled="loading">
              Cancel
            </UButton>
            <UButton color="primary" size="lg" :loading="loading" @click="handleSubmit">
              Create Creative
            </UButton>
          </div>
        </div>
      </template>
    </UCard>
  </UModal>
</template>