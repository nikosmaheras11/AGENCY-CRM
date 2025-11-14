<template>
  <div class="min-h-screen bg-gray-900 text-white p-8">
    <h1 class="text-4xl font-bold mb-4">✅ App is Working!</h1>
    
    <div class="card-glass p-6 max-w-4xl">
      <h2 class="text-2xl mb-4">Database Connection Test</h2>
      
      <div v-if="loading">Loading...</div>
      
      <div v-else-if="error" class="text-red-400">
        ❌ Error: {{ error.message }}
      </div>
      
      <div v-else class="space-y-4">
        <div class="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
          <h3 class="font-semibold text-green-300">✅ Database Connected!</h3>
          <p class="text-sm mt-2">Found {{ requests.length }} requests in database</p>
        </div>
        
        <div v-if="requests.length > 0">
          <h3 class="text-xl mb-2">Requests:</h3>
          <div class="space-y-2">
            <div v-for="req in requests" :key="req.id" class="bg-white/5 p-3 rounded">
              <div class="font-medium">{{ req.title }}</div>
              <div class="text-sm text-gray-400">Status: {{ req.status }} | Type: {{ req.project_type }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="mt-8">
      <UButton @click="navigateTo('/')">Go to Dashboard (requires login)</UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
const { supabase } = useSupabase()
const requests = ref<any[]>([])
const loading = ref(true)
const error = ref<Error | null>(null)

definePageMeta({
  layout: false // No auth required
})

onMounted(async () => {
  try {
    const { data, error: fetchError } = await supabase
      .from('requests')
      .select('*')
      .limit(10)
    
    if (fetchError) throw fetchError
    
    requests.value = data || []
  } catch (e: any) {
    error.value = e
  } finally {
    loading.value = false
  }
})
</script>
