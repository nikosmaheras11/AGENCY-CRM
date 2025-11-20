<template>
  <div class="min-h-screen bg-gradient-dark p-6">
    <!-- Header -->
    <div class="max-w-7xl mx-auto mb-8">
      <div class="flex items-center justify-between mb-2">
        <h1 class="text-3xl font-bold text-white">Creative Requests</h1>
        <button 
          @click="showRequestForm = true"
          class="px-6 py-3 bg-gradient-primary text-white rounded-lg font-medium hover:shadow-primary transition-all flex items-center gap-2"
        >
          <span class="material-icons">add</span>
          <span>New Request</span>
        </button>
      </div>
      <p class="text-gray-400">Manage and track all your creative requests in real-time</p>
    </div>

    <!-- Requests List -->
    <div class="max-w-7xl mx-auto">
      <RequestsList 
        @create-request="showRequestForm = true"
        @view-request="handleViewRequest"
      />
    </div>

    <!-- Request Form Modal -->
    <RequestFormModal 
      ref="requestFormModal"
      @submitted="handleRequestSubmitted"
    />

    <!-- Brief View Modal (for new-request & in-progress) -->
    <BriefViewModal 
      v-model="showBriefModal"
      :brief-id="selectedBriefId"
    />

    <!-- Asset Detail Modal (for needs-review, needs-edit, done) -->
    <CampaignDetailPanel 
      v-model="showAssetModal"
      :request-id="selectedRequestId"
    />
  </div>
</template>

<script setup lang="ts">
import RequestsList from '~/components/creative/RequestsList.vue'
import RequestFormModal from '~/components/creative/RequestFormModal.vue'
import BriefViewModal from '~/components/BriefViewModal.vue'
import CampaignDetailPanel from '~/components/CampaignDetailPanel.vue'

const requestFormModal = ref<any>(null)
const showRequestForm = ref(false)

// Brief modal state (for new-request & in-progress)
const showBriefModal = ref(false)
const selectedBriefId = ref<string | null>(null)

// Asset modal state (for needs-review, needs-edit, done)
const showAssetModal = ref(false)
const selectedRequestId = ref<string | null>(null)

watch(showRequestForm, (show) => {
  if (show && requestFormModal.value) {
    requestFormModal.value.open()
    showRequestForm.value = false
  }
})

const handleRequestSubmitted = (requestId: string) => {
  console.log('Request submitted:', requestId)
  // Could show a toast notification here
}

// Route to appropriate modal based on status
const handleViewRequest = (request: any) => {
  console.log('🔍 handleViewRequest called with:', { id: request.id, status: request.status, request })
  
  const briefStatuses = ['new-request', 'in-progress']
  const assetStatuses = ['needs-review', 'needs-edit', 'done']
  
  if (briefStatuses.includes(request.status)) {
    // Open brief modal
    console.log('📋 Opening BriefViewModal for status:', request.status)
    selectedBriefId.value = request.id
    showBriefModal.value = true
  } else if (assetStatuses.includes(request.status)) {
    // Open asset detail modal
    console.log('🎨 Opening CampaignDetailPanel for status:', request.status)
    selectedRequestId.value = request.id
    showAssetModal.value = true
  } else {
    console.warn('⚠️ Unknown status:', request.status)
  }
}

// Set page title
useHead({
  title: 'Creative Requests - Agency Dashboard'
})
</script>
