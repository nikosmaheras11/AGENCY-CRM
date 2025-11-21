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
            if (!user.value) throw new Error('User not authenticated')

            // Generate unique file path
            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
            const folder = metadata?.folder || 'creative-assets'
            const filePath = `${folder}/${fileName}`

            // Upload file to storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('assets')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false,
                })

            if (uploadError) throw uploadError

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('assets')
                .getPublicUrl(filePath)

            // Determine file type
            const fileType = file.type.startsWith('image/') ? 'image'
                : file.type.startsWith('video/') ? 'video'
                    : 'other'

            // Create asset record in database
            const { data: assetData, error: assetError } = await supabase
                .from('assets')
                .insert({
                    file_name: file.name,
                    file_type: fileType,
                    file_size: file.size,
                    storage_path: filePath,
                    public_url: publicUrl,
                    thumbnail_url: fileType === 'image' ? publicUrl : null,
                    campaign_id: metadata?.campaign_id,
                    client_id: metadata?.client_id,
                    uploaded_by: user.value.id,
                    mime_type: file.type,
                })
                .select()
                .single()

            if (assetError) throw assetError

            // Add to local state
            assetsState.value.unshift(assetData)

            return assetData
        } catch (error) {
            console.error('Error uploading asset:', error)
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
