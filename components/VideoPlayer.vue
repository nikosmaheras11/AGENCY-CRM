<template>
  <div class="video-player" ref="playerContainer" @mousemove="handleMouseMove">
    <!-- Video element -->
    <video
      ref="videoElement"
      :src="src"
      class="video-element"
      @loadedmetadata="handleLoadedMetadata"
      @timeupdate="handleTimeUpdate"
      @play="isPlaying = true"
      @pause="isPlaying = false"
      @ended="handleEnded"
      @volumechange="handleVolumeChange"
    />
    
    <!-- Play overlay (when paused) -->
    <div 
      v-if="!isPlaying && !controlsVisible" 
      class="play-overlay" 
      @click="togglePlay"
    >
      <div class="play-button">
        <span class="material-icons">play_arrow</span>
      </div>
    </div>
    
    <!-- Comment markers overlay -->
    <div v-if="comments.length > 0" class="comment-markers-overlay">
      <div
        v-for="comment in comments"
        :key="comment.id"
        class="comment-marker"
        :style="{ 
          left: `${(comment.timecode / duration) * 100}%`,
          top: comment.y_position ? `${comment.y_position}%` : '50%'
        }"
        @click="seekToComment(comment)"
      >
        <div class="comment-bubble">
          <span class="material-icons">comment</span>
        </div>
      </div>
    </div>
    
    <!-- Video controls -->
    <div 
      class="video-controls" 
      :class="{ visible: controlsVisible || !isPlaying }"
      @mouseenter="showControls"
      @mouseleave="startHideControlsTimer"
    >
      <!-- Timeline -->
      <div 
        class="timeline-container" 
        ref="timelineContainer"
        @mousedown="handleTimelineDrag"
        @mousemove="handleTimelineHover"
        @mouseleave="hideTimelinePreview"
      >
        <!-- Buffered ranges -->
        <div class="buffered-track">
          <div
            v-for="(range, index) in bufferedRanges"
            :key="index"
            class="buffered-range"
            :style="{
              left: `${(range.start / duration) * 100}%`,
              width: `${((range.end - range.start) / duration) * 100}%`
            }"
          />
        </div>
        
        <!-- Progress track -->
        <div class="timeline-track">
          <div class="progress-bar" :style="{ width: `${progress}%` }" />
          
          <!-- Comment markers on timeline -->
          <div
            v-for="comment in comments"
            :key="`marker-${comment.id}`"
            class="timeline-comment-marker"
            :style="{ left: `${(comment.timecode / duration) * 100}%` }"
            :title="comment.content"
          />
          
          <!-- Playhead -->
          <div class="playhead" :style="{ left: `${progress}%` }">
            <div class="playhead-handle" />
          </div>
        </div>
        
        <!-- Timeline preview tooltip -->
        <div
          v-if="timelinePreview.visible"
          class="timeline-preview"
          :style="{ left: `${timelinePreview.x}px` }"
        >
          <div class="preview-thumbnail">
            <img 
              v-if="timelinePreview.thumbnailUrl" 
              :src="timelinePreview.thumbnailUrl" 
              alt="Preview"
            />
            <div v-else class="preview-placeholder">
              <span class="material-icons">image</span>
            </div>
          </div>
          <div class="preview-time">{{ formatTime(timelinePreview.time) }}</div>
        </div>
      </div>
      
      <!-- Controls row -->
      <div class="controls-row">
        <!-- Left controls -->
        <div class="controls-left">
          <!-- Play/Pause -->
          <button @click="togglePlay" class="control-btn play-btn">
            <span class="material-icons">{{ isPlaying ? 'pause' : 'play_arrow' }}</span>
          </button>
          
          <!-- Previous frame -->
          <button @click="previousFrame" class="control-btn frame-btn">
            <span class="material-icons">skip_previous</span>
          </button>
          
          <!-- Next frame -->
          <button @click="nextFrame" class="control-btn frame-btn">
            <span class="material-icons">skip_next</span>
          </button>
          
          <!-- Time display -->
          <div class="time-display">
            <span class="current-time">{{ formatTime(currentTime) }}</span>
            <span class="separator">/</span>
            <span class="duration-time">{{ formatTime(duration) }}</span>
          </div>
          
          <!-- Volume control -->
          <div class="volume-control">
            <button @click="toggleMute" class="control-btn">
              <span class="material-icons">
                {{ isMuted ? 'volume_off' : volume > 0.5 ? 'volume_up' : 'volume_down' }}
              </span>
            </button>
            <div class="volume-slider-container">
              <input
                type="range"
                class="volume-slider"
                min="0"
                max="1"
                step="0.1"
                v-model.number="volume"
                @input="handleVolumeInput"
              />
            </div>
          </div>
        </div>
        
        <!-- Right controls -->
        <div class="controls-right">
          <!-- Add comment at current time -->
          <button @click="addCommentAtCurrentTime" class="control-btn" title="Add comment (C)">
            <span class="material-icons">add_comment</span>
          </button>
          
          <!-- Playback speed -->
          <div class="speed-control">
            <button @click="toggleSpeedMenu" class="control-btn">
              <span class="speed-label">{{ playbackSpeed }}x</span>
            </button>
            <div v-if="speedMenuVisible" class="speed-menu">
              <button
                v-for="speed in playbackSpeeds"
                :key="speed"
                @click="setPlaybackSpeed(speed)"
                class="speed-option"
                :class="{ active: playbackSpeed === speed }"
              >
                {{ speed }}x
              </button>
            </div>
          </div>
          
          <!-- Quality selector -->
          <div class="quality-control">
            <button @click="toggleQualityMenu" class="control-btn">
              <span class="material-icons">settings</span>
            </button>
            <div v-if="qualityMenuVisible" class="quality-menu">
              <button
                v-for="quality in qualities"
                :key="quality"
                @click="setQuality(quality)"
                class="quality-option"
                :class="{ active: currentQuality === quality }"
              >
                {{ quality }}
              </button>
            </div>
          </div>
          
          <!-- Picture-in-Picture -->
          <button 
            v-if="pipSupported" 
            @click="togglePiP" 
            class="control-btn"
            title="Picture in Picture"
          >
            <span class="material-icons">picture_in_picture</span>
          </button>
          
          <!-- Fullscreen -->
          <button @click="toggleFullscreen" class="control-btn">
            <span class="material-icons">
              {{ isFullscreen ? 'fullscreen_exit' : 'fullscreen' }}
            </span>
          </button>
        </div>
      </div>
      
      <!-- Keyboard shortcuts help -->
      <div v-if="showShortcuts" class="shortcuts-overlay" @click="showShortcuts = false">
        <div class="shortcuts-panel" @click.stop>
          <h3>Keyboard Shortcuts</h3>
          <div class="shortcuts-list">
            <div class="shortcut-item">
              <kbd>Space</kbd>
              <span>Play / Pause</span>
            </div>
            <div class="shortcut-item">
              <kbd>K</kbd>
              <span>Pause</span>
            </div>
            <div class="shortcut-item">
              <kbd>J</kbd>
              <span>Rewind 10s</span>
            </div>
            <div class="shortcut-item">
              <kbd>L</kbd>
              <span>Forward 10s</span>
            </div>
            <div class="shortcut-item">
              <kbd>←</kbd>
              <span>Rewind 5s</span>
            </div>
            <div class="shortcut-item">
              <kbd>→</kbd>
              <span>Forward 5s</span>
            </div>
            <div class="shortcut-item">
              <kbd>,</kbd>
              <span>Previous frame</span>
            </div>
            <div class="shortcut-item">
              <kbd>.</kbd>
              <span>Next frame</span>
            </div>
            <div class="shortcut-item">
              <kbd>F</kbd>
              <span>Fullscreen</span>
            </div>
            <div class="shortcut-item">
              <kbd>M</kbd>
              <span>Mute</span>
            </div>
            <div class="shortcut-item">
              <kbd>C</kbd>
              <span>Add comment</span>
            </div>
            <div class="shortcut-item">
              <kbd>?</kbd>
              <span>Show shortcuts</span>
            </div>
          </div>
          <button @click="showShortcuts = false" class="close-shortcuts-btn">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatTime } from '~/utils/asset-viewer'

interface Comment {
  id: string
  timecode: number
  x_position?: number | null
  y_position?: number | null
  content: string
}

interface Props {
  src: string
  comments?: Comment[]
  assetId?: string
}

const props = withDefaults(defineProps<Props>(), {
  comments: () => [],
  assetId: ''
})

const emit = defineEmits<{
  (e: 'add-comment', time: number): void
  (e: 'time-update', time: number): void
}>()

// Refs
const videoElement = ref<HTMLVideoElement>()
const playerContainer = ref<HTMLDivElement>()
const timelineContainer = ref<HTMLDivElement>()

// State
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(1)
const isMuted = ref(false)
const isFullscreen = ref(false)
const playbackSpeed = ref(1)
const currentQuality = ref('Auto')
const controlsVisible = ref(true)
const speedMenuVisible = ref(false)
const qualityMenuVisible = ref(false)
const showShortcuts = ref(false)
const isDraggingTimeline = ref(false)

// Timeline preview
const timelinePreview = ref({
  visible: false,
  x: 0,
  time: 0,
  thumbnailUrl: null as string | null
})

// Constants
const frameRate = 30 // Assuming 30fps
const playbackSpeeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2]
const qualities = ['Auto', '1080p', '720p', '480p', '360p']
const pipSupported = computed(() => document.pictureInPictureEnabled)

// Computed
const progress = computed(() => {
  return duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0
})

const bufferedRanges = computed(() => {
  if (!videoElement.value) return []
  const buffered = videoElement.value.buffered
  const ranges = []
  for (let i = 0; i < buffered.length; i++) {
    ranges.push({
      start: buffered.start(i),
      end: buffered.end(i)
    })
  }
  return ranges
})

// Video event handlers
const handleLoadedMetadata = () => {
  if (videoElement.value) {
    duration.value = videoElement.value.duration
  }
}

const handleTimeUpdate = () => {
  if (videoElement.value && !isDraggingTimeline.value) {
    currentTime.value = videoElement.value.currentTime
    emit('time-update', currentTime.value)
  }
}

const handleEnded = () => {
  isPlaying.value = false
}

const handleVolumeChange = () => {
  if (videoElement.value) {
    volume.value = videoElement.value.volume
    isMuted.value = videoElement.value.muted
  }
}

// Playback controls
const togglePlay = () => {
  if (!videoElement.value) return
  
  if (isPlaying.value) {
    videoElement.value.pause()
  } else {
    videoElement.value.play()
  }
}

const previousFrame = () => {
  if (!videoElement.value) return
  const frameDuration = 1 / frameRate
  videoElement.value.currentTime = Math.max(0, currentTime.value - frameDuration)
}

const nextFrame = () => {
  if (!videoElement.value) return
  const frameDuration = 1 / frameRate
  videoElement.value.currentTime = Math.min(duration.value, currentTime.value + frameDuration)
}

const seekBy = (seconds: number) => {
  if (!videoElement.value) return
  videoElement.value.currentTime = Math.max(0, Math.min(duration.value, currentTime.value + seconds))
}

// Timeline controls
const handleTimelineDrag = (e: MouseEvent) => {
  isDraggingTimeline.value = true
  seekToPosition(e)
  
  const handleMouseMove = (e: MouseEvent) => {
    seekToPosition(e)
  }
  
  const handleMouseUp = () => {
    isDraggingTimeline.value = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }
  
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

const seekToPosition = (e: MouseEvent) => {
  if (!timelineContainer.value || !videoElement.value) return
  
  const rect = timelineContainer.value.getBoundingClientRect()
  const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
  videoElement.value.currentTime = percent * duration.value
  currentTime.value = percent * duration.value
}

const handleTimelineHover = (e: MouseEvent) => {
  if (!timelineContainer.value) return
  
  const rect = timelineContainer.value.getBoundingClientRect()
  const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
  const time = percent * duration.value
  
  timelinePreview.value = {
    visible: true,
    x: e.clientX - rect.left,
    time,
    thumbnailUrl: getThumbnailForTime(time)
  }
}

const hideTimelinePreview = () => {
  timelinePreview.value.visible = false
}

const getThumbnailForTime = (time: number): string | null => {
  // Generate thumbnail sprite URL
  // Assuming thumbnails are organized as sprites: /thumbnails/{assetId}/sprite-{index}.jpg
  if (!props.assetId) return null
  
  const spriteInterval = 10 // seconds per sprite
  const spriteIndex = Math.floor(time / spriteInterval)
  return `/thumbnails/${props.assetId}/sprite-${spriteIndex}.jpg`
}

// Volume controls
const toggleMute = () => {
  if (!videoElement.value) return
  videoElement.value.muted = !videoElement.value.muted
}

const handleVolumeInput = () => {
  if (!videoElement.value) return
  videoElement.value.volume = volume.value
}

// Playback speed
const toggleSpeedMenu = () => {
  speedMenuVisible.value = !speedMenuVisible.value
  qualityMenuVisible.value = false
}

const setPlaybackSpeed = (speed: number) => {
  if (!videoElement.value) return
  videoElement.value.playbackRate = speed
  playbackSpeed.value = speed
  speedMenuVisible.value = false
}

// Quality control
const toggleQualityMenu = () => {
  qualityMenuVisible.value = !qualityMenuVisible.value
  speedMenuVisible.value = false
}

const setQuality = (quality: string) => {
  currentQuality.value = quality
  qualityMenuVisible.value = false
  // TODO: Implement quality switching with HLS/DASH
}

// Fullscreen
const toggleFullscreen = () => {
  if (!playerContainer.value) return
  
  if (document.fullscreenElement) {
    document.exitFullscreen()
    isFullscreen.value = false
  } else {
    playerContainer.value.requestFullscreen()
    isFullscreen.value = true
  }
}

// Picture-in-Picture
const togglePiP = async () => {
  if (!videoElement.value) return
  
  try {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture()
    } else {
      await videoElement.value.requestPictureInPicture()
    }
  } catch (error) {
    console.error('PiP error:', error)
  }
}

// Comments
const seekToComment = (comment: Comment) => {
  if (!videoElement.value) return
  videoElement.value.currentTime = comment.timecode
}

const addCommentAtCurrentTime = () => {
  emit('add-comment', currentTime.value)
}

// Controls visibility
let hideControlsTimeout: NodeJS.Timeout | null = null

const showControls = () => {
  controlsVisible.value = true
  if (hideControlsTimeout) {
    clearTimeout(hideControlsTimeout)
  }
}

const startHideControlsTimer = () => {
  if (isPlaying.value) {
    hideControlsTimeout = setTimeout(() => {
      controlsVisible.value = false
    }, 3000)
  }
}

const handleMouseMove = () => {
  showControls()
  startHideControlsTimer()
}

// Keyboard shortcuts
const handleKeyPress = (e: KeyboardEvent) => {
  // Ignore if user is typing in an input
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
    return
  }
  
  switch (e.key.toLowerCase()) {
    case ' ':
      e.preventDefault()
      togglePlay()
      break
    case 'k':
      e.preventDefault()
      if (videoElement.value) videoElement.value.pause()
      break
    case 'j':
      e.preventDefault()
      seekBy(-10)
      break
    case 'l':
      e.preventDefault()
      seekBy(10)
      break
    case 'arrowleft':
      e.preventDefault()
      seekBy(-5)
      break
    case 'arrowright':
      e.preventDefault()
      seekBy(5)
      break
    case ',':
      e.preventDefault()
      previousFrame()
      break
    case '.':
      e.preventDefault()
      nextFrame()
      break
    case 'f':
      e.preventDefault()
      toggleFullscreen()
      break
    case 'm':
      e.preventDefault()
      toggleMute()
      break
    case 'c':
      e.preventDefault()
      addCommentAtCurrentTime()
      break
    case '?':
      e.preventDefault()
      showShortcuts.value = !showShortcuts.value
      break
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleKeyPress)
  
  // Listen for fullscreen changes
  document.addEventListener('fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement
  })
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyPress)
  if (hideControlsTimeout) {
    clearTimeout(hideControlsTimeout)
  }
})
</script>

<style scoped>
.video-player {
  position: relative;
  width: 100%;
  height: 100%;
  background: #000;
  overflow: hidden;
}

.video-element {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1;
}

.play-button {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.play-button:hover {
  transform: scale(1.1);
  background: rgba(255, 255, 255, 1);
}

.play-button .material-icons {
  font-size: 48px;
  color: #000;
}

/* Comment markers */
.comment-markers-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 60px;
  pointer-events: none;
  z-index: 2;
}

.comment-marker {
  position: absolute;
  pointer-events: all;
  cursor: pointer;
}

.comment-bubble {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(59, 130, 246, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.comment-bubble:hover {
  transform: scale(1.2);
  background: rgba(59, 130, 246, 1);
}

.comment-bubble .material-icons {
  font-size: 18px;
  color: white;
}

/* Video controls */
.video-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  padding: 20px 16px 16px;
  opacity: 0;
  transition: opacity 0.3s;
  z-index: 10;
}

.video-controls.visible {
  opacity: 1;
}

/* Timeline */
.timeline-container {
  position: relative;
  height: 24px;
  margin-bottom: 12px;
  cursor: pointer;
}

.buffered-track {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

.buffered-range {
  position: absolute;
  height: 100%;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 2px;
}

.timeline-track {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

.timeline-container:hover .timeline-track {
  height: 6px;
}

.progress-bar {
  height: 100%;
  background: #3b82f6;
  border-radius: 2px;
  transition: width 0.1s linear;
}

.timeline-comment-marker {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  background: #f59e0b;
  border-radius: 50%;
  border: 2px solid white;
}

.playhead {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 14px;
  height: 14px;
  transition: width 0.1s, height 0.1s;
}

.timeline-container:hover .playhead {
  width: 16px;
  height: 16px;
}

.playhead-handle {
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* Timeline preview */
.timeline-preview {
  position: absolute;
  bottom: 100%;
  transform: translateX(-50%);
  margin-bottom: 8px;
  pointer-events: none;
}

.preview-thumbnail {
  width: 160px;
  height: 90px;
  background: #1a1a1a;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-placeholder {
  color: #666;
}

.preview-placeholder .material-icons {
  font-size: 32px;
}

.preview-time {
  text-align: center;
  font-size: 12px;
  font-weight: 500;
  color: white;
  background: rgba(0, 0, 0, 0.9);
  padding: 4px 8px;
  border-radius: 4px;
}

/* Controls row */
.controls-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.controls-left,
.controls-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.control-btn .material-icons {
  font-size: 24px;
}

.frame-btn .material-icons {
  font-size: 20px;
}

.time-display {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 500;
  color: white;
  font-family: 'Roboto Mono', monospace;
}

.separator {
  color: rgba(255, 255, 255, 0.6);
}

/* Volume control */
.volume-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.volume-slider-container {
  width: 0;
  overflow: hidden;
  transition: width 0.2s;
}

.volume-control:hover .volume-slider-container {
  width: 80px;
}

.volume-slider {
  width: 80px;
  height: 4px;
  -webkit-appearance: none;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  outline: none;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  cursor: pointer;
}

.volume-slider::-moz-range-thumb {
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

/* Speed and quality menus */
.speed-control,
.quality-control {
  position: relative;
}

.speed-label {
  font-size: 14px;
  font-weight: 500;
  min-width: 40px;
  text-align: center;
}

.speed-menu,
.quality-menu {
  position: absolute;
  bottom: 100%;
  right: 0;
  background: rgba(0, 0, 0, 0.95);
  border-radius: 8px;
  padding: 8px;
  margin-bottom: 8px;
  min-width: 100px;
}

.speed-option,
.quality-option {
  width: 100%;
  padding: 8px 12px;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  text-align: left;
  border-radius: 4px;
  transition: background 0.2s;
  font-size: 14px;
}

.speed-option:hover,
.quality-option:hover {
  background: rgba(255, 255, 255, 0.1);
}

.speed-option.active,
.quality-option.active {
  background: #3b82f6;
}

/* Keyboard shortcuts overlay */
.shortcuts-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.shortcuts-panel {
  background: #1a1a1a;
  border-radius: 12px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
}

.shortcuts-panel h3 {
  margin: 0 0 16px 0;
  color: white;
  font-size: 20px;
}

.shortcuts-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 24px;
}

.shortcut-item {
  display: flex;
  align-items: center;
  gap: 12px;
  color: white;
  font-size: 14px;
}

kbd {
  background: #2a2a2a;
  border: 1px solid #3a3a3a;
  border-radius: 4px;
  padding: 4px 8px;
  font-family: 'Roboto Mono', monospace;
  font-size: 12px;
  min-width: 32px;
  text-align: center;
}

.close-shortcuts-btn {
  width: 100%;
  padding: 12px;
  background: #3b82f6;
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.close-shortcuts-btn:hover {
  background: #2563eb;
}
</style>
