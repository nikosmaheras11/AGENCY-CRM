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

export const useRequests = () => {
  const allRequests = ref<Request[]>([])
  const loading = ref(true)
  const error = ref<Error | null>(null)

  /**
   * Fetch all requests from JSON file
   */
  const fetchRequests = async () => {
    try {
      loading.value = true
      // In production, this will fetch from the static file
      const response = await fetch('/data/requests/requests.json')
      
      if (!response.ok) {
        throw new Error('Failed to fetch requests')
      }
      
      const data: RequestsData = await response.json()
      allRequests.value = data.requests
      error.value = null
    } catch (e) {
      error.value = e as Error
      console.error('Error fetching requests:', e)
      allRequests.value = []
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
  const requestToAsset = (request: Request) => {
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
