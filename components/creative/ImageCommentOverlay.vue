<template>
  <div 
    ref="containerRef"
    class="relative w-full h-full"
    @click="handleImageClick"
  >
    <!-- Image -->
    <img 
      :src="imageUrl" 
      :alt="alt"
      class="w-full h-full object-contain"
    />
    
    <!-- Comment markers -->
    <div
      v-for="comment in comments"
      :key="comment.id"
      class="absolute w-8 h-8 -ml-4 -mt-4 cursor-pointer z-10 transition-transform hover:scale-110"
      :style="{
        left: `${comment.x_position}%`,
        top: `${comment.y_position}%`
      }"
      @click.stop="selectComment(comment)"
    >
      <!-- Comment pin -->
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
        {{ getCommentNumber(comment.id) }}
      </div>
    </div>
    
    <!-- New comment form -->
    <div
      v-if="showCommentForm"
      class="absolute z-20 bg-white rounded-lg shadow-xl p-4 w-80"
      :style="{
        left: `${newCommentPosition.x}px`,
        top: `${newCommentPosition.y}px`,
        transform: 'translate(-50%, -100%) translateY(-12px)'
      }"
    >
      <div class="mb-2">
        <label class="block text-sm font-medium text-gray-700 mb-1">Add Comment</label>
        <textarea
          ref="commentInput"
          v-model="commentText"
          rows="3"
          class="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          placeholder="Type your feedback here..."
          @keydown.esc="cancelComment"
        ></textarea>
      </div>
      
      <div class="flex justify-end gap-2">
        <button
          @click="cancelComment"
          class="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          @click="submitComment"
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
interface Comment {
  id: string
  text: string
  x_position: number
  y_position: number
  resolved: boolean
  author: string
  created_at: string
}

interface Props {
  imageUrl: string
  alt?: string
  comments?: Comment[]
  requestId: string
}

const props = withDefaults(defineProps<Props>(), {
  alt: 'Image',
  comments: () => []
})

const emit = defineEmits<{
  'comment-added': [comment: any]
  'comment-selected': [comment: Comment]
}>()

const containerRef = ref<HTMLElement | null>(null)
const commentInput = ref<HTMLTextAreaElement | null>(null)
const showCommentForm = ref(false)
const commentText = ref('')
const newCommentPosition = ref({ x: 0, y: 0, xPercent: 0, yPercent: 0 })

const { supabase } = useSupabase()

const handleImageClick = (event: MouseEvent) => {
  if (!containerRef.value) return
  
  const rect = containerRef.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  
  // Convert to percentage
  const xPercent = (x / rect.width) * 100
  const yPercent = (y / rect.height) * 100
  
  newCommentPosition.value = {
    x,
    y,
    xPercent,
    yPercent
  }
  
  showCommentForm.value = true
  
  // Focus the textarea
  nextTick(() => {
    commentInput.value?.focus()
  })
}

const submitComment = async () => {
  if (!commentText.value.trim()) return
  
  try {
    const { data: user } = await supabase.auth.getUser()
    
    const { data, error } = await supabase
      .from('comments')
      .insert({
        request_id: props.requestId,
        text: commentText.value,
        x_position: newCommentPosition.value.xPercent,
        y_position: newCommentPosition.value.yPercent,
        author: user.user?.user_metadata?.full_name || user.user?.email || 'Anonymous',
        author_id: user.user?.id,
        resolved: false
      })
      .select()
      .single()
    
    if (error) throw error
    
    emit('comment-added', data)
    
    // Reset form
    commentText.value = ''
    showCommentForm.value = false
  } catch (error) {
    console.error('Error adding comment:', error)
    alert('Failed to add comment')
  }
}

const cancelComment = () => {
  commentText.value = ''
  showCommentForm.value = false
}

const selectComment = (comment: Comment) => {
  emit('comment-selected', comment)
}

const getCommentNumber = (commentId: string) => {
  return props.comments.findIndex(c => c.id === commentId) + 1
}
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
