interface CommentNode {
  id: string
  request_id: string
  asset_id?: string
  parent_comment_id?: string | null
  author: string
  author_id: string
  text: string
  timecode?: number | null
  x_position?: number | null
  y_position?: number | null
  resolved: boolean
  created_at: string
  updated_at: string
  replies?: CommentNode[]
}

export const useAssetComments = (requestId: string) => {
  const { supabase } = useSupabase()
  
  const comments = ref<CommentNode[]>([])
  const flatComments = ref<any[]>([])
  const loading = ref(true)
  const error = ref<Error | null>(null)
  
  let commentsChannel: any = null
  
  // Build comment tree from flat array
  const buildCommentTree = (flatComments: any[]): CommentNode[] => {
    const commentMap = new Map<string, CommentNode>()
    const rootComments: CommentNode[] = []
    
    // First pass: create map with replies array
    flatComments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] })
    })
    
    // Second pass: build tree structure
    flatComments.forEach(comment => {
      const commentNode = commentMap.get(comment.id)!
      
      if (comment.parent_comment_id) {
        const parent = commentMap.get(comment.parent_comment_id)
        if (parent) {
          parent.replies!.push(commentNode)
        } else {
          // Parent not found, treat as root
          rootComments.push(commentNode)
        }
      } else {
        rootComments.push(commentNode)
      }
    })
    
    return rootComments
  }
  
  // Fetch comments for this asset
  const fetchComments = async () => {
    try {
      loading.value = true
      error.value = null
      
      // Fetch all comments flat, ordered by creation time
      const { data, error: fetchError} = await supabase
        .from('comments')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: true })
      
      if (fetchError) throw fetchError
      
      flatComments.value = data || []
      comments.value = buildCommentTree(data || [])
    } catch (e: any) {
      error.value = e
      console.error('Error fetching comments:', e)
    } finally {
      loading.value = false
    }
  }
  
  // Add a new comment with optional video timestamp or spatial position
  const addComment = async ({ 
    content, 
    x_position, 
    y_position, 
    video_timestamp = null,
    parent_id = null
  }: {
    content: string
    x_position?: number
    y_position?: number
    video_timestamp?: number | null
    parent_id?: string | null
  }) => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      
      if (!userData.user) {
        throw new Error('User not authenticated')
      }
      
      // Match actual database schema: request_id, author (NOT NULL), author_id, text, timecode, x_position, y_position, parent_comment_id
      const newComment = {
        request_id: requestId,
        author: userData.user.user_metadata?.full_name || userData.user.email || 'Anonymous',
        author_id: userData.user.id,
        text: content,
        timecode: video_timestamp,
        x_position: x_position || null,
        y_position: y_position || null,
        parent_comment_id: parent_id,
        resolved: false
      }
      
      const { data, error: addError } = await supabase
        .from('comments')
        .insert(newComment)
        .select()
        .single()
      
      if (addError) throw addError
      
      // Rebuild tree with new comment
      flatComments.value = [...flatComments.value, data]
      comments.value = buildCommentTree(flatComments.value)
      
      return data
    } catch (e: any) {
      error.value = e
      console.error('Error adding comment:', e)
      throw e
    }
  }
  
  // Add a reply to an existing comment
  const addReply = async (parentId: string, content: string) => {
    return addComment({ 
      content, 
      parent_id: parentId 
    })
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
            // Check if comment already exists (avoid duplicates)
            const exists = flatComments.value.find(c => c.id === payload.new.id)
            if (!exists) {
              flatComments.value = [...flatComments.value, payload.new]
              comments.value = buildCommentTree(flatComments.value)
            }
          } else if (payload.eventType === 'UPDATE') {
            const index = flatComments.value.findIndex(c => c.id === payload.new.id)
            if (index !== -1) {
              flatComments.value[index] = payload.new
              comments.value = buildCommentTree(flatComments.value)
            }
          } else if (payload.eventType === 'DELETE') {
            flatComments.value = flatComments.value.filter(c => c.id !== payload.old.id)
            comments.value = buildCommentTree(flatComments.value)
          }
        }
      )
      .subscribe()
  }
  
  // For video assets, get comments at a specific timestamp
  const getCommentsAtTimestamp = (timestamp: number, tolerance = 2) => {
    return comments.value.filter(comment => {
      if (comment.timecode === null || comment.timecode === undefined) return false
      return Math.abs(comment.timecode - timestamp) <= tolerance
    })
  }
  
  // Get only root-level comments (for display)
  const rootComments = computed(() => {
    return comments.value
  })
  
  // Order comments by timestamp (for video navigation)
  const timeOrderedComments = computed(() => {
    return flatComments.value
      .filter(comment => comment.timecode !== null && comment.timecode !== undefined)
      .sort((a, b) => a.timecode! - b.timecode!)
  })
  
  // Get spatial comments (image pins)
  const spatialComments = computed(() => {
    return flatComments.value.filter(comment => 
      comment.x_position !== null && 
      comment.y_position !== null &&
      !comment.parent_comment_id // Only root spatial comments
    )
  })
  
  // Get total comment count (including replies)
  const totalCommentCount = computed(() => flatComments.value.length)
  
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
    comments: rootComments,
    flatComments,
    loading,
    error,
    timeOrderedComments,
    spatialComments,
    totalCommentCount,
    fetchComments,
    addComment,
    addReply,
    updateCommentStatus,
    getCommentsAtTimestamp
  }
}
