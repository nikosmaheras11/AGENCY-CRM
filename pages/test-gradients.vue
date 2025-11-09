<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <h1 class="text-2xl font-bold mb-8">Gradient Test - If you see colors, gradients work!</h1>
    
    <div class="grid grid-cols-3 gap-4">
      <!-- Test 1: Inline style -->
      <div 
        class="h-48 rounded-xl"
        style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"
      >
        <div class="p-4 text-white font-bold">Test 1: Inline Style</div>
      </div>

      <!-- Test 2: Tailwind gradient -->
      <div class="h-48 rounded-xl bg-gradient-to-br from-purple-400 to-pink-600">
        <div class="p-4 text-white font-bold">Test 2: Tailwind</div>
      </div>

      <!-- Test 3: Dynamic Vue binding -->
      <div 
        class="h-48 rounded-xl"
        :style="{ backgroundImage: testGradient }"
      >
        <div class="p-4 text-white font-bold">Test 3: Vue Binding</div>
      </div>

      <!-- Test 4-14: All gradients from creative.vue -->
      <div
        v-for="(gradient, index) in allGradients"
        :key="index"
        class="h-48 rounded-xl"
        :style="{ backgroundImage: gradient }"
      >
        <div class="p-4 text-white font-bold">Card {{ index + 1 }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const testGradient = 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'

const allGradients = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)',
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  'linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)',
  'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
]
</script>
