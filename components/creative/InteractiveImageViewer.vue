<template>
  <div class="interactive-image-viewer">
    <div 
      ref="imageContainer"
      class="image-container"
      :class="{ 'commenting-mode': isCommentingEnabled }"
      @click="handleImageClick"
    >
      <!-- The actual image -->
      <img 
        :src="imageUrl" 
        :alt="altText"
        class="viewer-image"
        @load="onImageLoad"
      />
      
      <!-- Spatial comment markers overlay -->
      <SpatialCommentMarkers
        :spatial-comments="spatialComments"
        :active-comment-id="activeCommentId"
        :pending-comment="pendingComment"
        @select-comment="handleSelectComment"
      />
      
      <!-- Click instruction overlay -->
      <div v-if="isCommentingEnabled && !pendingComment" class="click-instruction">
        <div class="instruction-bubble">
          📍 Click anywhere to add a comment
        </div>
      </div>
    </div>
    
    <!-- Comment input modal (appears after clicking) -->
    <div 
      v-if="pendingComment" 
      class="comment-input-modal"
      :style="{
        left: `${pendingComment.screenX}px`,
        top: `${pendingComment.screenY}px`
      }"
    >
      <div class="modal-content">
        <div class="modal-header">
          <span>Add Comment</span>
          <button class="close-btn" @click="cancelComment">✕</button>
        </div>
        <textarea
          ref="commentTextarea"
          v-model="commentText"
          placeholder="What needs to change?"
          class="comment-textarea"
          rows="3"
          @keydown.meta.enter="submitComment"
          @keydown.ctrl.enter="submitComment"
          @keydown.esc="cancelComment"
        />
        <div class="modal-footer">
          <button class="btn-cancel" @click="cancelComment">Cancel</button>
          <button 
            class="btn-submit" 
            :disabled="!commentText.trim() || isSubmitting"
            @click="submitComment"
          >
            {{ isSubmitting ? 'Posting...' : 'Post' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SpatialCommentMarkers from './SpatialCommentMarkers.vue'

interface SpatialComment {
  id: string
  x_position: number
  y_position: number
  author: string
  text: string
  created_at: string
  resolved: boolean
  replies?: any[]
}

interface Props {
  imageUrl: string
  spatialComments: SpatialComment[]
  altText?: string
  isCommentingEnabled?: boolean
  activeCommentId?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  altText: 'Image',
  isCommentingEnabled: true,
  activeCommentId: null
})

const emit = defineEmits<{
  'add-comment': [payload: { x: number; y: number; text: string }]
  'select-comment': [commentId: string]
}>()

const imageContainer = ref<HTMLElement | null>(null)
const commentTextarea = ref<HTMLTextAreaElement | null>(null)
const pendingComment = ref<{
  x: number
  y: number
  screenX: number
  screenY: number
} | null>(null)
const commentText = ref('')
const isSubmitting = ref(false)
const imageLoaded = ref(false)

const onImageLoad = () => {
  imageLoaded.value = true
}

const handleImageClick = (event: MouseEvent) => {
  if (!props.isCommentingEnabled || !imageLoaded.value) return
  if (pendingComment.value) return // Already placing a comment
  
  const container = imageContainer.value
  if (!container) return
  
  // Get click position relative to image container
  const rect = container.getBoundingClientRect()
  const x = ((event.clientX - rect.left) / rect.width) * 100
  const y = ((event.clientY - rect.top) / rect.height) * 100
  
  // Clamp values between 0-100
  const clampedX = Math.max(0, Math.min(100, x))
  const clampedY = Math.max(0, Math.min(100, y))
  
  // Set pending comment with both relative (%) and screen (px) positions
  pendingComment.value = {
    x: clampedX,
    y: clampedY,
    screenX: event.clientX + 10,
    screenY: event.clientY + 10
  }
  
  // Focus textarea on next tick
  nextTick(() => {
    commentTextarea.value?.focus()
  })
}

const handleSelectComment = (commentId: string) => {
  emit('select-comment', commentId)
}

const submitComment = async () => {
  if (!commentText.value.trim() || !pendingComment.value || isSubmitting.value) return
  
  isSubmitting.value = true
  
  try {
    emit('add-comment', {
      x: pendingComment.value.x,
      y: pendingComment.value.y,
      text: commentText.value.trim()
    })
    
    // Reset state
    commentText.value = ''
    pendingComment.value = null
  } catch (error) {
    console.error('Error submitting comment:', error)
  } finally {
    isSubmitting.value = false
  }
}

const cancelComment = () => {
  commentText.value = ''
  pendingComment.value = null
}
</script>

<style scoped>
.interactive-image-viewer {
  position: relative;
  width: 100%;
  height: 100%;
}

.image-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.image-container.commenting-mode {
  cursor: crosshair;
}

.viewer-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.click-instruction {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
  z-index: 20;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.instruction-bubble {
  background: rgba(0, 0, 0, 0.85);
  color: white;
  padding: 10px 20px;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.comment-input-modal {
  position: fixed;
  z-index: 100;
  animation: modalSlideIn 0.2s ease;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  width: 320px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  font-weight: 600;
  font-size: 14px;
  color: #111827;
}

.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  line-height: 1;
  transition: color 0.15s;
}

.close-btn:hover {
  color: #111827;
}

.comment-textarea {
  width: 100%;
  padding: 12px 16px;
  border: none;
  font-size: 14px;
  font-family: inherit;
  resize: none;
  outline: none;
  color: #111827;
  background: white;
}

.comment-textarea::placeholder {
  color: #9ca3af;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 16px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.btn-cancel,
.btn-submit {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-cancel {
  background: white;
  border: 1px solid #d1d5db;
  color: #374151;
}

.btn-cancel:hover {
  background: #f9fafb;
}

.btn-submit {
  background: #3b82f6;
  border: none;
  color: white;
}

.btn-submit:hover:not(:disabled) {
  background: #2563eb;
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
