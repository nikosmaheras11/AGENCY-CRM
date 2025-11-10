<script setup lang="ts">
// Channel configuration from environment
const channels = [
  {
    id: 'C09HBDKSUGH',
    name: 'Creative Hours',
    description: 'hours-creative-polymarket'
  },
  {
    id: 'C09F44R90UX',
    name: 'Performance Hours',
    description: 'hours-performance-polymarket'
  },
  {
    id: 'C09RDUX4198',
    name: 'Creative Requests',
    description: 'polymarket-creative-requests'
  },
  {
    id: 'C09RJ82TFPG',
    name: 'UGC Hours',
    description: 'polymarket-ugc-hours'
  }
]

const selectedChannel = ref(channels[0].id)
const selectedChannelInfo = computed(() => 
  channels.find(c => c.id === selectedChannel.value)
)
</script>

<template>
  <div class="container mx-auto p-6">
    <div class="mb-6">
      <h1 class="text-3xl font-bold mb-2">Slack Message Feeds</h1>
      <p class="text-gray-600">Real-time messages from your Polymarket Slack channels</p>
    </div>

    <!-- Channel Selector -->
    <div class="mb-6">
      <div class="flex gap-2 flex-wrap">
        <UButton
          v-for="channel in channels"
          :key="channel.id"
          :variant="selectedChannel === channel.id ? 'solid' : 'outline'"
          @click="selectedChannel = channel.id"
        >
          {{ channel.name }}
        </UButton>
      </div>
    </div>

    <!-- Selected Channel Feed -->
    <div class="max-w-4xl">
      <SlackMessageFeed 
        :channel-id="selectedChannel"
        :channel-name="selectedChannelInfo?.description"
        :limit="30"
      />
    </div>
  </div>
</template>
