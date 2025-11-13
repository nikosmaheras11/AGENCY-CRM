export const useCollaborativeCursors = (assetId: string) => {
  const { supabase } = useSupabase()
  
  const cursors = ref<Record<string, any>>({})
  const isActive = ref(false)
  
  let cursorChannel: any = null
  let broadcastInterval: any = null
  let lastMousePosition = { x: 0, y: 0 }
  
  // Enable collaboration mode
  const enableCollaboration = async () => {
    if (isActive.value) return
    isActive.value = true
    
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return
    
    // Set up Supabase Broadcast channel (not DB-persisted, low latency)
    cursorChannel = supabase
      .channel(`asset:${assetId}:cursors`, {
        config: {
          broadcast: { 
            self: false,  // Don't receive own broadcasts
            ack: false     // Don't wait for confirmation
          }
        }
      })
      .on('broadcast', { event: 'cursor-move' }, (payload: any) => {
        // Update cursor positions
        cursors.value = {
          ...cursors.value,
          [payload.payload.userId]: payload.payload
        }
        
        // Expire cursors after inactivity (10 seconds)
        setTimeout(() => {
          const now = Date.now()
          Object.entries(cursors.value).forEach(([userId, cursor]: [string, any]) => {
            if (now - cursor.timestamp > 10000) {
              const newCursors = { ...cursors.value }
              delete newCursors[userId]
              cursors.value = newCursors
            }
          })
        }, 10000)
      })
      .subscribe()
      
    // Start broadcasting cursor position
    startBroadcasting()
  }
  
  // Update mouse position
  const updateMousePosition = (x: number, y: number) => {
    lastMousePosition = { x, y }
  }
  
  // Start broadcasting cursor position
  const startBroadcasting = async () => {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return
    
    broadcastInterval = setInterval(() => {
      if (!cursorChannel || !isActive.value) return
      
      cursorChannel.send({
        type: 'broadcast',
        event: 'cursor-move',
        payload: {
          userId: userData.user.id,
          username: userData.user.user_metadata?.full_name || userData.user.email,
          avatarUrl: userData.user.user_metadata?.avatar_url,
          x: lastMousePosition.x,
          y: lastMousePosition.y,
          timestamp: Date.now()
        }
      })
    }, 50) // 50ms = 20 updates per second
  }
  
  // Disable collaboration mode
  const disableCollaboration = () => {
    isActive.value = false
    
    if (broadcastInterval) {
      clearInterval(broadcastInterval)
      broadcastInterval = null
    }
    
    if (cursorChannel) {
      supabase.removeChannel(cursorChannel)
      cursorChannel = null
    }
    
    cursors.value = {}
  }
  
  onUnmounted(() => {
    disableCollaboration()
  })
  
  return {
    cursors,
    isCollaborationActive: isActive,
    enableCollaboration,
    disableCollaboration,
    updateMousePosition
  }
}
