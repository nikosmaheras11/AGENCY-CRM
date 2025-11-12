<template>
  <div class="min-h-screen bg-[#0f1117] p-8">
    <div class="max-w-2xl mx-auto">
      <div class="bg-[#1a1d24] rounded-xl p-6 border border-white/10">
        <h1 class="text-2xl font-bold text-white mb-6">Database Insert Test</h1>
        
        <!-- Test Button -->
        <button
          @click="testInsert"
          :disabled="isLoading"
          class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
        >
          {{ isLoading ? 'Testing...' : 'Test Database Insert' }}
        </button>
        
        <!-- Auth Status -->
        <div class="mb-4 p-4 bg-[#0f1117] rounded-lg">
          <p class="text-sm text-gray-400 mb-2">Auth Status:</p>
          <p class="text-white font-mono text-sm">{{ authStatus }}</p>
        </div>
        
        <!-- Result -->
        <div v-if="result" class="p-4 bg-green-900/20 border border-green-500/50 rounded-lg">
          <p class="text-green-400 font-bold mb-2">✓ Success!</p>
          <pre class="text-white text-xs overflow-auto">{{ JSON.stringify(result, null, 2) }}</pre>
        </div>
        
        <!-- Error -->
        <div v-if="error" class="p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
          <p class="text-red-400 font-bold mb-2">✗ Error</p>
          <pre class="text-white text-xs overflow-auto">{{ error }}</pre>
        </div>
        
        <!-- Logs -->
        <div v-if="logs.length > 0" class="mt-4 p-4 bg-[#0f1117] rounded-lg">
          <p class="text-sm text-gray-400 mb-2">Logs:</p>
          <div class="space-y-1">
            <p v-for="(log, i) in logs" :key="i" class="text-white text-xs font-mono">
              {{ log }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { supabase } = useSupabase()
const { user } = useAuth()

const isLoading = ref(false)
const result = ref<any>(null)
const error = ref<string | null>(null)
const logs = ref<string[]>([])

const authStatus = computed(() => {
  if (!user.value) return 'Not authenticated'
  return `Authenticated as: ${user.value.email} (${user.value.id})`
})

function addLog(message: string) {
  const timestamp = new Date().toLocaleTimeString()
  logs.value.push(`[${timestamp}] ${message}`)
  console.log(message)
}

async function testInsert() {
  isLoading.value = true
  result.value = null
  error.value = null
  logs.value = []
  
  try {
    addLog('Starting database insert test...')
    
    // Check auth
    if (!user.value) {
      throw new Error('User not authenticated')
    }
    addLog(`User authenticated: ${user.value.id}`)
    
    // Prepare minimal test data
    const testData = {
      title: `Test Request ${Date.now()}`,
      description: 'This is a test request created via the test page',
      project_type: 'creative' as const,
      status: 'new-request' as const,
      priority: 'medium' as const,
      created_by: user.value.id,
      created_by_name: user.value.user_metadata?.full_name || user.value.email?.split('@')[0] || 'Test User'
    }
    
    addLog('Prepared test data')
    addLog(`Data: ${JSON.stringify(testData, null, 2)}`)
    
    // Insert into database
    addLog('Calling Supabase insert...')
    const { data, error: insertError } = await supabase
      .from('requests')
      .insert(testData)
      .select()
      .single()
    
    addLog('Received response from Supabase')
    
    if (insertError) {
      addLog(`Insert error: ${insertError.message}`)
      throw insertError
    }
    
    if (!data) {
      addLog('No data returned from insert')
      throw new Error('No data returned from insert')
    }
    
    addLog('Insert successful!')
    result.value = data
    
  } catch (err: any) {
    addLog(`ERROR: ${err.message}`)
    error.value = err.message || 'Unknown error occurred'
    console.error('Full error:', err)
  } finally {
    isLoading.value = false
    addLog('Test complete')
  }
}

// Auto-test on mount for quick verification
onMounted(async () => {
  // Wait a moment for auth to initialize
  await new Promise(resolve => setTimeout(resolve, 1000))
  addLog('Page loaded - ready to test')
})
</script>
