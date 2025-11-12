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
        <div v-if="user" class="flex items-center pl-4 border-l border-white/10">
          <img 
            v-if="userAvatar" 
            :src="userAvatar" 
            :alt="userName"
            class="w-10 h-10 rounded-full shadow-primary"
          />
          <div v-else class="w-10 h-10 rounded-full bg-gradient-to-br from-teal-300 to-primary-400 shadow-primary flex items-center justify-center font-semibold">
            {{ userInitials }}
          </div>
          <div class="ml-3">
            <div class="text-sm font-medium text-white">{{ userName }}</div>
            <div class="text-xs text-slate-400">{{ userEmail || 'Slack User' }}</div>
          </div>
          <span class="material-icons text-slate-400 ml-2 text-lg">expand_more</span>
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

// User data
const user = ref<any>(null)

// Get user info on mount
onMounted(async () => {
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  user.value = currentUser
})

// Computed properties for user display
const userName = computed(() => {
  if (!user.value) return 'Loading...'
  // Try to get name from user_metadata (Slack OAuth stores it there)
  return user.value.user_metadata?.full_name || 
         user.value.user_metadata?.name || 
         user.value.email?.split('@')[0] || 
         'User'
})

const userEmail = computed(() => {
  return user.value?.email || ''
})

const userAvatar = computed(() => {
  // Slack stores avatar in user_metadata
  return user.value?.user_metadata?.avatar_url || 
         user.value?.user_metadata?.picture ||
         null
})

const userInitials = computed(() => {
  const name = userName.value
  if (name === 'Loading...') return '...'
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
})

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
