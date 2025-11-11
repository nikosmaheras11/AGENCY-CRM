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
            <img v-if="boardAsset.thumbnail" :src="boardAsset.thumbnail" alt="" />
            <div v-else class="thumbnail-placeholder" :style="{ backgroundImage: getAssetGradient(boardAsset.id) }" />
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
          <span>{{ currentAsset?.campaign || 'Campaign' }}</span>
          <span class="material-icons">chevron_right</span>
          <span class="current">{{ currentAsset?.title || 'Asset' }}</span>
        </div>
      </header>
      
      <!-- Media container -->
      <div class="media-container">
        <!-- Video Player -->
        <div v-if="currentAsset?.videoUrl" class="video-wrapper">
          <video
            ref="videoRef"
            :src="currentAsset.videoUrl"
            class="media-element"
            @loadedmetadata="handleVideoMetadata"
            @timeupdate="handleTimeUpdate"
            @play="isPlaying = true"
            @pause="isPlaying = false"
          />
          
          <!-- Play overlay -->
          <div v-if="!isPlaying" class="play-overlay" @click="togglePlay">
            <div class="play-button">
              <span class="material-icons">play_arrow</span>
            </div>
          </div>
          
          <!-- Video controls -->
          <div class="video-controls">
            <div class="timeline-container" @click="seekTimeline">
              <div class="timeline-track">
                <div class="progress-bar" :style="{ width: `${progress}%` }"></div>
                <div class="playhead" :style="{ left: `${progress}%` }"></div>
              </div>
            </div>
            
            <div class="controls-row">
              <button @click="togglePlay" class="control-btn play-btn">
                <span class="material-icons">{{ isPlaying ? 'pause' : 'play_arrow' }}</span>
              </button>
              
              <div class="time-display">
                <span>{{ formatTime(currentTime) }}</span>
                <span>/</span>
                <span>{{ formatTime(duration) }}</span>
              </div>
              
              <div class="spacer"></div>
              
              <button class="control-btn">
                <span class="material-icons">settings</span>
              </button>
              
              <button @click="toggleFullscreen" class="control-btn">
                <span class="material-icons">{{ isFullscreen ? 'fullscreen_exit' : 'fullscreen' }}</span>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Figma Viewer -->
        <div v-else-if="currentAsset?.figmaUrl" class="figma-wrapper">
          <iframe
            :src="convertToFigmaEmbedUrl(currentAsset.figmaUrl)"
            class="figma-embed"
            allowfullscreen
          />
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
        <div v-if="activeTab === 'comments'" class="tab-panel comments-panel">
          <div class="comments-header">
            <h3>Comments</h3>
            <button @click="addingComment = true" class="btn-primary">
              <span class="material-icons">add_comment</span>
            </button>
          </div>
          
          <div class="comments-list">
            <p class="empty-state">No comments yet</p>
          </div>
          
          <div class="comment-input">
            <textarea v-model="newComment" placeholder="Add a comment..."></textarea>
            <button @click="submitComment" class="btn-primary">Post</button>
          </div>
        </div>
        
        <!-- Versions Tab -->
        <div v-if="activeTab === 'versions'" class="tab-panel versions-panel">
          <h3>Version History</h3>
          <p class="empty-state">Version history coming soon</p>
        </div>
        
        <!-- Activity Tab -->
        <div v-if="activeTab === 'activity'" class="tab-panel activity-panel">
          <h3>Activity Feed</h3>
          <p class="empty-state">No activity yet</p>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { convertToFigmaEmbedUrl } from '~/utils/figma'
import { formatTime, formatFileSize, formatRelativeTime } from '~/utils/asset-viewer'

definePageMeta({
  layout: false
})

const route = useRoute()
const assetId = route.params.id as string

// Fetch current asset and board assets
const { getRequestById, fetchRequests, allRequests } = useRequests()

onMounted(async () => {
  if (allRequests.value.length === 0) {
    await fetchRequests()
  }
})

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
      current_version: 1
    }))
})

// Video player state
const videoRef = ref<HTMLVideoElement>()
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const isFullscreen = ref(false)

const progress = computed(() => {
  return duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0
})

// UI state
const activeTab = ref<'details' | 'comments' | 'versions' | 'activity'>('details')
const editingTitle = ref(false)
const isFavorite = ref(false)
const newComment = ref('')
const addingComment = ref(false)

const localAsset = ref({
  status: currentAsset.value?.status || 'new-request'
})

const tabs = [
  { id: 'details', label: 'Details', icon: 'info', badge: null },
  { id: 'comments', label: 'Comments', icon: 'comment', badge: 0 },
  { id: 'versions', label: 'Versions', icon: 'history', badge: 1 },
  { id: 'activity', label: 'Activity', icon: 'notifications', badge: null }
]

// Video player functions
const handleVideoMetadata = () => {
  if (videoRef.value) {
    duration.value = videoRef.value.duration
  }
}

const handleTimeUpdate = () => {
  if (videoRef.value) {
    currentTime.value = videoRef.value.currentTime
  }
}

const togglePlay = () => {
  if (!videoRef.value) return
  
  if (isPlaying.value) {
    videoRef.value.pause()
  } else {
    videoRef.value.play()
  }
}

const seekTimeline = (e: MouseEvent) => {
  if (!videoRef.value) return
  
  const timeline = e.currentTarget as HTMLElement
  const rect = timeline.getBoundingClientRect()
  const percent = (e.clientX - rect.left) / rect.width
  videoRef.value.currentTime = percent * duration.value
}

const toggleFullscreen = () => {
  if (!videoRef.value) return
  
  if (document.fullscreenElement) {
    document.exitFullscreen()
    isFullscreen.value = false
  } else {
    videoRef.value.requestFullscreen()
    isFullscreen.value = true
  }
}

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
  console.log('Update field:', field, localAsset.value[field])
}

const handleShare = () => {
  alert('Share functionality coming soon')
}

const handleDownload = () => {
  if (currentAsset.value?.videoUrl) {
    window.open(currentAsset.value.videoUrl, '_blank')
  }
}

const submitComment = () => {
  if (!newComment.value.trim()) return
  
  // TODO: Save comment to database
  console.log('New comment:', newComment.value)
  newComment.value = ''
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
  margin-bottom: 16px;
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
</style>
