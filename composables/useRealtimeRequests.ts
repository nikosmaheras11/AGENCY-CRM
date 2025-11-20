import type { RealtimeChannel } from '@supabase/supabase-js'

export interface Request {
  id: string
  title: string
  description: string
  project_type: 'creative' | 'performance' | 'design' | 'ugc'
  status: 'new-request' | 'in-progress' | 'needs-review' | 'needs-edit' | 'done'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  platform: string | null
  format: string | null
  dimensions: string | null
  due_date: string | null
  assignee: string | null
  to_user: string | null
  inspiration: string | null
  figma_url: string | null
  asset_file_url: string | null
  thumbnail_url: string | null
  created_by_name: string | null
  created_at: string
  updated_at: string
}

export const useRealtimeRequests = () => {
  const { supabase } = useSupabase()
  
  const requests = ref<Request[]>([])
  const loading = ref(true)
  const connectionStatus = ref<'connected' | 'connecting' | 'disconnected'>('connecting')
  
  let channel: RealtimeChannel | null = null
  
  const fetchRequests = async () => {
    try {
      // Fetch all requests from single table
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      // Transform array fields for display (use first value for single fields)
      requests.value = (data || []).map(req => ({
        ...req,
        platform: req.platform_array?.[0] || req.format || null,
        format: req.platform_array?.[0] || req.format || null,
        dimensions: req.ad_size_format?.[0] || req.dimensions || null
      }))
    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      loading.value = false
    }
  }
  
  const handleInsert = (payload: any) => {
    const newRequest = payload.new as Request
    // Avoid duplicates
    if (!requests.value.find(r => r.id === newRequest.id)) {
      requests.value = [newRequest, ...requests.value]
    }
  }
  
  const handleUpdate = (payload: any) => {
    const updatedRequest = payload.new as Request
    const index = requests.value.findIndex(r => r.id === updatedRequest.id)
    if (index !== -1) {
      requests.value[index] = updatedRequest
    }
  }
  
  const handleDelete = (payload: any) => {
    requests.value = requests.value.filter(r => r.id !== payload.old.id)
  }
  
  const setupRealtime = () => {
    // Subscribe to requests table only
    channel = supabase
      .channel('requests-changes', {
        config: { private: true } // Enforce RLS
      })
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'requests' },
        (payload) => {
          const newRequest = payload.new as any
          // Transform array fields for display
          const transformed = {
            ...newRequest,
            platform: newRequest.platform_array?.[0] || newRequest.format || null,
            format: newRequest.platform_array?.[0] || newRequest.format || null,
            dimensions: newRequest.ad_size_format?.[0] || newRequest.dimensions || null
          }
          handleInsert({ new: transformed })
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'requests' },
        (payload) => {
          const updatedRequest = payload.new as any
          // Transform array fields for display
          const transformed = {
            ...updatedRequest,
            platform: updatedRequest.platform_array?.[0] || updatedRequest.format || null,
            format: updatedRequest.platform_array?.[0] || updatedRequest.format || null,
            dimensions: updatedRequest.ad_size_format?.[0] || updatedRequest.dimensions || null
          }
          handleUpdate({ new: transformed })
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'requests' },
        handleDelete
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          connectionStatus.value = 'connected'
        } else if (status === 'CHANNEL_ERROR' || status === 'CLOSED') {
          connectionStatus.value = 'disconnected'
        }
      })
  }
  
  const cleanup = () => {
    if (channel) {
      supabase.removeChannel(channel)
      channel = null
    }
  }
  
  // Initialize
  onMounted(async () => {
    await fetchRequests()
    setupRealtime()
  })
  
  onUnmounted(cleanup)
  
  return {
    requests: readonly(requests),
    loading: readonly(loading),
    connectionStatus: readonly(connectionStatus),
    refetch: fetchRequests
  }
}
