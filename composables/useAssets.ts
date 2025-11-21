// composables/useAssets.ts

// Global state for assets
const assetsState = ref<any[]>([])

export const useAssets = () => {
    const { supabase } = useSupabase()
    const { user } = useAuth()
    const loading = ref(false)
    const uploadProgress = ref(0)
    const error = ref<Error | null>(null)

    /**
     * Fetch all assets
     */
    const fetchAssets = async () => {
        try {
            loading.value = true
            const { data, error: err } = await supabase
                .from('assets')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50) // Limit for now

            if (err) throw err
            assetsState.value = data || []
        } catch (e) {
            error.value = e as Error
            console.error('Error fetching assets:', e)
        } finally {
            loading.value = false
        }
    }

    /**
     * Upload a file to Supabase storage and create an asset record
     */
    const uploadAsset = async (file: File, metadata?: {
        folder?: string
        campaign_id?: string
        client_id?: string
    }) => {
        loading.value = true
        uploadProgress.value = 0

        try {
            if (!user.value) {
                throw new Error('User not authenticated')
            }

            console.log('📤 Starting upload for:', file.name, 'Size:', file.size, 'Type:', file.type)

            // Generate unique file path
            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
            const folder = metadata?.folder || 'creative-assets'
            const filePath = `${folder}/${fileName}`

            console.log('📁 Upload path:', filePath)

            // Upload file to storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('assets')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false,
                })

            if (uploadError) {
                console.error('❌ Storage upload error:', uploadError)
                throw new Error(`Storage upload failed: ${uploadError.message}`)
            }

            console.log('✅ File uploaded to storage:', uploadData)

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('assets')
                .getPublicUrl(filePath)

            console.log('🔗 Public URL:', publicUrl)

            // Determine file type
            const fileType = file.type.startsWith('image/') ? 'image'
                : file.type.startsWith('video/') ? 'video'
                    : 'other'

            // Create asset record in database
            const assetPayload = {
                file_name: file.name,
                file_type: fileType,
                file_size: file.size,
                storage_path: filePath,
                public_url: publicUrl,
                thumbnail_url: fileType === 'image' ? publicUrl : null,
                campaign_id: metadata?.campaign_id || null,
                client_id: metadata?.client_id || null,
                uploaded_by: user.value.id,
                mime_type: file.type,
            }

            console.log('💾 Creating asset record:', assetPayload)

            const { data: assetData, error: assetError } = await supabase
                .from('assets')
                .insert(assetPayload)
                .select()
                .single()

            if (assetError) {
                console.error('❌ Database insert error:', assetError)
                throw new Error(`Database insert failed: ${assetError.message}`)
            }

            console.log('✅ Asset record created:', assetData)

            // Add to local state
            assetsState.value.unshift(assetData)

            return assetData
        } catch (error: any) {
            console.error('❌ Upload failed:', error)
            console.error('Error details:', {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint
            })
            throw error
        } finally {
            loading.value = false
            uploadProgress.value = 0
        }
    }

    /**
     * Delete an asset from storage and database
     */
    const deleteAsset = async (assetId: string, storagePath: string) => {
        loading.value = true

        try {
            // Delete from storage
            const { error: storageError } = await supabase.storage
                .from('assets')
                .remove([storagePath])

            if (storageError) console.warn('Error deleting from storage:', storageError)

            // Delete from database
            const { error: dbError } = await supabase
                .from('assets')
                .delete()
                .eq('id', assetId)

            if (dbError) throw dbError

            // Remove from local state
            const index = assetsState.value.findIndex(a => a.id === assetId)
            if (index > -1) {
                assetsState.value.splice(index, 1)
            }
        } catch (error) {
            console.error('Error deleting asset:', error)
            throw error
        } finally {
            loading.value = false
        }
    }

    return {
        assets: assetsState,
        fetchAssets,
        uploadAsset,
        deleteAsset,
        loading,
        uploadProgress,
        error
    }
}
