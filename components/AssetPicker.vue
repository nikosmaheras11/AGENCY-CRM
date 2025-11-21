<script setup lang="ts">
const props = defineProps<{
  modelValue: string | string[] | null
  assets: any[]
  placeholder?: string
  multiple?: boolean
}>()

const emit = defineEmits(['update:modelValue'])

const searchQuery = ref('')
const showDropdown = ref(false)
const containerRef = ref<HTMLElement | null>(null)

const filteredAssets = computed(() => {
  if (!searchQuery.value) return props.assets
  const query = searchQuery.value.toLowerCase()
  return props.assets.filter(asset => 
    asset.title?.toLowerCase().includes(query) ||
    asset.name?.toLowerCase().includes(query)
  )
})

const selectedAssets = computed(() => {
  if (props.multiple && Array.isArray(props.modelValue)) {
    return props.assets.filter(a => props.modelValue.includes(a.id))
  }
  return props.assets.find(a => a.id === props.modelValue)
})

const isSelected = (assetId: string) => {
  if (props.multiple && Array.isArray(props.modelValue)) {
    return props.modelValue.includes(assetId)
  }
  return props.modelValue === assetId
}

const selectAsset = (asset: any) => {
  if (props.multiple) {
    const current = Array.isArray(props.modelValue) ? [...props.modelValue] : []
    const index = current.indexOf(asset.id)
    
    if (index === -1) {
      current.push(asset.id)
    } else {
      current.splice(index, 1)
    }
    emit('update:modelValue', current)
    // Don't close dropdown in multiple mode
  } else {
    emit('update:modelValue', asset.id)
    showDropdown.value = false
  }
}

const removeAsset = (assetId: string) => {
  if (props.multiple && Array.isArray(props.modelValue)) {
    const newValue = props.modelValue.filter(id => id !== assetId)
    emit('update:modelValue', newValue)
  } else {
    emit('update:modelValue', null)
  }
}

// Close dropdown when clicking outside
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const handleClickOutside = (event: MouseEvent) => {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    showDropdown.value = false
  }
}
</script>

<template>
  <div ref="containerRef" class="relative">
    <!-- Selected State (Single) -->
    <div 
      v-if="!multiple && selectedAssets && !Array.isArray(selectedAssets)"
      class="flex items-center gap-3 p-3 border border-gray-700 rounded-lg bg-gray-800 cursor-pointer hover:border-primary-500 transition-colors"
      @click="showDropdown = !showDropdown"
    >
      <img 
        v-if="selectedAssets.thumbnail_url || selectedAssets.thumbnail"
        :src="selectedAssets.thumbnail_url || selectedAssets.thumbnail" 
        class="w-10 h-10 rounded object-cover bg-gray-700"
      />
      <div v-else class="w-10 h-10 rounded bg-gray-700 flex items-center justify-center">
        <span class="material-icons text-gray-500">image</span>
      </div>
      <div class="flex-1 min-w-0">
        <div class="font-medium truncate">{{ selectedAssets.title || selectedAssets.name }}</div>
        <div class="text-xs text-gray-400 truncate">{{ selectedAssets.format }} • {{ selectedAssets.dimensions }}</div>
      </div>
      <button 
        @click.stop="emit('update:modelValue', null)"
        class="p-1 hover:bg-gray-700 rounded"
      >
        <span class="material-icons text-gray-400">close</span>
      </button>
    </div>

    <!-- Selected State (Multiple) -->
    <div 
      v-else-if="multiple && Array.isArray(selectedAssets) && selectedAssets.length > 0"
      class="w-full"
    >
      <div 
        class="flex flex-wrap gap-2 p-3 border border-gray-700 rounded-lg bg-gray-800 min-h-[3rem]"
        @click="showDropdown = !showDropdown"
      >
        <div 
          v-for="asset in selectedAssets" 
          :key="asset.id"
          class="flex items-center gap-2 bg-gray-700 rounded pl-2 pr-1 py-1"
        >
          <img 
            v-if="asset.thumbnail_url || asset.thumbnail"
            :src="asset.thumbnail_url || asset.thumbnail" 
            class="w-5 h-5 rounded object-cover"
          />
          <span class="text-sm truncate max-w-[150px]">{{ asset.title || asset.name }}</span>
          <button 
            @click.stop="removeAsset(asset.id)"
            class="hover:text-white text-gray-400"
          >
            <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
          </button>
        </div>
        <div 
          class="flex-1 min-w-[100px] flex items-center text-gray-400 cursor-pointer hover:text-gray-300"
        >
          <UIcon name="i-heroicons-plus" class="mr-1" />
          Add more...
        </div>
      </div>
    </div>

    <!-- Empty State / Dropdown Trigger -->
    <div 
      v-else
      class="w-full"
    >
      <div 
        class="flex items-center gap-2 p-3 border border-gray-700 rounded-lg bg-gray-800 cursor-pointer hover:border-gray-600 transition-colors"
        @click="showDropdown = !showDropdown"
      >
        <span class="material-icons text-gray-400">add_photo_alternate</span>
        <span class="text-gray-400">{{ placeholder || 'Select asset...' }}</span>
      </div>
    </div>

    <!-- Dropdown -->
    <div 
      v-if="showDropdown"
      class="absolute z-50 left-0 right-0 mt-2 max-h-60 overflow-y-auto bg-gray-900 border border-gray-700 rounded-lg shadow-xl"
    >
      <div class="sticky top-0 p-2 bg-gray-900 border-b border-gray-700">
        <input 
          v-model="searchQuery"
          type="text"
          placeholder="Search assets..."
          class="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm focus:outline-none focus:border-primary-500"
          @click.stop
        />
      </div>

      <div class="p-1">
        <div 
          v-for="asset in filteredAssets" 
          :key="asset.id"
          class="flex items-center gap-3 p-2 hover:bg-gray-800 rounded cursor-pointer"
          :class="{ 'bg-gray-800': isSelected(asset.id) }"
          @click="selectAsset(asset)"
        >
          <div v-if="multiple" class="flex items-center justify-center w-5 h-5 border border-gray-600 rounded mr-2">
             <UIcon v-if="isSelected(asset.id)" name="i-heroicons-check" class="w-4 h-4 text-primary-500" />
          </div>

          <img 
            v-if="asset.thumbnail_url || asset.thumbnail"
            :src="asset.thumbnail_url || asset.thumbnail" 
            class="w-8 h-8 rounded object-cover bg-gray-700"
          />
          <div v-else class="w-8 h-8 rounded bg-gray-700 flex items-center justify-center">
            <span class="material-icons text-xs text-gray-500">image</span>
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium truncate">{{ asset.title || asset.name }}</div>
            <div class="text-xs text-gray-500 truncate">{{ asset.format }}</div>
          </div>
          <UIcon v-if="!multiple && isSelected(asset.id)" name="i-heroicons-check" class="text-primary-500" />
        </div>

        <div v-if="filteredAssets.length === 0" class="p-4 text-center text-sm text-gray-500">
          No assets found
        </div>
      </div>
    </div>
  </div>
</template>