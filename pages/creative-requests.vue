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
      <RequestsList @create-request="showRequestForm = true" />
    </div>

    <!-- Request Form Modal -->
    <RequestFormModal 
      ref="requestFormModal"
      @submitted="handleRequestSubmitted"
    />
  </div>
</template>

<script setup lang="ts">
import RequestsList from '~/components/creative/RequestsList.vue'
import RequestFormModal from '~/components/creative/RequestFormModal.vue'

const requestFormModal = ref<any>(null)
const showRequestForm = ref(false)

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

// Set page title
useHead({
  title: 'Creative Requests - Agency Dashboard'
})
</script>
