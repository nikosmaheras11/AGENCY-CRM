<template>
  <div 
    class="absolute pointer-events-none z-50 transition-all duration-100"
    :style="{ 
      left: `${x}%`, 
      top: `${y}%`,
      transform: 'translate(-2px, -2px)'
    }"
  >
    <!-- Cursor SVG -->
    <svg 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      :style="{ color: cursorColor }"
      class="drop-shadow-lg"
    >
      <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"></path>
    </svg>
    
    <!-- Username label -->
    <div 
      class="absolute top-full left-0 mt-1 px-2 py-0.5 rounded text-xs font-bold text-white whitespace-nowrap drop-shadow-lg"
      :style="{ backgroundColor: cursorColor }"
    >
      {{ username }}
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  x: number
  y: number
  username: string
  userId: string
}>()

// Generate consistent color based on userId
const cursorColor = computed(() => {
  const hash = props.userId.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc)
  }, 0)
  
  return `hsl(${Math.abs(hash) % 360}, 80%, 60%)`
})
</script>
