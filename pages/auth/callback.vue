<template>
  <div class="auth-callback">
    <div class="loading-container">
      <UIcon name="i-heroicons-arrow-path" class="loading-icon" />
      <p>Completing sign in...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { supabase } = useSupabase()

onMounted(async () => {
  try {
    // Supabase automatically handles the OAuth callback
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Auth error:', error)
      await navigateTo('/login?error=auth_failed')
      return
    }
    
    if (session) {
      // Successfully authenticated, redirect to dashboard
      await navigateTo('/')
    } else {
      // No session, redirect to login
      await navigateTo('/login')
    }
  } catch (error) {
    console.error('Auth callback error:', error)
    await navigateTo('/login?error=unexpected_error')
  }
})
</script>

<style scoped>
.auth-callback {
  @apply min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900;
}

.loading-container {
  @apply text-center;
}

.loading-icon {
  @apply text-4xl text-blue-600 animate-spin mb-4 mx-auto;
}

.loading-container p {
  @apply text-gray-600 dark:text-gray-400;
}
</style>
