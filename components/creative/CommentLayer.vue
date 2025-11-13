<template>
  <div 
    ref="containerRef"
    class="relative w-full h-full"
    @click="handleCanvasClick"
    @mousemove="handleMouseMove"
  >
    <!-- Media element (image or video) -->
    <slot name="media" />
    
    <!-- Comment pins for existing comments -->
    <div
      v-for="comment in visibleComments"
      :key="comment.id"
      class="absolute w-8 h-8 -ml-4 -mt-4 cursor-pointer z-30 transition-transform hover:scale-110"
      :style="{
        left: `${comment.x_position}%`,
        top: `${comment.y_position}%`
      }"
      @click.stop="selectComment(comment)"
    >
      <!-- Comment pin icon -->
      <div 
        class="w-full h-full rounded-full flex items-center justify-center shadow-lg"
        :class="comment.resolved ? 'bg-green-500' : 'bg-blue-500'"
      >
        <span class="material-icons text-white text-sm">
          {{ comment.resolved ? 'check' : 'comment' }}
        </span>
      </div>
      
      <!-- Comment number badge -->
      <div class="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full border-2 border-blue-500 flex items-center justify-center text-xs font-bold">
        {{ getCommentNumber(comment) }}
      </div>
    </div>
    
    <!-- Collaborative cursors -->
    <CommentCursor 
      v-for="(cursor, userId) in cursors"
      :key="userId"
      :x="cursor.x"
      :y="cursor.y"
      :username="cursor.username"
      :user-id="userId"
    />
    
    <!-- Video timeline with markers -->
    <VideoTimeline
      v-if="isVideo && videoDuration > 0"
      :comments="comments"
      :video-duration="videoDuration"
      :current-time="currentVideoTime"
      @seek="handleSeek"
    />
    
    <!-- New comment form modal -->
    <div
      v-if="showCommentForm"
      class="absolute z-40 bg-white rounded-lg shadow-2xl p-4 w-96"
      :style="{
        left: `${newCommentPosition.x}px`,
        top: `${newCommentPosition.y}px`,
        transform: 'translate(-50%, -100%) translateY(-12px)'
      }"
    >
      <!-- Video timestamp indicator -->
      <div v-if="isVideo && newCommentPosition.videoTimestamp !== null" class="mb-2 flex items-center gap-2 text-sm text-gray-600">
        <span class="material-icons text-base">schedule</span>
        <span class="font-mono">{{ formatTimestamp(newCommentPosition.videoTimestamp) }}</span>
      </div>
      
      <div class="mb-2">
        <label class="block text-sm font-medium text-gray-700 mb-1">Add Comment</label>
        <textarea
          ref="commentInput"
          v-model="commentText"
          rows="3"
          class="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
          placeholder="Type your feedback here..."
          @keydown.esc="cancelComment"
        ></textarea>
      </div>
      
      <div class="flex justify-end gap-2">
        <button
          @click.stop="cancelComment"
          class="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          @click.stop="submitComment"
          class="px-3 py-1.5 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="!commentText.trim()"
        >
          Post Comment
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  assetId: string
  isVideo?: boolean
  enableCollaboration?: boolean
  videoDuration?: number  // In seconds
  currentVideoTime?: number  // In seconds
}

const props = withDefaults(defineProps<Props>(), {
  isVideo: false,
  enableCollaboration: false,
  videoDuration: 0,
  currentVideoTime: 0
})

const emit = defineEmits<{
  'comment-added': [comment: any]
  'comment-selected': [comment: any]
  'seek': [time: number]
}>()

// Composables
const { 
  comments, 
  loading, 
  addComment, 
  updateCommentStatus,
  timeOrderedComments,
  getCommentsAtTimestamp 
} = useAssetComments(props.assetId)

const {
  cursors,
  isCollaborationActive,
  enableCollaboration,
  disableCollaboration,
  updateMousePosition
} = useCollaborativeCursors(props.assetId)

// Refs
const containerRef = ref<HTMLElement | null>(null)
const commentInput = ref<HTMLTextAreaElement | null>(null)
const showCommentForm = ref(false)
const commentText = ref('')
const newCommentPosition = ref({ 
  x: 0, 
  y: 0, 
  xPercent: 0, 
  yPercent: 0, 
  videoTimestamp: null as number | null 
})

// Visible comments (filter by video timestamp if applicable)
const visibleComments = computed(() => {
  if (!props.isVideo) {
    // For images, show all spatial comments
    return comments.value.filter(c => c.x_position !== null && c.y_position !== null)
  }
  
  // For videos, show comments at current timestamp (within 2 seconds tolerance)
  if (props.currentVideoTime > 0) {
    return getCommentsAtTimestamp(props.currentVideoTime, 2)
  }
  
  return []
})

// Handle canvas clicks to add new comments
const handleCanvasClick = (event: MouseEvent) => {
  // Don't open new form if one is already open
  if (showCommentForm.value || !containerRef.value) return
  
  const rect = containerRef.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  
  // Convert to percentage
  const xPercent = (x / rect.width) * 100
  const yPercent = (y / rect.height) * 100
  
  // Capture video timestamp if applicable
  const videoTimestamp = props.isVideo ? props.currentVideoTime : null
  
  newCommentPosition.value = {
    x,
    y,
    xPercent,
    yPercent,
    videoTimestamp
  }
  
  showCommentForm.value = true
  
  // Focus the textarea
  nextTick(() => {
    commentInput.value?.focus()
  })
}

// Submit new comment
const submitComment = async () => {
  if (!commentText.value.trim()) return
  
  try {
    const comment = await addComment({
      content: commentText.value,
      x_position: newCommentPosition.value.xPercent,
      y_position: newCommentPosition.value.yPercent,
      video_timestamp: newCommentPosition.value.videoTimestamp
    })
    
    emit('comment-added', comment)
    
    // Reset form
    commentText.value = ''
    showCommentForm.value = false
  } catch (error) {
    console.error('Error adding comment:', error)
    alert('Failed to add comment')
  }
}

// Cancel comment form
const cancelComment = () => {
  commentText.value = ''
  showCommentForm.value = false
}

// Select existing comment
const selectComment = (comment: any) => {
  emit('comment-selected', comment)
}

// Get comment number for display
const getCommentNumber = (comment: any) => {
  return comments.value.findIndex(c => c.id === comment.id) + 1
}

// Handle mouse movement for collaborative cursors
const handleMouseMove = (event: MouseEvent) => {
  if (!props.enableCollaboration || !isCollaborationActive.value || !containerRef.value) return
  
  const rect = containerRef.value.getBoundingClientRect()
  const x = ((event.clientX - rect.left) / rect.width) * 100
  const y = ((event.clientY - rect.top) / rect.height) * 100
  
  updateMousePosition(x, y)
}

// Handle video seek from timeline
const handleSeek = (time: number) => {
  emit('seek', time)
}

// Format timestamp for display
const formatTimestamp = (seconds: number | null): string => {
  if (seconds === null) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

// Watch collaboration prop and enable/disable
watch(() => props.enableCollaboration, (newVal) => {
  if (newVal) {
    enableCollaboration()
  } else {
    disableCollaboration()
  }
}, { immediate: true })
</script>

<style scoped>
.material-icons {
  font-family: 'Material Icons';
  font-weight: normal;
  font-style: normal;
  font-size: 16px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
}
</style>
