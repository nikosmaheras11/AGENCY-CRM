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

// Module-level singleton for SSR safety
let _supabaseClient: SupabaseClient | null = null
const _user = ref<User | null>(null)

export const useSupabase = () => {
  // Get runtime config - try directly first, fallback to tryUseNuxtApp
  let config
  try {
    config = useRuntimeConfig()
  } catch (e) {
    // If direct call fails, try using nuxtApp context
    const nuxtApp = tryUseNuxtApp()
    if (!nuxtApp) {
      console.warn('[useSupabase] Cannot access runtime config, returning safe defaults')
      return {
        supabase: null as any,
        client: null as any,
        user: _user,
        uploadFile: async () => null,
        getPublicUrl: () => '',
        uploadVideo: async () => '',
        uploadImage: async () => '',
        generateVideoThumbnail: async () => new Blob()
      }
    }
    try {
      config = nuxtApp.runWithContext(() => useRuntimeConfig())
    } catch (e2) {
      console.error('[useSupabase] Failed to get runtime config:', e2)
      return {
        supabase: null as any,
        client: null as any,
        user: _user,
        uploadFile: async () => null,
        getPublicUrl: () => '',
        uploadVideo: async () => '',
        uploadImage: async () => '',
        generateVideoThumbnail: async () => new Blob()
      }
    }
  }

  // Validate config has required Supabase values
  if (!config?.public?.supabaseUrl || !config?.public?.supabaseAnonKey) {
    console.error('[useSupabase] Missing Supabase configuration:', {
      hasUrl: !!config?.public?.supabaseUrl,
      hasKey: !!config?.public?.supabaseAnonKey
    })
    return {
      supabase: null as any,
      client: null as any,
      user: _user,
      uploadFile: async () => null,
      getPublicUrl: () => '',
      uploadVideo: async () => '',
      uploadImage: async () => '',
      generateVideoThumbnail: async () => new Blob()
    }
  }

  // Initialize Supabase client if needed
  if (!_supabaseClient) {
    _supabaseClient = createClient(
      config.public.supabaseUrl as string,
      config.public.supabaseAnonKey as string,
      {
        auth: {
          flowType: 'pkce',
          detectSessionInUrl: true,
          persistSession: true,
          autoRefreshToken: true
        }
      }
    )
  }

  const supabase = _supabaseClient!

  // Initialize user on client side only
  const initUser = async () => {
    if (import.meta.client && supabase) {
      try {
        const { data } = await supabase.auth.getUser()
        _user.value = data.user
      } catch (e) {
        console.warn('[useSupabase] Failed to get user:', e)
      }
    }
  }

  // Auto-init on client if user not set
  if (import.meta.client && !_user.value && supabase) {
    initUser()
  }

  /**
   * Upload file to Supabase Storage
   */
  const uploadFile = async (bucket: string, path: string, file: File) => {
    if (!supabase) throw new Error('Supabase client not initialized')
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
    if (!supabase) return ''
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
   * Generate thumbnail from video (client-side only)
   */
  const generateVideoThumbnail = (videoFile: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!import.meta.client) {
        reject(new Error('generateVideoThumbnail can only be called on client'))
        return
      }

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
    supabase,
    client: supabase,
    user: _user,
    uploadFile,
    getPublicUrl,
    uploadVideo,
    uploadImage,
    generateVideoThumbnail
  }
}

  // Initialize user on client side only
  const initUser = async () => {
    if (import.meta.client && supabase) {
      try {
        const { data } = await supabase.auth.getUser()
        _user.value = data.user
      } catch (e) {
        console.warn('[useSupabase] Failed to get user:', e)
      }
    }
  }

  // Auto-init on client if user not set
  if (import.meta.client && !_user.value && supabase) {
    initUser()
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
   * Generate thumbnail from video (client-side only)
   */
  const generateVideoThumbnail = (videoFile: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!import.meta.client) {
        reject(new Error('generateVideoThumbnail can only be called on client'))
        return
      }

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
    supabase,
    client: supabase,
    user: _user,
    uploadFile,
    getPublicUrl,
    uploadVideo,
    uploadImage,
    generateVideoThumbnail
  }
}
