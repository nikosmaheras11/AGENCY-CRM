<template>
  <!-- Brief View Modal - Centered document-style modal -->
  <Transition name="fade">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center p-6"
      @click.self="emit('update:modelValue', false)"
    >
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" @click="emit('update:modelValue', false)" />

      <!-- Modal Panel - Centered document -->
      <div class="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between px-8 py-6 border-b border-gray-200 bg-white">
          <div class="flex items-center gap-4">
            <h1 class="text-2xl font-bold text-gray-900">Creative Brief</h1>
            <span 
              class="px-3 py-1.5 rounded-full text-xs font-semibold"
              :class="getStatusBadge(displayData?.status)"
            >
              {{ formatStatus(displayData?.status) }}
            </span>
          </div>
          
          <button
            @click="emit('update:modelValue', false)"
            class="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span class="material-icons text-gray-600">close</span>
          </button>
        </div>

        <!-- Brief Content - Document Style with Rich Text Layout -->
        <div class="flex-1 overflow-y-auto px-12 py-8 bg-gray-50">
          <div class="max-w-3xl mx-auto space-y-8">
            <!-- Info Banner -->
            <div class="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-4">
              <div class="flex items-start gap-3">
                <span class="material-icons text-blue-600 text-lg">info</span>
                <p class="text-sm text-blue-900 leading-relaxed">
                  This request is in the brief stage. When you move it to "Needs Review", the full asset review workflow with version control and comment threads becomes available.
                </p>
              </div>
            </div>

            <!-- Request Title -->
            <div>
              <h2 class="text-xl font-bold text-gray-900 mb-3">Request Title</h2>
              <p class="text-base text-gray-700 leading-relaxed">{{ displayData?.title || 'Untitled Request' }}</p>
            </div>

            <!-- Client -->
            <div v-if="displayData?.client">
              <h2 class="text-xl font-bold text-gray-900 mb-3">Client</h2>
              <p class="text-base text-gray-700 leading-relaxed">{{ displayData.client }}</p>
            </div>

            <!-- Campaign -->
            <div v-if="displayData?.campaign">
              <h2 class="text-xl font-bold text-gray-900 mb-3">Campaign</h2>
              <p class="text-base text-gray-700 leading-relaxed">{{ displayData.campaign }}</p>
            </div>

            <!-- Platforms -->
            <div v-if="displayData?.platform_array && displayData.platform_array.length > 0">
              <h2 class="text-xl font-bold text-gray-900 mb-3">Platform</h2>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="platform in displayData.platform_array"
                  :key="platform"
                  class="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg text-sm font-semibold"
                >
                  {{ platform }}
                </span>
              </div>
            </div>

            <!-- Ad Sizes -->
            <div v-if="displayData?.ad_size_format && displayData.ad_size_format.length > 0">
              <h2 class="text-xl font-bold text-gray-900 mb-3">Ad Size/Format</h2>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="size in displayData.ad_size_format"
                  :key="size"
                  class="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-semibold"
                >
                  {{ size }}
                </span>
              </div>
            </div>

            <!-- Priority -->
            <div>
              <h2 class="text-xl font-bold text-gray-900 mb-3">Priority</h2>
              <span 
                class="inline-block px-4 py-2 rounded-lg text-sm font-semibold"
                :class="getPriorityBadgeLight(displayData?.priority)"
              >
                {{ formatPriority(displayData?.priority) }}
              </span>
            </div>

            <!-- Due Date -->
            <div v-if="displayData?.due_date">
              <h2 class="text-xl font-bold text-gray-900 mb-3">Due Date</h2>
              <p class="text-base text-gray-700 leading-relaxed">{{ formatDate(displayData.due_date) }}</p>
            </div>

            <!-- Creative Description -->
            <div v-if="displayData?.description">
              <h2 class="text-xl font-bold text-gray-900 mb-3">Creative Description</h2>
              <p class="text-base text-gray-700 leading-relaxed whitespace-pre-wrap">{{ displayData.description }}</p>
            </div>

            <!-- Inspiration -->
            <div v-if="displayData?.inspiration">
              <h2 class="text-xl font-bold text-gray-900 mb-3">Inspiration</h2>
              <p class="text-base text-gray-700 leading-relaxed whitespace-pre-wrap">{{ displayData.inspiration }}</p>
            </div>

            <!-- Figma URL -->
            <div v-if="displayData?.figma_url">
              <h2 class="text-xl font-bold text-gray-900 mb-3">Figma Link</h2>
              <a 
                :href="displayData.figma_url" 
                target="_blank" 
                class="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:border-blue-500 rounded-lg text-sm text-blue-600 hover:text-blue-700 transition-colors"
              >
                <span class="material-icons text-base">link</span>
                <span class="truncate">Open in Figma</span>
                <span class="material-icons text-base">open_in_new</span>
              </a>
            </div>

            <!-- Reference URLs -->
            <div v-if="displayData?.reference_urls && displayData.reference_urls.length > 0">
              <h2 class="text-xl font-bold text-gray-900 mb-3">Reference Links</h2>
              <div class="space-y-2">
                <a 
                  v-for="(url, index) in displayData.reference_urls" 
                  :key="index"
                  :href="url" 
                  target="_blank" 
                  class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:border-blue-500 rounded-lg text-sm text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <span class="material-icons text-base">link</span>
                  <span class="flex-1 truncate">{{ url }}</span>
                  <span class="material-icons text-base">open_in_new</span>
                </a>
              </div>
            </div>

            <!-- Assigned To -->
            <div v-if="displayData?.assignee">
              <h2 class="text-xl font-bold text-gray-900 mb-3">Assigned To</h2>
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                  {{ getInitials(displayData.assignee) }}
                </div>
                <span class="text-base text-gray-700">{{ displayData.assignee }}</span>
              </div>
            </div>

            <!-- Tags -->
            <div v-if="displayData?.tags && displayData.tags.length > 0">
              <h2 class="text-xl font-bold text-gray-900 mb-3">Tags</h2>
              <div class="flex flex-wrap gap-2">
                <span 
                  v-for="tag in displayData.tags" 
                  :key="tag"
                  class="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium"
                >
                  {{ tag }}
                </span>
              </div>
            </div>

            <!-- Created Date -->
            <div v-if="displayData?.created_at">
              <h2 class="text-xl font-bold text-gray-900 mb-3">Created</h2>
              <p class="text-base text-gray-700 leading-relaxed">{{ formatDate(displayData.created_at) }}</p>
            </div>
          </div>
        </div>

        <!-- Footer with Quick Actions -->
        <div class="px-8 py-6 border-t border-gray-200 bg-white">
          <div class="max-w-3xl mx-auto flex gap-3">
            <!-- Start Working (for new-request status) -->
            <button
              v-if="displayData?.status === 'new-request'"
              @click="updateStatus('in-progress')"
              class="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <span class="material-icons text-lg">play_arrow</span>
              Start Working
            </button>

            <!-- Move to Review (for in-progress status) -->
            <button
              v-if="displayData?.status === 'in-progress'"
              @click="updateStatus('needs-review')"
              class="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <span class="material-icons text-lg">rate_review</span>
              Move to Review
            </button>
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
      .from('requests')
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

// Update status (just changes status, no migration needed)
const updateStatus = async (newStatus: string) => {
  if (!props.briefId) return
  
  try {
    const { error } = await supabase
      .from('requests')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', props.briefId)
    
    if (error) throw error
    
    // Close modal - realtime will update the list and show correct modal next time
    emit('update:modelValue', false)
    
    // Refresh brief data if staying in brief mode
    if (newStatus === 'in-progress') {
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
    'new-request': 'bg-gray-200 text-gray-700',
    'in-progress': 'bg-blue-100 text-blue-700'
  }
  return badges[status || ''] || 'bg-gray-200 text-gray-700'
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

const getPriorityBadgeLight = (priority?: string) => {
  const badges: Record<string, string> = {
    'urgent': 'bg-red-100 text-red-800',
    'high': 'bg-orange-100 text-orange-800',
    'medium': 'bg-yellow-100 text-yellow-800',
    'low': 'bg-green-100 text-green-800'
  }
  return badges[priority?.toLowerCase() || 'medium'] || 'bg-yellow-100 text-yellow-800'
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
