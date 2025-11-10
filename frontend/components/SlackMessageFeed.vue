<script setup lang="ts">
interface SlackMessage {
  id: string
  user_id: string
  user_name: string
  user_avatar?: string
  text: string
  thread_ts?: string
  ts: string
  channel_name: string
  channel_id: string
  attachments?: any[]
  timestamp: string
}

const props = defineProps<{
  limit?: number
}>()

const messages = ref<SlackMessage[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

// Fetch messages from all Slack channels via our server endpoint
async function fetchMessages() {
  loading.value = true
  error.value = null
  
  try {
    const data = await $fetch('/api/slack/feed', {
      query: {
        limit: props.limit || 50
      }
    })
    
    if (data.ok) {
      messages.value = data.messages as SlackMessage[]
    }
  } catch (e: any) {
    error.value = e.message || 'Failed to fetch messages'
    console.error('Error fetching Slack messages:', e)
  } finally {
    loading.value = false
  }
}

// Format timestamp for display
function formatTimestamp(ts: string): string {
  const date = new Date(parseFloat(ts) * 1000)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  
  return date.toLocaleDateString()
}

// Get user initials from name
function getInitials(name: string): string {
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

// Auto-refresh every 30 seconds
const refreshInterval = ref<NodeJS.Timeout>()

onMounted(() => {
  fetchMessages()
  refreshInterval.value = setInterval(fetchMessages, 30000)
})

onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
  }
})
</script>

<template>
  <div class="slack-message-feed">
    <!-- Loading State -->
    <div v-if="loading && messages.length === 0" class="space-y-2">
      <div v-for="i in 3" :key="i" class="bg-white/5 border border-white/10 rounded-lg p-3 animate-pulse">
        <div class="h-16"></div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-3 bg-error/20 border border-error rounded-lg">
      <p class="text-sm text-error">{{ error }}</p>
    </div>

    <!-- Messages List -->
    <div v-else-if="messages.length > 0" class="space-y-2 max-h-64 overflow-y-auto">
      <div 
        v-for="(message, index) in messages" 
        :key="message.id"
        :class="`p-3 ${index === 0 ? 'bg-primary-400/10 border-l-2 border-primary-400' : 'bg-white/5 border border-white/10'} rounded-lg hover:bg-primary-400/20 transition-colors cursor-pointer`"
      >
        <div class="flex">
          <div 
            v-if="message.user_avatar"
            class="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden"
          >
            <img :src="message.user_avatar" :alt="message.user_name" class="w-full h-full object-cover" />
          </div>
          <div 
            v-else
            class="w-8 h-8 rounded-full bg-white/10 backdrop-blur-xl flex-shrink-0 flex items-center justify-center text-xs font-medium text-white"
          >
            {{ getInitials(message.user_name) }}
          </div>
          <div class="ml-3 flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <div class="font-medium text-sm truncate text-white">{{ message.user_name }}</div>
              <div class="text-xs text-slate-400">{{ formatTimestamp(message.ts) }}</div>
            </div>
            <div class="text-xs text-slate-400 mt-0.5">
              {{ message.channel_name }}
            </div>
            <div :class="`mt-1 text-sm line-clamp-2 ${index === 0 ? 'font-medium text-white' : 'text-slate-300'}`">
              {{ message.text }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="p-6 text-center text-slate-400">
      <p class="text-sm">No messages yet</p>
    </div>
  </div>
</template>

<style scoped>
.slack-message-feed {
  @apply w-full;
}
</style>
