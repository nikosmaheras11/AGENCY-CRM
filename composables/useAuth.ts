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
  // Use useState for SSR-safe shared state
  const user = useState<any>('auth-user', () => null)
  const profile = useState<UserProfile | null>('auth-profile', () => null)
  const loading = useState<boolean>('auth-loading', () => true)

  const { supabase } = useSupabase()

  /**
   * Get current authenticated user
   */
  const getCurrentUser = async () => {
    if (!supabase) return null
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
      console.error('[useAuth] Error getting current user:', e)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch user profile from profiles table
   */
  const fetchProfile = async (userId: string) => {
    if (!supabase) return null
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) throw error

      profile.value = data
      return data
    } catch (e) {
      console.error('[useAuth] Error fetching profile:', e)
      return null
    }
  }

  /**
   * Sign in with email and password
   */
  const signIn = async (email: string, password: string) => {
    if (!supabase) return { data: null, error: new Error('Supabase not initialized') }
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
      console.error('[useAuth] Sign in error:', e)
      return { data: null, error: e }
    }
  }

  /**
   * Sign up with email and password
   */
  const signUp = async (email: string, password: string, fullName?: string) => {
    if (!supabase) return { data: null, error: new Error('Supabase not initialized') }
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
      console.error('[useAuth] Sign up error:', e)
      return { data: null, error: e }
    }
  }

  /**
   * Sign out
   */
  const signOut = async () => {
    if (!supabase) return
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      user.value = null
      profile.value = null
    } catch (e) {
      console.error('[useAuth] Sign out error:', e)
    }
  }

  /**
   * Update user profile
   */
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!supabase) return { data: null, error: new Error('Supabase not initialized') }
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
      console.error('[useAuth] Update profile error:', e)
      return { data: null, error: e }
    }
  }

  /**
   * Listen for auth state changes
   */
  const initAuthListener = () => {
    if (!supabase) return
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[useAuth] Auth state changed:', event)

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

  // Initialize on mount (client-side only)
  if (import.meta.client) {
    onMounted(() => {
      getCurrentUser()
      initAuthListener()
    })
  }

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
