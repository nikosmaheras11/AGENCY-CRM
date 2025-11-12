export default defineNuxtRouteMiddleware(async (to, from) => {
  const { supabase } = useSupabase()
  
  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    // User is not authenticated, redirect to login
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
})
