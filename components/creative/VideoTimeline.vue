<template>
  <div class="absolute bottom-16 left-0 right-0 h-5 z-40 pointer-events-none">
    <!-- Timeline markers for comments -->
    <div 
      v-for="comment in videoComments" 
      :key="comment.id"
      class="absolute w-1 h-4 rounded-sm bottom-0 transform -translate-x-1/2 pointer-events-auto cursor-pointer transition-all hover:h-5 hover:w-1.5"
      :class="comment.resolved ? 'bg-green-500' : 'bg-blue-500'"
      :style="{ left: `${getPositionPercent(comment.timecode)}%` }"
      @click.stop="$emit('seek', comment.timecode)"
    ></div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  comments: any[]
  videoDuration: number
  currentTime: number
}>()

defineEmits<{
  seek: [time: number]
}>()

const videoComments = computed(() => {
  return props.comments.filter(c => c.timecode !== null && c.timecode !== undefined)
})

const getPositionPercent = (time: number | null) => {
  if (!props.videoDuration || time === null) return 0
  return (time / props.videoDuration) * 100
}
</script>
