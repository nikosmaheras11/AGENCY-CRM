import { createClient } from '@supabase/supabase-js'
import type { User } from '@supabase/supabase-js'

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

// Singleton Supabase client - created once and reused
let supabaseClient: any = null

export const useSupabase = () => {
  const config = useRuntimeConfig()
  
  // Create client only once
  if (!supabaseClient) {
    supabaseClient = createClient(
      config.public.supabaseUrl,
      config.public.supabaseAnonKey
    )
  }
  
  const supabase = supabaseClient

  // Get current user state
  const user = useState<User | null>('supabase-user', () => null)
  
  // Initialize user
  const initUser = async () => {
    const { data } = await supabase.auth.getUser()
    user.value = data.user
  }
  
  // Only run on client side
  if (process.client && !user.value) {
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
    supabase,
    client: supabase,
    user,
    uploadFile,
    getPublicUrl,
    uploadVideo,
    uploadImage,
    generateVideoThumbnail
  }
}
