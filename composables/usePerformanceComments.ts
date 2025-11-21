import type { RealtimeChannel } from '@supabase/supabase-js'

export interface PerformanceComment {
  id: string
  entity_type: 'campaign' | 'ad_set' | 'creative'
  entity_id: string
  campaign_id?: string
  ad_set_id?: string
  creative_id?: string
  author: string
  author_id: string
  text: string
  parent_comment_id?: string
  resolved: boolean
  created_at: string
  updated_at: string
  
  // Joined data
  author_name?: string
  author_avatar?: string
  replies?: PerformanceComment[]
}

export const usePerformanceComments = () => {
  const { supabase } = useSupabase()
  const comments = ref<PerformanceComment[]>([])
  const loading = ref(false)
  const channel = ref<RealtimeChannel | null>(null)

  /**
   * Fetch comments for a specific entity
   */
  const fetchComments = async (entityType: 'campaign' | 'ad_set' | 'creative', entityId: string) => {
    loading.value = true
    
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          author_profile:profiles!comments_author_id_fkey(full_name, avatar_url)
        `)
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('created_at', { ascending: true })
      
      if (error) throw error
      
      // Transform and build thread structure
      const commentsWithAuthor = (data || []).map((comment: any) => ({
        ...comment,
        author_name: comment.author_profile?.full_name || comment.author,
        author_avatar: comment.author_profile?.avatar_url
      }))
      
      // Build threaded structure
      comments.value = buildCommentTree(commentsWithAuthor)
      
      return comments.value
    } catch (error) {
      console.error('Failed to fetch comments:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * Create a new comment
   */
  const createComment = async (
    entityType: 'campaign' | 'ad_set' | 'creative',
    entityId: string,
    text: string,
    parentCommentId?: string
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

      const { data, error } = await supabase
        .from('comments')
        .insert({
          entity_type: entityType,
          entity_id: entityId,
          text,
          author: profile?.full_name || user.email || 'Anonymous',
          author_id: user.id,
          parent_comment_id: parentCommentId,
          resolved: false
        })
        .select(`
          *,
          author_profile:profiles!comments_author_id_fkey(full_name, avatar_url)
        `)
        .single()

      if (error) throw error

      return {
        ...data,
        author_name: data.author_profile?.full_name || data.author,
        author_avatar: data.author_profile?.avatar_url
      }
    } catch (error) {
      console.error('Failed to create comment:', error)
      throw error
    }
  }

  /**
   * Reply to a comment
   */
  const replyToComment = async (
    entityType: 'campaign' | 'ad_set' | 'creative',
    entityId: string,
    parentCommentId: string,
    text: string
  ) => {
    return createComment(entityType, entityId, text, parentCommentId)
  }

  /**
   * Toggle comment resolved status
   */
  const toggleResolve = async (commentId: string) => {
    try {
      const comment = findCommentById(comments.value, commentId)
      if (!comment) throw new Error('Comment not found')

      const { error } = await supabase
        .from('comments')
        .update({ resolved: !comment.resolved })
        .eq('id', commentId)

      if (error) throw error
    } catch (error) {
      console.error('Failed to toggle comment resolution:', error)
      throw error
    }
  }

  /**
   * Delete a comment
   */
  const deleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)

      if (error) throw error
    } catch (error) {
      console.error('Failed to delete comment:', error)
      throw error
    }
  }

  /**
   * Subscribe to real-time comment updates
   */
  const subscribeToComments = (
    entityType: 'campaign' | 'ad_set' | 'creative',
    entityId: string,
    onUpdate?: () => void
  ) => {
    // Clean up existing subscription
    if (channel.value) {
      supabase.removeChannel(channel.value)
    }

    channel.value = supabase
      .channel(`comments:${entityType}:${entityId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `entity_id=eq.${entityId}`
        },
        async (payload) => {
          console.log('Comment change:', payload)
          
          // Refresh comments
          await fetchComments(entityType, entityId)
          
          // Trigger optional callback
          if (onUpdate) onUpdate()
        }
      )
      .subscribe()
  }

  /**
   * Unsubscribe from real-time updates
   */
  const unsubscribe = () => {
    if (channel.value) {
      supabase.removeChannel(channel.value)
      channel.value = null
    }
  }

  // Helper: Build comment tree structure
  const buildCommentTree = (flatComments: any[]): PerformanceComment[] => {
    const commentMap = new Map<string, PerformanceComment>()
    const rootComments: PerformanceComment[] = []

    // First pass: create map
    flatComments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] })
    })

    // Second pass: build tree
    flatComments.forEach(comment => {
      const commentNode = commentMap.get(comment.id)!
      
      if (comment.parent_comment_id) {
        const parent = commentMap.get(comment.parent_comment_id)
        if (parent) {
          parent.replies = parent.replies || []
          parent.replies.push(commentNode)
        }
      } else {
        rootComments.push(commentNode)
      }
    })

    return rootComments
  }

  // Helper: Find comment by ID in tree
  const findCommentById = (commentList: PerformanceComment[], id: string): PerformanceComment | null => {
    for (const comment of commentList) {
      if (comment.id === id) return comment
      if (comment.replies?.length) {
        const found = findCommentById(comment.replies, id)
        if (found) return found
      }
    }
    return null
  }

  // Cleanup on unmount
  onUnmounted(() => {
    unsubscribe()
  })

  return {
    comments,
    loading,
    fetchComments,
    createComment,
    replyToComment,
    toggleResolve,
    deleteComment,
    subscribeToComments,
    unsubscribe
  }
}
