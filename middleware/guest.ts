export default defineNuxtRouteMiddleware(async (to, from) => {
  // Only run on client-side - server doesn't have access to localStorage session
  if (import.meta.server) {
    return // Skip on server, let client handle auth
  }
  
  const { supabase } = useSupabase()
  
  if (!supabase) {
    return // Can't check, allow access
  }
  
  // Check if user is already authenticated
  const { data: { session } } = await supabase.auth.getSession()
  
  if (session) {
    // User is already logged in, redirect to dashboard
    console.log('[guest middleware] User already logged in, redirecting to dashboard')
    return navigateTo('/')
  }
})
