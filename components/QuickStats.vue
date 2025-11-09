<template>
  <div class="space-y-4">
    <div 
      v-for="(value, key) in stats" 
      :key="key"
      class="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50"
    >
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
          <span class="material-icons text-blue-600 dark:text-blue-400">
            {{ getStatIcon(key) }}
          </span>
        </div>
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
          {{ formatKey(key) }}
        </span>
      </div>
      <span class="text-xl font-bold text-gray-900 dark:text-white">
        {{ formatValue(value) }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Stats {
  [key: string]: number | string
}

defineProps<{
  stats: Stats
}>()

const getStatIcon = (key: string) => {
  const icons: Record<string, string> = {
    activeProjects: 'folder_open',
    totalClients: 'business',
    teamMembers: 'group',
    assetsManaged: 'inventory_2'
  }
  return icons[key] || 'analytics'
}

const formatKey = (key: string) => {
  return key.replace(/([A-Z])/g, ' $1').trim()
}

const formatValue = (value: number | string) => {
  if (typeof value === 'number' && value > 1000) {
    return value.toLocaleString()
  }
  return value
}
</script>
