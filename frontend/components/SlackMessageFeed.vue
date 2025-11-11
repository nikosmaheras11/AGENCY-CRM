<script setup lang="ts">
interface SlackMessage {
  id: any
  user_id: any
  user_name: any
  user_avatar?: any
  text: any
  thread_ts?: any
  ts: any
  channel_name: any
  channel_id: any
  attachments?: any[]
  timestamp: any
  permalink?: any
  reactions?: any
}

const props = defineProps<{
  limit?: number
}>()

const loading = ref(false)
const error = ref<string | null>(null)

// Mock data for the 4 Polymarket channels
const messages = ref<SlackMessage[]>([
  {
    id: '1',
    user_id: 'U001',
    user_name: 'Sarah Chen',
    text: 'Just wrapped up the Q4 creative review. Great work team! 🎨',
    ts: String(Date.now() / 1000 - 300), // 5 minutes ago
    channel_name: 'hours-creative-polymarket',
    channel_id: 'C09HBDKSUGH',
    timestamp: new Date(Date.now() - 300000).toISOString()
  },
  {
    id: '2',
    user_id: 'U002',
    user_name: 'Mike Rodriguez',
    text: 'Campaign performance looking strong this week. CTR up 23% 📈',
    ts: String(Date.now() / 1000 - 1200), // 20 minutes ago
    channel_name: 'hours-performance-polymarket',
    channel_id: 'C09F44R90UX',
    timestamp: new Date(Date.now() - 1200000).toISOString()
  },
  {
    id: '3',
    user_id: 'U003',
    user_name: 'Alex Kim',
    text: 'New creative request: Need 3 video variations for the launch campaign by Friday',
    ts: String(Date.now() / 1000 - 3600), // 1 hour ago
    channel_name: 'polymarket-creative-requests',
    channel_id: 'C09RDUX4198',
    timestamp: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: '4',
    user_id: 'U004',
    user_name: 'Jordan Taylor',
    text: 'UGC submissions for this week are looking fantastic! Let\'s review tomorrow',
    ts: String(Date.now() / 1000 - 5400), // 1.5 hours ago
    channel_name: 'polymarket-ugc-hours',
    channel_id: 'C09RJ82TFPG',
    timestamp: new Date(Date.now() - 5400000).toISOString()
  },
  {
    id: '5',
    user_id: 'U001',
    user_name: 'Sarah Chen',
    text: 'Updated the brand guidelines doc with the new color palette',
    ts: String(Date.now() / 1000 - 7200), // 2 hours ago
    channel_name: 'hours-creative-polymarket',
    channel_id: 'C09HBDKSUGH',
    timestamp: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: '6',
    user_id: 'U002',
    user_name: 'Mike Rodriguez',
    text: 'A/B test results are in - Variant B is the clear winner!',
    ts: String(Date.now() / 1000 - 10800), // 3 hours ago
    channel_name: 'hours-performance-polymarket',
    channel_id: 'C09F44R90UX',
    timestamp: new Date(Date.now() - 10800000).toISOString()
  },
  {
    id: '7',
    user_id: 'U005',
    user_name: 'Chris Martinez',
    text: 'Can we prioritize the Instagram Stories templates? Client needs them ASAP',
    ts: String(Date.now() / 1000 - 14400), // 4 hours ago
    channel_name: 'polymarket-creative-requests',
    channel_id: 'C09RDUX4198',
    timestamp: new Date(Date.now() - 14400000).toISOString()
  },
  {
    id: '8',
    user_id: 'U004',
    user_name: 'Jordan Taylor',
    text: 'Received 47 new UGC submissions today. Quality is excellent! 🌟',
    ts: String(Date.now() / 1000 - 18000), // 5 hours ago
    channel_name: 'polymarket-ugc-hours',
    channel_id: 'C09RJ82TFPG',
    timestamp: new Date(Date.now() - 18000000).toISOString()
  }
])

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

// Using mock data - no auto-refresh needed
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
