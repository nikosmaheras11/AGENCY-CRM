export interface RequestFormData {
  creativeName: string
  toUser?: string
  platform?: string
  adSizeFormat?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  dueDate?: string
  creativeDescription?: string
  inspiration?: string
  figmaAssetLinks?: string
  assetFile?: File | null
}

export const useRequestForm = () => {
  const { supabase, uploadImage, uploadVideo, generateVideoThumbnail, uploadFile, getPublicUrl } = useSupabase()
  
  const submitting = ref(false)
  const error = ref<string | null>(null)
  
  const submitRequest = async (formData: RequestFormData) => {
    console.log('[useRequestForm] Starting submission...', { formData: { ...formData, assetFile: formData.assetFile?.name } })
    console.log('[useRequestForm] Supabase client configured')
    
    try {
      submitting.value = true
      error.value = null
      
      // Get current user directly from session
      console.log('[useRequestForm] Getting user from session...')
      const { data: authData, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        console.error('[useRequestForm] Auth error:', authError)
        throw new Error(`Authentication error: ${authError.message}`)
      }
      
      const user = authData.user
      
      console.log('[useRequestForm] Session data:', { hasUser: !!user, userData: user })
      
      // Check auth first
      if (!user) {
        console.error('[useRequestForm] No authenticated user found!')
        console.log('[useRequestForm] Checking session...')
        const { data: sessionData } = await supabase.auth.getSession()
        console.log('[useRequestForm] Session:', sessionData)
        throw new Error('You must be logged in to create a request')
      }
      console.log('[useRequestForm] User authenticated:', user.id)
      console.log('[useRequestForm] User email:', user.email)
      
      // Handle file upload if present
      let assetFileUrl: string | null = null
      let thumbnailUrl: string | null = null
      
      if (formData.assetFile) {
        console.log('[useRequestForm] Processing file upload:', formData.assetFile.name)
        const file = formData.assetFile
        const fileType = file.type.split('/')[0] // 'image' or 'video'
        
        if (fileType === 'image') {
          console.log('[useRequestForm] Uploading image...')
          assetFileUrl = await uploadImage(file, 'requests')
          thumbnailUrl = assetFileUrl // Use image as its own thumbnail
          console.log('[useRequestForm] Image uploaded:', assetFileUrl)
        } else if (fileType === 'video') {
          console.log('[useRequestForm] Uploading video...')
          assetFileUrl = await uploadVideo(file, 'requests')
          console.log('[useRequestForm] Video uploaded:', assetFileUrl)
          
          // Generate thumbnail from video
          try {
            console.log('[useRequestForm] Generating video thumbnail...')
            const thumbnailBlob = await generateVideoThumbnail(file)
            const thumbnailFile = new File([thumbnailBlob], `thumbnail-${Date.now()}.jpg`, { type: 'image/jpeg' })
            
            // Upload thumbnail
            const thumbnailPath = `requests/thumbnails/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`
            await uploadFile('assets', thumbnailPath, thumbnailFile)
            thumbnailUrl = getPublicUrl('assets', thumbnailPath)
            console.log('[useRequestForm] Thumbnail generated and uploaded:', thumbnailUrl)
          } catch (thumbError) {
            console.error('[useRequestForm] Failed to generate thumbnail:', thumbError)
            // Fallback: use video URL (browser will show first frame)
            thumbnailUrl = assetFileUrl
          }
        } else {
          console.log('[useRequestForm] Uploading generic file...')
          // For other file types, use generic upload
          const fileExt = file.name.split('.').pop()
          const fileName = `requests/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
          
          const { error: uploadError } = await supabase.storage
            .from('assets')
            .upload(fileName, file)
          
          if (uploadError) {
            console.error('[useRequestForm] File upload error:', uploadError)
            throw uploadError
          }
          
          const { data } = supabase.storage
            .from('assets')
            .getPublicUrl(fileName)
          
          assetFileUrl = data.publicUrl
          thumbnailUrl = assetFileUrl // Use file URL as thumbnail
          console.log('[useRequestForm] Generic file uploaded:', assetFileUrl)
        }
      }
      
      // Parse platform and ad size format as arrays for new_requests table
      const platformArray = formData.platform ? [formData.platform] : []
      const adSizeArray = formData.adSizeFormat ? formData.adSizeFormat.split(',').map(s => s.trim()) : []
      
      // Get user display name
      const createdByName = user?.user_metadata?.full_name || 
                           user?.user_metadata?.name || 
                           user?.email?.split('@')[0] || 
                           'Unknown'
      
      console.log('[useRequestForm] Created by name:', createdByName)
      
      // Prepare brief data for new_requests table (brief stage)
      const briefData = {
        title: formData.creativeName,
        description: formData.creativeDescription || '',
        project_type: 'creative' as const,
        status: 'new-request' as const,
        priority: formData.priority || 'medium',
        // Brief-specific array fields:
        platform: platformArray,  // Array: ["Meta", "TikTok", etc.]
        ad_size_format: adSizeArray,  // Array: ["1080x1920", "Carousel", etc.]
        due_date: formData.dueDate || null,
        inspiration: formData.inspiration || null,
        figma_url: formData.figmaAssetLinks || null,
        reference_urls: formData.figmaAssetLinks ? [formData.figmaAssetLinks] : [],
        created_by: user?.id || null,
        created_by_name: createdByName,
        assignee: formData.toUser || 'Unassigned',
        assigned_to: null  // TODO: Map toUser to user ID if needed
      }
      
      console.log('[useRequestForm] Inserting brief data to new_requests:', briefData)
      
      // Use REST API directly with proper Prefer header instead of .select()
      // This avoids the .select() hang issue with the JS client
      console.log('[useRequestForm] Calling REST API insert to new_requests table...')
      
      const config = useRuntimeConfig()
      const restUrl = `${config.public.supabaseUrl}/rest/v1/new_requests`
      const authHeader = await supabase.auth.getSession()
      const token = authHeader.data.session?.access_token || config.public.supabaseAnonKey
      
      const response = await fetch(restUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': config.public.supabaseAnonKey,
          'Authorization': `Bearer ${token}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(briefData)
      })
      
      console.log('[useRequestForm] Got response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('[useRequestForm] API error:', errorData)
        throw new Error(errorData.message || `API error: ${response.status}`)
      }
      
      const insertedData = await response.json()
      console.log('[useRequestForm] Brief inserted successfully to new_requests:', insertedData[0])
      
      // Note: Asset file upload not supported in brief stage
      // Files will be uploaded when request graduates to asset review stage
      const briefRecord = insertedData[0] // REST API returns array
      if (assetFileUrl && briefRecord) {
        console.warn('[useRequestForm] Asset file uploaded but brief stage does not support file storage yet')
        console.log('[useRequestForm] File will need to be re-uploaded when moving to review stage')
        // TODO: Store file temporarily or add to reference_urls
      }
      }
      
      console.log('[useRequestForm] Submission complete! Returning:', requestRecord)
      return requestRecord
    } catch (err: any) {
      error.value = err.message || 'Failed to submit request'
      console.error('[useRequestForm] ERROR:', err)
      console.error('[useRequestForm] Error details:', {
        message: err.message,
        code: err.code,
        details: err.details,
        hint: err.hint
      })
      throw err
    } finally {
      submitting.value = false
    }
  }
  
  return {
    submitRequest,
    submitting: readonly(submitting),
    error: readonly(error)
  }
}
