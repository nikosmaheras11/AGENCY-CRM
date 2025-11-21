<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold text-white flex items-center gap-2">
        <UIcon name="i-heroicons-chat-bubble-left-right" />
        Comments
        <span v-if="comments.length > 0" class="text-sm text-gray-500">({{ comments.length }})</span>
      </h3>
      <UButton
        v-if="comments.length > 0"
        size="xs"
        variant="ghost"
        @click="isCollapsed = !isCollapsed"
      >
        {{ isCollapsed ? 'Expand' : 'Collapse' }}
      </UIcon>
    </div>

    <div v-if="!isCollapsed">
      <!-- Comment List -->
      <div v-if="comments.length > 0" class="space-y-3">
        <CommentItem
          v-for="comment in comments"
          :key="comment.id"
          :comment="comment"
          @reply="handleReply"
          @resolve="handleResolve"
          @delete="handleDelete"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-8 border-2 border-dashed border-gray-700 rounded-lg">
        <UIcon name="i-heroicons-chat-bubble-left" class="text-4xl text-gray-600 mb-2" />
        <p class="text-sm text-gray-500">No comments yet. Be the first to comment!</p>
      </div>

      <!-- New Comment Input -->
      <div class="mt-4">
        <div class="flex gap-2">
          <UTextarea
            v-model="newCommentText"
            placeholder="Add a comment..."
            :rows="2"
            class="flex-1"
            @keydown.meta.enter="submitComment"
            @keydown.ctrl.enter="submitComment"
          />
        </div>
        <div class="flex items-center justify-between mt-2">
          <span class="text-xs text-gray-500">⌘ + Enter to submit</span>
          <UButton
            :disabled="!newCommentText.trim() || submitting"
            :loading="submitting"
            @click="submitComment"
          >
            Comment
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PerformanceComment } from '~/composables/usePerformanceComments'

interface Props {
  entityType: 'campaign' | 'ad_set' | 'creative'
  entityId: string
}

const props = defineProps<Props>()

const { 
  comments, 
  loading, 
  fetchComments, 
  createComment, 
  replyToComment, 
  toggleResolve, 
  deleteComment,
  subscribeToComments
} = usePerformanceComments()

const toast = useToast()
const newCommentText = ref('')
const submitting = ref(false)
const isCollapsed = ref(false)

// Load comments on mount
onMounted(async () => {
  await fetchComments(props.entityType, props.entityId)
  subscribeToComments(props.entityType, props.entityId)
})

const submitComment = async () => {
  if (!newCommentText.value.trim() || submitting.value) return

  try {
    submitting.value = true
    await createComment(props.entityType, props.entityId, newCommentText.value.trim())
    newCommentText.value = ''
    toast.add({ title: 'Comment posted', color: 'green' })
  } catch (error) {
    console.error('Failed to post comment:', error)
    toast.add({ title: 'Failed to post comment', color: 'red' })
  } finally {
    submitting.value = false
  }
}

const handleReply = async (parentCommentId: string, text: string) => {
  try {
    await replyToComment(props.entityType, props.entityId, parentCommentId, text)
    toast.add({ title: 'Reply posted', color: 'green' })
  } catch (error) {
    console.error('Failed to post reply:', error)
    toast.add({ title: 'Failed to post reply', color: 'red' })
  }
}

const handleResolve = async (commentId: string) => {
  try {
    await toggleResolve(commentId)
    toast.add({ title: 'Comment updated', color: 'green' })
  } catch (error) {
    console.error('Failed to resolve comment:', error)
    toast.add({ title: 'Failed to update comment', color: 'red' })
  }
}

const handleDelete = async (commentId: string) => {
  try {
    await deleteComment(commentId)
    toast.add({ title: 'Comment deleted', color: 'green' })
  } catch (error) {
    console.error('Failed to delete comment:', error)
    toast.add({ title: 'Failed to delete comment', color: 'red' })
  }
}
</script>

<!-- Comment Item Component -->
<script setup lang="ts">
const CommentItem = defineComponent({
  name: 'CommentItem',
  props: {
    comment: {
      type: Object as PropType<PerformanceComment>,
      required: true
    }
  },
  emits: ['reply', 'resolve', 'delete'],
  setup(props, { emit }) {
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

    return () => h('div', {
      class: [
        'p-3 rounded-lg border',
        props.comment.resolved ? 'bg-gray-900/30 border-gray-800' : 'bg-gray-800/50 border-gray-700'
      ]
    }, [
      // Header
      h('div', { class: 'flex items-start justify-between mb-2' }, [
        h('div', { class: 'flex items-center gap-2' }, [
          // Avatar
          h('div', { class: 'w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-medium' },
            (props.comment.author_name || props.comment.author).charAt(0).toUpperCase()
          ),
          // Author & Time
          h('div', [
            h('div', { class: 'text-sm font-medium text-white' }, props.comment.author_name || props.comment.author),
            h('div', { class: 'text-xs text-gray-500' }, formatTimestamp(props.comment.created_at))
          ])
        ]),
        // Resolved Badge
        props.comment.resolved && h('span', {
          class: 'px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-400'
        }, '✓ Resolved')
      ]),

      // Comment Text
      h('p', { class: 'text-sm text-gray-300 whitespace-pre-wrap mb-3' }, props.comment.text),

      // Actions
      h('div', { class: 'flex items-center gap-3 text-xs' }, [
        h('button', {
          class: 'text-gray-500 hover:text-gray-300 transition-colors',
          onClick: () => { showReplyBox.value = !showReplyBox.value }
        }, 'Reply'),
        h('button', {
          class: 'text-gray-500 hover:text-gray-300 transition-colors',
          onClick: () => emit('resolve', props.comment.id)
        }, props.comment.resolved ? 'Unresolve' : 'Resolve')
      ]),

      // Reply Box
      showReplyBox.value && h('div', { class: 'mt-3 pl-4 border-l-2 border-gray-700' }, [
        h('textarea', {
          class: 'w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm text-gray-300 resize-none focus:outline-none focus:border-gray-600',
          placeholder: 'Write a reply...',
          rows: 2,
          value: replyText.value,
          onInput: (e: Event) => { replyText.value = (e.target as HTMLTextAreaElement).value }
        }),
        h('div', { class: 'flex justify-end gap-2 mt-2' }, [
          h('button', {
            class: 'px-3 py-1 text-xs text-gray-400 hover:text-gray-200',
            onClick: () => { showReplyBox.value = false; replyText.value = '' }
          }, 'Cancel'),
          h('button', {
            class: 'px-3 py-1 text-xs bg-primary-500 hover:bg-primary-600 rounded',
            onClick: submitReply
          }, 'Reply')
        ])
      ]),

      // Nested Replies
      props.comment.replies && props.comment.replies.length > 0 && h('div', { class: 'mt-3 pl-4 border-l-2 border-gray-700 space-y-2' },
        props.comment.replies.map(reply => h(CommentItem, {
          comment: reply,
          onReply: (parentId: string, text: string) => emit('reply', parentId, text),
          onResolve: (id: string) => emit('resolve', id),
          onDelete: (id: string) => emit('delete', id)
        }))
      )
    ])
  }
})
</script>
