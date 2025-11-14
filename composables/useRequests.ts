/**
 * Composable for managing unified request system
 * Reads from data/requests/requests.json and filters by projectType
 */

export interface Request {
  id: string
  projectType: 'creative' | 'performance' | 'design' | 'ugc'
  status: 'new-request' | 'in-progress' | 'needs-review' | 'needs-edit' | 'done'
  title: string
  format?: string | null
  size?: string | null
  dimensions?: string | null
  duration?: string | null
  thumbnail?: string
  figmaUrl?: string
  videoUrl?: string
  assetFileUrl?: string
  metadata: {
    assignee?: string | null
    dueDate?: string | null
    tags?: string[]
    priority?: 'Low' | 'Medium' | 'High' | 'Critical' | null
    client?: string
    campaign?: string
  }
  comments?: any[]
  createdAt: string
  updatedAt: string
}

export interface RequestsData {
  requests: Request[]
}

export interface Asset {
  id: string
  thumbnail: string
  title: string
  format: string
  size: string
  dimensions: string
  duration: string
  commentCount: number
  status: string
  figmaUrl?: string
  videoUrl?: string
  metadata: {
    assignee: string | null
    dueDate: string | null
    tags: string | null
    priority: string | null
  }
}

export const useRequests = () => {
  const allRequests = ref<Request[]>([])
  const loading = ref(true)
  const error = ref<Error | null>(null)

  /**
   * Fetch all requests from Supabase database
   */
  const fetchRequests = async () => {
    try {
      loading.value = true
      console.log('🔌 useRequests: Connecting to Supabase...')
      const { supabase } = useSupabase()
      
      console.log('📡 useRequests: Fetching from requests table...')
      const { data, error: fetchError } = await supabase
        .from('requests')
        .select('*')
        .order('created_at', { ascending: false })
      
      console.log('📥 useRequests: Supabase response:', { data, error: fetchError })
      
      if (fetchError) {
        console.error('❌ useRequests: Supabase error:', fetchError)
        throw fetchError
      }
      
      // Fetch current asset versions for thumbnail URLs
      const requestIds = data?.map((r: any) => r.id) || []
      let assetVersions: Record<string, any> = {}
      
      if (requestIds.length > 0) {
        try {
          const { data: assetsData, error: assetsError } = await supabase
            .from('assets')
            .select('request_id, thumbnail_url, preview_url')
            .in('request_id', requestIds)
            .eq('is_current_version', true)
          
          if (assetsError) {
            console.warn('⚠️ Could not fetch asset versions:', assetsError)
          } else {
            // Create a map of request_id -> asset data
            assetVersions = (assetsData || []).reduce((acc: Record<string, any>, asset: any) => {
              acc[asset.request_id] = asset
              return acc
            }, {} as Record<string, any>)
          }
        } catch (assetsErr) {
          console.warn('⚠️ Error fetching asset versions:', assetsErr)
        }
      }
      
      // Transform database format to Request format
      allRequests.value = (data || []).map(item => {
        const currentAsset = assetVersions[item.id]
        
        return {
          id: item.id,
          projectType: item.project_type,
          status: item.status,
          title: item.title,
          format: item.format,
          size: item.size,
          dimensions: item.dimensions,
          duration: item.duration,
          // Use current asset version thumbnail if available, otherwise use request thumbnail
          thumbnail: currentAsset?.thumbnail_url || currentAsset?.preview_url || item.thumbnail_url,
          figmaUrl: item.figma_url,
          videoUrl: item.video_url,
          assetFileUrl: item.asset_file_url,
          metadata: {
            assignee: item.assignee,
            dueDate: item.due_date,
            tags: item.tags,
            priority: item.priority,
            client: item.client,
            campaign: item.campaign
          },
          comments: [],
          createdAt: item.created_at,
          updatedAt: item.updated_at
        }
      })
      console.log('✅ useRequests: Transformed', allRequests.value.length, 'requests')
      console.log('🎨 useRequests: Creative requests:', allRequests.value.filter(r => r.projectType === 'creative').length)
      error.value = null
    } catch (e) {
      error.value = e as Error
      console.error('❌ Error fetching requests:', e)
      // Set empty array so app doesn't crash
      allRequests.value = []
      // Don't throw - let the app continue
    } finally {
      loading.value = false
    }
  }

  /**
   * Get requests filtered by projectType
   */
  const getRequestsByType = (projectType: Request['projectType']) => {
    return computed(() => 
      allRequests.value.filter(req => req.projectType === projectType)
    )
  }

  /**
   * Get requests grouped by status for a specific projectType
   * Returns object with status as keys and arrays of requests as values
   */
  const getRequestsByTypeAndStatus = (projectType: Request['projectType']) => {
    return computed(() => {
      const filtered = allRequests.value.filter(req => req.projectType === projectType)
      
      return {
        'new-request': filtered.filter(req => req.status === 'new-request'),
        'in-progress': filtered.filter(req => req.status === 'in-progress'),
        'needs-review': filtered.filter(req => req.status === 'needs-review'),
        'needs-edit': filtered.filter(req => req.status === 'needs-edit'),
        'done': filtered.filter(req => req.status === 'done')
      }
    })
  }

  /**
   * Get all requests (for project management board)
   * Optionally filter by multiple projectTypes
   */
  const getAllRequests = (projectTypes?: Request['projectType'][]) => {
    return computed(() => {
      if (!projectTypes || projectTypes.length === 0) {
        return allRequests.value
      }
      return allRequests.value.filter(req => projectTypes.includes(req.projectType))
    })
  }

  /**
   * Get all requests grouped by status (for project management board)
   */
  const getAllRequestsByStatus = () => {
    return computed(() => {
      return {
        'new-request': allRequests.value.filter(req => req.status === 'new-request'),
        'in-progress': allRequests.value.filter(req => req.status === 'in-progress'),
        'needs-review': allRequests.value.filter(req => req.status === 'needs-review'),
        'needs-edit': allRequests.value.filter(req => req.status === 'needs-edit'),
        'done': allRequests.value.filter(req => req.status === 'done')
      }
    })
  }

  /**
   * Get request by ID
   */
  const getRequestById = (id: string) => {
    return computed(() => 
      allRequests.value.find(req => req.id === id)
    )
  }

  /**
   * Convert Request to legacy Asset format for backward compatibility
   */
  const requestToAsset = (request: Request): Asset => {
    return {
      id: request.id,
      thumbnail: request.thumbnail || '',
      title: request.title,
      format: request.format || 'Unknown',
      size: request.size || '0 MB',
      dimensions: request.dimensions || 'Unknown',
      duration: request.duration || '0:00',
      commentCount: request.comments?.length || 0,
      status: request.status,
      figmaUrl: request.figmaUrl,
      videoUrl: request.videoUrl,
      metadata: {
        assignee: request.metadata.assignee || null,
        dueDate: request.metadata.dueDate || null,
        tags: request.metadata.tags?.join(', ') || null,
        priority: request.metadata.priority || null
      }
    }
  }

  /**
   * Get statistics for a projectType
   */
  const getStats = (projectType?: Request['projectType']) => {
    return computed(() => {
      const filtered = projectType 
        ? allRequests.value.filter(req => req.projectType === projectType)
        : allRequests.value

      return {
        total: filtered.length,
        newRequests: filtered.filter(req => req.status === 'new-request').length,
        inProgress: filtered.filter(req => req.status === 'in-progress').length,
        needsReview: filtered.filter(req => req.status === 'needs-review').length,
        needsEdit: filtered.filter(req => req.status === 'needs-edit').length,
        done: filtered.filter(req => req.status === 'done').length
      }
    })
  }

  return {
    // State
    allRequests,
    loading,
    error,

    // Methods
    fetchRequests,
    getRequestsByType,
    getRequestsByTypeAndStatus,
    getAllRequests,
    getAllRequestsByStatus,
    getRequestById,
    requestToAsset,
    getStats
  }
}
