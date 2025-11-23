<template>
  <div class="h-full bg-[#1E1E1E] flex flex-col text-white">
    <!-- Top Navigation Bar -->
    <div class="bg-[#2D2D2D] border-b border-gray-800 px-6 py-3 flex items-center justify-between">
      <!-- Left: Breadcrumb -->
      <div class="flex items-center gap-3 text-sm">
        <button @click="$emit('close')" class="hover:bg-gray-700 p-2 rounded transition-colors">
          <span class="material-icons text-xl">arrow_back</span>
        </button>
        <span class="text-gray-400">POLYMARKET</span>
        <span class="text-gray-600">/</span>
        <span class="text-gray-400">POLYMARKET CREATIVE REQUESTS</span>
        <span class="text-gray-600">/</span>
        <span class="text-white">{{ asset?.title || 'Loading...' }}</span>
      </div>

      <!-- Right: Actions -->
      <div class="flex items-center gap-3">
        <button class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
          <span class="material-icons text-lg">check</span>
          <span>{{ asset?.reviewCount || 0 }} Needs Review</span>
        </button>
        <button class="p-2 hover:bg-gray-700 rounded transition-colors">
          <span class="material-icons">star_border</span>
        </button>
        <button class="p-2 hover:bg-gray-700 rounded transition-colors">
          <span class="material-icons">ios_share</span>
        </button>
        <button @click="$emit('close')" class="p-2 hover:bg-gray-700 rounded transition-colors">
          <span class="material-icons">close</span>
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Left: Video Player -->
      <div class="flex-1 flex flex-col bg-[#1E1E1E]">
        <!-- Video Container -->
        <div class="flex-1 flex items-center justify-center p-6 bg-[#1E1E1E]">
          <!-- Loading state -->
          <div v-if="!asset" class="text-gray-400 text-center">
            <div class="text-lg">Loading asset...</div>
          </div>
          
          <!-- Video Display -->
          <div v-else-if="asset.type === 'video'" class="relative w-full h-full flex items-center justify-center">
            <div class="relative" style="max-width: 100%; max-height: 100%;">
              <!-- Google Drive embed -->
              <iframe
                v-if="asset.videoUrl?.includes('drive.google.com')"
                :src="asset.videoUrl"
                class="w-full h-full"
                style="min-width: 800px; min-height: 600px;"
                allowfullscreen
                allow="autoplay"
              />
              
              <!-- Regular video player -->
              <template v-else>
                <video 
                  ref="videoPlayer"
                  class="max-w-full max-h-full rounded-lg"
                  :src="asset.videoUrl"
                  @loadedmetadata="onVideoLoaded"
                  @timeupdate="onTimeUpdate"
                  controls
                >
                  Your browser does not support video playback.
                </video>
              </template>
            </div>
          </div>

          <!-- Figma Display -->
          <div v-else-if="asset.type === 'figma'" class="w-full h-full flex flex-col items-center justify-center bg-[#1E1E1E] gap-4">
            <div class="text-center">
              <div class="w-16 h-16 bg-[#333] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-white" viewBox="0 0 38 57" fill="currentColor">
                  <path d="M19 28.5C19 23.2533 23.2533 19 28.5 19C33.7467 19 38 23.2533 38 28.5C38 33.7467 33.7467 38 28.5 38C23.2533 38 19 33.7467 19 28.5Z"/>
                  <path d="M0 47.5C0 42.2533 4.25329 38 9.5 38H19V47.5C19 52.7467 14.7467 57 9.5 57C4.25329 57 0 52.7467 0 47.5Z"/>
                  <path d="M19 0V19H28.5C33.7467 19 38 14.7467 38 9.5C38 4.25329 33.7467 0 28.5 0H19Z"/>
                  <path d="M0 9.5C0 14.7467 4.25329 19 9.5 19H19V0H9.5C4.25329 0 0 4.25329 0 9.5Z"/>
                  <path d="M0 28.5C0 33.7467 4.25329 38 9.5 38H19V19H9.5C4.25329 19 0 23.2533 0 28.5Z"/>
                </svg>
              </div>
              <h3 class="text-xl font-medium text-white mb-2">Figma Design File</h3>
              <p class="text-gray-400 mb-6">View and comment directly in Figma</p>
              <a 
                :href="asset.figmaUrl" 
                target="_blank"
                class="px-6 py-3 bg-[#0D99FF] hover:bg-[#007BE5] text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2"
              >
                <span>Open in Figma</span>
                <span class="material-icons text-sm">open_in_new</span>
              </a>
            </div>
          </div>

          <!-- Image Display with Interactive Comments -->
          <div v-else class="w-full h-full flex items-center justify-center relative">
            <InteractiveImageViewer
              v-if="asset.imageUrl"
              :image-url="asset.imageUrl"
              :spatial-comments="spatialComments"
              :active-comment-id="activeCommentId"
              :is-commenting-enabled="enableAnnotation"
              @add-comment="handleSpatialComment"
              @select-comment="handleSelectComment"
            />
            <div v-else class="text-gray-400">No image available</div>
          </div>
        </div>

        <!-- Video Controls -->
        <div v-if="asset?.type === 'video'" class="bg-[#2D2D2D] px-6 py-4 border-t border-gray-800">
          <div class="flex items-center gap-4 mb-3">
            <!-- Chapter Info -->
            <div class="flex items-center gap-2 text-sm">
              <span class="material-icons text-blue-500">view_module</span>
              <span class="text-gray-400">{{ currentChapter }} chapters</span>
            </div>
            
            <!-- Timeline -->
            <div class="flex items-center gap-2 text-sm">
              <button class="text-gray-400 hover:text-white transition-colors">
                <span class="material-icons text-xl">chevron_left</span>
              </button>
              <span class="text-white font-medium">{{ formatTime(currentTime) }}</span>
              <span class="text-gray-500">/</span>
              <span class="text-gray-400">{{ formatTime(duration) }}</span>
              <button class="text-gray-400 hover:text-white transition-colors">
                <span class="material-icons text-xl">chevron_right</span>
              </button>
            </div>
          </div>

          <!-- Controls -->
          <div class="flex items-center gap-3">
            <button @click="togglePlay" class="w-10 h-10 bg-white text-black hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
              <span class="material-icons">{{ isPlaying ? 'pause' : 'play_arrow' }}</span>
            </button>
            
            <button class="text-gray-400 hover:text-white transition-colors">
              <span class="material-icons">skip_previous</span>
            </button>
            
            <button class="text-gray-400 hover:text-white transition-colors">
              <span class="material-icons">replay_10</span>
            </button>
            
            <button class="text-gray-400 hover:text-white transition-colors">
              <span class="material-icons">volume_up</span>
            </button>

            <div class="flex-1" />

            <button class="text-gray-400 hover:text-white transition-colors">
              <span class="material-icons">settings</span>
            </button>
            
            <button class="text-gray-400 hover:text-white transition-colors">
              <span class="material-icons">subtitles</span>
            </button>
            
            <button class="text-gray-400 hover:text-white transition-colors">
              <span class="material-icons">download</span>
            </button>
            
            <button @click="toggleFullscreen" class="text-gray-400 hover:text-white transition-colors">
              <span class="material-icons">fullscreen</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Right: Info/Comments Panel -->
      <div class="w-96 bg-[#2D2D2D] border-l border-gray-800 flex flex-col">
        <!-- Tabs -->
        <div class="flex border-b border-gray-800">
          <button 
            @click="activeTab = 'info'" 
            class="flex-1 px-4 py-3 text-sm font-medium transition-colors"
            :class="activeTab === 'info' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'"
          >
            Info
          </button>
          <button 
            @click="activeTab = 'comments'" 
            class="flex-1 px-4 py-3 text-sm font-medium transition-colors"
            :class="activeTab === 'comments' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'"
          >
            Comments
          </button>
          <button class="p-3 text-gray-400 hover:text-white transition-colors">
            <span class="material-icons">more_horiz</span>
          </button>
        </div>

        <!-- Info Tab -->
        <div v-if="activeTab === 'info'" class="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <h2 class="text-lg font-semibold mb-2">{{ asset?.title || 'Loading...' }}</h2>
            <div class="flex items-center gap-2 text-sm text-gray-400">
              <span>V1</span>
              <span>·</span>
              <span>{{ asset?.format || 'MOV' }}</span>
              <span>·</span>
              <span>{{ asset?.size || '0 MB' }}</span>
              <span>·</span>
              <span>{{ asset?.dimensions || '1080 × 1920' }}</span>
              <span>·</span>
              <span>{{ asset?.duration || '0:00' }}</span>
            </div>
          </div>

          <div class="space-y-3">
            <div>
              <label class="text-xs text-gray-400 uppercase mb-1 block">Status</label>
              <select class="w-full bg-[#1E1E1E] border border-gray-700 rounded px-3 py-2 text-sm">
                <option>Needs Review</option>
                <option>In Progress</option>
                <option>Needs Edit</option>
                <option>Approved</option>
              </select>
            </div>

            <div>
              <label class="text-xs text-gray-400 uppercase mb-1 block">Assignee</label>
              <select class="w-full bg-[#1E1E1E] border border-gray-700 rounded px-3 py-2 text-sm">
                <option>Unassigned</option>
                <option>Sarah J.</option>
                <option>Mike C.</option>
                <option>Emma D.</option>
              </select>
            </div>

            <div>
              <label class="text-xs text-gray-400 uppercase mb-1 block">Due Date</label>
              <input type="date" class="w-full bg-[#1E1E1E] border border-gray-700 rounded px-3 py-2 text-sm" />
            </div>

            <div>
              <label class="text-xs text-gray-400 uppercase mb-1 block">Tags</label>
              <input type="text" placeholder="Add tags..." class="w-full bg-[#1E1E1E] border border-gray-700 rounded px-3 py-2 text-sm" />
            </div>
          </div>
        </div>

        <!-- Comments Tab -->
        <div v-if="activeTab === 'comments'" class="flex-1 flex flex-col">
          <!-- Comments List -->
          <div class="flex-1 overflow-hidden flex flex-col">
            <CommentThread
              :entity-type="entityType"
              :entity-id="assetId"
              :current-time="enableAnnotation ? currentTime : null"
              :pending-spatial-comment="pendingSpatialComment"
              :active-comment-id="activeCommentId"
              @comment-added="onCommentAdded"
              @select-comment="handleSelectComment"
              @clear-spatial="pendingSpatialComment = null"
            />
          </div>


        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import InteractiveImageViewer from '~/components/creative/InteractiveImageViewer.vue'
import CommentThread from '~/components/CommentThread.vue'

interface Comment {
  id: number
  author: string
  initials: string
  avatarColor: string
  time: string
  version: string
  text: string
  replies: Comment[]
}

interface Asset {
  id: string
  title: string
  type: 'video' | 'image' | 'figma'
  format: string
  size: string
  dimensions: string
  duration: string
  aspectRatio: string
  videoUrl?: string
  imageUrl?: string
  figmaUrl?: string
  reviewCount: number
}

const props = withDefaults(defineProps<{
  assetId: string
  entityType?: string
  enableAnnotation?: boolean
}>(), {
  entityType: 'request', // Default to request for backward compatibility
  enableAnnotation: true
})

defineEmits<{
  close: []
}>()

const videoPlayer = ref<HTMLVideoElement>()
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const currentChapter = ref(2)
const activeTab = ref<'info' | 'comments'>('comments')
const pendingSpatialComment = ref<{ x: number; y: number; text?: string } | null>(null)
const activeCommentId = ref<string | null>(null)
const spatialComments = ref<any[]>([])

// Load spatial comments
const loadSpatialComments = async () => {
  const { supabase } = useSupabase()
  const { data } = await supabase
    .from('comments')
    .select('*')
    .eq('entity_type', props.entityType)
    .eq('entity_id', props.assetId)
    .not('x_position', 'is', null)
    .order('created_at', { ascending: true })
  
  spatialComments.value = data || []
}

// Handle new spatial comment from InteractiveImageViewer
const handleSpatialComment = (payload: { x: number; y: number; text: string }) => {
  console.log('📍 handleSpatialComment received:', payload)
  // Switch to comments tab
  activeTab.value = 'comments'
  // Set pending comment with text to be picked up by CommentThread
  pendingSpatialComment.value = { x: payload.x, y: payload.y, text: payload.text }
  console.log('📍 pendingSpatialComment set:', pendingSpatialComment.value)
}

// Handle selecting a comment (from pin or list)
const handleSelectComment = (commentId: string | any) => {
  const id = typeof commentId === 'string' ? commentId : commentId.id
  activeCommentId.value = id
  activeTab.value = 'comments'
  
  // If it's a video comment with timecode, seek to it
  if (typeof commentId === 'object' && commentId.timecode && videoPlayer.value) {
    videoPlayer.value.currentTime = commentId.timecode
  }
}

const onCommentAdded = (comment: any) => {
  if (comment.x_position) {
    spatialComments.value.push(comment)
  }
  pendingSpatialComment.value = null
}

watch(() => props.assetId, loadSpatialComments, { immediate: true })

// Video player helper functions
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const togglePlay = () => {
  if (videoPlayer.value) {
    if (isPlaying.value) {
      videoPlayer.value.pause()
    } else {
      videoPlayer.value.play()
    }
  }
}

const toggleFullscreen = () => {
  if (videoPlayer.value) {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      videoPlayer.value.requestFullscreen()
    }
  }
}

const onVideoLoaded = () => {
  if (videoPlayer.value) {
    duration.value = videoPlayer.value.duration
  }
}

const onTimeUpdate = () => {
  if (videoPlayer.value) {
    currentTime.value = videoPlayer.value.currentTime
  }
}

// Fetch real asset data
const { getRequestById } = useRequests()
const requestData = getRequestById(props.assetId)

// Convert Google Drive share URL to embed URL
function convertGoogleDriveUrl(url: string): string {
  if (!url) return ''
  const match = url.match(/\/d\/(.*?)(?:\/|$)/)
  if (match && match[1]) {
    return `https://drive.google.com/file/d/${match[1]}/preview`
  }
  return url
}

// Map request to asset format
const asset = computed<Asset | null>(() => {
  const req = requestData.value
  console.log('🎬 AssetViewer - Request data:', req)
  if (!req) {
    console.log('⚠️ No request data found for ID:', props.assetId)
    return null
  }
  
  // Only convert Google Drive URLs, keep local URLs as-is
  const videoUrl = req.videoUrl 
    ? (req.videoUrl.includes('drive.google.com') ? convertGoogleDriveUrl(req.videoUrl) : req.videoUrl)
    : undefined
  
  const assetData: Asset = {
    id: req.id,
    title: req.title,
    type: (req.figmaUrl ? 'figma' : (req.videoUrl ? 'video' : 'image')) as 'video' | 'image' | 'figma',
    format: req.format || 'Unknown',
    size: req.size || '0 MB',
    dimensions: req.dimensions || 'Unknown',
    duration: req.duration || '0:00',
    aspectRatio: '16/9',
    videoUrl,
    imageUrl: req.thumbnail,
    figmaUrl: req.figmaUrl,
    reviewCount: req.comments?.length || 0
  }
  console.log('✅ AssetViewer - Computed asset:', assetData)
  return assetData
})



// Listen for video player events
onMounted(() => {
  if (videoPlayer.value) {
    videoPlayer.value.addEventListener('play', () => isPlaying.value = true)
    videoPlayer.value.addEventListener('pause', () => isPlaying.value = false)
  }
})
</script>

<style scoped>
/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #1E1E1E;
}

::-webkit-scrollbar-thumb {
  background: #4B5563;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #6B7280;
}
</style>
