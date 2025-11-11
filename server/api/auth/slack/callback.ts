import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)
  
  const code = query.code as string
  const error = query.error as string
  
  // Handle OAuth errors
  if (error) {
    console.error('Slack OAuth error:', error)
    return sendRedirect(event, '/?error=slack_auth_failed')
  }
  
  if (!code) {
    return sendRedirect(event, '/?error=no_code')
  }
  
  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: config.public.slackClientId,
        client_secret: config.slackClientSecret,
        code: code,
        redirect_uri: `${config.public.siteUrl}/api/auth/slack/callback`
      })
    })
    
    const tokenData = await tokenResponse.json()
    
    if (!tokenData.ok) {
      console.error('Slack token exchange failed:', tokenData.error)
      return sendRedirect(event, '/?error=token_exchange_failed')
    }
    
    // Get user info from Slack
    const userResponse = await fetch('https://slack.com/api/users.info', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.authed_user.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user: tokenData.authed_user.id
      })
    })
    
    const userData = await userResponse.json()
    
    if (!userData.ok) {
      console.error('Failed to get Slack user info:', userData.error)
      return sendRedirect(event, '/?error=user_info_failed')
    }
    
    const slackUser = userData.user
    
    // Create Supabase admin client
    const supabase = createClient(
      config.public.supabaseUrl,
      config.supabaseServiceKey
    )
    
    // Check if user exists by Slack ID
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('slack_id', slackUser.id)
      .single()
    
    let userId: string
    
    if (existingProfile) {
      // Update existing profile
      userId = existingProfile.id
      
      await supabase
        .from('profiles')
        .update({
          first_name: slackUser.profile.first_name || slackUser.real_name?.split(' ')[0],
          last_name: slackUser.profile.last_name || slackUser.real_name?.split(' ').slice(1).join(' '),
          avatar_url: slackUser.profile.image_192,
          slack_access_token: tokenData.authed_user.access_token,
        })
        .eq('id', userId)
    } else {
      // Create new user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: slackUser.profile.email,
        email_confirm: true,
        user_metadata: {
          slack_id: slackUser.id,
          full_name: slackUser.real_name,
          avatar_url: slackUser.profile.image_192
        }
      })
      
      if (authError) {
        console.error('Failed to create Supabase user:', authError)
        return sendRedirect(event, '/?error=user_creation_failed')
      }
      
      userId = authData.user.id
      
      // Create profile
      await supabase
        .from('profiles')
        .insert({
          id: userId,
          slack_id: slackUser.id,
          first_name: slackUser.profile.first_name || slackUser.real_name?.split(' ')[0],
          last_name: slackUser.profile.last_name || slackUser.real_name?.split(' ').slice(1).join(' '),
          avatar_url: slackUser.profile.image_192,
          slack_access_token: tokenData.authed_user.access_token,
        })
    }
    
    // Generate auth link for the user (works with latest Supabase)
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: slackUser.profile.email,
      options: {
        redirectTo: `${config.public.siteUrl}/dashboard`
      }
    })
    
    if (linkError) {
      console.error('Failed to generate auth link:', linkError)
      return sendRedirect(event, '/?error=session_creation_failed')
    }
    
    // Extract the token from the generated link
    const url = new URL(linkData.properties.action_link)
    const token = url.searchParams.get('token')
    const tokenHash = url.searchParams.get('token_hash')
    
    if (!token || !tokenHash) {
      console.error('No token in generated link')
      return sendRedirect(event, '/?error=no_token')
    }
    
    // Verify the token and create session
    const { data: sessionData, error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: 'magiclink'
    })
    
    if (verifyError) {
      console.error('Failed to verify OTP:', verifyError)
      return sendRedirect(event, '/?error=verification_failed')
    }
    
    // Redirect with token in URL for client-side session establishment
    return sendRedirect(event, `/auth/callback?access_token=${sessionData.session.access_token}&refresh_token=${sessionData.session.refresh_token}&type=slack`)
    
  } catch (error) {
    console.error('Slack OAuth callback error:', error)
    return sendRedirect(event, '/?error=unexpected_error')
  }
})
