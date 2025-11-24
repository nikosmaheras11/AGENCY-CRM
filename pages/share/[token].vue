<script setup lang="ts">
const route = useRoute()
const token = route.params.token as string
const { fetchSharedData, postGuestComment, submitGuestApproval } = useShareLinks()
const toast = useToast()

// State
const loading = ref(true)
const error = ref<string | null>(null)
const data = ref<any>(null)
const permissions = ref<any>({})
const guestName = ref('')
const showNameModal = ref(false)
const pendingAction = ref<any>(null) // { type: 'comment' | 'approve', payload: any }

// Fetch Data
onMounted(async () => {
  try {
    const result = await fetchSharedData(token)
    data.value = result.data
    permissions.value = result.permissions
    
    // Check for stored guest name
    const storedName = localStorage.getItem('guest_name')
    if (storedName) guestName.value = storedName
  } catch (err: any) {
    error.value = err.statusMessage || 'Failed to load content'
  } finally {
    loading.value = false
  }
})

// Guest Identity Handling
const requireGuestName = (action: any) => {
  if (guestName.value) {
    executeAction(action)
  } else {
    pendingAction.value = action
    showNameModal.value = true
  }
}

const saveGuestName = () => {
  if (!guestName.value.trim()) return
  localStorage.setItem('guest_name', guestName.value)
  showNameModal.value = false
  if (pendingAction.value) {
    executeAction(pendingAction.value)
    pendingAction.value = null
  }
}

const executeAction = async (action: any) => {
  try {
    if (action.type === 'comment') {
      await postGuestComment(
        token, 
        'creative', // Assuming commenting on creatives for now
        action.payload.entityId, 
        action.payload.text, 
        guestName.value
      )
      toast.add({ title: 'Comment posted', color: 'green' })
      // Refresh data to show new comment (simplified)
      // In a real app, we'd push to the local array
    } else if (action.type === 'approve') {
      await submitGuestApproval(token, action.payload.creativeId, action.payload.status)
      toast.add({ title: `Creative ${action.payload.status}`, color: 'green' })
      // Update local state
      const creative = data.value.creatives.find((c: any) => c.id === action.payload.creativeId)
      if (creative) creative.status = action.payload.status
    }
  } catch (err) {
    toast.add({ title: 'Action failed', color: 'red' })
  }
}

// Handlers passed to components
const handleComment = (creativeId: string, text: string) => {
  requireGuestName({ type: 'comment', payload: { entityId: creativeId, text } })
}

const handleApprove = (creativeId: string) => {
  requireGuestName({ type: 'approve', payload: { creativeId, status: 'approved' } })
}

const handleReject = (creativeId: string) => {
  requireGuestName({ type: 'approve', payload: { creativeId, status: 'rejected' } })
}
</script>

<template>
  <div class="min-h-screen bg-gray-950 text-white">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center h-screen">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin text-4xl text-primary-500" />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex flex-col items-center justify-center h-screen space-y-4">
      <UIcon name="i-heroicons-exclamation-circle" class="text-5xl text-red-500" />
      <h1 class="text-2xl font-bold">Access Denied</h1>
      <p class="text-gray-400">{{ error }}</p>
    </div>

    <!-- Content -->
    <div v-else class="max-w-7xl mx-auto px-4 py-8">
      <!-- Header -->
      <header class="flex items-center justify-between mb-8 pb-6 border-b border-gray-800">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <UBadge color="primary" variant="subtle">Ad Set Review</UBadge>
            <span v-if="guestName" class="text-sm text-gray-400">Viewing as {{ guestName }}</span>
          </div>
          <h1 class="text-3xl font-bold">{{ data.name }}</h1>
          <p class="text-gray-400 mt-1">{{ data.audience_description || 'No description provided' }}</p>
        </div>
        <div class="flex gap-2">
           <!-- Actions if needed -->
        </div>
      </header>

      <!-- Creatives Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="creative in data.creatives" 
          :key="creative.id"
          class="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 group"
        >
          <!-- Preview -->
          <div class="aspect-video bg-gray-800 relative">
             <img 
               v-if="creative.thumbnail_url || creative.preview_url" 
               :src="creative.thumbnail_url || creative.preview_url" 
               class="w-full h-full object-cover"
             />
             <div v-else class="flex items-center justify-center h-full text-gray-600">
               <UIcon name="i-heroicons-photo" class="text-4xl" />
             </div>
             
             <!-- Status Badge -->
             <div class="absolute top-3 right-3">
               <UBadge 
                 :color="creative.status === 'approved' ? 'green' : creative.status === 'rejected' ? 'red' : 'yellow'"
               >
                 {{ creative.status }}
               </UBadge>
             </div>
          </div>

          <!-- Actions -->
          <div class="p-4 space-y-4">
            <div class="flex justify-between items-start">
              <h3 class="font-medium truncate">{{ creative.name }}</h3>
            </div>

            <div class="flex gap-2">
              <UButton 
                block 
                color="green" 
                variant="soft" 
                icon="i-heroicons-check"
                @click="handleApprove(creative.id)"
              >
                Approve
              </UButton>
              <UButton 
                block 
                color="red" 
                variant="soft" 
                icon="i-heroicons-x-mark"
                @click="handleReject(creative.id)"
              >
                Reject
              </UButton>
            </div>

            <!-- Simple Comment Input -->
            <div v-if="permissions.canComment" class="pt-4 border-t border-gray-800">
              <UInput 
                placeholder="Add a comment..." 
                icon="i-heroicons-chat-bubble-left"
                @keyup.enter="(e: any) => handleComment(creative.id, e.target.value)"
              >
                <template #trailing>
                  <kbd class="text-xs text-gray-500">Enter</kbd>
                </template>
              </UInput>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Guest Name Modal -->
    <UModal v-model="showNameModal">
      <div class="p-6 bg-gray-900 border border-gray-800 rounded-lg">
        <h3 class="text-lg font-bold mb-4 text-white">Who are you?</h3>
        <p class="text-gray-400 mb-4">Please enter your name to leave comments or approve assets.</p>
        <UInput v-model="guestName" placeholder="Your Name (e.g. John Doe)" class="mb-4" autofocus @keyup.enter="saveGuestName" />
        <div class="flex justify-end">
          <UButton @click="saveGuestName" color="primary">Continue</UButton>
        </div>
      </div>
    </UModal>
  </div>
</template>
