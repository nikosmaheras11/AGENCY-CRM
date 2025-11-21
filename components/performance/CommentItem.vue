<template>
  <div 
    class="p-3 rounded-lg border"
    :class="comment.resolved ? 'bg-gray-900/30 border-gray-800' : 'bg-gray-800/50 border-gray-700'"
  >
    <!-- Header -->
    <div class="flex items-start justify-between mb-2">
      <div class="flex items-center gap-2">
        <!-- Avatar -->
        <div class="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-medium">
          {{ (comment.author_name || comment.author).charAt(0).toUpperCase() }}
        </div>
        <!-- Author & Time -->
        <div>
          <div class="text-sm font-medium text-white">{{ comment.author_name || comment.author }}</div>
          <div class="text-xs text-gray-500">{{ formatTimestamp(comment.created_at) }}</div>
        </div>
      </div>
      <!-- Resolved Badge -->
      <span 
        v-if="comment.resolved"
        class="px-2 py-0.5 text-xs rounded-full bg-secondary/20 text-secondary"
      >
        ✓ Resolved
      </span>
    </div>

    <!-- Comment Text -->
    <p class="text-sm text-gray-300 whitespace-pre-wrap mb-3">{{ comment.text }}</p>

    <!-- Actions -->
    <div class="flex items-center gap-3 text-xs">
      <button 
        class="text-gray-500 hover:text-gray-300 transition-colors"
        @click="showReplyBox = !showReplyBox"
      >
        Reply
      </button>
      <button 
        class="text-gray-500 hover:text-gray-300 transition-colors"
        @click="$emit('resolve', comment.id)"
      >
        {{ comment.resolved ? 'Unresolve' : 'Resolve' }}
      </button>
    </div>

    <!-- Reply Box -->
    <div v-if="showReplyBox" class="mt-3 pl-4 border-l-2 border-gray-700">
      <textarea
        v-model="replyText"
        class="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm text-gray-300 resize-none focus:outline-none focus:border-gray-600"
        placeholder="Write a reply..."
        rows="2"
      />
      <div class="flex justify-end gap-2 mt-2">
        <button
          class="px-3 py-1 text-xs text-gray-400 hover:text-gray-200"
          @click="showReplyBox = false; replyText = ''"
        >
          Cancel
        </button>
        <button
          class="px-3 py-1 text-xs bg-primary-500 hover:bg-primary-600 rounded"
          @click="submitReply"
        >
          Reply
        </button>
      </div>
    </div>

    <!-- Nested Replies -->
    <div v-if="comment.replies?.length" class="mt-3 pl-4 border-l-2 border-gray-700 space-y-2">
      <PerformanceCommentItem
        v-for="reply in comment.replies"
        :key="reply.id"
        :comment="reply"
        @reply="(parentId, text) => $emit('reply', parentId, text)"
        @resolve="(id) => $emit('resolve', id)"
        @delete="(id) => $emit('delete', id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PerformanceComment } from '~/composables/usePerformanceComments'

interface Props {
  comment: PerformanceComment
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'reply', parentId: string, text: string): void
  (e: 'resolve', id: string): void
  (e: 'delete', id: string): void
}>()

const showReplyBox = ref(false)
const replyText = ref('')

const submitReply = () => {
  if (!replyText.value.trim()) return
  emit('reply', props.comment.id, replyText.value.trim())
  replyText.value = ''
  showReplyBox.value = false
}

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}
</script>
