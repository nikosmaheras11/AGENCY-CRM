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
        <div v-if="user" ref="userMenuContainer" class="relative">
          <button 
            @click.stop="toggleUserMenu"
            class="flex items-center pl-4 border-l border-white/10 hover:bg-white/5 rounded-lg transition-colors py-1 pr-2"
          >
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
            <span 
              class="material-icons text-slate-400 ml-2 text-lg transition-transform"
              :class="{ 'rotate-180': showUserMenu }"
            >
              expand_more
            </span>
          </button>
          
          <!-- User Dropdown Menu -->
          <transition
            enter-active-class="transition ease-out duration-100"
            enter-from-class="transform opacity-0 scale-95"
            enter-to-class="transform opacity-100 scale-100"
            leave-active-class="transition ease-in duration-75"
            leave-from-class="transform opacity-100 scale-100"
            leave-to-class="transform opacity-0 scale-95"
          >
            <div 
              v-if="showUserMenu"
              class="absolute right-0 top-full mt-2 w-40 card-glass border border-white/10 rounded-lg shadow-lg overflow-hidden z-50"
            >
              <button
                @mousedown.prevent.stop="signOut"
                class="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors cursor-pointer"
              >
                <span class="material-icons text-lg">logout</span>
                <span>Sign Out</span>
              </button>
            </div>
          </transition>
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import RequestFormModal from '~/components/creative/RequestFormModal.vue'
import type { RequestFormModalInstance } from '~/types/components'

const { supabase } = useSupabase()
const { user, profile, loading: authLoading, getDisplayName } = useAuth()

// User menu state
const showUserMenu = ref(false)
const userMenuContainer = ref<HTMLElement | null>(null)

// Toggle user menu
function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value
}

// Close menu when clicking outside
function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (userMenuContainer.value && !userMenuContainer.value.contains(target)) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Sign out function
async function signOut() {
  try {
    showUserMenu.value = false
    
    // Get current session token
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session?.access_token) {
      // Revoke Slack OAuth token
      try {
        await $fetch('/api/auth/slack/revoke', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        })
      } catch (error) {
        // Continue with sign out even if Slack revocation fails
        console.warn('Slack token revocation failed:', error)
      }
    }
    
    // Sign out from Supabase
    await supabase.auth.signOut()
    
    // Redirect to login page
    await navigateTo('/login')
  } catch (error) {
    console.error('Error signing out:', error)
  }
}

// Computed properties for user display
const userName = computed(() => {
  if (authLoading.value) return 'Loading...'
  if (!user.value) return 'User'
  // Try to get name from profile, then user_metadata (Slack OAuth stores it there)
  return profile.value?.full_name ||
         user.value.user_metadata?.full_name || 
         user.value.user_metadata?.name || 
         user.value.email?.split('@')[0] || 
         'User'
})

const userEmail = computed(() => {
  return user.value?.email || ''
})

const userAvatar = computed(() => {
  // Check profile first, then Slack metadata
  return profile.value?.avatar_url ||
         user.value?.user_metadata?.avatar_url || 
         user.value?.user_metadata?.picture ||
         null
})

const userInitials = computed(() => {
  const name = userName.value
  if (name === 'Loading...' || authLoading.value) return '...'
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
