/**
 * Composable for user authentication and profile management
 */

export interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  role: 'admin' | 'designer' | 'account_manager' | 'client' | 'member'
}

export const useAuth = () => {
  const { supabase } = useSupabase()
  
  const user = ref<any>(null)
  const profile = ref<UserProfile | null>(null)
  const loading = ref(true)

  /**
   * Get current authenticated user
   */
  const getCurrentUser = async () => {
    try {
      const { data: { user: authUser }, error } = await supabase.auth.getUser()
      
      if (error) throw error
      
      user.value = authUser
      
      // Fetch user profile
      if (authUser) {
        await fetchProfile(authUser.id)
      }
      
      return authUser
    } catch (e) {
      console.error('Error getting current user:', e)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch user profile from profiles table
   */
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) throw error
      
      profile.value = data
      return data
    } catch (e) {
      console.error('Error fetching profile:', e)
      return null
    }
  }

  /**
   * Sign in with email and password
   */
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      
      user.value = data.user
      
      if (data.user) {
        await fetchProfile(data.user.id)
      }
      
      return { data, error: null }
    } catch (e: any) {
      console.error('Sign in error:', e)
      return { data: null, error: e }
    }
  }

  /**
   * Sign up with email and password
   */
  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      })
      
      if (error) throw error
      
      return { data, error: null }
    } catch (e: any) {
      console.error('Sign up error:', e)
      return { data: null, error: e }
    }
  }

  /**
   * Sign out
   */
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      user.value = null
      profile.value = null
    } catch (e) {
      console.error('Sign out error:', e)
    }
  }

  /**
   * Update user profile
   */
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user.value) return { data: null, error: new Error('No user logged in') }
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.value.id)
        .select()
        .single()
      
      if (error) throw error
      
      profile.value = data
      return { data, error: null }
    } catch (e: any) {
      console.error('Update profile error:', e)
      return { data: null, error: e }
    }
  }

  /**
   * Listen for auth state changes
   */
  const initAuthListener = () => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event)
      
      if (session?.user) {
        user.value = session.user
        await fetchProfile(session.user.id)
      } else {
        user.value = null
        profile.value = null
      }
    })
  }

  /**
   * Get display name for user
   */
  const getDisplayName = computed(() => {
    if (!user.value) return 'Anonymous'
    return profile.value?.full_name || user.value.email?.split('@')[0] || 'User'
  })

  /**
   * Check if user is admin
   */
  const isAdmin = computed(() => {
    return profile.value?.role === 'admin'
  })

  /**
   * Get user initials for avatar
   */
  const getInitials = computed(() => {
    if (!profile.value?.full_name) {
      return user.value?.email?.substring(0, 2).toUpperCase() || 'U'
    }
    
    return profile.value.full_name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  })

  // Initialize on mount
  onMounted(() => {
    getCurrentUser()
    initAuthListener()
  })

  return {
    user,
    profile,
    loading,
    getCurrentUser,
    fetchProfile,
    signIn,
    signUp,
    signOut,
    updateProfile,
    getDisplayName,
    isAdmin,
    getInitials
  }
}
