<template>
  <div class="filter-panel bg-white border-r border-gray-200 w-72 flex flex-col overflow-hidden">
    <!-- Header -->
    <div class="p-4 border-b border-gray-200">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold text-gray-900">Filters</h3>
        <button 
          v-if="hasActiveFilters"
          @click="clearAllFilters"
          class="text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          Clear all
        </button>
      </div>
      
      <!-- Search bar -->
      <div class="relative">
        <span class="material-icons absolute left-3 top-2.5 text-gray-400 text-lg">search</span>
        <input 
          v-model="localFilters.search"
          type="text"
          placeholder="Search assets..."
          class="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
    
    <!-- Active filter chips -->
    <div v-if="activeFilterChips.length > 0" class="p-3 border-b border-gray-100 bg-gray-50">
      <div class="flex flex-wrap gap-2">
        <div
          v-for="chip in activeFilterChips"
          :key="chip.id"
          class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium"
        >
          <span>{{ chip.label }}</span>
          <button 
            @click="removeFilterChip(chip)"
            class="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
          >
            <span class="material-icons text-xs">close</span>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Filter groups (scrollable) -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4">
      <!-- Status Filter -->
      <div class="filter-group">
        <h4 class="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Status</h4>
        <div class="space-y-1.5">
          <label
            v-for="status in statusOptions"
            :key="status.value"
            class="flex items-center justify-between px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div class="flex items-center gap-2">
              <input
                type="checkbox"
                :value="status.value"
                v-model="localFilters.status"
                class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span class="text-sm text-gray-700 flex items-center gap-1.5">
                <span>{{ status.emoji }}</span>
                <span>{{ status.label }}</span>
              </span>
            </div>
            <span class="text-xs text-gray-400 font-medium">{{ status.count }}</span>
          </label>
        </div>
      </div>
      
      <!-- File Type Filter -->
      <div class="filter-group">
        <h4 class="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">File Type</h4>
        <div class="space-y-1.5">
          <label
            v-for="type in fileTypeOptions"
            :key="type.value"
            class="flex items-center justify-between px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div class="flex items-center gap-2">
              <input
                type="checkbox"
                :value="type.value"
                v-model="localFilters.fileTypes"
                class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span class="text-sm text-gray-700 flex items-center gap-1.5">
                <span>{{ type.icon }}</span>
                <span>{{ type.label }}</span>
              </span>
            </div>
            <span class="text-xs text-gray-400 font-medium">{{ type.count }}</span>
          </label>
        </div>
      </div>
      
      <!-- Properties Filter -->
      <div class="filter-group">
        <h4 class="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Properties</h4>
        <div class="space-y-1.5">
          <label class="flex items-center px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              v-model="localFilters.hasComments"
              class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span class="ml-2 text-sm text-gray-700">Has Comments</span>
          </label>
          
          <label class="flex items-center px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              v-model="localFilters.hasAssignee"
              class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span class="ml-2 text-sm text-gray-700">Has Assignee</span>
          </label>
        </div>
      </div>
      
      <!-- Priority Filter -->
      <div class="filter-group">
        <h4 class="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Priority</h4>
        <div class="space-y-1.5">
          <label
            v-for="priority in priorityOptions"
            :key="priority.value"
            class="flex items-center justify-between px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div class="flex items-center gap-2">
              <input
                type="checkbox"
                :value="priority.value"
                v-model="localFilters.priority"
                class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span class="text-sm text-gray-700">{{ priority.label }}</span>
            </div>
            <span class="text-xs text-gray-400 font-medium">{{ priority.count }}</span>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Request } from '~/composables/useRequests'

interface Filters {
  search: string
  status: string[]
  fileTypes: string[]
  hasComments: boolean
  hasAssignee: boolean
  priority: string[]
}

interface Props {
  assets: any[] // Array of assets to filter
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:filters': [filters: Filters]
}>()

// Local filter state
const localFilters = ref<Filters>({
  search: '',
  status: [],
  fileTypes: [],
  hasComments: false,
  hasAssignee: false,
  priority: []
})

// Watch filters and emit changes
watch(localFilters, (newFilters) => {
  emit('update:filters', newFilters)
}, { deep: true })

// Status options with counts
const statusOptions = computed(() => [
  { 
    value: 'new-request', 
    label: 'New Request', 
    emoji: '📬',
    count: props.assets.filter(a => a.status === 'new-request').length 
  },
  { 
    value: 'in-progress', 
    label: 'In Progress', 
    emoji: '🔄',
    count: props.assets.filter(a => a.status === 'in-progress').length 
  },
  { 
    value: 'needs-review', 
    label: 'Needs Review', 
    emoji: '👀',
    count: props.assets.filter(a => a.status === 'needs-review').length 
  },
  { 
    value: 'needs-edit', 
    label: 'Needs Edit', 
    emoji: '✏️',
    count: props.assets.filter(a => a.status === 'needs-edit').length 
  },
  { 
    value: 'done', 
    label: 'Done', 
    emoji: '✅',
    count: props.assets.filter(a => a.status === 'done').length 
  }
])

// File type options with counts
const fileTypeOptions = computed(() => [
  { 
    value: 'video', 
    label: 'Video', 
    icon: '🎬',
    count: props.assets.filter(a => a.videoUrl).length 
  },
  { 
    value: 'figma', 
    label: 'Figma', 
    icon: '🎨',
    count: props.assets.filter(a => a.figmaUrl).length 
  },
  { 
    value: 'other', 
    label: 'Other', 
    icon: '📄',
    count: props.assets.filter(a => !a.videoUrl && !a.figmaUrl).length 
  }
])

// Priority options with counts
const priorityOptions = computed(() => [
  { 
    value: 'Critical', 
    label: 'Critical',
    count: props.assets.filter(a => a.metadata?.priority === 'Critical').length 
  },
  { 
    value: 'High', 
    label: 'High',
    count: props.assets.filter(a => a.metadata?.priority === 'High').length 
  },
  { 
    value: 'Medium', 
    label: 'Medium',
    count: props.assets.filter(a => a.metadata?.priority === 'Medium').length 
  },
  { 
    value: 'Low', 
    label: 'Low',
    count: props.assets.filter(a => a.metadata?.priority === 'Low').length 
  }
])

// Active filter chips
const activeFilterChips = computed(() => {
  const chips: { id: string; label: string; type: string }[] = []
  
  // Status chips
  localFilters.value.status.forEach(status => {
    const option = statusOptions.value.find(s => s.value === status)
    if (option) {
      chips.push({
        id: `status-${status}`,
        label: `${option.emoji} ${option.label}`,
        type: 'status'
      })
    }
  })
  
  // File type chips
  localFilters.value.fileTypes.forEach(type => {
    const option = fileTypeOptions.value.find(t => t.value === type)
    if (option) {
      chips.push({
        id: `type-${type}`,
        label: `${option.icon} ${option.label}`,
        type: 'fileType'
      })
    }
  })
  
  // Priority chips
  localFilters.value.priority.forEach(priority => {
    chips.push({
      id: `priority-${priority}`,
      label: priority,
      type: 'priority'
    })
  })
  
  // Property chips
  if (localFilters.value.hasComments) {
    chips.push({ id: 'has-comments', label: 'Has Comments', type: 'property' })
  }
  if (localFilters.value.hasAssignee) {
    chips.push({ id: 'has-assignee', label: 'Has Assignee', type: 'property' })
  }
  
  return chips
})

const hasActiveFilters = computed(() => {
  return localFilters.value.status.length > 0 ||
         localFilters.value.fileTypes.length > 0 ||
         localFilters.value.priority.length > 0 ||
         localFilters.value.hasComments ||
         localFilters.value.hasAssignee ||
         localFilters.value.search.length > 0
})

// Remove individual chip
const removeFilterChip = (chip: any) => {
  if (chip.type === 'status') {
    const value = chip.id.replace('status-', '')
    localFilters.value.status = localFilters.value.status.filter(s => s !== value)
  } else if (chip.type === 'fileType') {
    const value = chip.id.replace('type-', '')
    localFilters.value.fileTypes = localFilters.value.fileTypes.filter(t => t !== value)
  } else if (chip.type === 'priority') {
    const value = chip.id.replace('priority-', '')
    localFilters.value.priority = localFilters.value.priority.filter(p => p !== value)
  } else if (chip.id === 'has-comments') {
    localFilters.value.hasComments = false
  } else if (chip.id === 'has-assignee') {
    localFilters.value.hasAssignee = false
  }
}

// Clear all filters
const clearAllFilters = () => {
  localFilters.value = {
    search: '',
    status: [],
    fileTypes: [],
    hasComments: false,
    hasAssignee: false,
    priority: []
  }
}
</script>

<style scoped>
/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 9999px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.15);
}

.filter-group + .filter-group {
  padding-top: 1rem;
  border-top: 1px solid #f3f4f6;
}
</style>
