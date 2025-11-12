<template>
  <div class="min-h-screen bg-gradient-dark text-white relative flex flex-col">
    <!-- Background pattern overlay -->
    <div class="absolute inset-0 bg-pattern opacity-[0.015] pointer-events-none"></div>
    
    <!-- Persistent Header Navigation -->
    <header class="h-16 bg-white/5 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-6 relative z-10">
      <div class="flex items-center">
        <h1 class="text-xl font-semibold text-white">Client Dashboard</h1>
      </div>
      <div class="flex items-center space-x-4">
        <!-- New Request Button -->
        <button 
          @click="openRequestForm"
          class="flex items-center gap-2 px-4 py-2 bg-success hover:bg-success/90 rounded-lg font-medium transition-colors"
        >
          <span class="material-icons text-lg">add</span>
          <span class="hidden sm:inline">New Request</span>
        </button>
        
        <div class="relative">
          <button class="w-10 h-10 rounded-full bg-white/5 backdrop-blur-xl flex items-center justify-center text-white hover:bg-white/10 transition-colors">
            <span class="material-icons text-xl">search</span>
          </button>
        </div>
        <div class="relative">
          <button class="w-10 h-10 rounded-full bg-white/5 backdrop-blur-xl flex items-center justify-center text-white hover:bg-white/10 transition-colors">
            <span class="material-icons text-xl">notifications</span>
          </button>
          <div class="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
            3
          </div>
        </div>
        <!-- User Profile -->
        <div class="flex items-center pl-4 border-l border-white/10">
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-teal-300 to-primary-400 shadow-primary flex items-center justify-center font-semibold text-sm">
            {{ userInitials }}
          </div>
          <div v-if="user" class="ml-3">
            <div class="text-sm font-medium text-white">{{ userDisplayName }}</div>
            <div class="text-xs text-slate-400">{{ userEmail }}</div>
          </div>
          <div v-else class="ml-3">
            <div class="text-sm font-medium text-white">Loading...</div>
          </div>
          <button @click="handleSignOut" class="ml-2 text-slate-400 hover:text-white transition-colors" title="Sign out">
            <span class="material-icons text-lg">logout</span>
          </button>
        </div>
      </div>
    </header>
    
    <!-- Page Content (from child pages) -->
    <main class="flex-1 overflow-y-auto relative z-10">
      <slot />
    </main>
    
    <!-- Request Form Modal -->
    <RequestFormModal ref="requestFormModal" @submitted="handleRequestSubmitted" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import RequestFormModal from '~/components/creative/RequestFormModal.vue'
import type { RequestFormModalInstance } from '~/types/components'

const { supabase } = useSupabase()
const router = useRouter()

// User data
const user = ref<any>(null)
const profile = ref<any>(null)

// Get user session
onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.user) {
    user.value = session.user
    
    // Fetch profile data
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
    
    profile.value = profileData
  }
})

// Computed user info
const userDisplayName = computed(() => {
  if (profile.value?.first_name) {
    return `${profile.value.first_name} ${profile.value.last_name || ''}`.trim()
  }
  return user.value?.email?.split('@')[0] || 'User'
})

const userEmail = computed(() => {
  return user.value?.email || ''
})

const userInitials = computed(() => {
  if (profile.value?.first_name) {
    const first = profile.value.first_name[0] || ''
    const last = profile.value.last_name?.[0] || ''
    return (first + last).toUpperCase()
  }
  return user.value?.email?.substring(0, 2).toUpperCase() || 'U'
})

// Sign out handler
async function handleSignOut() {
  await supabase.auth.signOut()
  await router.push('/login')
}

// Request form modal
const requestFormModal = ref<RequestFormModalInstance | null>(null)

function openRequestForm(): void {
  requestFormModal.value?.open()
}

function handleRequestSubmitted(requestId: string): void {
  console.log('New request created:', requestId)
  // Could emit event or refresh data across app
}
</script>
