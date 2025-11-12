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
  const { user } = useAuth()
  
  const submitting = ref(false)
  const error = ref<string | null>(null)
  
  const submitRequest = async (formData: RequestFormData) => {
    console.log('[useRequestForm] Starting submission...', { formData: { ...formData, assetFile: formData.assetFile?.name } })
    console.log('[useRequestForm] Supabase client configured')
    
    try {
      submitting.value = true
      error.value = null
      
      // Check auth first
      if (!user.value) {
        console.error('[useRequestForm] No authenticated user found!')
        throw new Error('You must be logged in to create a request')
      }
      console.log('[useRequestForm] User authenticated:', user.value.id)
      console.log('[useRequestForm] User email:', user.value.email)
      
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
      const createdByName = user.value?.user_metadata?.full_name || 
                           user.value?.user_metadata?.name || 
                           user.value?.email?.split('@')[0] || 
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
        created_by: user.value?.id || null,
        created_by_name: createdByName
      }
      
      console.log('[useRequestForm] Inserting request data:', requestData)
      
      // Insert into database with timeout
      console.log('[useRequestForm] Calling Supabase insert...')
      const insertPromise = supabase
        .from('requests')
        .insert(requestData)
        .select()
        .single()
      
      console.log('[useRequestForm] Waiting for response...')
      const { data, error: insertError } = await insertPromise
      
      console.log('[useRequestForm] Got response from Supabase')
      
      if (insertError) {
        console.error('[useRequestForm] Database insert error:', insertError)
        console.error('[useRequestForm] Error code:', insertError.code)
        console.error('[useRequestForm] Error message:', insertError.message)
        console.error('[useRequestForm] Error details:', insertError.details)
        console.error('[useRequestForm] Error hint:', insertError.hint)
        throw insertError
      }
      
      if (!data) {
        console.error('[useRequestForm] No data returned from insert!')
        throw new Error('No data returned from database insert')
      }
      
      console.log('[useRequestForm] Request inserted successfully:', data)
      
      // Create initial asset version if file was uploaded
      if (assetFileUrl && data) {
        console.log('[useRequestForm] Creating asset version...')
        const { error: versionError } = await supabase
          .from('asset_versions')
          .insert({
            request_id: data.id,
            version_number: 1,
            file_url: assetFileUrl,
            file_type: formData.assetFile?.type.split('/')[0] || 'unknown',
            file_size: formData.assetFile?.size || 0,
            thumbnail_url: thumbnailUrl,
            status: 'draft',
            created_by: user.value?.id
          })
        
        if (versionError) {
          console.error('[useRequestForm] Asset version creation error:', versionError)
          // Don't throw - request was created successfully
        } else {
          console.log('[useRequestForm] Asset version created')
        }
      }
      
      console.log('[useRequestForm] Submission complete! Returning:', data)
      return data
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
