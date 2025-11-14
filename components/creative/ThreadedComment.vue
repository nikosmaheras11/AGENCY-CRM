<template>
  <div class="threaded-comment" :class="{ 'is-reply': depth > 0 }">
    <div class="comment-main">
      <!-- Avatar -->
      <div class="comment-avatar">
        <div class="avatar-circle">
          {{ getInitials(comment.author) }}
        </div>
      </div>
      
      <div class="comment-content">
        <!-- Header -->
        <div class="comment-header">
          <span class="comment-author">{{ comment.author }}</span>
          <span class="comment-time">{{ formatRelativeTime(comment.created_at) }}</span>
          <div v-if="comment.x_position !== null" class="pin-indicator">
            {{ pinNumber }}
          </div>
          <span v-if="comment.timecode !== null && comment.timecode !== undefined" class="comment-badge">
            🎬 {{ formatTimecode(comment.timecode!) }}
          </span>
        </div>
        
        <!-- Text -->
        <div class="comment-text">{{ comment.text }}</div>
        
        <!-- Actions -->
        <div class="comment-actions">
          <button 
            class="action-btn"
            @click="showReplyInput = !showReplyInput"
          >
            Reply
          </button>
          
          <button 
            v-if="!comment.resolved"
            class="action-btn"
            @click="$emit('resolve', comment.id)"
          >
            Resolve
          </button>
          
          <button 
            v-else
            class="action-btn resolved"
            @click="$emit('unresolve', comment.id)"
          >
            ✓ Resolved
          </button>
        </div>
        
        <!-- Reply input -->
        <div v-if="showReplyInput" class="reply-input-container">
          <textarea
            v-model="replyText"
            placeholder="Write a reply..."
            class="reply-textarea"
            rows="2"
            @keydown.meta.enter="submitReply"
            @keydown.ctrl.enter="submitReply"
          />
          <div class="reply-actions">
            <button 
              class="btn-cancel"
              @click="cancelReply"
            >
              Cancel
            </button>
            <button 
              class="btn-submit"
              :disabled="!replyText.trim()"
              @click="submitReply"
            >
              Reply
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Nested replies -->
    <div v-if="comment.replies && comment.replies.length > 0" class="comment-replies">
      <ThreadedComment
        v-for="reply in comment.replies"
        :key="reply.id"
        :comment="reply"
        :depth="depth + 1"
        @resolve="$emit('resolve', $event)"
        @unresolve="$emit('unresolve', $event)"
        @reply="$emit('reply', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Comment {
  id: string
  author: string
  author_id: string
  text: string
  created_at: string
  x_position?: number | null
  y_position?: number | null
  timecode?: number | null
  resolved: boolean
  replies?: Comment[]
}

interface Props {
  comment: Comment
  depth?: number
  pinNumber?: number
}

const props = withDefaults(defineProps<Props>(), {
  depth: 0,
  pinNumber: 0
})

const emit = defineEmits<{
  resolve: [commentId: string]
  unresolve: [commentId: string]
  reply: [payload: { parentId: string; text: string }]
}>()

const showReplyInput = ref(false)
const replyText = ref('')

const getInitials = (name: string) => {
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

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

const formatTimecode = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const submitReply = () => {
  if (!replyText.value.trim()) return
  
  emit('reply', {
    parentId: props.comment.id,
    text: replyText.value.trim()
  })
  
  replyText.value = ''
  showReplyInput.value = false
}

const cancelReply = () => {
  replyText.value = ''
  showReplyInput.value = false
}
</script>

<style scoped>
.threaded-comment {
  margin-bottom: 16px;
}

.threaded-comment.is-reply {
  margin-left: 48px;
  margin-top: 12px;
}

.comment-main {
  display: flex;
  gap: 12px;
}

.comment-avatar {
  flex-shrink: 0;
}

.avatar-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.comment-content {
  flex: 1;
  min-width: 0;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.comment-author {
  font-weight: 600;
  color: #f9fafb;
  font-size: 14px;
}

.comment-time {
  font-size: 13px;
  color: #9ca3af;
}

.comment-badge {
  font-size: 11px;
  padding: 2px 8px;
  background: #374151;
  color: #e5e7eb;
  border-radius: 12px;
}

.pin-indicator {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.comment-text {
  color: #e5e7eb;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 8px;
  word-wrap: break-word;
}

.comment-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.action-btn {
  background: none;
  border: none;
  color: #6b7280;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.15s;
}

.action-btn:hover {
  color: #3b82f6;
  background: #eff6ff;
}

.action-btn.resolved {
  color: #10b981;
}

.action-btn.resolved:hover {
  background: #d1fae5;
}

.reply-input-container {
  margin-top: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
}

.reply-textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.15s;
}

.reply-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.reply-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

.btn-cancel,
.btn-submit {
  padding: 6px 16px;
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

.comment-replies {
  margin-top: 12px;
}
</style>
