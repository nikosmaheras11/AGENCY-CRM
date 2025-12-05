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

// Handle OAuth callback on client-side only
if (import.meta.client) {
  onMounted(async () => {
    console.log('[auth/callback] Processing OAuth callback...')
    
    try {
      // Get the code and error from URL
      const code = route.query.code as string
      const error = route.query.error as string
      const errorDescription = route.query.error_description as string
      
      if (error) {
        console.error('[auth/callback] OAuth error:', error, errorDescription)
        await navigateTo(`/login?error=${error}`)
        return
      }
      
      if (!code) {
        console.error('[auth/callback] No code in callback URL')
        await navigateTo('/login?error=no_code')
        return
      }
      
      console.log('[auth/callback] Exchanging code for session...')
      
      // Exchange the code for a session
      // Supabase JS client automatically handles PKCE code exchange when detectSessionInUrl is true
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('[auth/callback] Session error:', sessionError)
        await navigateTo('/login?error=auth_failed')
        return
      }
      
      if (session) {
        console.log('[auth/callback] Session established:', session.user.email)
        
        // Ensure profile exists in database
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle()
        
        if (!profile) {
          console.log('[auth/callback] Creating profile for new user')
          // Create profile from Slack user metadata
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: session.user.id,
              email: session.user.email,
              full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
              avatar_url: session.user.user_metadata?.avatar_url,
              role: 'member' // Default role
            })
          
          if (profileError) {
            console.error('[auth/callback] Failed to create profile:', profileError)
            // Continue anyway - profile can be created later
          }
        }
        
        // Successfully authenticated, redirect to dashboard
        console.log('[auth/callback] Redirecting to dashboard')
        await navigateTo('/')
      } else {
        console.error('[auth/callback] No session after exchange')
        await navigateTo('/login?error=session_failed')
      }
    } catch (error) {
      console.error('[auth/callback] Unexpected error:', error)
      await navigateTo('/login?error=unexpected_error')
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
