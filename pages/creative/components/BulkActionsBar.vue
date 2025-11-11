<template>
  <Transition name="slide-up">
    <div 
      v-if="selectedAssets.length > 0" 
      class="bulk-actions-bar fixed bottom-0 left-0 right-0 bg-white border-t-2 border-blue-500 shadow-2xl z-40"
    >
      <div class="max-w-screen-2xl mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <!-- Left: Selection info -->
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
              <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span class="material-icons text-blue-600">check_circle</span>
              </div>
              <div>
                <p class="text-sm font-semibold text-gray-900">
                  {{ selectedAssets.length }} asset{{ selectedAssets.length > 1 ? 's' : '' }} selected
                </p>
                <button 
                  @click="clearSelection"
                  class="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear selection
                </button>
              </div>
            </div>
          </div>
          
          <!-- Right: Bulk actions -->
          <div class="flex items-center gap-2">
            <!-- Change Status -->
            <div class="relative">
              <button 
                @click="toggleStatusMenu"
                class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <span class="material-icons text-lg">swap_horiz</span>
                <span>Change Status</span>
              </button>
              
              <!-- Status dropdown -->
              <div 
                v-if="showStatusMenu"
                class="absolute bottom-full mb-2 right-0 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[200px] z-50"
              >
                <button
                  v-for="status in statusOptions"
                  :key="status.value"
                  @click="bulkChangeStatus(status.value)"
                  class="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm"
                >
                  <span>{{ status.emoji }}</span>
                  <span class="text-gray-700">{{ status.label }}</span>
                </button>
              </div>
            </div>
            
            <!-- Assign -->
            <button 
              @click="bulkAssign"
              class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <span class="material-icons text-lg">person_add</span>
              <span>Assign</span>
            </button>
            
            <!-- Add Tags -->
            <button 
              @click="bulkTag"
              class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <span class="material-icons text-lg">label</span>
              <span>Add Tags</span>
            </button>
            
            <!-- Download -->
            <button 
              @click="bulkDownload"
              class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <span class="material-icons text-lg">download</span>
              <span>Download</span>
            </button>
            
            <!-- Delete (danger) -->
            <button 
              @click="bulkDelete"
              class="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <span class="material-icons text-lg">delete</span>
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
interface Props {
  selectedAssets: string[] // Array of selected asset IDs
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'clear-selection': []
  'bulk-change-status': [assetIds: string[], status: string]
  'bulk-assign': [assetIds: string[]]
  'bulk-tag': [assetIds: string[]]
  'bulk-download': [assetIds: string[]]
  'bulk-delete': [assetIds: string[]]
}>()

// Status menu state
const showStatusMenu = ref(false)

const statusOptions = [
  { value: 'new-request', label: 'New Request', emoji: '📬' },
  { value: 'in-progress', label: 'In Progress', emoji: '🔄' },
  { value: 'needs-review', label: 'Needs Review', emoji: '👀' },
  { value: 'needs-edit', label: 'Needs Edit', emoji: '✏️' },
  { value: 'done', label: 'Done', emoji: '✅' }
]

const toggleStatusMenu = () => {
  showStatusMenu.value = !showStatusMenu.value
}

// Close status menu when clicking outside
onMounted(() => {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!target.closest('.relative')) {
      showStatusMenu.value = false
    }
  })
})

// Action handlers
const clearSelection = () => {
  emit('clear-selection')
}

const bulkChangeStatus = (status: string) => {
  emit('bulk-change-status', props.selectedAssets, status)
  showStatusMenu.value = false
}

const bulkAssign = () => {
  emit('bulk-assign', props.selectedAssets)
}

const bulkTag = () => {
  emit('bulk-tag', props.selectedAssets)
}

const bulkDownload = () => {
  emit('bulk-download', props.selectedAssets)
}

const bulkDelete = () => {
  if (confirm(`Are you sure you want to delete ${props.selectedAssets.length} asset(s)?`)) {
    emit('bulk-delete', props.selectedAssets)
  }
}
</script>

<style scoped>
/* Slide up animation */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-up-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

.slide-up-enter-to,
.slide-up-leave-from {
  transform: translateY(0);
  opacity: 1;
}
</style>
