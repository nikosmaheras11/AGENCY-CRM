<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-container">
          
          <!-- Modal Header -->
          <div class="modal-header">
            <div class="header-left">
              <input
                v-if="request"
                v-model="localTitle"
                type="text"
                placeholder="Untitled Request"
                class="title-input"
                @blur="updateField('title', localTitle)"
                @keydown.enter="updateField('title', localTitle)"
              />
            </div>
            
            <div class="header-actions">
              <button class="icon-button" @click="$emit('close')">
                <span class="material-icons">close</span>
              </button>
            </div>
          </div>

          <!-- Tab Navigation -->
          <div class="modal-tabs">
            <button
              class="tab-button"
              :class="{ active: activeTab === 'details' }"
              @click="activeTab = 'details'"
            >
              <span class="material-icons text-sm">description</span>
              <span>Details</span>
            </button>
            
            <button
              class="tab-button"
              :class="{ active: activeTab === 'comments' }"
              @click="activeTab = 'comments'"
            >
              <span class="material-icons text-sm">comment</span>
              <span>Comments</span>
              <span v-if="comments.length" class="tab-badge">
                {{ comments.length }}
              </span>
            </button>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="modal-loading">
            <span class="material-icons text-4xl animate-spin text-blue-500">refresh</span>
            <span class="text-gray-400">Loading request...</span>
          </div>

          <!-- Modal Content -->
          <div v-else-if="request" class="modal-content">
            
            <!-- Details Tab -->
            <div v-if="activeTab === 'details'" class="content-section">
              <RequestDetailFields
                :request="request"
                :saving="saving"
                @update="updateField"
              />
            </div>

            <!-- Comments Tab -->
            <div v-else-if="activeTab === 'comments'" class="content-section">
              <RequestCommentThread
                :request-id="requestId"
                :comments="comments"
              />
            </div>

          </div>

          <!-- Error State -->
          <div v-else class="modal-error">
            <span class="material-icons text-4xl text-red-500">error</span>
            <span class="text-gray-400">Failed to load request</span>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { Request } from '~/composables/useRequests'
import type { RequestComment } from '~/types/request-modal'

interface Props {
  requestId: string
  isOpen: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  updated: [request: any]
}>()

// State
const request = ref<Request | null>(null)
const comments = ref<RequestComment[]>([])
const loading = ref(true)
const saving = ref(false)
const activeTab = ref<'details' | 'comments'>('details')
const localTitle = ref('')

// Composables
const { supabase } = useSupabase()

// Fetch request data
const fetchRequest = async () => {
  try {
    loading.value = true
    
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .eq('id', props.requestId)
      .single()
    
    if (error) throw error
    
    // Transform to Request format
    request.value = {
      id: data.id,
      projectType: data.project_type,
      status: data.status,
      title: data.title,
      format: data.format,
      size: data.size,
      dimensions: data.dimensions,
      duration: data.duration,
      thumbnail: data.thumbnail_url,
      figmaUrl: data.figma_url,
      videoUrl: data.video_url,
      assetFileUrl: data.asset_file_url,
      metadata: {
        assignee: data.assignee,
        dueDate: data.due_date,
        tags: data.tags,
        priority: data.priority,
        client: data.client,
        campaign: data.campaign
      },
      comments: [],
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
    
    localTitle.value = data.title || ''
    
    // Fetch comments
    await fetchComments()
    
  } catch (error) {
    console.error('Failed to fetch request:', error)
  } finally {
    loading.value = false
  }
}

// Fetch comments
const fetchComments = async () => {
  try {
    const { data, error } = await supabase
      .from('request_comments')
      .select('*')
      .eq('request_id', props.requestId)
      .order('created_at', { ascending: true })
    
    if (error) throw error
    comments.value = data || []
  } catch (error) {
    console.error('Failed to fetch comments:', error)
  }
}

// Update field handler
const updateField = async (fieldKey: string, value: any) => {
  if (!request.value) return
  
  try {
    saving.value = true
    
    // Map frontend field names to database column names
    const dbFieldMap: Record<string, string> = {
      'title': 'title',
      'status': 'status',
      'priority': 'priority',
      'format': 'format',
      'size': 'size',
      'dimensions': 'dimensions',
      'duration': 'duration',
      'assignee': 'assignee',
      'dueDate': 'due_date',
      'client': 'client',
      'campaign': 'campaign'
    }
    
    const dbField = dbFieldMap[fieldKey] || fieldKey
    
    const { data, error } = await supabase
      .from('requests')
      .update({ 
        [dbField]: value,
        updated_at: new Date().toISOString()
      })
      .eq('id', props.requestId)
      .select()
      .single()
    
    if (error) throw error
    
    // Update local state
    if (fieldKey === 'title') {
      localTitle.value = value
      if (request.value) request.value.title = value
    }
    
    emit('updated', data)
    
  } catch (error) {
    console.error('Failed to update field:', error)
  } finally {
    saving.value = false
  }
}

// Setup realtime subscription for comments
const setupRealtimeSubscription = () => {
  const channel = supabase
    .channel(`request-modal-${props.requestId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'request_comments',
        filter: `request_id=eq.${props.requestId}`
      },
      (payload) => {
        if (!comments.value.find(c => c.id === payload.new.id)) {
          comments.value.push(payload.new as RequestComment)
        }
      }
    )
    .subscribe()
  
  onUnmounted(() => {
    supabase.removeChannel(channel)
  })
}

// Initialize when modal opens
watch(() => props.isOpen, async (isOpen) => {
  if (isOpen) {
    await fetchRequest()
    setupRealtimeSubscription()
  }
}, { immediate: true })

// Keyboard shortcuts
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    emit('close')
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
/* Modal Overlay */
.modal-overlay {
  @apply fixed inset-0 z-50 
         bg-black/80 backdrop-blur-sm
         flex items-center justify-center
         p-4 overflow-y-auto;
}

/* Modal Container */
.modal-container {
  @apply relative w-full max-w-4xl
         bg-gray-900
         rounded-2xl 
         shadow-2xl shadow-black/50
         border border-gray-700
         flex flex-col
         max-h-[90vh];
}

/* Header */
.modal-header {
  @apply flex items-center justify-between gap-4
         px-6 py-4
         border-b border-gray-700
         bg-gray-800/50;
}

.header-left {
  @apply flex-1;
}

.title-input {
  @apply w-full bg-transparent border-none
         text-xl font-semibold text-white
         focus:outline-none focus:ring-0
         placeholder-gray-500;
}

.header-actions {
  @apply flex items-center gap-2;
}

.icon-button {
  @apply w-10 h-10 flex items-center justify-center
         rounded-lg
         text-gray-400 hover:text-white
         hover:bg-gray-700
         transition-all;
}

/* Tabs */
.modal-tabs {
  @apply flex items-center gap-1
         px-6 py-3
         border-b border-gray-700
         bg-gray-800/30;
}

.tab-button {
  @apply flex items-center gap-2
         px-4 py-2
         rounded-lg
         text-sm font-medium
         text-gray-400
         hover:text-white hover:bg-gray-700/50
         transition-all;
}

.tab-button.active {
  @apply text-white bg-gray-700;
}

.tab-badge {
  @apply px-1.5 py-0.5
         text-xs font-semibold
         bg-blue-500/20 text-blue-400
         rounded;
}

/* Content */
.modal-content {
  @apply flex-1 overflow-y-auto;
}

.content-section {
  @apply p-6;
}

/* States */
.modal-loading,
.modal-error {
  @apply flex flex-col items-center justify-center
         gap-3 py-16;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  @apply transition-all duration-200;
}

.modal-enter-from,
.modal-leave-to {
  @apply opacity-0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  @apply scale-95;
}
</style>
