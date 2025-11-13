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
  const { supabase, uploadImage, uploadVideo } = useSupabase()
  
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
      const { data, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        console.error('[useRequestForm] Auth error:', authError)
        throw new Error(`Authentication error: ${authError.message}`)
      }
      
      const user = data.user
      
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
          console.log('[useRequestForm] Image uploaded:', assetFileUrl)
        } else if (fileType === 'video') {
          console.log('[useRequestForm] Uploading video...')
          assetFileUrl = await uploadVideo(file, 'requests')
          console.log('[useRequestForm] Video uploaded:', assetFileUrl)
          // Generate thumbnail from video if needed
          // thumbnailUrl = await generateVideoThumbnail(file)
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
          console.log('[useRequestForm] Generic file uploaded:', assetFileUrl)
        }
      }
      
      // Parse ad size format (e.g., "1080x1920, Carousel")
      const formatParts = formData.adSizeFormat?.split(',').map(s => s.trim()) || []
      const dimensions = formatParts[0] || null
      const format = formatParts[1] || formData.platform || null
      
      // Get user display name
      const createdByName = user?.user_metadata?.full_name || 
                           user?.user_metadata?.name || 
                           user?.email?.split('@')[0] || 
                           'Unknown'
      
      console.log('[useRequestForm] Created by name:', createdByName)
      
      // Prepare request data - match exact database schema
      const requestData = {
        title: formData.creativeName,
        description: formData.creativeDescription || null,
        project_type: 'creative' as const,
        status: 'new-request' as const,
        priority: formData.priority || 'medium',
        // Map form fields to database columns:
        format: formData.platform || null,  // "Platform" → format column
        dimensions,  // "Ad Size/Format" → dimensions column
        due_date: formData.dueDate || null,
        to_user: formData.toUser || null,
        inspiration: formData.inspiration || null,
        figma_url: formData.figmaAssetLinks || null,
        asset_file_url: assetFileUrl,
        thumbnail_url: thumbnailUrl,
        created_by: user?.id || null,
        created_by_name: createdByName
      }
      
      console.log('[useRequestForm] Inserting request data:', requestData)
      
      // Use REST API directly with proper Prefer header instead of .select()
      // This avoids the .select() hang issue with the JS client
      console.log('[useRequestForm] Calling REST API insert...')
      
      const config = useRuntimeConfig()
      const restUrl = `${config.public.supabaseUrl}/rest/v1/requests`
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
        body: JSON.stringify(requestData)
      })
      
      console.log('[useRequestForm] Got response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('[useRequestForm] API error:', errorData)
        throw new Error(errorData.message || `API error: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('[useRequestForm] Request inserted successfully:', data[0])
      
      // Create initial asset version if file was uploaded
      const requestRecord = data[0] // REST API returns array
      if (assetFileUrl && requestRecord) {
        console.log('[useRequestForm] Creating asset version...')
        const { error: versionError } = await supabase
          .from('asset_versions')
          .insert({
            request_id: requestRecord.id,
            version_number: 1,
            file_url: assetFileUrl,
            file_type: formData.assetFile?.type.split('/')[0] || 'unknown',
            file_size: formData.assetFile?.size || 0,
            thumbnail_url: thumbnailUrl,
            status: 'draft',
            created_by: user?.id
          })
        
        if (versionError) {
          console.error('[useRequestForm] Asset version creation error:', versionError)
          // Don't throw - request was created successfully
        } else {
          console.log('[useRequestForm] Asset version created')
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
