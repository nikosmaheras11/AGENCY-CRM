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
  const accessToken = route.query.access_token as string
  const refreshToken = route.query.refresh_token as string
  
  if (accessToken && refreshToken) {
    try {
      // Set the session on the client
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      })
      
      if (error) {
        console.error('Failed to set session:', error)
        navigateTo('/?error=session_failed')
        return
      }
      
      // Successfully authenticated, redirect to dashboard
      navigateTo('/dashboard')
    } catch (error) {
      console.error('Auth callback error:', error)
      navigateTo('/?error=unexpected_error')
    }
  } else {
    // No tokens provided, redirect to login
    navigateTo('/login')
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
