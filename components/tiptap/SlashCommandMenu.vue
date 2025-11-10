<template>
  <div class="slash-menu" v-if="items.length">
    <div
      v-for="(item, index) in items"
      :key="index"
      :class="['slash-menu-item', { 'is-selected': index === selectedIndex }]"
      @click="selectItem(index)"
    >
      <span class="material-icons text-base">{{ item.icon }}</span>
      <div class="ml-3">
        <div class="font-medium text-sm">{{ item.title }}</div>
        <div class="text-xs text-slate-400">{{ item.description }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface CommandItem {
  title: string
  description: string
  icon: string
  command: (props: any) => void
}

const props = defineProps<{
  items: CommandItem[]
  command: (item: CommandItem) => void
}>()

const selectedIndex = ref(0)

function onKeyDown(event: KeyboardEvent) {
  if (event.key === 'ArrowUp') {
    selectedIndex.value = (selectedIndex.value + props.items.length - 1) % props.items.length
    return true
  }

  if (event.key === 'ArrowDown') {
    selectedIndex.value = (selectedIndex.value + 1) % props.items.length
    return true
  }

  if (event.key === 'Enter') {
    selectItem(selectedIndex.value)
    return true
  }

  return false
}

function selectItem(index: number) {
  const item = props.items[index]
  if (item) {
    props.command(item)
  }
}

defineExpose({ onKeyDown })
</script>

<style scoped>
.slash-menu {
  @apply bg-slate-900 border border-white/10 rounded-lg shadow-xl p-2 max-h-80 overflow-y-auto;
}

.slash-menu-item {
  @apply flex items-start p-2 rounded cursor-pointer transition-colors;
}

.slash-menu-item:hover,
.slash-menu-item.is-selected {
  @apply bg-white/10;
}
</style>
