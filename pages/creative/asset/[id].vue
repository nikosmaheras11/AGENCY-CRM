<template>
  <div class="asset-viewer-layout">
    <!-- Left Sidebar: Asset Navigation -->
    <aside class="asset-sidebar">
      <div class="sidebar-header">
        <button @click="navigateTo('/creative')" class="back-button">
          <span class="material-icons">arrow_back</span>
          <span>Back to Board</span>
        </button>
      </div>
      
      <!-- Asset thumbnails strip -->
      <div class="asset-strip">
        <div 
          v-for="boardAsset in boardAssets"
          :key="boardAsset.id"
          class="asset-strip-item"
          :class="{ active: boardAsset.id === assetId }"
          @click="navigateToAsset(boardAsset.id)"
        >
          <div class="strip-thumbnail">
            <img 
              v-if="getThumbnail(boardAsset)" 
              :src="getThumbnail(boardAsset) || ''" 
              alt=""
              @error="(e) => (e.target as HTMLImageElement).style.display = 'none'"
            />
            <div 
              v-if="!getThumbnail(boardAsset)" 
              class="thumbnail-placeholder" 
              :style="{ backgroundImage: getAssetGradient(boardAsset.id) }" 
            />
          </div>
          <div class="strip-info">
            <p class="strip-title">{{ boardAsset.title }}</p>
            <span class="strip-version">v{{ boardAsset.current_version || 1 }}</span>
          </div>
        </div>
      </div>
    </aside>
    
    <!-- Main Content: Media Player -->
    <main class="asset-main">
      <!-- Header with metadata -->
      <header class="asset-header">
        <div class="asset-title-row">
          <h1 
            ref="titleInput"
            :contenteditable="editingTitle"
            @blur="updateTitle"
            @keydown.enter.prevent="saveTitle"
            class="asset-title"
          >
            {{ currentAsset?.title || 'Untitled' }}
          </h1>
          
          <div class="header-actions">
            <button @click="toggleFavorite" class="icon-button" :class="{ active: isFavorite }">
              <span class="material-icons">{{ isFavorite ? 'star' : 'star_border' }}</span>
            </button>
            
            <button @click="handleShare" class="action-button">
              <span class="material-icons">share</span>
              <span>Share</span>
            </button>
            
            <button @click="handleDownload" class="action-button">
              <span class="material-icons">download</span>
              <span>Download</span>
            </button>
            
            <div class="dropdown-menu-wrapper">
              <button class="icon-button">
                <span class="material-icons">more_vert</span>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Breadcrumb navigation -->
        <div class="breadcrumb">
          <span>Board</span>
          <span class="material-icons">chevron_right</span>
          <span>{{ currentAsset?.metadata?.campaign || 'Campaign' }}</span>
          <span class="material-icons">chevron_right</span>
          <span class="current">{{ currentAsset?.title || 'Asset' }}</span>
        </div>
      </header>
      
      <!-- Media container -->
      <div 
        class="media-container"
        @dragenter="handleDragEnter"
        @dragleave="handleDragLeave"
        @dragover="handleDragOver"
        @drop="handleDrop"
      >
        <!-- Drag overlay -->
        <div v-if="isDragging" class="drag-overlay">
          <div class="drag-overlay-content">
            <span class="material-icons">cloud_upload</span>
            <p>Drop file to create new version</p>
          </div>
        </div>
        <!-- Video Player -->
        <div v-if="isVideo && mediaUrl" class="video-wrapper">
          <video 
            ref="videoElement"
            :src="mediaUrl" 
            class="w-full h-full object-contain bg-black rounded-lg"
            controls
            @loadedmetadata="handleVideoLoaded"
            @timeupdate="handleTimeUpdate"
          />
          
          <!-- Video comment button overlay -->
          <div class="video-comment-overlay">
            <button 
              class="btn-add-comment"
              @click="openVideoCommentForm"
            >
              <span class="material-icons">add_comment</span>
              <span>Add Comment at {{ formatTimecode(currentTime) }}</span>
            </button>
          </div>
        </div>
        
        <!-- Image Viewer with Spatial Comments -->
        <div v-else-if="isImage && mediaUrl" class="image-wrapper">
          <InteractiveImageViewer
            :image-url="mediaUrl"
            :spatial-comments="spatialComments"
            :alt-text="currentAsset?.title || 'Asset image'"
            :is-commenting-enabled="true"
            :active-comment-id="activeCommentId"
            @add-comment="handleSpatialComment"
            @select-comment="handleSelectSpatialComment"
          />
        </div>
        
        <!-- Figma Viewer -->
        <div v-else-if="currentAsset?.figmaUrl" class="figma-wrapper">
          <iframe
            :src="convertToFigmaEmbedUrl(currentAsset.figmaUrl)"
            class="figma-embed"
            allowfullscreen
          />
        </div>
        
        <!-- Document/File Viewer -->
        <div v-else-if="mediaUrl" class="file-wrapper">
          <div class="file-preview">
            <span class="material-icons">description</span>
            <p v-if="mediaUrl">{{ getFileName(mediaUrl) }}</p>
            <a v-if="mediaUrl" :href="mediaUrl" target="_blank" class="download-link">
              <span class="material-icons">download</span>
              Download File
            </a>
          </div>
        </div>
        
        <!-- Fallback -->
        <div v-else class="media-placeholder">
          <span class="material-icons">image</span>
          <p>No media available</p>
        </div>
      </div>
    </main>
    
    <!-- Right Sidebar: Details & Comments -->
    <aside class="asset-details-panel">
      <!-- Tab navigation -->
      <div class="tab-navigation">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="tab-button"
          :class="{ active: activeTab === tab.id }"
        >
          <span class="material-icons">{{ tab.icon }}</span>
          <span>{{ tab.label }}</span>
          <span v-if="tab.badge" class="tab-badge">{{ tab.badge }}</span>
        </button>
      </div>
      
      <!-- Tab panels -->
      <div class="tab-content">
        <!-- Details Tab -->
        <div v-if="activeTab === 'details'" class="tab-panel details-panel">
          <h3>Asset Details</h3>
          
          <div class="detail-field">
            <label>Status</label>
            <select v-model="localAsset.status" @change="updateField('status')">
              <option value="new-request">New Request</option>
              <option value="in-progress">In Progress</option>
              <option value="needs-review">Needs Review</option>
              <option value="needs-edit">Needs Edit</option>
              <option value="done">Done</option>
            </select>
          </div>
          
          <div class="detail-field">
            <label>Format</label>
            <p class="field-value">{{ currentAsset?.format || 'N/A' }}</p>
          </div>
          
          <div class="detail-field">
            <label>Dimensions</label>
            <p class="field-value">{{ currentAsset?.dimensions || 'N/A' }}</p>
          </div>
          
          <div class="detail-field">
            <label>File Size</label>
            <p class="field-value">{{ currentAsset?.size || 'N/A' }}</p>
          </div>
          
          <div class="detail-field">
            <label>Duration</label>
            <p class="field-value">{{ currentAsset?.duration || 'N/A' }}</p>
          </div>
        </div>
        
        <!-- Comments Tab -->
        <div v-if="activeTab === 'comments'" class="tab-panel comments-panel no-padding">
          <div class="comments-header">
            <h3>Comments ({{ totalCommentCount }})</h3>
            <button 
              v-if="!isVideo"
              class="btn-filter"
              @click="showResolvedComments = !showResolvedComments"
            >
              {{ showResolvedComments ? 'Hide Resolved' : 'Show Resolved' }}
            </button>
          </div>
          
          <!-- New comment form (for video) - Always visible when on Comments tab -->
          <div v-if="isVideo" class="comment-form-container">
            <div class="form-header">
              <span class="timestamp-badge">
                <span class="material-icons">schedule</span>
                {{ formatTimecode(currentTime) }}
              </span>
              <span class="helper-text">Comment at current time</span>
            </div>
            <textarea
              ref="videoCommentTextarea"
              v-model="videoCommentText"
              placeholder="Add your comment at this timestamp..."
              class="comment-textarea"
              rows="3"
              @keydown.meta.enter="submitVideoCommentQuick"
              @keydown.ctrl.enter="submitVideoCommentQuick"
              @focus="onCommentFocus"
            />
            <div class="form-actions">
              <button 
                class="btn-submit"
                :disabled="!videoCommentText.trim()"
                @click="submitVideoCommentQuick"
              >
                Post at {{ formatTimecode(currentTime) }}
              </button>
            </div>
          </div>
          
          <div class="comments-list">
            <div v-if="commentsLoading" class="loading-state">
              <span class="material-icons spin">refresh</span>
              <p>Loading comments...</p>
            </div>
            
            <div v-else-if="displayedComments.length === 0" class="empty-state">
              <span class="material-icons">comment</span>
              <p>No comments yet</p>
              <p class="helper-text">
                {{ isVideo ? 'Play the video and click to add a comment' : 'Click on the image to add a comment' }}
              </p>
            </div>
            
            <div v-else class="threaded-comments-container">
              <ThreadedComment
                v-for="(comment, index) in displayedComments"
                :key="comment.id"
                :comment="comment"
                :pin-number="index + 1"
                @resolve="handleResolveComment"
                @unresolve="handleUnresolveComment"
                @reply="handleReply"
              />
            </div>
          </div>
        </div>
        
        <!-- Versions Tab -->
        <div v-if="activeTab === 'versions'" class="tab-panel versions-panel no-padding">
          <VersionHistory 
            :asset-id="assetId"
            @version-selected="handleVersionSelected"
            @version-restored="handleVersionRestored"
          />
        </div>
      </div>
    </aside>
    
    <!-- Version Upload Dialog -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showVersionDialog" class="version-dialog-backdrop" @click="cancelVersionUpload">
          <div class="version-dialog" @click.stop>
            <h3>Upload New Version</h3>
            <p>You're about to upload a new version of this asset.</p>
            
            <div v-if="uploadFile" class="file-preview">
              <div class="file-name">{{ uploadFile.name }}</div>
              <div class="file-meta">{{ formatFileSize(uploadFile.size) }}</div>
            </div>
            
            <div class="form-group">
              <label for="version-comment">Version comment (optional):</label>
              <textarea 
                id="version-comment"
                v-model="versionComment"
                placeholder="What changed in this version?"
                rows="3"
              ></textarea>
            </div>
            
            <div class="dialog-actions">
              <button 
                @click="cancelVersionUpload"
                class="cancel-btn"
                :disabled="isUploading"
              >
                Cancel
              </button>
              <button 
                @click="uploadNewVersion"
                :disabled="isUploading"
                class="confirm-btn"
              >
                {{ isUploading ? 'Uploading...' : 'Upload Version' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { convertToFigmaEmbedUrl } from '~/utils/figma'
import { formatTime, formatRelativeTime } from '~/utils/asset-viewer'
import CommentLayer from '~/components/creative/CommentLayer.vue'
import InteractiveImageViewer from '~/components/creative/InteractiveImageViewer.vue'
import ThreadedComment from '~/components/creative/ThreadedComment.vue'

definePageMeta({
  layout: false
})

const route = useRoute()
const assetId = route.params.id as string

// Fetch current asset and board assets
const { getRequestById, fetchRequests, allRequests } = useRequests()

// Figma thumbnail support
const { fetchFigmaThumbnail, getThumbnail } = useFigmaThumbnails()

const requestData = getRequestById(assetId)
const currentAsset = computed(() => requestData.value)

// Get all creative assets for sidebar navigation
const boardAssets = computed(() => {
  return allRequests.value
    .filter(req => req.projectType === 'creative')
    .map(req => ({
      id: req.id,
      title: req.title,
      thumbnail: req.thumbnail,
      figmaUrl: req.figmaUrl,
      current_version: 1
    }))
})

// Fetch requests and Figma thumbnails
onMounted(async () => {
  if (allRequests.value.length === 0) {
    await fetchRequests()
  }
  
  // Fetch thumbnails for Figma assets
  for (const asset of boardAssets.value) {
    if (asset.figmaUrl && !asset.thumbnail) {
      await fetchFigmaThumbnail(asset.figmaUrl)
    }
  }
})

// Video player state
const videoElement = ref<HTMLVideoElement | null>(null)
const currentTime = ref(0)
const videoDuration = ref(0)

const handleVideoLoaded = (event: Event) => {
  const video = event.target as HTMLVideoElement
  videoDuration.value = video.duration
}

const handleTimeUpdate = (event: Event) => {
  const video = event.target as HTMLVideoElement
  currentTime.value = video.currentTime
}

const handleCommentAdded = (comment: any) => {
  // Comment is added through CommentLayer composable
  console.log('Comment added:', comment)
}

const handleCommentSelected = (comment: any) => {
  activeTab.value = 'comments'
  // The CommentThread component will highlight this comment
}

const handleSeek = (time: number) => {
  if (videoElement.value) {
    videoElement.value.currentTime = time
  }
}

// Comments system
const { 
  comments, 
  spatialComments,
  totalCommentCount,
  loading: commentsLoading, 
  addComment, 
  addReply,
  updateCommentStatus 
} = useAssetComments(assetId)

const showResolvedComments = ref(false)
const activeCommentId = ref<string | null>(null)

// Video comment form state
const videoCommentText = ref('')
const videoCommentTextarea = ref<HTMLTextAreaElement | null>(null)
const capturedTimecode = ref(0) // Capture time when user focuses textarea

// Filter comments based on resolved state
const displayedComments = computed(() => {
  if (showResolvedComments.value) {
    return comments.value
  }
  return comments.value.filter(c => !c.resolved)
})

// Handle spatial comment on image
const handleSpatialComment = async ({ x, y, text }: { x: number; y: number; text: string }) => {
  try {
    await addComment({
      content: text,
      x_position: x,
      y_position: y
    })
    activeTab.value = 'comments'
  } catch (error) {
    console.error('Error adding spatial comment:', error)
    alert('Failed to add comment')
  }
}

// Handle selecting a spatial comment pin
const handleSelectSpatialComment = (commentId: string) => {
  activeCommentId.value = commentId
  activeTab.value = 'comments'
  
  // Scroll to comment in sidebar
  nextTick(() => {
    const commentEl = document.querySelector(`[data-comment-id="${commentId}"]`)
    commentEl?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}

// Handle resolving/unresolving comments
const handleResolveComment = async (commentId: string) => {
  try {
    await updateCommentStatus(commentId, true)
  } catch (error) {
    console.error('Error resolving comment:', error)
  }
}

const handleUnresolveComment = async (commentId: string) => {
  try {
    await updateCommentStatus(commentId, false)
  } catch (error) {
    console.error('Error unresolving comment:', error)
  }
}

// Handle replies to comments
const handleReply = async ({ parentId, text }: { parentId: string; text: string }) => {
  try {
    await addReply(parentId, text)
  } catch (error) {
    console.error('Error adding reply:', error)
    alert('Failed to add reply')
  }
}

// Video comment functions
const onCommentFocus = () => {
  // Capture current video time when user focuses textarea
  capturedTimecode.value = currentTime.value
}

const openVideoCommentForm = () => {
  // Open comments tab and focus textarea
  activeTab.value = 'comments'
  nextTick(() => {
    videoCommentTextarea.value?.focus()
  })
}

const submitVideoCommentQuick = async () => {
  if (!videoCommentText.value.trim()) return
  
  try {
    // Use current video time (updates in real-time as they type)
    await addComment({
      content: videoCommentText.value,
      video_timestamp: currentTime.value
    })
    
    videoCommentText.value = ''
  } catch (error) {
    console.error('Error adding video comment:', error)
    alert('Failed to add comment')
  }
}

const formatTimecode = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Drag and drop state
const isDragging = ref(false)
const isUploading = ref(false)
const showVersionDialog = ref(false)
const uploadFile = ref<File | null>(null)
const versionComment = ref('')

// UI state
const activeTab = ref<'details' | 'comments' | 'versions'>('details')
const editingTitle = ref(false)
const isFavorite = ref(false)

const localAsset = ref({
  status: currentAsset.value?.status || 'new-request'
})

const tabs = [
  { id: 'details' as const, label: 'Details', icon: 'info', badge: null },
  { id: 'comments' as const, label: 'Comments', icon: 'comment', badge: 0 },
  { id: 'versions' as const, label: 'Versions', icon: 'history', badge: 1 }
]

// Navigation
const navigateToAsset = (id: string) => {
  navigateTo(`/creative/asset/${id}`)
}

// Actions
const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value
}

const updateTitle = () => {
  editingTitle.value = false
  // TODO: Save to database
}

const saveTitle = () => {
  updateTitle()
}

const updateField = (field: string) => {
  // TODO: Auto-save to database
  const value = (localAsset.value as any)[field]
  console.log('Update field:', field, value)
}

const { generateShareLink, copyToClipboard } = useShareLinks()
const generatingLink = ref(false)

const handleShare = async () => {
  if (generatingLink.value) return

  generatingLink.value = true

  try {
    const shareLink = await generateShareLink({
      assetId,
      permissions: {
        canComment: true,
        canDownload: true,
        expiresIn: 168 // 7 days
      }
    })

    if (!shareLink) {
      alert('Failed to generate share link')
      return
    }

    const copied = await copyToClipboard(shareLink.url)

    if (copied) {
      alert(`Share link copied to clipboard!\n\nLink expires in 7 days.\n\n${shareLink.url}`)
    } else {
      // Fallback: show link in alert
      prompt('Copy this link:', shareLink.url)
    }
  } catch (error) {
    console.error('Error sharing:', error)
    alert('Failed to create share link')
  } finally {
    generatingLink.value = false
  }
}

const handleDownload = () => {
  if (mediaUrl.value) {
    window.open(mediaUrl.value, '_blank')
  }
}

// Drag and drop handlers
const handleDragEnter = (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
  isDragging.value = true
}

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
  if (e.target === e.currentTarget) {
    isDragging.value = false
  }
}

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
}

const handleDrop = async (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
  isDragging.value = false
  
  const files = e.dataTransfer?.files
  if (!files || files.length === 0) return
  
  uploadFile.value = files[0]
  showVersionDialog.value = true
}

const cancelVersionUpload = () => {
  uploadFile.value = null
  versionComment.value = ''
  showVersionDialog.value = false
}

const uploadNewVersion = async () => {
  if (!uploadFile.value || !assetId) return
  
  isUploading.value = true
  
  try {
    const { supabase } = useSupabase()
    const user = useSupabaseUser().value
    
    // Get current max version for this request
    const { data: currentAssets } = await supabase
      .from('assets')
      .select('version_number')
      .eq('request_id', assetId)
      .order('version_number', { ascending: false })
      .limit(1)
    
    const nextVersion = (currentAssets?.[0]?.version_number || 0) + 1
    
    // Upload file to Supabase Storage
    const fileExt = uploadFile.value.name.split('.').pop()
    const timestamp = Date.now()
    const storagePath = `requests/${timestamp}-${uploadFile.value.name}`
    
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('assets')
      .upload(storagePath, uploadFile.value, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (uploadError) throw uploadError
    
    // Get public URL
    const { data: urlData } = supabase
      .storage
      .from('assets')
      .getPublicUrl(storagePath)
    
    // Mark all existing versions as not current
    await supabase
      .from('assets')
      .update({ is_current_version: false })
      .eq('request_id', assetId)
    
    // Create new asset version
    const { error: insertError } = await supabase
      .from('assets')
      .insert({
        request_id: assetId,
        name: uploadFile.value.name,
        original_filename: uploadFile.value.name,
        storage_path: storagePath,
        file_type: uploadFile.value.type,
        file_size: uploadFile.value.size,
        mime_type: uploadFile.value.type,
        preview_url: urlData.publicUrl,
        thumbnail_url: urlData.publicUrl,
        version_number: nextVersion,
        is_current_version: true,
        version_notes: versionComment.value || null,
        created_by: user.value?.id
      })
    
    if (insertError) throw insertError
    
    // Refresh the page to show new version
    window.location.reload()
    
  } catch (error: any) {
    console.error('Error uploading version:', error)
    alert('Failed to upload new version: ' + error.message)
  } finally {
    isUploading.value = false
    cancelVersionUpload()
  }
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// Media URL and type detection
const mediaUrl = computed(() => {
  const url = currentAsset.value?.assetFileUrl || 
         currentAsset.value?.videoUrl || 
         currentAsset.value?.thumbnail ||
         null
  console.log('[Asset Viewer] mediaUrl:', url)
  return url
})

const isVideo = computed(() => {
  if (!mediaUrl.value) return false
  const url = mediaUrl.value.toLowerCase()
  const result = url.includes('.mp4') || url.includes('.mov') || url.includes('.webm') || url.includes('.avi')
  console.log('[Asset Viewer] isVideo:', result, 'for url:', url)
  return result
})

const isImage = computed(() => {
  if (!mediaUrl.value) return false
  const url = mediaUrl.value.toLowerCase()
  const result = url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png') || url.includes('.gif') || url.includes('.webp')
  console.log('[Asset Viewer] isImage:', result, 'for url:', url)
  return result
})

const getFileName = (url: string | null) => {
  if (!url) return 'File'
  const parts = url.split('/')
  return parts[parts.length - 1] || 'File'
}

// Version handlers
const handleVersionSelected = (version: any) => {
  console.log('Version selected:', version)
  // TODO: Switch media player to this version
}

const handleVersionRestored = (version: any) => {
  console.log('Version restored:', version)
  // TODO: Refresh asset data
}

// Utility
const getAssetGradient = (id: string) => {
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  ]
  return gradients[parseInt(id) % gradients.length]
}
</script>

<style scoped>
.asset-viewer-layout {
  display: grid;
  grid-template-columns: 280px 1fr 400px;
  height: 100vh;
  overflow: hidden;
  background: #0a0a0a;
}

/* ============================================
   RESPONSIVE DESIGN - Mobile First
   ============================================ */

/* Tablet: Hide left sidebar, keep right panel */
@media (max-width: 1024px) {
  .asset-viewer-layout {
    grid-template-columns: 1fr 360px;
  }

  .asset-sidebar {
    display: none;
  }
}

/* Mobile: Stack vertically, full width */
@media (max-width: 768px) {
  .asset-viewer-layout {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr auto;
  }

  .asset-sidebar {
    display: none;
  }

  .asset-details-panel {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 50vh;
    border-left: none;
    border-top: 1px solid #2a2a2a;
    transform: translateY(calc(100% - 60px));
    transition: transform 0.3s ease;
    z-index: 100;
  }

  .asset-details-panel.expanded {
    transform: translateY(0);
  }

  /* Smaller header on mobile */
  .asset-header {
    padding: 12px 16px;
  }

  .asset-title {
    font-size: 16px;
  }

  .header-actions {
    gap: 4px;
  }

  .action-button span:not(.material-icons) {
    display: none;
  }

  /* Simplified breadcrumb */
  .breadcrumb {
    font-size: 11px;
    overflow-x: auto;
    white-space: nowrap;
  }

  /* Adjust media container padding */
  .media-container {
    padding: 12px;
  }
}

/* Left Sidebar */
.asset-sidebar {
  background: #1a1a1a;
  border-right: 1px solid #2a2a2a;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #2a2a2a;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #e5e7eb;
  background: none;
  border: none;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
  width: 100%;
}

.back-button:hover {
  background: #2a2a2a;
}

.asset-strip {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.asset-strip-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
  margin-bottom: 8px;
}

.asset-strip-item:hover {
  background: #2a2a2a;
}

.asset-strip-item.active {
  background: #3b82f6;
}

.strip-thumbnail {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
}

.strip-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-placeholder {
  width: 100%;
  height: 100%;
}

.strip-info {
  flex: 1;
  min-width: 0;
}

.strip-title {
  color: #e5e7eb;
  font-size: 14px;
  font-weight: 500;
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.strip-version {
  color: #9ca3af;
  font-size: 12px;
}

/* Main Content */
.asset-main {
  display: flex;
  flex-direction: column;
  background: #0a0a0a;
}

.asset-header {
  padding: 16px 24px;
  border-bottom: 1px solid #2a2a2a;
}

.asset-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.asset-title {
  color: #f9fafb;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  outline: none;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-button, .action-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: none;
  border: 1px solid #374151;
  border-radius: 6px;
  color: #d1d5db;
  cursor: pointer;
  transition: all 0.2s;
}

.icon-button:hover, .action-button:hover {
  background: #1f2937;
  border-color: #4b5563;
}

.icon-button.active {
  color: #fbbf24;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  font-size: 13px;
}

.breadcrumb .current {
  color: #e5e7eb;
}

/* Media Container */
.media-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 24px;
}

/* Drag and Drop Overlay */
.drag-overlay {
  position: absolute;
  inset: 0;
  background: rgba(59, 130, 246, 0.9);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  pointer-events: none;
}

.drag-overlay-content {
  text-align: center;
  color: white;
}

.drag-overlay-content .material-icons {
  font-size: 64px;
  margin-bottom: 16px;
}

.drag-overlay-content p {
  font-size: 18px;
  font-weight: 500;
  margin: 0;
}

.video-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  max-width: 1200px;
  max-height: 800px;
}

.media-element {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #000;
  border-radius: 8px;
}

.play-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  cursor: pointer;
  border-radius: 8px;
}

.play-button {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.play-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.play-button .material-icons {
  font-size: 48px;
  color: white;
}

/* Video Controls */
.video-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0,0,0,0.8));
  padding: 24px 16px 16px;
}

.timeline-container {
  margin-bottom: 12px;
  cursor: pointer;
}

.timeline-track {
  position: relative;
  height: 4px;
  background: rgba(255,255,255,0.3);
  border-radius: 2px;
}

.progress-bar {
  position: absolute;
  height: 100%;
  background: #3b82f6;
  border-radius: 2px;
}

.playhead {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
}

.controls-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.control-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-btn:hover {
  color: #3b82f6;
}

.play-btn .material-icons {
  font-size: 32px;
}

.time-display {
  display: flex;
  gap: 4px;
  color: white;
  font-size: 14px;
  font-family: monospace;
}

.spacer {
  flex: 1;
}

.figma-wrapper {
  width: 100%;
  height: 100%;
}

.figma-embed {
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 8px;
}

.image-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  max-width: 1200px;
  max-height: 800px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.asset-image {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.file-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 40px;
  background: #1a1a1a;
  border-radius: 12px;
  border: 2px dashed #374151;
}

.file-preview .material-icons {
  font-size: 64px;
  color: #6b7280;
}

.file-preview p {
  color: #e5e7eb;
  font-size: 16px;
  margin: 0;
  text-align: center;
  word-break: break-all;
  max-width: 400px;
}

.download-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #3b82f6;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  transition: background 0.2s;
}

.download-link:hover {
  background: #2563eb;
}

.download-link .material-icons {
  font-size: 20px;
}

.media-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #6b7280;
}

.media-placeholder .material-icons {
  font-size: 64px;
}

/* Right Sidebar */
.asset-details-panel {
  background: #1a1a1a;
  border-left: 1px solid #2a2a2a;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.tab-navigation {
  display: flex;
  border-bottom: 1px solid #2a2a2a;
}

.tab-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 8px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 12px;
}

.tab-button:hover {
  color: #e5e7eb;
  background: #2a2a2a;
}

.tab-button.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

.tab-button .material-icons {
  font-size: 18px;
}

.tab-badge {
  background: #374151;
  color: #d1d5db;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
}

.tab-content {
  flex: 1;
  overflow-y: auto;
}

.tab-panel {
  padding: 20px;
}

.tab-panel.no-padding {
  padding: 0;
}

.tab-panel h3 {
  color: #f9fafb;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
}

.detail-field {
  margin-bottom: 16px;
}

.detail-field label {
  display: block;
  color: #9ca3af;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  margin-bottom: 6px;
}

.detail-field select, .detail-field input {
  width: 100%;
  background: #0a0a0a;
  border: 1px solid #374151;
  border-radius: 6px;
  padding: 8px 12px;
  color: #e5e7eb;
  font-size: 14px;
}

.field-value {
  color: #e5e7eb;
  font-size: 14px;
  margin: 0;
}

.empty-state {
  color: #6b7280;
  font-size: 14px;
  text-align: center;
  padding: 40px 20px;
  margin: 0;
}

.comments-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #2a2a2a;
  background: #1a1a1a;
}

.comments-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #f9fafb;
}

.btn-filter {
  background: #0a0a0a;
  border: 1px solid #374151;
  color: #9ca3af;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-filter:hover {
  border-color: #3b82f6;
  color: #3b82f6;
}

.comments-list {
  padding: 20px;
  overflow-y: auto;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px 20px;
  color: #6b7280;
}

.loading-state .material-icons {
  font-size: 32px;
}

.loading-state .spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.threaded-comments-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 40px 20px;
  color: #6b7280;
  text-align: center;
}

.empty-state .material-icons {
  font-size: 48px;
  opacity: 0.5;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

.empty-state .helper-text {
  font-size: 12px;
  color: #4b5563;
}

.video-comment-overlay {
  position: absolute;
  bottom: 80px;
  right: 20px;
  z-index: 10;
}

.btn-add-comment {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(59, 130, 246, 0.95);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 24px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: all 0.2s;
}

.btn-add-comment:hover {
  background: rgba(37, 99, 235, 0.95);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
}

.btn-add-comment .material-icons {
  font-size: 20px;
}

.comment-form-container {
  padding: 16px 20px;
  background: #0a0a0a;
  border-bottom: 1px solid #2a2a2a;
}

.form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.form-header .helper-text {
  font-size: 12px;
  color: #6b7280;
}

.timestamp-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #374151;
  color: #e5e7eb;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
}

.timestamp-badge .material-icons {
  font-size: 16px;
}

.btn-close {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.btn-close:hover {
  color: #e5e7eb;
  background: #374151;
}

.btn-close .material-icons {
  font-size: 20px;
}

.comment-textarea {
  width: 100%;
  background: #1a1a1a;
  border: 1px solid #374151;
  border-radius: 8px;
  padding: 12px;
  color: #e5e7eb;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  margin-bottom: 12px;
  transition: border-color 0.2s;
}

.comment-textarea:focus {
  outline: none;
  border-color: #3b82f6;
}

.comment-textarea::placeholder {
  color: #6b7280;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
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
  background: #1a1a1a;
  border: 1px solid #374151;
  color: #9ca3af;
}

.btn-cancel:hover {
  background: #2a2a2a;
  color: #e5e7eb;
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

.comment-input {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #2a2a2a;
}

.comment-input textarea {
  width: 100%;
  background: #0a0a0a;
  border: 1px solid #374151;
  border-radius: 6px;
  padding: 12px;
  color: #e5e7eb;
  font-size: 14px;
  resize: vertical;
  min-height: 80px;
  margin-bottom: 8px;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-primary:hover {
  background: #2563eb;
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #1a1a1a;
}

::-webkit-scrollbar-thumb {
  background: #374151;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #4b5563;
}
/* Version Dialog */
.version-dialog-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.version-dialog {
  background-color: #1E2532;
  border-radius: 12px;
  padding: 24px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.version-dialog h3 {
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 20px;
  font-weight: 600;
  color: #f9fafb;
}

.version-dialog p {
  margin-bottom: 20px;
  color: #d1d5db;
  font-size: 14px;
}

.file-preview {
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
  border: 1px solid #374151;
}

.file-name {
  font-weight: 500;
  margin-bottom: 6px;
  color: #f9fafb;
}

.file-meta {
  font-size: 13px;
  color: #9ca3af;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #e5e7eb;
}

.form-group textarea {
  width: 100%;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid #374151;
  border-radius: 6px;
  padding: 10px 12px;
  color: #f9fafb;
  resize: vertical;
  font-family: inherit;
  font-size: 14px;
}

.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn, .confirm-btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background-color: transparent;
  border: 1px solid #374151;
  color: #d1d5db;
}

.cancel-btn:hover:not(:disabled) {
  background-color: #1f2937;
  border-color: #4b5563;
}

.confirm-btn {
  background-color: #3b82f6;
  border: none;
  color: white;
}

.confirm-btn:hover:not(:disabled) {
  background-color: #2563eb;
}

.confirm-btn:disabled, .cancel-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
}
</style>
