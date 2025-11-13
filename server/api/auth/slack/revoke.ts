import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  try {
    // Get the user's session
    const authHeader = getHeader(event, 'authorization')
    
    if (!authHeader) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized'
      })
    }
    
    const token = authHeader.replace('Bearer ', '')
    
    // Create Supabase client with the user's token
    const supabase = createClient(
      config.public.supabaseUrl,
      config.public.supabaseAnonKey,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    )
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'User not found'
      })
    }
    
    // Get user's profile with Slack token
    const { data: profile } = await supabase
      .from('profiles')
      .select('slack_access_token')
      .eq('id', user.id)
      .single()
    
    if (profile?.slack_access_token) {
      // Revoke the Slack OAuth token
      await fetch('https://slack.com/api/auth.revoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          token: profile.slack_access_token
        })
      })
      
      // Clear the token from the profile
      await supabase
        .from('profiles')
        .update({ slack_access_token: null })
        .eq('id', user.id)
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error revoking Slack token:', error)
    // Don't fail the sign out if revocation fails
    return { success: true, warning: 'Token revocation failed but sign out continues' }
  }
})
