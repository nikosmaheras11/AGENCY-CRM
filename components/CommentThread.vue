<template>
  <div class="comment-thread-container">
    <!-- Filter/Sort controls -->
    <div class="thread-controls">
      <div class="filter-tabs">
        <button 
          :class="{ active: filter === 'all' }"
          @click="filter = 'all'"
        >
          All ({{ allComments.length }})
        </button>
        <button 
          :class="{ active: filter === 'unresolved' }"
          @click="filter = 'unresolved'"
        >
          Open ({{ unresolvedComments.length }})
        </button>
        <button 
          :class="{ active: filter === 'resolved' }"
          @click="filter = 'resolved'"
        >
          Resolved ({{ resolvedComments.length }})
        </button>
      </div>
    </div>
    
    <!-- Comments list -->
    <div class="comments-list">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading comments...</p>
      </div>
      
      <div v-else-if="filteredComments.length === 0" class="empty-state">
        <span class="material-icons">comment</span>
        <p>{{ filter === 'all' ? 'No comments yet' : `No ${filter} comments` }}</p>
      </div>
      
      <div
        v-for="comment in filteredComments"
        :key="comment.id"
        class="comment-item"
        :class="{ resolved: comment.resolved }"
      >
        <div class="comment-header">
          <div class="comment-author">
            <div class="author-avatar">
              {{ getInitials(comment.author_name || 'User') }}
            </div>
            <div class="author-info">
              <span class="author-name">{{ comment.author_name || 'Anonymous' }}</span>
              <span class="comment-time">{{ formatRelativeTime(comment.created_at) }}</span>
            </div>
          </div>
          
          <button @click="toggleCommentMenu(comment)" class="comment-menu-btn">
            <span class="material-icons">more_horiz</span>
          </button>
        </div>
        
        <div class="comment-content">
          <p>{{ comment.content }}</p>
          
          <span v-if="comment.edited" class="edited-badge">(edited)</span>
        </div>
        
        <!-- Timecode badge (for video comments) -->
        <div v-if="comment.timecode !== null" class="comment-timecode">
          <span class="material-icons">play_circle</span>
          <span>{{ formatTime(comment.timecode) }}</span>
        </div>
        
        <div class="comment-actions">
          <button @click="replyToComment(comment)" class="action-btn">
            <span class="material-icons">reply</span>
            Reply
          </button>
          
          <button 
            v-if="!comment.resolved"
            @click="resolveComment(comment)"
            class="action-btn"
          >
            <span class="material-icons">check</span>
            Resolve
          </button>
          
          <button 
            v-else
            @click="unresolveComment(comment)"
            class="action-btn"
          >
            <span class="material-icons">refresh</span>
            Reopen
          </button>
        </div>
      </div>
    </div>
    
    <!-- New comment input -->
    <div class="new-comment-input">
      <div class="input-header">
        <span>Add comment</span>
        <span v-if="currentTime !== null" class="timecode-display">
          at {{ formatTime(currentTime) }}
        </span>
      </div>
      <textarea
        v-model="newCommentContent"
        placeholder="Write a comment..."
        @keydown.meta.enter="submitComment"
        @keydown.ctrl.enter="submitComment"
      ></textarea>
      <div class="input-actions">
        <button @click="clearComment" class="btn-secondary">Cancel</button>
        <button @click="submitComment" class="btn-primary" :disabled="!newCommentContent.trim()">
          Post Comment
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatRelativeTime, formatTime } from '~/utils/asset-viewer'

interface Comment {
  id: string
  request_id: string
  parent_comment_id?: string | null
  author_id?: string | null
  author_name?: string | null
  author_email?: string | null
  content: string
  content_html?: string | null
  timecode?: number | null
  x_position?: number | null
  y_position?: number | null
  resolved: boolean
  resolved_by?: string | null
  resolved_at?: string | null
  reactions?: any
  created_at: string
  updated_at: string
  edited: boolean
  thread_depth: number
}

interface Props {
  assetId: string
  currentTime?: number | null
}

const props = defineProps<Props>()

// State
const allComments = ref<Comment[]>([])
const loading = ref(true)
const filter = ref<'all' | 'unresolved' | 'resolved'>('all')
const newCommentContent = ref('')

// Filtered comments
const unresolvedComments = computed(() => 
  allComments.value.filter(c => !c.resolved)
)

const resolvedComments = computed(() => 
  allComments.value.filter(c => c.resolved)
)

const filteredComments = computed(() => {
  if (filter.value === 'unresolved') return unresolvedComments.value
  if (filter.value === 'resolved') return resolvedComments.value
  return allComments.value
})

// Fetch comments from Supabase
const fetchComments = async () => {
  loading.value = true
  
  try {
    const { supabase } = useSupabase()
    
    const { data, error: fetchError } = await supabase
      .from('comments')
      .select('*')
      .eq('request_id', props.assetId)
      .order('created_at', { ascending: false })
    
    if (fetchError) throw fetchError
    
    allComments.value = data || []
  } catch (e) {
    console.error('Error fetching comments:', e)
  } finally {
    loading.value = false
  }
}

// Submit new comment
const submitComment = async () => {
  if (!newCommentContent.value.trim()) return
  
  try {
    const { supabase } = useSupabase()
    
    const commentData = {
      request_id: props.assetId,
      content: newCommentContent.value.trim(),
      author_name: 'Current User', // TODO: Get from auth
      timecode: props.currentTime || null,
      resolved: false,
      edited: false,
      thread_depth: 0
    }
    
    const { data, error: insertError } = await supabase
      .from('comments')
      .insert(commentData)
      .select()
      .single()
    
    if (insertError) throw insertError
    
    // Add to local state
    allComments.value.unshift(data)
    
    // Clear input
    newCommentContent.value = ''
    
    console.log('Comment posted:', data)
  } catch (e) {
    console.error('Error posting comment:', e)
    alert('Failed to post comment')
  }
}

// Resolve comment
const resolveComment = async (comment: Comment) => {
  try {
    const { supabase } = useSupabase()
    
    const { error: updateError } = await supabase
      .from('comments')
      .update({ 
        resolved: true,
        resolved_at: new Date().toISOString()
      })
      .eq('id', comment.id)
    
    if (updateError) throw updateError
    
    // Update local state
    const index = allComments.value.findIndex(c => c.id === comment.id)
    if (index !== -1) {
      allComments.value[index].resolved = true
      allComments.value[index].resolved_at = new Date().toISOString()
    }
  } catch (e) {
    console.error('Error resolving comment:', e)
  }
}

// Unresolve comment
const unresolveComment = async (comment: Comment) => {
  try {
    const { supabase } = useSupabase()
    
    const { error: updateError } = await supabase
      .from('comments')
      .update({ 
        resolved: false,
        resolved_at: null
      })
      .eq('id', comment.id)
    
    if (updateError) throw updateError
    
    // Update local state
    const index = allComments.value.findIndex(c => c.id === comment.id)
    if (index !== -1) {
      allComments.value[index].resolved = false
      allComments.value[index].resolved_at = null
    }
  } catch (e) {
    console.error('Error unresolving comment:', e)
  }
}

// Reply to comment
const replyToComment = (comment: Comment) => {
  // TODO: Implement reply functionality
  console.log('Reply to:', comment)
}

// Toggle comment menu
const toggleCommentMenu = (comment: Comment) => {
  // TODO: Implement menu
  console.log('Comment menu:', comment)
}

// Clear comment input
const clearComment = () => {
  newCommentContent.value = ''
}

// Get initials from name
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

// Real-time subscriptions
onMounted(async () => {
  await fetchComments()
  
  // Subscribe to real-time updates
  const { supabase } = useSupabase()
  
  const subscription = supabase
    .channel(`comments:${props.assetId}`)
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'comments',
        filter: `request_id=eq.${props.assetId}`
      },
      (payload) => {
        console.log('Comment update:', payload)
        
        if (payload.eventType === 'INSERT') {
          // Add new comment if not already in list
          if (!allComments.value.find(c => c.id === payload.new.id)) {
            allComments.value.unshift(payload.new as Comment)
          }
        } else if (payload.eventType === 'UPDATE') {
          // Update existing comment
          const index = allComments.value.findIndex(c => c.id === payload.new.id)
          if (index !== -1) {
            allComments.value[index] = payload.new as Comment
          }
        } else if (payload.eventType === 'DELETE') {
          // Remove comment
          allComments.value = allComments.value.filter(c => c.id !== payload.old.id)
        }
      }
    )
    .subscribe()
  
  // Cleanup on unmount
  onUnmounted(() => {
    subscription.unsubscribe()
  })
})
</script>

<style scoped>
.comment-thread-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #1a1a1a;
}

.thread-controls {
  padding: 12px 16px;
  border-bottom: 1px solid #2a2a2a;
}

.filter-tabs {
  display: flex;
  gap: 4px;
}

.filter-tabs button {
  padding: 6px 12px;
  background: none;
  border: none;
  color: #9ca3af;
  font-size: 13px;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-tabs button:hover {
  background: #2a2a2a;
  color: #e5e7eb;
}

.filter-tabs button.active {
  background: #374151;
  color: #f9fafb;
}

.comments-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 20px;
  color: #6b7280;
  text-align: center;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #374151;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state .material-icons {
  font-size: 48px;
  color: #4b5563;
}

.comment-item {
  background: #0a0a0a;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.comment-item.resolved {
  opacity: 0.6;
  border-left: 3px solid #10b981;
}

.comment-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 8px;
}

.comment-author {
  display: flex;
  gap: 10px;
  align-items: center;
}

.author-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.author-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.author-name {
  color: #f9fafb;
  font-size: 14px;
  font-weight: 600;
}

.comment-time {
  color: #9ca3af;
  font-size: 12px;
}

.comment-menu-btn {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.comment-menu-btn:hover {
  background: #2a2a2a;
  color: #e5e7eb;
}

.comment-content {
  color: #d1d5db;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 8px;
}

.comment-content p {
  margin: 0;
}

.edited-badge {
  color: #9ca3af;
  font-size: 12px;
  font-style: italic;
  margin-left: 8px;
}

.comment-timecode {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: #374151;
  border-radius: 4px;
  color: #60a5fa;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 8px;
}

.comment-timecode .material-icons {
  font-size: 14px;
}

.comment-actions {
  display: flex;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid #2a2a2a;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: none;
  border: none;
  color: #9ca3af;
  font-size: 12px;
  font-weight: 500;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #2a2a2a;
  color: #e5e7eb;
}

.action-btn .material-icons {
  font-size: 14px;
}

.new-comment-input {
  border-top: 1px solid #2a2a2a;
  padding: 16px;
  background: #0a0a0a;
}

.input-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  color: #9ca3af;
  font-size: 13px;
  font-weight: 500;
}

.timecode-display {
  color: #60a5fa;
  font-weight: 600;
}

.new-comment-input textarea {
  width: 100%;
  min-height: 80px;
  padding: 12px;
  background: #1a1a1a;
  border: 1px solid #374151;
  border-radius: 6px;
  color: #e5e7eb;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s;
}

.new-comment-input textarea:focus {
  outline: none;
  border-color: #3b82f6;
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}

.btn-secondary,
.btn-primary {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background: #374151;
  color: #e5e7eb;
}

.btn-secondary:hover {
  background: #4b5563;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
