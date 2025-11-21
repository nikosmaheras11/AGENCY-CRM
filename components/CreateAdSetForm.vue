<!-- components/CreateAdSetForm.vue -->
<script setup lang="ts">
const props = defineProps<{
  campaign: any
}>()

const emit = defineEmits(['close', 'created'])

const step = ref(1)
const uploadedFiles = ref<Array<{ file: File, asset: any | null, uploading: boolean, error: string | null }>>([])
const creativeData = ref<Array<{ asset: any, title: string }>>([])

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
  
  // Timeline
  planned_start_date: null,
  planned_end_date: null,
  
  // Notes
  internal_notes: ''
})

const { createAdSet, loading: adSetLoading } = useAdSets()
const { createCreative, loading: creativeLoading } = useCreatives()
const { uploadAsset, deleteAsset, loading: assetUploadLoading } = useAssets()

const loading = computed(() => adSetLoading.value || creativeLoading.value || assetUploadLoading.value)

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
  if (step.value === 1 && !formData.value.name) {
    return
  }
  
  if (step.value === 2) {
    // Initialize creative data for uploaded assets
    creativeData.value = uploadedFiles.value
      .filter(f => f.asset)
      .map(f => ({
        asset: f.asset,
        title: f.file.name.replace(/\.[^/.]+$/, '') // filename without extension
      }))
  }
  
  step.value++
}

const handleFilesUpload = async (files: File[]) => {
  for (const file of files) {
    const index = uploadedFiles.value.length
    uploadedFiles.value.push({
      file,
      asset: null,
      uploading: true,
      error: null
    })

    try {
      const asset = await uploadAsset(file, {
        folder: 'creative-assets',
        campaign_id: props.campaign.id
      })
      // Update the item directly for reactivity
      uploadedFiles.value[index] = {
        file,
        asset: asset,
        uploading: false,
        error: null
      }
    } catch (error) {
      console.error('Upload failed:', error)
      uploadedFiles.value[index] = {
        file,
        asset: null,
        uploading: false,
        error: 'Upload failed'
      }
    }
  }
}

const removeUploadedFile = async (index: number) => {
  const item = uploadedFiles.value[index]
  if (item.asset) {
    try {
      await deleteAsset(item.asset.id, item.asset.storage_path)
    } catch (error) {
      console.error('Error deleting asset:', error)
    }
  }
  uploadedFiles.value.splice(index, 1)
}

const handleSubmit = async () => {
  try {
    if (!formData.value.name) throw new Error('Ad set name is required')
    
    // 1. Create Ad Set
    const adSet = await createAdSet({
      ...formData.value,
      campaign_id: props.campaign.id
    })

    // 2. Create Creatives for uploaded assets with title and budget
    if (creativeData.value.length > 0) {
      const createPromises = creativeData.value.map(item => {
        return createCreative({
          ad_set_id: adSet.id,
          name: item.title || 'New Creative',
          asset_id: item.asset.id,
          format: item.asset.file_type === 'video' ? 'video' : 'single_image',
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
  <UModal :model-value="true" @update:model-value="emit('close')" :ui="{ width: 'sm:max-w-4xl' }">
    <UCard :ui="{ body: { padding: 'p-0' } }">
      <template #header>
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-white">Create Ad Set</h2>
            <p class="text-sm text-gray-400 mt-1">Campaign: {{ campaign.name }}</p>
          </div>
          <UButton icon="i-heroicons-x-mark" variant="ghost" @click="emit('close')" />
        </div>
        
        <!-- Horizontal Stepper -->
        <div class="flex items-center mt-6 border-b border-gray-700 pb-4">
          <div class="flex items-center w-full">
            <!-- Step 1 -->
            <div class="flex items-center relative">
              <div 
                class="flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-colors"
                :class="step >= 1 ? 'bg-primary-500 text-white' : 'bg-gray-700 text-gray-400'"
              >
                1
              </div>
              <span 
                class="ml-2 text-sm font-medium transition-colors"
                :class="step >= 1 ? 'text-white' : 'text-gray-500'"
              >
                Details
              </span>
            </div>
            
            <div class="flex-1 h-0.5 mx-4 bg-gray-700">
              <div class="h-full bg-primary-500 transition-all duration-300" :style="{ width: step > 1 ? '100%' : '0%' }"></div>
            </div>

            <!-- Step 2 -->
            <div class="flex items-center relative">
              <div 
                class="flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-colors"
                :class="step >= 2 ? 'bg-primary-500 text-white' : 'bg-gray-700 text-gray-400'"
              >
                2
              </div>
              <span 
                class="ml-2 text-sm font-medium transition-colors"
                :class="step >= 2 ? 'text-white' : 'text-gray-500'"
              >
                Select Creatives
              </span>
            </div>

            <div class="flex-1 h-0.5 mx-4 bg-gray-700">
              <div class="h-full bg-primary-500 transition-all duration-300" :style="{ width: step > 2 ? '100%' : '0%' }"></div>
            </div>

            <!-- Step 3 -->
            <div class="flex items-center relative">
              <div 
                class="flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-colors"
                :class="step >= 3 ? 'bg-primary-500 text-white' : 'bg-gray-700 text-gray-400'"
              >
                3
              </div>
              <span 
                class="ml-2 text-sm font-medium transition-colors"
                :class="step >= 3 ? 'text-white' : 'text-gray-500'"
              >
                Configure
              </span>
            </div>
          </div>
        </div>
      </template>

      <div class="p-6 max-h-[60vh] overflow-y-auto">
        <!-- Step 1: Ad Set Details -->
        <div v-show="step === 1" class="space-y-6">
          <!-- Basic Info -->
          <UFormGroup label="Ad Set Name" required :ui="{ label: { base: 'text-gray-200' } }">
            <UInput
              v-model="formData.name"
              placeholder="e.g. US Women 25-45 - Fashion"
              size="lg"
            />
          </UFormGroup>

          <UFormGroup label="Platform" required :ui="{ label: { base: 'text-gray-200' } }">
            <USelect
              v-model="formData.platform"
              :options="campaign.platforms.map((p: any) => ({ value: p, label: p.charAt(0).toUpperCase() + p.slice(1) }))"
              size="lg"
            />
          </UFormGroup>

          <!-- Audience Description -->
          <UFormGroup label="Audience Description" :ui="{ label: { base: 'text-gray-200' } }">
            <UTextarea
              v-model="formData.audience_description"
              placeholder="Describe the target audience for this ad set..."
              :rows="3"
              size="lg"
            />
          </UFormGroup>

          <!-- Demographics -->
          <div class="border-t border-gray-700 pt-6">
            <h3 class="text-lg font-semibold mb-4 text-white">Demographics</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UFormGroup label="Age Range" :ui="{ label: { base: 'text-gray-200' } }">
                <UInput
                  v-model="formData.age_range"
                  placeholder="e.g. 25-45"
                  size="lg"
                />
              </UFormGroup>

              <UFormGroup label="Gender" :ui="{ label: { base: 'text-gray-200' } }">
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
            <UFormGroup label="Locations" class="mt-4" :ui="{ label: { base: 'text-gray-200' } }">
              <div class="space-y-3">
                <div v-if="formData.locations.length > 0" class="flex flex-wrap gap-2">
                  <UBadge
                    v-for="(location, index) in formData.locations"
                    :key="index"
                    color="blue"
                    variant="soft"
                    size="lg"
                  >
                    {{ location }}
                    <button type="button" @click="removeLocation(index)" class="ml-1">
                      <UIcon name="i-heroicons-x-mark" />
                    </button>
                  </UBadge>
                </div>

                <div class="flex gap-2">
                  <UInput
                    v-model="locationInput"
                    placeholder="e.g. United States, California, Los Angeles"
                    class="flex-1"
                    size="lg"
                    @keyup.enter="addLocation"
                  />
                  <UButton icon="i-heroicons-plus" @click="addLocation">Add</UButton>
                </div>
              </div>
            </UFormGroup>
          </div>

          <!-- Timeline -->
          <div class="border-t border-gray-700 pt-6">
            <h3 class="text-lg font-semibold mb-4 text-white">Timeline</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UFormGroup label="Planned Start Date" :ui="{ label: { base: 'text-gray-200' } }">
                <UInput v-model="formData.planned_start_date" type="date" size="lg" />
              </UFormGroup>

              <UFormGroup label="Planned End Date" hint="(optional)" :ui="{ label: { base: 'text-gray-200' } }">
                <UInput v-model="formData.planned_end_date" type="date" size="lg" />
              </UFormGroup>
            </div>
          </div>
        </div>

        <!-- Step 2: Upload Files -->
        <div v-show="step === 2" class="space-y-6">
          <div class="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <h3 class="text-sm font-medium text-gray-200 mb-2">Upload Creatives</h3>
            <p class="text-sm text-gray-400">
              Upload the files you want to use as creatives. You'll add titles in the next step.
            </p>
          </div>

          <FileDropzone 
            accept="image/*,video/*"
            :multiple="true"
            :max-size="50"
            @upload="handleFilesUpload"
          />

          <!-- Uploaded Files Preview -->
          <div v-if="uploadedFiles.length > 0" class="space-y-3">
            <h4 class="text-sm font-medium text-gray-200">Uploaded Files</h4>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <div 
                v-for="(item, index) in uploadedFiles"
                :key="index"
                class="relative aspect-square rounded-lg overflow-hidden border-2 transition-all"
                :class="item.uploading ? 'border-yellow-500' : item.error ? 'border-red-500' : 'border-secondary'"
              >
                <div class="w-full h-full bg-gray-800 flex items-center justify-center">
                  <template v-if="item.uploading">
                    <UIcon name="i-heroicons-arrow-path" class="text-3xl text-yellow-500 animate-spin" />
                  </template>
                  <template v-else-if="item.error">
                    <UIcon name="i-heroicons-exclamation-triangle" class="text-3xl text-red-500" />
                  </template>
                  <template v-else-if="item.asset">
                    <img 
                      v-if="item.asset.file_type === 'image'"
                      :src="item.asset.thumbnail_url || item.asset.preview_url"
                      :alt="item.file.name"
                      class="w-full h-full object-cover"
                    />
                    <div v-else class="flex flex-col items-center gap-2">
                      <UIcon name="i-heroicons-film" class="text-3xl text-gray-400" />
                      <span class="text-xs text-gray-400">Video</span>
                    </div>
                  </template>
                </div>
                
                <button
                  type="button"
                  @click="removeUploadedFile(index)"
                  class="absolute top-1 right-1 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                >
                  <UIcon name="i-heroicons-x-mark" class="text-white" />
                </button>
              </div>
            </div>
            
            <p class="text-sm text-gray-400">
              {{ uploadedFiles.filter(f => f.asset).length }} / {{ uploadedFiles.length }} files uploaded
            </p>
          </div>
        </div>

        <!-- Step 3: Title & Budget for Each Creative -->
        <div v-show="step === 3" class="space-y-6">
          <div class="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <h3 class="text-sm font-medium text-gray-200 mb-2">Creative Details</h3>
            <p class="text-sm text-gray-400">
              Set the title for each creative.
            </p>
          </div>

          <div class="space-y-4">
            <div 
              v-for="(item, index) in creativeData" 
              :key="index"
              class="p-4 border border-gray-700 rounded-lg bg-gray-800/30"
            >
              <div class="flex items-center gap-4 mb-4">
                <img 
                  v-if="item.asset.file_type === 'image'"
                  :src="item.asset.thumbnail_url || item.asset.public_url" 
                  class="w-16 h-16 rounded object-cover bg-gray-700"
                />
                <div v-else class="w-16 h-16 rounded bg-gray-700 flex items-center justify-center">
                  <UIcon name="i-heroicons-film" class="text-2xl text-gray-400" />
                </div>
                <div class="flex-1">
                  <UFormGroup label="Creative Title" :ui="{ label: { base: 'text-gray-300 text-xs' } }">
                    <UInput
                      v-model="creativeData[index].title"
                      placeholder="e.g. Summer Sale - Hero Image"
                      size="lg"
                    />
                  </UFormGroup>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3 p-4 border-t border-gray-700">
          <UButton 
            color="gray" 
            variant="ghost" 
            @click="step === 1 ? emit('close') : step--" 
            :disabled="loading"
          >
            {{ step === 1 ? 'Cancel' : 'Back' }}
          </UButton>

          <UButton 
            v-if="step < 3"
            color="primary" 
            size="lg" 
            @click="handleNext"
            :disabled="step === 1 && !formData.name"
          >
            Next
          </UButton>

          <UButton 
            v-if="step === 3"
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