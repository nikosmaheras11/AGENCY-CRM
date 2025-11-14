<template>
  <div class="spatial-comments-container">
    <!-- Comment pins overlaid on image -->
    <div
      v-for="(comment, index) in spatialComments"
      :key="comment.id"
      class="comment-marker"
      :style="{
        left: `${comment.x_position}%`,
        top: `${comment.y_position}%`
      }"
      :class="{ 
        'active': activeCommentId === comment.id,
        'resolved': comment.resolved 
      }"
      @mouseenter="hoveredCommentId = comment.id"
      @mouseleave="hoveredCommentId = null"
      @click="$emit('select-comment', comment.id)"
    >
      <!-- Pin number -->
      <div class="pin-number">
        {{ index + 1 }}
      </div>
      
      <!-- Hover tooltip -->
      <div 
        v-if="hoveredCommentId === comment.id" 
        class="comment-tooltip"
      >
        <div class="tooltip-author">{{ comment.author }}</div>
        <div class="tooltip-text">{{ comment.text }}</div>
        <div class="tooltip-meta">
          {{ formatRelativeTime(comment.created_at) }}
          <span v-if="comment.replies && comment.replies.length > 0">
            · {{ comment.replies.length }} {{ comment.replies.length === 1 ? 'reply' : 'replies' }}
          </span>
        </div>
      </div>
    </div>
    
    <!-- Click indicator (temporary pin while placing comment) -->
    <div
      v-if="pendingComment"
      class="comment-marker pending"
      :style="{
        left: `${pendingComment.x}%`,
        top: `${pendingComment.y}%`
      }"
    >
      <div class="pin-number">+</div>
    </div>
  </div>
</template>

<script setup lang="ts">
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
  spatialComments: SpatialComment[]
  activeCommentId?: string | null
  pendingComment?: { x: number; y: number } | null
}

defineProps<Props>()

defineEmits<{
  'select-comment': [commentId: string]
}>()

const hoveredCommentId = ref<string | null>(null)

const formatRelativeTime = (timestamp: string) => {
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

<style scoped>
.spatial-comments-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.comment-marker {
  position: absolute;
  transform: translate(-50%, -50%);
  pointer-events: all;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s ease;
}

.pin-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
}

.comment-marker:hover .pin-number {
  transform: scale(1.15);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.comment-marker.active .pin-number {
  background: #ef4444;
  transform: scale(1.2);
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.5);
}

.comment-marker.resolved .pin-number {
  background: #10b981;
  opacity: 0.7;
}

.comment-marker.pending .pin-number {
  background: #8b5cf6;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

.comment-tooltip {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 8px;
  min-width: 200px;
  max-width: 300px;
  background: #1f2937;
  color: white;
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  font-size: 13px;
  z-index: 50;
  pointer-events: none;
}

.comment-tooltip::before {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-bottom-color: #1f2937;
}

.tooltip-author {
  font-weight: 600;
  margin-bottom: 4px;
  color: #60a5fa;
}

.tooltip-text {
  margin-bottom: 6px;
  line-height: 1.4;
}

.tooltip-meta {
  font-size: 11px;
  color: #9ca3af;
}
</style>
