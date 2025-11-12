export default defineNuxtRouteMiddleware(async (to, from) => {
  const { supabase } = useSupabase()
  
  // Check if user is already authenticated
  const { data: { session } } = await supabase.auth.getSession()
  
  if (session) {
    // User is already logged in, redirect to dashboard
    return navigateTo('/')
  }
})
