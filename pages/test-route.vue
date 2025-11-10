<template>
  <div class="p-8 bg-green-500 text-white">
    <h1 class="text-4xl font-bold mb-4">✅ Test Route Works!</h1>
    <p>If you see this, basic routing is functional.</p>
    <NuxtLink to="/creative/asset/999" class="underline block mt-4">
      Try clicking here to go to /creative/asset/999
    </NuxtLink>
  </div>
</template>

<script setup>
console.log('🧪 Test route component loaded')
</script>
