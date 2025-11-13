<template>
  <div 
    class="asset-grid"
    :class="[`grid-${density}`, `cols-${columns}`]"
  >
    <!-- Reuse KanbanCard component for consistency -->
    <KanbanCard
      v-for="asset in sortedAssets"
      :key="asset.id"
      :asset="asset"
      @click="handleAssetClick(asset)"
      class="asset-card"
    />
  </div>
</template>

<script setup lang="ts">
import KanbanCard from '~/components/creative/KanbanCard.vue'

interface Props {
  assets: any[]
  density?: 'comfortable' | 'cozy' | 'compact'
  columns?: 3 | 4 | 5 | 6 | 'auto'
  selectionEnabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  density: 'cozy',
  columns: 'auto',
  selectionEnabled: false
})

const emit = defineEmits<{
  assetClick: [asset: any]
  selectionChange: [selectedIds: string[]]
}>()

// Selection state
const selectedAssets = ref<Set<string>>(new Set())

const isSelected = (id: string) => selectedAssets.value.has(id)

const toggleSelection = (id: string) => {
  if (selectedAssets.value.has(id)) {
    selectedAssets.value.delete(id)
  } else {
    selectedAssets.value.add(id)
  }
  emit('selectionChange', Array.from(selectedAssets.value))
}

// Sorting (can be enhanced later)
const sortedAssets = computed(() => props.assets)

// Asset click handler
const handleAssetClick = (asset: any) => {
  emit('assetClick', asset)
}
</script>

<style scoped>
/* Grid density variations */
.grid-comfortable { gap: 24px; }
.grid-cozy { gap: 16px; }
.grid-compact { gap: 8px; }

/* Column configurations */
.asset-grid {
  display: grid;
  padding: 24px;
}

.cols-3 { grid-template-columns: repeat(3, 1fr); }
.cols-4 { grid-template-columns: repeat(4, 1fr); }
.cols-5 { grid-template-columns: repeat(5, 1fr); }
.cols-6 { grid-template-columns: repeat(6, 1fr); }
.cols-auto { 
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); 
}

/* Hover effects */
.asset-card {
  transition: all 0.2s ease;
}

.asset-card:hover {
  transform: translateY(-2px);
}

/* Line clamp utility */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
