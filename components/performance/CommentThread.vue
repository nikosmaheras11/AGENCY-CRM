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
      </UButton>
    </div>

    <div v-if="!isCollapsed">
      <!-- Comment List -->
      <div v-if="comments.length > 0" class="space-y-3">
        <PerformanceCommentItem
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
