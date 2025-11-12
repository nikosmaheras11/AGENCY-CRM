<template>
  <div class="requests-list">
    <!-- Connection Status Banner -->
    <div 
      v-if="connectionStatus !== 'connected'" 
      class="mb-4 px-4 py-3 rounded-lg border"
      :class="{
        'bg-yellow-500/10 border-yellow-500/20 text-yellow-200': connectionStatus === 'connecting',
        'bg-red-500/10 border-red-500/20 text-red-200': connectionStatus === 'disconnected'
      }"
    >
      <div class="flex items-center gap-2">
        <span class="material-icons text-sm animate-pulse">
          {{ connectionStatus === 'connecting' ? 'sync' : 'sync_problem' }}
        </span>
        <span class="text-sm">
          {{ connectionStatus === 'connecting' ? 'Connecting to real-time updates...' : 'Reconnecting...' }}
        </span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-16">
      <div class="flex flex-col items-center gap-4">
        <div class="w-12 h-12 border-4 border-primary-400 border-t-transparent rounded-full animate-spin"></div>
        <span class="text-sm text-gray-400">Loading requests...</span>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="requests.length === 0" class="text-center py-16">
      <div class="flex flex-col items-center gap-4">
        <span class="material-icons text-6xl text-gray-600">inbox</span>
        <h3 class="text-xl font-medium text-white">No requests yet</h3>
        <p class="text-gray-400">Create your first creative request to get started</p>
        <button 
          @click="$emit('create-request')"
          class="mt-4 px-6 py-3 bg-gradient-primary text-white rounded-lg font-medium hover:shadow-primary transition-all"
        >
          Create Request
        </button>
      </div>
    </div>

    <!-- Requests Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div 
        v-for="request in requests" 
        :key="request.id"
        class="request-card group bg-[#1a1d24] border border-white/10 rounded-xl p-5 hover:border-primary-400/50 transition-all cursor-pointer"
        @click="viewRequest(request.id)"
      >
        <!-- Header -->
        <div class="flex items-start justify-between mb-3">
          <div class="flex-1 min-w-0">
            <h3 class="text-lg font-semibold text-white truncate group-hover:text-primary-400 transition-colors">
              {{ request.title }}
            </h3>
            <p v-if="request.created_by_name" class="text-xs text-gray-400 mt-1">
              by {{ request.created_by_name }}
            </p>
          </div>
          
          <!-- Priority Badge -->
          <span 
            class="px-2 py-1 rounded text-xs font-medium flex-shrink-0 ml-2"
            :class="priorityClasses(request.priority)"
          >
            {{ request.priority }}
          </span>
        </div>

        <!-- Description -->
        <p v-if="request.description" class="text-sm text-gray-400 mb-4 line-clamp-2">
          {{ request.description }}
        </p>

        <!-- Metadata Row -->
        <div class="flex items-center gap-4 text-xs text-gray-400 mb-4">
          <div v-if="request.platform" class="flex items-center gap-1">
            <span class="material-icons text-sm">devices</span>
            <span>{{ request.platform }}</span>
          </div>
          <div v-if="request.dimensions" class="flex items-center gap-1">
            <span class="material-icons text-sm">aspect_ratio</span>
            <span>{{ request.dimensions }}</span>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between pt-4 border-t border-white/5">
          <!-- Status -->
          <span 
            class="px-2 py-1 rounded text-xs font-medium"
            :class="statusClasses(request.status)"
          >
            {{ formatStatus(request.status) }}
          </span>

          <!-- Due Date -->
          <div v-if="request.due_date" class="flex items-center gap-1 text-xs">
            <span class="material-icons text-sm" :class="isOverdue(request.due_date) ? 'text-red-400' : 'text-gray-400'">
              event
            </span>
            <span :class="isOverdue(request.due_date) ? 'text-red-400 font-medium' : 'text-gray-400'">
              {{ formatDate(request.due_date) }}
            </span>
          </div>
        </div>

        <!-- Asset Preview (if available) -->
        <div v-if="request.thumbnail_url || request.asset_file_url" class="mt-4 rounded-lg overflow-hidden">
          <img 
            :src="request.thumbnail_url || request.asset_file_url" 
            :alt="request.title"
            class="w-full h-32 object-cover"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { requests, loading, connectionStatus } = useRealtimeRequests()
const router = useRouter()

const emit = defineEmits<{
  'create-request': []
}>()

const formatDate = (dateString: string) => {
  if (!dateString) return 'No due date'
  const date = new Date(dateString)
  const today = new Date()
  const diffTime = date.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays === -1) return 'Yesterday'
  if (diffDays < 0) return `${Math.abs(diffDays)} days ago`
  if (diffDays <= 7) return `In ${diffDays} days`
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const isOverdue = (dateString: string) => {
  if (!dateString) return false
  return new Date(dateString) < new Date()
}

const formatStatus = (status: string) => {
  return status
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const priorityClasses = (priority: string) => {
  const classes = {
    urgent: 'bg-red-500/20 text-red-300 border border-red-500/30',
    high: 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
    medium: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    low: 'bg-green-500/20 text-green-300 border border-green-500/30'
  }
  return classes[priority as keyof typeof classes] || classes.medium
}

const statusClasses = (status: string) => {
  const classes = {
    'new-request': 'bg-yellow-500/20 text-yellow-300',
    'in-progress': 'bg-blue-500/20 text-blue-300',
    'needs-review': 'bg-orange-500/20 text-orange-300',
    'needs-edit': 'bg-red-500/20 text-red-300',
    'done': 'bg-green-500/20 text-green-300'
  }
  return classes[status as keyof typeof classes] || classes['new-request']
}

const viewRequest = (id: string) => {
  router.push(`/creative/asset/${id}`)
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.request-card {
  transition: all 0.2s ease;
}

.request-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(117, 81, 255, 0.15);
}
</style>
