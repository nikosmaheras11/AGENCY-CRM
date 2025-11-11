import type { RealtimeChannel } from '@supabase/supabase-js';

export interface SlackMessage {
  id: string;
  channel_id: string;
  channel_name: string;
  user_id: string;
  user_name: string;
  text: string;
  timestamp: string;
  permalink: string;
  thread_ts: string | null;
  is_thread_reply: boolean;
  reactions: readonly any[];
}

export interface UserMention {
  mention_id: string;
  user_slack_id: string;
  is_read: boolean;
  read_at: string | null;
  mention_created_at: string;
  message_id: string;
  channel_id: string;
  channel_name: string;
  user_id: string;
  user_name: string;
  text: string;
  message_timestamp: string;
  permalink: string;
  thread_ts: string | null;
  is_thread_reply: boolean;
  reactions: any[];
  profile_id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

export const useSlackMentions = () => {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();
  
  const mentions = ref<UserMention[]>([]);
  const unreadCount = ref(0);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  
  let realtimeChannel: RealtimeChannel | null = null;

  /**
   * Fetch mentions for the current user
   */
  const fetchMentions = async (limit = 50) => {
    if (!user.value) {
      error.value = 'User not authenticated';
      return;
    }

    try {
      isLoading.value = true;
      error.value = null;

      const { data, error: fetchError } = await supabase
        .from('user_mention_details')
        .select('*')
        .eq('profile_id', user.value.id)
        .order('mention_created_at', { ascending: false })
        .limit(limit);

      if (fetchError) throw fetchError;

      mentions.value = data || [];
      unreadCount.value = mentions.value.filter(m => !m.is_read).length;

    } catch (err: any) {
      console.error('Error fetching mentions:', err);
      error.value = err.message;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Fetch only unread mentions
   */
  const fetchUnreadMentions = async () => {
    if (!user.value) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('user_mention_details')
        .select('*')
        .eq('profile_id', user.value.id)
        .eq('is_read', false)
        .order('mention_created_at', { ascending: false });

      if (fetchError) throw fetchError;

      return data || [];

    } catch (err: any) {
      console.error('Error fetching unread mentions:', err);
      return [];
    }
  };

  /**
   * Get unread count
   */
  const getUnreadCount = async () => {
    if (!user.value) return 0;

    try {
      const { data, error: countError } = await supabase
        .rpc('get_unread_mention_count', { user_id: user.value.id });

      if (countError) throw countError;

      unreadCount.value = data || 0;
      return data || 0;

    } catch (err: any) {
      console.error('Error getting unread count:', err);
      return 0;
    }
  };

  /**
   * Mark a mention as read
   */
  const markAsRead = async (mentionId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('user_mentions')
        .update({ is_read: true })
        .eq('id', mentionId);

      if (updateError) throw updateError;

      // Update local state
      const index = mentions.value.findIndex(m => m.mention_id === mentionId);
      if (index >= 0) {
        mentions.value[index].is_read = true;
        mentions.value[index].read_at = new Date().toISOString();
        unreadCount.value = Math.max(0, unreadCount.value - 1);
      }

    } catch (err: any) {
      console.error('Error marking mention as read:', err);
      throw err;
    }
  };

  /**
   * Mark all mentions as read
   */
  const markAllAsRead = async () => {
    if (!user.value) return;

    try {
      const { data, error: updateError } = await supabase
        .rpc('mark_all_mentions_read', { user_id: user.value.id });

      if (updateError) throw updateError;

      // Update local state
      mentions.value = mentions.value.map(m => ({
        ...m,
        is_read: true,
        read_at: new Date().toISOString()
      }));
      unreadCount.value = 0;

      return data;

    } catch (err: any) {
      console.error('Error marking all as read:', err);
      throw err;
    }
  };

  /**
   * Set up real-time subscription for new mentions
   */
  const subscribeToMentions = () => {
    if (!user.value) return;

    // Clean up existing subscription
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel);
    }

    // Get user's Slack ID from metadata
    const slackId = user.value.user_metadata?.slack_id;
    if (!slackId) {
      console.warn('No Slack ID found for user');
      return;
    }

    realtimeChannel = supabase
      .channel('mention-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_mentions',
          filter: `user_slack_id=eq.${slackId}`
        },
        async (payload: any) => {
          console.log('New mention received:', payload);
          
          // Fetch the full mention details
          const { data, error: fetchError } = await supabase
            .from('user_mention_details')
            .select('*')
            .eq('mention_id', payload.new.id)
            .single();

          if (!fetchError && data) {
            // Add to the beginning of the list
            mentions.value = [data, ...mentions.value];
            unreadCount.value++;
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_mentions',
          filter: `user_slack_id=eq.${slackId}`
        },
        (payload: any) => {
          console.log('Mention updated:', payload);
          
          // Update local state
          const index = mentions.value.findIndex(
            m => m.mention_id === payload.new.id
          );
          
          if (index >= 0) {
            mentions.value[index].is_read = payload.new.is_read;
            mentions.value[index].read_at = payload.new.read_at;
            
            if (payload.new.is_read && !payload.old.is_read) {
              unreadCount.value = Math.max(0, unreadCount.value - 1);
            }
          }
        }
      )
      .subscribe();
  };

  /**
   * Clean up real-time subscription
   */
  const unsubscribe = () => {
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel);
      realtimeChannel = null;
    }
  };

  /**
   * Format timestamp for display
   */
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  // Auto-fetch mentions on mount and set up subscription
  onMounted(() => {
    if (user.value) {
      fetchMentions();
      subscribeToMentions();
    }
  });

  // Clean up subscription on unmount
  onUnmounted(() => {
    unsubscribe();
  });

  // Watch for user changes
  watch(user, (newUser) => {
    if (newUser) {
      fetchMentions();
      subscribeToMentions();
    } else {
      mentions.value = [];
      unreadCount.value = 0;
      unsubscribe();
    }
  });

  return {
    mentions: readonly(mentions),
    unreadCount: readonly(unreadCount),
    isLoading: readonly(isLoading),
    error: readonly(error),
    fetchMentions,
    fetchUnreadMentions,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    subscribeToMentions,
    unsubscribe,
    formatTimestamp
  };
};
