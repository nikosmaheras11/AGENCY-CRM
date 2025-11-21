<template>
  <div class="space-y-8">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="Object.keys(groupedCreatives).length === 0" class="text-center py-12 text-slate-400">
      No live creatives found.
    </div>

    <!-- Platform Groups -->
    <div v-else v-for="(creatives, platform) in groupedCreatives" :key="platform" class="space-y-4">
      <!-- Platform Header -->
      <div class="flex items-center gap-3 px-2">
        <UIcon :name="getPlatformIcon(platform)" class="text-2xl text-white" />
        <h3 class="text-lg font-medium text-white capitalize">{{ platform }}</h3>
        <span class="px-2 py-0.5 rounded-full text-xs bg-white/10 text-slate-400">
          {{ creatives.length }}
        </span>
      </div>

      <!-- Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <div 
          v-for="creative in creatives" 
          :key="creative.id"
          class="group relative aspect-[4/5] rounded-xl overflow-hidden bg-slate-800 border border-white/5 hover:border-primary-500/50 transition-all"
        >
          <!-- Image/Video Preview -->
          <img 
            v-if="creative.asset?.preview_url" 
            :src="creative.asset.preview_url" 
            class="w-full h-full object-cover"
            alt=""
          />
          <div v-else class="w-full h-full flex items-center justify-center bg-slate-800 text-slate-600">
            <UIcon name="i-heroicons-photo" class="text-4xl" />
          </div>

          <!-- Overlay Info -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
            <h4 class="text-white font-medium truncate">{{ creative.name }}</h4>
            <div class="flex items-center justify-between mt-2">
              <span class="text-xs text-slate-300 capitalize">{{ creative.format }}</span>
              <button class="p-1.5 bg-white/10 hover:bg-primary-500 rounded-lg text-white transition-colors">
                <UIcon name="i-heroicons-arrow-top-right-on-square" class="text-xs" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { fetchLiveCreatives } = useCampaigns()
const loading = ref(true)
const creatives = ref<any[]>([])

onMounted(async () => {
  try {
    creatives.value = await fetchLiveCreatives()
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})

const groupedCreatives = computed(() => {
  const groups: Record<string, any[]> = {}
  
  creatives.value.forEach(creative => {
    const platform = creative.ad_set?.platform || 'other'
    if (!groups[platform]) groups[platform] = []
    groups[platform].push(creative)
  })
  
  return groups
})

const getPlatformIcon = (platform: string) => {
  const icons: Record<string, string> = {
    'meta': 'i-simple-icons-meta',
    'tiktok': 'i-simple-icons-tiktok',
    'google': 'i-simple-icons-google',
    'linkedin': 'i-simple-icons-linkedin',
    'twitter': 'i-simple-icons-x',
    'pinterest': 'i-simple-icons-pinterest',
    'snapchat': 'i-simple-icons-snapchat'
  }
  return icons[platform.toLowerCase()] || 'i-heroicons-globe-alt'
}
</script>
