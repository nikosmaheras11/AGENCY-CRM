<script setup lang="ts">
import { readItems } from '@directus/sdk'

interface SlackMessage {
  id: string
  channel_name: string
  user_name: string
  text: string
  thread_ts?: string
  ts: string
  attachments?: Array<{
    id: string
    name: string
    mimetype: string
    url: string
    permalink: string
  }>
  sector: string
  created_at: string
}

const props = defineProps<{
  sector?: string
  limit?: number
}>()

const { client } = useDirectus()
const messages = ref<SlackMessage[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

// Fetch messages from Directus
async function fetchMessages() {
  loading.value = true
  error.value = null
  
  try {
    const filter: any = {}
    
    // Filter by sector if provided
    if (props.sector) {
      filter.sector = { _eq: props.sector }
    }
    
    const result = await client.request(
      readItems('slack_messages', {
        filter,
        sort: ['-created_at'],
        limit: props.limit || 50
      })
    )
    
    messages.value = result as SlackMessage[]
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
  if (diffDays < 7) return `${diffDays}d ago`
  
  return date.toLocaleDateString()
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
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold">
        Slack Feed
        <span v-if="sector" class="text-sm text-gray-500 ml-2">
          ({{ sector }})
        </span>
      </h3>
      <UButton 
        icon="i-heroicons-arrow-path" 
        size="sm" 
        variant="ghost"
        :loading="loading"
        @click="fetchMessages"
      >
        Refresh
      </UButton>
    </div>

    <!-- Loading State -->
    <div v-if="loading && messages.length === 0" class="space-y-4">
      <USkeleton v-for="i in 3" :key="i" class="h-24" />
    </div>

    <!-- Error State -->
    <UAlert 
      v-else-if="error" 
      color="red" 
      variant="soft"
      title="Error loading messages"
      :description="error"
    />

    <!-- Messages List -->
    <div v-else-if="messages.length > 0" class="space-y-3">
      <UCard 
        v-for="message in messages" 
        :key="message.id"
        class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <div class="flex gap-3">
          <!-- Avatar -->
          <UAvatar 
            :alt="message.user_name" 
            size="sm"
          />
          
          <!-- Content -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="font-medium text-sm">{{ message.user_name }}</span>
              <span class="text-xs text-gray-500">
                {{ formatTimestamp(message.ts) }}
              </span>
              <UBadge 
                :label="message.channel_name" 
                size="xs" 
                variant="subtle"
              />
            </div>
            
            <!-- Message Text -->
            <p class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {{ message.text }}
            </p>
            
            <!-- Attachments -->
            <div v-if="message.attachments && message.attachments.length > 0" class="mt-2 space-y-2">
              <a
                v-for="attachment in message.attachments"
                :key="attachment.id"
                :href="attachment.permalink"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800"
              >
                <UIcon name="i-heroicons-paper-clip" />
                {{ attachment.name }}
              </a>
            </div>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Empty State -->
    <UCard v-else>
      <div class="text-center py-8 text-gray-500">
        <UIcon name="i-heroicons-chat-bubble-left-right" class="w-12 h-12 mx-auto mb-2" />
        <p>No messages yet</p>
        <p class="text-sm mt-1">Messages will appear here when posted in your Slack channels</p>
      </div>
    </UCard>
  </div>
</template>

<style scoped>
.slack-message-feed {
  @apply w-full;
}
</style>
