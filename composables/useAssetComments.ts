export const useAssetComments = (requestId: string) => {
  const { supabase } = useSupabase()
  
  const comments = ref<any[]>([])
  const loading = ref(true)
  const error = ref<Error | null>(null)
  
  let commentsChannel: any = null
  
  // Fetch comments for this request
  const fetchComments = async () => {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: fetchError } = await supabase
        .from('comments')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: false })
      
      if (fetchError) throw fetchError
      comments.value = data || []
    } catch (e: any) {
      error.value = e
      console.error('Error fetching comments:', e)
    } finally {
      loading.value = false
    }
  }
  
  // Add a new comment with position and optional timestamp
  const addComment = async ({ 
    content, 
    x_position, 
    y_position, 
    video_timestamp = null 
  }: {
    content: string
    x_position: number
    y_position: number
    video_timestamp?: number | null
  }) => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      
      const newComment = {
        request_id: requestId,
        text: content,
        x_position,
        y_position,
        timecode: video_timestamp, // Database uses 'timecode' not 'video_timestamp'
        resolved: false,
        author: userData.user?.user_metadata?.full_name || userData.user?.email || 'Anonymous',
        author_id: userData.user?.id
      }
      
      const { data, error: addError } = await supabase
        .from('comments')
        .insert(newComment)
        .select()
        .single()
      
      if (addError) throw addError
      
      // Optimistic update
      comments.value = [data, ...comments.value]
      return data
    } catch (e: any) {
      error.value = e
      console.error('Error adding comment:', e)
      throw e
    }
  }
  
  // Update comment status
  const updateCommentStatus = async (commentId: string, resolved: boolean) => {
    try {
      const { data, error: updateError } = await supabase
        .from('comments')
        .update({ resolved })
        .eq('id', commentId)
        .select()
        .single()
      
      if (updateError) throw updateError
      
      // Update in local state
      const index = comments.value.findIndex(c => c.id === commentId)
      if (index !== -1) {
        comments.value[index] = {
          ...comments.value[index],
          resolved: data.resolved
        }
      }
      
      return data
    } catch (e: any) {
      error.value = e
      console.error('Error updating comment status:', e)
      throw e
    }
  }
  
  // Setup real-time subscription
  const setupRealtimeSubscription = () => {
    commentsChannel = supabase
      .channel(`comments-${requestId}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'comments',
          filter: `request_id=eq.${requestId}`
        },
        (payload: any) => {
          console.log('Realtime comment event:', payload.eventType, payload)
          
          if (payload.eventType === 'INSERT') {
            // Check if comment already exists (avoid duplicates from optimistic updates)
            const exists = comments.value.find(c => c.id === payload.new.id)
            if (!exists) {
              comments.value = [payload.new, ...comments.value]
            }
          } else if (payload.eventType === 'UPDATE') {
            const index = comments.value.findIndex(c => c.id === payload.new.id)
            if (index !== -1) {
              comments.value[index] = {
                ...comments.value[index],
                ...payload.new
              }
            }
          } else if (payload.eventType === 'DELETE') {
            comments.value = comments.value.filter(c => c.id !== payload.old.id)
          }
        }
      )
      .subscribe()
  }
  
  // For video assets, get comments at a specific timestamp
  const getCommentsAtTimestamp = (timestamp: number, tolerance = 2) => {
    return comments.value.filter(comment => {
      if (comment.timecode === null) return false
      return Math.abs(comment.timecode - timestamp) <= tolerance
    })
  }
  
  // Order comments by timestamp (for video navigation)
  const timeOrderedComments = computed(() => {
    return [...comments.value]
      .filter(comment => comment.timecode !== null)
      .sort((a, b) => a.timecode - b.timecode)
  })
  
  // Lifecycle hooks
  onMounted(() => {
    fetchComments()
    setupRealtimeSubscription()
  })
  
  onUnmounted(() => {
    if (commentsChannel) {
      supabase.removeChannel(commentsChannel)
    }
  })
  
  return {
    comments,
    loading,
    error,
    timeOrderedComments,
    fetchComments,
    addComment,
    updateCommentStatus,
    getCommentsAtTimestamp
  }
}
