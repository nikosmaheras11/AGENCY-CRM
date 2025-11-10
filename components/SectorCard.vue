<template>
  <div 
    class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 hover:shadow-lg transition-shadow cursor-pointer"
    :style="{ borderLeftColor: sector.color }"
  >
    <div class="flex items-start justify-between mb-4">
      <div class="flex items-center gap-3">
        <div 
          class="w-12 h-12 rounded-lg flex items-center justify-center"
          :style="{ backgroundColor: sector.color + '20' }"
        >
          <span class="material-icons text-2xl" :style="{ color: sector.color }">
            {{ sector.icon }}
          </span>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ sector.name }}
          </h3>
        </div>
      </div>
    </div>

    <div class="space-y-2">
      <div v-for="(value, key) in sectorStats" :key="key" class="flex justify-between items-center">
        <span class="text-sm text-gray-600 dark:text-gray-400 capitalize">
          {{ formatKey(key) }}
        </span>
        <span class="text-sm font-semibold text-gray-900 dark:text-white">
          {{ formatValue(value) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Sector {
  id: number
  name: string
  slug: string
  color: string
  icon: string
  [key: string]: any
}

const props = defineProps<{
  sector: Sector
}>()

const sectorStats = computed(() => {
  const { id, name, slug, color, icon, ...stats } = props.sector
  return stats
})

const formatKey = (key: string | number): string => {
  return String(key).replace(/([A-Z])/g, ' $1').trim()
}

const formatValue = (value: any) => {
  if (typeof value === 'number' && value > 1000) {
    return value.toLocaleString()
  }
  return value
}
</script>
