<template>
  <div class="h-full bg-[#1E1E1E] flex flex-col text-white">
    <!-- Top Navigation Bar -->
    <div class="bg-[#2D2D2D] border-b border-gray-800 px-6 py-3 flex items-center justify-between">
      <!-- Left: Breadcrumb -->
      <div class="flex items-center gap-3 text-sm">
        <button @click="$emit('close')" class="hover:bg-gray-700 p-2 rounded transition-colors">
          <span class="material-icons text-xl">arrow_back</span>
        </button>
        <span class="text-gray-400">FITNESS INTL.</span>
        <span class="text-gray-600">/</span>
        <span class="text-gray-400">LA FITNESS</span>
        <span class="text-gray-600">/</span>
        <span class="text-gray-400">LAF MEDIA REQUESTS</span>
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
        <div class="flex-1 flex items-center justify-center p-6">
          <div class="relative max-w-full max-h-full" :style="{ aspectRatio: asset?.aspectRatio || '9/16' }">
            <!-- Video/Image Display -->
            <div v-if="asset?.type === 'video'" class="relative w-full h-full bg-black rounded-lg overflow-hidden">
              <video 
                ref="videoPlayer"
                class="w-full h-full object-contain"
                :src="asset?.videoUrl || '/placeholder-video.mp4'"
                @loadedmetadata="onVideoLoaded"
                @timeupdate="onTimeUpdate"
              >
                Your browser does not support video playback.
              </video>
              
              <!-- Play Overlay -->
              <div v-if="!isPlaying" class="absolute inset-0 flex items-center justify-center bg-black/30">
                <button @click="togglePlay" class="w-20 h-20 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full flex items-center justify-center transition-all">
                  <span class="material-icons text-white text-5xl">play_arrow</span>
                </button>
              </div>
            </div>

            <!-- Image Display -->
            <div v-else class="w-full h-full bg-black rounded-lg overflow-hidden flex items-center justify-center">
              <img :src="asset?.imageUrl || '/placeholder.jpg'" alt="Asset" class="max-w-full max-h-full object-contain" />
            </div>
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
          <div class="flex-1 overflow-y-auto p-4 space-y-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm text-gray-400">{{ comments.length }} open comments</span>
              <button class="text-sm text-blue-500 hover:text-blue-400">Comment</button>
            </div>

            <div v-for="comment in comments" :key="comment.id" class="space-y-2">
              <div class="flex gap-3">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" :style="{ backgroundColor: comment.avatarColor }">
                  {{ comment.initials }}
                </div>
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="font-medium text-sm">{{ comment.author }}</span>
                    <span class="text-xs text-gray-500">{{ comment.time }}</span>
                    <span class="text-xs text-gray-500">{{ comment.version }}</span>
                  </div>
                  <p class="text-sm text-gray-300">{{ comment.text }}</p>
                  <button class="text-xs text-gray-500 hover:text-gray-400 mt-1">Reply</button>
                </div>
              </div>

              <!-- Replies -->
              <div v-for="reply in comment.replies" :key="reply.id" class="ml-11 flex gap-3">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" :style="{ backgroundColor: reply.avatarColor }">
                  {{ reply.initials }}
                </div>
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="font-medium text-sm">{{ reply.author }}</span>
                    <span class="text-xs text-gray-500">{{ reply.time }}</span>
                  </div>
                  <p class="text-sm text-gray-300">{{ reply.text }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Comment Input -->
          <div class="border-t border-gray-800 p-4">
            <div class="flex gap-2">
              <input 
                v-model="newComment"
                type="text" 
                placeholder="Add a comment..." 
                class="flex-1 bg-[#1E1E1E] border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                @keyup.enter="addComment"
              />
              <button class="text-gray-400 hover:text-white transition-colors">
                <span class="material-icons">alternate_email</span>
              </button>
              <button @click="addComment" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors">
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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
  type: 'video' | 'image'
  format: string
  size: string
  dimensions: string
  duration: string
  aspectRatio: string
  videoUrl?: string
  imageUrl?: string
  reviewCount: number
}

const props = defineProps<{
  assetId: string
}>()

defineEmits<{
  close: []
}>()

const videoPlayer = ref<HTMLVideoElement>()
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const currentChapter = ref(2)
const activeTab = ref<'info' | 'comments'>('comments')
const newComment = ref('')

// Mock asset data - replace with actual API call
const asset = ref<Asset>({
  id: props.assetId,
  title: 'LA Fitness - Spring Campaign Hero Video',
  type: 'video',
  format: 'MOV',
  size: '47 MB',
  dimensions: '1080 × 1920',
  duration: '0:15',
  aspectRatio: '9/16',
  videoUrl: '/demo-video.mp4',
  reviewCount: 33
})

const comments = ref<Comment[]>([
  {
    id: 1,
    author: 'Nikos Maheras',
    initials: 'NM',
    avatarColor: '#8B5CF6',
    time: '0:00',
    version: '3d V1',
    text: 'Nicole Wren See my email with any comments or modifications on these movements.',
    replies: []
  },
  {
    id: 2,
    author: 'MarcAnthony Paz',
    initials: 'MA',
    avatarColor: '#F59E0B',
    time: '3d V1',
    version: '3d V1',
    text: 'Approved',
    replies: []
  }
])

function togglePlay() {
  if (!videoPlayer.value) return
  
  if (isPlaying.value) {
    videoPlayer.value.pause()
  } else {
    videoPlayer.value.play()
  }
  isPlaying.value = !isPlaying.value
}

function toggleFullscreen() {
  if (!videoPlayer.value) return
  if (document.fullscreenElement) {
    document.exitFullscreen()
  } else {
    videoPlayer.value.requestFullscreen()
  }
}

function onVideoLoaded() {
  if (videoPlayer.value) {
    duration.value = videoPlayer.value.duration
  }
}

function onTimeUpdate() {
  if (videoPlayer.value) {
    currentTime.value = videoPlayer.value.currentTime
  }
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function addComment() {
  if (!newComment.value.trim()) return
  
  const newCommentObj: Comment = {
    id: Date.now(),
    author: 'You',
    initials: 'YO',
    avatarColor: '#3B82F6',
    time: 'Just now',
    version: 'V1',
    text: newComment.value,
    replies: []
  }
  
  comments.value.push(newCommentObj)
  newComment.value = ''
}

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
