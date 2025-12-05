export default defineNuxtRouteMiddleware(async (to, from) => {
  // Only run on client-side - server doesn't have access to localStorage session
  if (import.meta.server) {
    return // Skip on server, let client handle auth
  }
  
  const { supabase } = useSupabase()
  
  if (!supabase) {
    console.warn('[auth middleware] Supabase client not available')
    return navigateTo('/login')
  }
  
  // Check if user is authenticated
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error) {
    console.error('[auth middleware] Error getting session:', error)
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
  
  if (!session) {
    // User is not authenticated, redirect to login
    console.log('[auth middleware] No session, redirecting to login')
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
  
  console.log('[auth middleware] Session valid for:', session.user.email)
})
