<template>
  <!-- Brief View Modal - Simpler than asset viewer, shows form data as readable brief -->
  <Transition name="slide">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex"
      @click.self="emit('update:modelValue', false)"
    >
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="emit('update:modelValue', false)" />

      <!-- Modal Panel -->
      <div class="relative ml-auto w-full max-w-2xl h-full bg-[#1d1d1f] shadow-2xl overflow-y-auto">
        <div class="sticky top-0 z-10 bg-[#1d1d1f]/95 backdrop-blur-sm border-b border-gray-800">
          <!-- Header -->
          <div class="flex items-center justify-between p-6">
            <div class="flex items-center gap-3">
              <button
                @click="emit('update:modelValue', false)"
                class="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors"
              >
                <span class="material-icons text-gray-400">close</span>
              </button>
              <h2 class="text-xl font-semibold text-white">Creative Brief</h2>
            </div>
            
            <!-- Status Badge -->
            <span 
              class="px-3 py-1 rounded-full text-xs font-medium"
              :class="getStatusBadge(displayData?.status)"
            >
              {{ formatStatus(displayData?.status) }}
            </span>
          </div>
        </div>

        <!-- Brief Content -->
        <div class="p-6 space-y-6">
          <!-- Title -->
          <div>
            <h1 class="text-2xl font-semibold text-white mb-2">
              {{ displayData?.title || 'Untitled Brief' }}
            </h1>
            <div class="flex items-center gap-4 text-sm text-gray-400">
              <span>Created {{ formatDate(displayData?.created_at) }}</span>
              <span v-if="displayData?.due_date">Due {{ formatDate(displayData?.due_date) }}</span>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="flex gap-3">
            <button 
              @click="updateStatus('in-progress')"
              v-if="displayData?.status === 'new-request'"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Start Working
            </button>
            <button 
              @click="updateStatus('needs-review')"
              v-if="displayData?.status === 'in-progress'"
              class="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Move to Review
            </button>
            <button class="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors">
              Edit Brief
            </button>
          </div>

          <!-- Brief Details Grid -->
          <div class="space-y-6">
            <!-- Platforms -->
            <div v-if="displayData?.platform && displayData.platform.length > 0" class="space-y-2">
              <label class="text-sm font-medium text-gray-400">Platforms</label>
              <div class="flex flex-wrap gap-2">
                <span 
                  v-for="platform in displayData.platform" 
                  :key="platform"
                  class="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium"
                >
                  {{ platform }}
                </span>
              </div>
            </div>

            <!-- Ad Sizes/Formats -->
            <div v-if="displayData?.ad_size_format && displayData.ad_size_format.length > 0" class="space-y-2">
              <label class="text-sm font-medium text-gray-400">Ad Sizes / Formats</label>
              <div class="flex flex-wrap gap-2">
                <span 
                  v-for="format in displayData.ad_size_format" 
                  :key="format"
                  class="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-medium"
                >
                  {{ format }}
                </span>
              </div>
            </div>

            <!-- Priority -->
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-400">Priority</label>
              <div>
                <span 
                  class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                  :class="getPriorityBadge(displayData?.priority)"
                >
                  {{ formatPriority(displayData?.priority) }}
                </span>
              </div>
            </div>

            <!-- Description -->
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-400">Creative Description</label>
              <div class="p-4 bg-gray-900/50 border border-gray-800 rounded-lg text-sm text-gray-300 whitespace-pre-wrap">
                {{ displayData?.description || 'No description provided' }}
              </div>
            </div>

            <!-- Inspiration (if provided) -->
            <div v-if="displayData?.inspiration" class="space-y-2">
              <label class="text-sm font-medium text-gray-400">Inspiration</label>
              <div class="p-4 bg-gray-900/50 border border-gray-800 rounded-lg text-sm text-gray-300 whitespace-pre-wrap">
                {{ displayData.inspiration }}
              </div>
            </div>

            <!-- Figma URL -->
            <div v-if="displayData?.figma_url" class="space-y-2">
              <label class="text-sm font-medium text-gray-400">Figma Link</label>
              <a 
                :href="displayData.figma_url" 
                target="_blank" 
                class="flex items-center gap-2 p-3 bg-gray-900/50 border border-gray-800 hover:border-blue-500 rounded-lg text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                <span class="material-icons text-base">link</span>
                <span class="flex-1 truncate">{{ displayData.figma_url }}</span>
                <span class="material-icons text-base">open_in_new</span>
              </a>
            </div>

            <!-- Reference URLs -->
            <div v-if="displayData?.reference_urls && displayData.reference_urls.length > 0" class="space-y-2">
              <label class="text-sm font-medium text-gray-400">Reference Links</label>
              <div class="space-y-2">
                <a 
                  v-for="(url, index) in displayData.reference_urls" 
                  :key="index"
                  :href="url" 
                  target="_blank" 
                  class="flex items-center gap-2 p-3 bg-gray-900/50 border border-gray-800 hover:border-blue-500 rounded-lg text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <span class="material-icons text-base">link</span>
                  <span class="flex-1 truncate">{{ url }}</span>
                  <span class="material-icons text-base">open_in_new</span>
                </a>
              </div>
            </div>

            <!-- Assignment -->
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-400">Assigned To</label>
              <div class="flex items-center gap-2 p-3 bg-gray-900/50 border border-gray-800 rounded-lg">
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-xs">
                  {{ getInitials(displayData?.assignee) }}
                </div>
                <span class="text-sm text-gray-300">{{ displayData?.assignee || 'Unassigned' }}</span>
              </div>
            </div>

            <!-- Client & Campaign -->
            <div class="grid grid-cols-2 gap-4">
              <div v-if="displayData?.client" class="space-y-2">
                <label class="text-sm font-medium text-gray-400">Client</label>
                <div class="p-3 bg-gray-900/50 border border-gray-800 rounded-lg text-sm text-gray-300">
                  {{ displayData.client }}
                </div>
              </div>
              <div v-if="displayData?.campaign" class="space-y-2">
                <label class="text-sm font-medium text-gray-400">Campaign</label>
                <div class="p-3 bg-gray-900/50 border border-gray-800 rounded-lg text-sm text-gray-300">
                  {{ displayData.campaign }}
                </div>
              </div>
            </div>

            <!-- Tags -->
            <div v-if="displayData?.tags && displayData.tags.length > 0" class="space-y-2">
              <label class="text-sm font-medium text-gray-400">Tags</label>
              <div class="flex flex-wrap gap-2">
                <span 
                  v-for="tag in displayData.tags" 
                  :key="tag"
                  class="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>

          <!-- Notice about asset workflow -->
          <div class="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div class="flex gap-3">
              <span class="material-icons text-blue-400">info</span>
              <div class="flex-1">
                <p class="text-sm text-blue-300 font-medium mb-1">Brief Stage</p>
                <p class="text-xs text-blue-400/80">
                  This request is in the brief stage. When you move it to "Needs Review", it will graduate to the full asset review workflow with version control and comment threads.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  briefId?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const { supabase } = useSupabase()
const briefData = ref<any>(null)

// Fetch brief data
const fetchBriefData = async () => {
  if (!props.briefId) return
  
  try {
    const { data, error } = await supabase
      .from('new_requests')
      .select('*')
      .eq('id', props.briefId)
      .single()
    
    if (error) throw error
    briefData.value = data
  } catch (error) {
    console.error('Failed to fetch brief:', error)
  }
}

// Watch for modal open
watch(() => props.modelValue, (isOpen) => {
  if (isOpen && props.briefId) {
    fetchBriefData()
  }
}, { immediate: true })

const displayData = computed(() => briefData.value)

// Update status (triggers migration if moving to review)
const updateStatus = async (newStatus: string) => {
  if (!props.briefId) return
  
  try {
    const { error } = await supabase
      .from('new_requests')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', props.briefId)
    
    if (error) throw error
    
    // If moving to needs-review, the trigger will auto-migrate to requests table
    if (newStatus === 'needs-review') {
      console.log('✅ Brief graduated to asset workflow')
      emit('update:modelValue', false)
      // Refresh the board
      window.location.reload()
    } else {
      // Refresh brief data
      await fetchBriefData()
    }
  } catch (error) {
    console.error('Failed to update status:', error)
  }
}

// Helper functions
const getInitials = (name?: string) => {
  if (!name) return 'U'
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

const formatDate = (date?: string) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatStatus = (status?: string) => {
  const map: Record<string, string> = {
    'new-request': 'New Request',
    'in-progress': 'In Progress'
  }
  return map[status || ''] || status
}

const formatPriority = (priority?: string) => {
  if (!priority) return 'Medium'
  return priority.charAt(0).toUpperCase() + priority.slice(1)
}

const getStatusBadge = (status?: string) => {
  const badges: Record<string, string> = {
    'new-request': 'bg-gray-500/20 text-gray-300',
    'in-progress': 'bg-blue-500/20 text-blue-300'
  }
  return badges[status || ''] || 'bg-gray-500/20 text-gray-300'
}

const getPriorityBadge = (priority?: string) => {
  const badges: Record<string, string> = {
    'urgent': 'bg-red-500/20 text-red-300',
    'high': 'bg-orange-500/20 text-orange-300',
    'medium': 'bg-yellow-500/20 text-yellow-300',
    'low': 'bg-green-500/20 text-green-300'
  }
  return badges[priority?.toLowerCase() || 'medium'] || 'bg-yellow-500/20 text-yellow-300'
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
