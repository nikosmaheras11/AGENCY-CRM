import { createClient } from '@supabase/supabase-js'
import type { User, SupabaseClient } from '@supabase/supabase-js'

// Database types
export interface SlackMessage {
  id: string
  channel_id: string
  channel_name: string
  user_id: string
  user_name: string
  text: string
  timestamp: string
  permalink: string | null
  thread_ts: string | null
  is_thread_reply: boolean
  parent_message_id: string | null
  created_at: string
  reactions: Array<{
    name: string
    user: string
    timestamp: number
  }>
  mentions: any[]
}

export const useSupabase = () => {
  const nuxtApp = tryUseNuxtApp()

  // If called outside of Nuxt context (e.g. some edge cases), return a dummy or throw
  if (!nuxtApp) {
    console.warn('useSupabase called outside of Nuxt context')
    // We can't do much without context, but we can try to return a minimal object
    // to prevent immediate destructuring errors
    return {
      supabase: null as any,
      client: null as any,
      user: ref(null),
      uploadFile: async () => null,
      getPublicUrl: () => '',
      uploadVideo: async () => '',
      uploadImage: async () => '',
      generateVideoThumbnail: async () => new Blob()
    }
  }

  const config = useRuntimeConfig()

  // Initialize or retrieve the Supabase client
  // We use nuxtApp to store the client instance instead of useState
  // because useState tries to serialize the object (causing 500 error)
  // while nuxtApp is per-request on server and singleton on client
  let supabaseClient = (nuxtApp as any)._supabaseClient

  if (!supabaseClient) {
    // Custom storage adapter using Nuxt Cookies
    // This allows the session to persist across SSR
    const cookieOptions = {
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production'
    }

    const storageAdapter = {
      getItem: (key: string) => {
        // We use a specific prefix for auth tokens to avoid conflicts
        // Supabase default key is usually 'sb-<project-ref>-auth-token'
        // We'll just use the key passed by Supabase
        return nuxtApp.runWithContext(() => {
          const cookie = useCookie(key)
          return cookie.value
        })
      },
      setItem: (key: string, value: string) => {
        nuxtApp.runWithContext(() => {
          const cookie = useCookie(key, cookieOptions)
          cookie.value = value
        })
      },
      removeItem: (key: string) => {
        nuxtApp.runWithContext(() => {
          const cookie = useCookie(key, cookieOptions)
          cookie.value = null
        })
      }
    }

    supabaseClient = createClient(
      config.public.supabaseUrl,
      config.public.supabaseAnonKey,
      {
        auth: {
          storage: storageAdapter,
          flowType: 'pkce',
          detectSessionInUrl: true,
          persistSession: true,
          autoRefreshToken: true
        }
      }
    )

      // Save to nuxtApp for reuse
      ; (nuxtApp as any)._supabaseClient = supabaseClient
  }

  const supabase = supabaseClient

  // Get current user state
  const user = useState<User | null>('supabase-user', () => null)

  // Initialize user
  const initUser = async () => {
    const { data } = await supabase.auth.getUser()
    user.value = data.user
  }

  // Initialize on mount (client-side) or if not present
  if (process.client && !user.value) {
    initUser()
  }

  // Also try to init on server if we have a session
  if (process.server && !user.value) {
    // We can't await in setup, but we can start the promise
    // Or rely on middleware to handle the critical auth checks
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        user.value = data.session.user
      }
    })
  }

  /**
   * Upload file to Supabase Storage
   */
  const uploadFile = async (bucket: string, path: string, file: File) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) throw error
    return data
  }

  /**
   * Get public URL for a file
   */
  const getPublicUrl = (bucket: string, path: string) => {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)

    return data.publicUrl
  }

  /**
   * Upload video and get streaming URL
   */
  const uploadVideo = async (file: File, folder: string = 'videos') => {
    const fileName = `${folder}/${Date.now()}-${file.name}`
    await uploadFile('assets', fileName, file)
    return getPublicUrl('assets', fileName)
  }

  /**
   * Upload image and get URL
   */
  const uploadImage = async (file: File, folder: string = 'images') => {
    const fileName = `${folder}/${Date.now()}-${file.name}`
    await uploadFile('assets', fileName, file)
    return getPublicUrl('assets', fileName)
  }

  /**
   * Generate thumbnail from video (client-side)
   */
  const generateVideoThumbnail = (videoFile: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video')
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      video.preload = 'metadata'
      video.src = URL.createObjectURL(videoFile)

      video.onloadedmetadata = () => {
        video.currentTime = 1 // Get frame at 1 second
      }

      video.onseeked = () => {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height)

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to generate thumbnail'))
          }
          URL.revokeObjectURL(video.src)
        }, 'image/jpeg', 0.8)
      }

      video.onerror = reject
    })
  }

  return {
    supabase: supabase,
    client: supabase,
    user,
    uploadFile,
    getPublicUrl,
    uploadVideo,
    uploadImage,
    generateVideoThumbnail
  }
}
