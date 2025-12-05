<template>
  <div class="auth-callback">
    <div class="loading-container">
      <UIcon name="i-heroicons-arrow-path" class="loading-icon" />
      <p>{{ statusMessage }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { supabase } = useSupabase()
const statusMessage = ref('Completing sign in...')

// Handle OAuth callback on client-side only
if (import.meta.client) {
  onMounted(async () => {
    console.log('[auth/callback] Processing OAuth callback...')
    console.log('[auth/callback] URL:', window.location.href)
    console.log('[auth/callback] Query params:', route.query)
    
    try {
      // Check for error in URL
      const error = route.query.error as string
      const errorDescription = route.query.error_description as string
      
      if (error) {
        console.error('[auth/callback] OAuth error:', error, errorDescription)
        await navigateTo(`/login?error=${error}`)
        return
      }
      
      // Get the authorization code from URL
      const code = route.query.code as string
      
      if (!code) {
        console.error('[auth/callback] No code in callback URL')
        await navigateTo('/login?error=no_code')
        return
      }
      
      console.log('[auth/callback] Got authorization code, exchanging for session...')
      statusMessage.value = 'Exchanging authorization code...'
      
      // Exchange the code for a session - THIS IS THE KEY FIX
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error('[auth/callback] Code exchange error:', exchangeError)
        await navigateTo(`/login?error=exchange_failed&message=${encodeURIComponent(exchangeError.message)}`)
        return
      }
      
      if (!data.session) {
        console.error('[auth/callback] No session returned from code exchange')
        await navigateTo('/login?error=no_session')
        return
      }
      
      console.log('[auth/callback] Session established for:', data.session.user.email)
      statusMessage.value = 'Setting up your account...'
      
      // Ensure profile exists in database
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.session.user.id)
        .maybeSingle()
      
      if (!profile) {
        console.log('[auth/callback] Creating profile for new user')
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.session.user.id,
            email: data.session.user.email,
            full_name: data.session.user.user_metadata?.full_name || data.session.user.user_metadata?.name,
            avatar_url: data.session.user.user_metadata?.avatar_url,
            role: 'member'
          })
        
        if (profileError) {
          console.error('[auth/callback] Failed to create profile:', profileError)
          // Continue anyway - profile can be created later
        }
      }
      
      // Get the redirect URL from query params or default to home
      const redirectTo = route.query.redirect as string || '/'
      
      console.log('[auth/callback] Success! Redirecting to:', redirectTo)
      statusMessage.value = 'Success! Redirecting...'
      
      // Small delay to ensure session is persisted
      await new Promise(resolve => setTimeout(resolve, 500))
      
      await navigateTo(redirectTo)
    } catch (error: any) {
      console.error('[auth/callback] Unexpected error:', error)
      await navigateTo(`/login?error=unexpected_error&message=${encodeURIComponent(error.message || 'Unknown error')}`)
    }
  })
}

definePageMeta({
  layout: false,
  middleware: [] // No middleware - allow unauthenticated access to complete OAuth
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
