<template>
  <div class="mentions-panel">
    <!-- Header -->
    <div class="mentions-header">
      <div class="header-left">
        <h2 class="header-title">
          <UIcon name="i-heroicons-chat-bubble-left-ellipsis" class="icon" />
          Slack Mentions
        </h2>
        <UBadge v-if="unreadCount > 0" color="red" variant="solid">
          {{ unreadCount }}
        </UBadge>
      </div>
      
      <div class="header-actions">
        <UButton
          v-if="unreadCount > 0"
          size="sm"
          variant="ghost"
          @click="handleMarkAllRead"
          :loading="isMarkingAllRead"
        >
          Mark all read
        </UButton>
        
        <UButton
          size="sm"
          variant="ghost"
          icon="i-heroicons-arrow-path"
          @click="handleRefresh"
          :loading="isLoading"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading && mentions.length === 0" class="loading-state">
      <UIcon name="i-heroicons-arrow-path" class="loading-icon" />
      <p>Loading your mentions...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="mentions.length === 0" class="empty-state">
      <UIcon name="i-heroicons-chat-bubble-left-ellipsis" class="empty-icon" />
      <h3>No mentions yet</h3>
      <p>When someone mentions you in Slack, it will appear here</p>
    </div>

    <!-- Mentions List -->
    <div v-else class="mentions-list">
      <TransitionGroup name="mention">
        <div
          v-for="mention in mentions"
          :key="mention.mention_id"
          class="mention-item"
          :class="{ 'unread': !mention.is_read }"
          @click="handleMentionClick(mention)"
        >
          <!-- Unread Indicator -->
          <div v-if="!mention.is_read" class="unread-indicator" />

          <!-- Message Header -->
          <div class="mention-header">
            <div class="header-info">
              <UAvatar
                :src="mention.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(mention.user_name)}&background=random`"
                :alt="mention.user_name"
                size="xs"
              />
              <div class="message-meta">
                <span class="user-name">{{ mention.user_name }}</span>
                <span class="channel-name">#{{ mention.channel_name }}</span>
              </div>
            </div>
            
            <span class="timestamp">
              {{ formatTimestamp(mention.mention_created_at) }}
            </span>
          </div>

          <!-- Message Content -->
          <div class="mention-content">
            <p class="message-text">{{ mention.text }}</p>
            
            <!-- Thread Indicator -->
            <div v-if="mention.is_thread_reply" class="thread-indicator">
              <UIcon name="i-heroicons-chat-bubble-left-right" />
              <span>Reply in thread</span>
            </div>
          </div>

          <!-- Reactions -->
          <div v-if="mention.reactions && mention.reactions.length > 0" class="reactions">
            <div
              v-for="reaction in mention.reactions"
              :key="reaction.name"
              class="reaction"
            >
              <span class="emoji">{{ getEmojiFromName(reaction.name) }}</span>
              <span class="count">{{ reaction.count }}</span>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="mention-footer">
            <UButton
              :href="mention.permalink"
              target="_blank"
              size="xs"
              variant="ghost"
              icon="i-heroicons-arrow-top-right-on-square"
            >
              Open in Slack
            </UButton>
            
            <UButton
              v-if="!mention.is_read"
              size="xs"
              variant="ghost"
              @click.stop="handleMarkRead(mention.mention_id)"
            >
              Mark as read
            </UButton>
          </div>
        </div>
      </TransitionGroup>
    </div>

    <!-- Error Toast -->
    <UNotifications />
  </div>
</template>

<script setup lang="ts">
import type { UserMention } from '~/composables/useSlackMentions';

const {
  mentions,
  unreadCount,
  isLoading,
  error,
  fetchMentions,
  markAsRead,
  markAllAsRead,
  formatTimestamp
} = useSlackMentions();

const toast = useToast();
const isMarkingAllRead = ref(false);

/**
 * Handle clicking on a mention
 */
const handleMentionClick = async (mention: UserMention) => {
  if (!mention.is_read) {
    try {
      await markAsRead(mention.mention_id);
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  }
};

/**
 * Handle marking all mentions as read
 */
const handleMarkAllRead = async () => {
  try {
    isMarkingAllRead.value = true;
    const count = await markAllAsRead();
    
    toast.add({
      title: 'Success',
      description: `Marked ${count} mention${count !== 1 ? 's' : ''} as read`,
      color: 'green'
    });
  } catch (err) {
    toast.add({
      title: 'Error',
      description: 'Failed to mark mentions as read',
      color: 'red'
    });
  } finally {
    isMarkingAllRead.value = false;
  }
};

/**
 * Handle refresh button
 */
const handleRefresh = () => {
  fetchMentions();
};

/**
 * Convert emoji name to emoji character
 */
const getEmojiFromName = (name: string): string => {
  const emojiMap: Record<string, string> = {
    '+1': '👍',
    '-1': '👎',
    'heart': '❤️',
    'eyes': '👀',
    'fire': '🔥',
    'rocket': '🚀',
    'tada': '🎉',
    'clap': '👏',
    'pray': '🙏',
    'thinking_face': '🤔',
    'smile': '😄',
    'laughing': '😆',
  };
  
  return emojiMap[name] || `:${name}:`;
};

// Watch for errors
watch(error, (newError) => {
  if (newError) {
    toast.add({
      title: 'Error',
      description: newError,
      color: 'red'
    });
  }
});
</script>

<style scoped>
.mentions-panel {
  @apply flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg shadow-sm;
}

.mentions-header {
  @apply flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800;
}

.header-left {
  @apply flex items-center gap-2;
}

.header-title {
  @apply text-lg font-semibold flex items-center gap-2;
}

.header-title .icon {
  @apply text-blue-500;
}

.header-actions {
  @apply flex items-center gap-2;
}

.loading-state,
.empty-state {
  @apply flex flex-col items-center justify-center py-12 text-gray-500;
}

.loading-icon {
  @apply w-12 h-12 animate-spin mb-4;
}

.empty-icon {
  @apply w-16 h-16 mb-4 text-gray-400;
}

.empty-state h3 {
  @apply text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300;
}

.mentions-list {
  @apply flex-1 overflow-y-auto p-4 space-y-3;
}

.mention-item {
  @apply relative bg-gray-50 dark:bg-gray-800 rounded-lg p-4 cursor-pointer
         transition-all hover:shadow-md hover:bg-gray-100 dark:hover:bg-gray-750;
}

.mention-item.unread {
  @apply bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500;
}

.unread-indicator {
  @apply absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full;
}

.mention-header {
  @apply flex items-center justify-between mb-3;
}

.header-info {
  @apply flex items-center gap-2;
}

.message-meta {
  @apply flex flex-col;
}

.user-name {
  @apply font-semibold text-sm text-gray-900 dark:text-gray-100;
}

.channel-name {
  @apply text-xs text-gray-500 dark:text-gray-400;
}

.timestamp {
  @apply text-xs text-gray-400;
}

.mention-content {
  @apply mb-3;
}

.message-text {
  @apply text-sm text-gray-700 dark:text-gray-300 line-clamp-3;
}

.thread-indicator {
  @apply flex items-center gap-1 mt-2 text-xs text-gray-500;
}

.reactions {
  @apply flex flex-wrap gap-2 mb-3;
}

.reaction {
  @apply flex items-center gap-1 px-2 py-1 bg-white dark:bg-gray-700 rounded-full text-xs;
}

.emoji {
  @apply text-base;
}

.count {
  @apply text-gray-600 dark:text-gray-400;
}

.mention-footer {
  @apply flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700;
}

/* Transitions */
.mention-enter-active,
.mention-leave-active {
  transition: all 0.3s ease;
}

.mention-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.mention-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

.mention-move {
  transition: transform 0.3s ease;
}
</style>
