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
      // Fetch from new_requests table (brief stage: new-request, in-progress)
      const { data: briefData, error: briefError } = await supabase
        .from('new_requests')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (briefError) throw briefError
      
      // Fetch from requests table (asset stage: needs-review, needs-edit, done)
      const { data: assetData, error: assetError } = await supabase
        .from('requests')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (assetError) throw assetError
      
      // Transform brief data to match Request interface
      const briefs = (briefData || []).map(brief => ({
        ...brief,
        platform: brief.platform?.[0] || null, // Take first platform from array
        format: brief.platform?.[0] || null,
        dimensions: brief.ad_size_format?.[0] || null // Take first size from array
      }))
      
      // Combine both arrays (briefs from new_requests + assets from requests)
      requests.value = [...briefs, ...(assetData || [])]
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
    // Subscribe to BOTH new_requests and requests tables
    channel = supabase
      .channel('all-requests-changes', {
        config: { private: true } // Enforce RLS
      })
      // Listen to new_requests table (brief stage)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'new_requests' },
        (payload) => {
          const newBrief = payload.new as any
          // Transform brief to match Request interface
          const transformedBrief = {
            ...newBrief,
            platform: newBrief.platform?.[0] || null,
            format: newBrief.platform?.[0] || null,
            dimensions: newBrief.ad_size_format?.[0] || null
          }
          handleInsert({ new: transformedBrief })
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'new_requests' },
        (payload) => {
          const updatedBrief = payload.new as any
          const transformedBrief = {
            ...updatedBrief,
            platform: updatedBrief.platform?.[0] || null,
            format: updatedBrief.platform?.[0] || null,
            dimensions: updatedBrief.ad_size_format?.[0] || null
          }
          handleUpdate({ new: transformedBrief })
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'new_requests' },
        handleDelete
      )
      // Listen to requests table (asset stage)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'requests' },
        handleInsert
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'requests' },
        handleUpdate
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
