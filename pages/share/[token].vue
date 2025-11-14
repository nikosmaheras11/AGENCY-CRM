<template>
  <div class="share-viewer">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading shared asset...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <span class="material-icons">error_outline</span>
      <h2>{{ error }}</h2>
      <p>This link may have expired or been revoked.</p>
      <button @click="navigateTo('/')" class="btn-primary">
        Go to Homepage
      </button>
    </div>

    <!-- Asset Viewer -->
    <div v-else-if="asset" class="asset-container">
      <!-- Header -->
      <header class="share-header">
        <div class="header-content">
          <h1>{{ asset.title }}</h1>
          <div class="header-actions">
            <button
              v-if="shareLink?.canDownload"
              @click="downloadAsset"
              class="btn-download"
            >
              <span class="material-icons">download</span>
              Download
            </button>
          </div>
        </div>
      </header>

      <!-- Media Viewer -->
      <main class="media-viewer">
        <CommentLayer
          v-if="asset"
          :asset-id="asset.id"
          :is-video="isVideo"
          :enable-collaboration="shareLink?.canComment"
          :video-duration="videoDuration"
          :current-video-time="currentTime"
          @seek="handleSeek"
        >
          <template #media>
            <!-- Video -->
            <video
              v-if="isVideo"
              ref="videoElement"
              :src="mediaUrl"
              class="media-element"
              controls
              @loadedmetadata="handleVideoLoaded"
              @timeupdate="handleTimeUpdate"
            />

            <!-- Image -->
            <img
              v-else-if="isImage"
              :src="mediaUrl"
              :alt="asset.title"
              class="media-element"
            />

            <!-- Fallback -->
            <div v-else class="no-media">
              <span class="material-icons">image_not_supported</span>
              <p>Media not available</p>
            </div>
          </template>
        </CommentLayer>
      </main>

      <!-- Comments Panel (if enabled) -->
      <aside v-if="shareLink?.canComment" class="comments-panel">
        <h3>Comments</h3>
        <CommentThread
          :asset-id="asset.id"
          :current-time="isVideo ? currentTime : undefined"
        />
      </aside>

      <!-- Footer Info -->
      <footer class="share-footer">
        <div class="footer-content">
          <p class="text-sm text-gray-400">
            Shared by {{ asset.client || 'Team' }}
          </p>
          <p v-if="shareLink?.expiresAt" class="text-xs text-gray-500">
            Link expires: {{ formatDate(shareLink.expiresAt) }}
          </p>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import CommentLayer from '~/components/creative/CommentLayer.vue'
import CommentThread from '~/components/CommentThread.vue'

definePageMeta({
  layout: false,
  middleware: [] // No auth required for public shares
})

const route = useRoute()
const token = route.params.token as string

const { validateShareToken } = useShareLinks()

// State
const loading = ref(true)
const error = ref<string | null>(null)
const shareLink = ref<any>(null)
const asset = ref<any>(null)

// Video state
const videoElement = ref<HTMLVideoElement | null>(null)
const currentTime = ref(0)
const videoDuration = ref(0)

// Validate token and load asset
onMounted(async () => {
  const result = await validateShareToken(token)

  if (!result.valid) {
    error.value = result.error || 'Invalid share link'
    loading.value = false
    return
  }

  shareLink.value = result.shareLink
  asset.value = result.asset
  loading.value = false

  // Track view
  trackView()
})

// Media detection (use snake_case field names from database)
const mediaUrl = computed(() => {
  if (!asset.value) return null
  return asset.value.asset_file_url ||
         asset.value.video_url ||
         asset.value.thumbnail ||
         asset.value.figma_url ||
         null
})

const isVideo = computed(() => {
  if (!mediaUrl.value) return false
  const url = mediaUrl.value.toLowerCase()
  return url.includes('.mp4') || url.includes('.mov') || url.includes('.webm')
})

const isImage = computed(() => {
  if (!mediaUrl.value) return false
  const url = mediaUrl.value.toLowerCase()
  return url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png') || url.includes('.gif')
})

// Video handlers
const handleVideoLoaded = (event: Event) => {
  const video = event.target as HTMLVideoElement
  videoDuration.value = video.duration
}

const handleTimeUpdate = (event: Event) => {
  const video = event.target as HTMLVideoElement
  currentTime.value = video.currentTime
}

const handleSeek = (time: number) => {
  if (videoElement.value) {
    videoElement.value.currentTime = time
  }
}

// Download asset
const downloadAsset = () => {
  if (mediaUrl.value) {
    window.open(mediaUrl.value, '_blank')
  }
}

// Track view analytics
const trackView = async () => {
  if (!shareLink.value) return

  const { supabase } = useSupabase()
  await supabase
    .from('share_links')
    .update({
      view_count: (shareLink.value.view_count || 0) + 1,
      last_accessed_at: new Date().toISOString()
    })
    .eq('id', shareLink.value.id)
}

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}
</script>

<style>
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');
</style>

<style scoped>
.share-viewer {
  min-height: 100vh;
  background: #0a0a0a;
  color: white;
}

.loading-state,
.error-state {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  text-align: center;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #2a2a2a;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state .material-icons {
  font-size: 64px;
  color: #ef4444;
}

.error-state h2 {
  font-size: 24px;
  margin: 0;
}

.error-state p {
  color: #9ca3af;
  margin: 0;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #2563eb;
}

.asset-container {
  display: grid;
  grid-template-rows: auto 1fr auto;
  grid-template-columns: 1fr 400px;
  height: 100vh;
}

.share-header {
  grid-column: 1 / -1;
  background: #1a1a1a;
  border-bottom: 1px solid #2a2a2a;
  padding: 16px 24px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.share-header h1 {
  font-size: 20px;
  margin: 0;
}

.btn-download {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-download:hover {
  background: #2563eb;
}

.media-viewer {
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: #0a0a0a;
}

.media-element {
  max-width: 100%;
  max-height: calc(100vh - 200px);
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.comments-panel {
  background: #1a1a1a;
  border-left: 1px solid #2a2a2a;
  padding: 24px;
  overflow-y: auto;
  grid-row: 2 / 3;
}

.comments-panel h3 {
  font-size: 18px;
  margin: 0 0 16px 0;
}

.share-footer {
  grid-column: 1 / -1;
  background: #1a1a1a;
  border-top: 1px solid #2a2a2a;
  padding: 12px 24px;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.no-media {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #6b7280;
}

.no-media .material-icons {
  font-size: 64px;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .asset-container {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr auto;
  }

  .comments-panel {
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

  .media-viewer {
    padding: 12px;
  }
}
</style>
