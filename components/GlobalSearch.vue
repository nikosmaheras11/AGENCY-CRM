<template>
  <div class="relative" v-click-outside="closeSearch">
    <!-- Search Button -->
    <button
      @click="openSearch"
      class="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-400"
    >
      <span class="material-icons text-lg">search</span>
      <span class="text-sm">Search</span>
      <kbd class="ml-1 px-1.5 py-0.5 text-xs bg-white/5 border border-white/10 rounded">⌘K</kbd>
    </button>

    <!-- Search Modal Overlay -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="isOpen"
          class="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] bg-black/60 backdrop-blur-sm"
          @click="closeSearch"
        >
          <!-- Search Container -->
          <div
            @click.stop
            class="w-full max-w-2xl mx-4 bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden"
            style="box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5)"
          >
            <!-- Search Input -->
            <div class="flex items-center gap-3 px-4 py-3 border-b border-white/10">
              <span class="material-icons text-gray-400">search</span>
              <input
                ref="searchInput"
                v-model="searchQuery"
                @input="debouncedSearch"
                type="text"
                placeholder="Search assets, requests, projects..."
                class="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none text-base"
                autocomplete="off"
              />
              <span v-if="isSearching" class="material-icons text-primary-400 animate-spin">refresh</span>
              <button
                v-if="searchQuery"
                @click="clearSearch"
                class="text-gray-400 hover:text-white transition-colors"
              >
                <span class="material-icons text-lg">close</span>
              </button>
            </div>

            <!-- Results -->
            <div class="max-h-[60vh] overflow-y-auto">
              <!-- Loading State -->
              <div v-if="isSearching && !searchResults.length" class="flex items-center justify-center py-12">
                <div class="flex flex-col items-center gap-3">
                  <span class="material-icons text-4xl text-primary-400 animate-spin">refresh</span>
                  <span class="text-gray-400 text-sm">Searching...</span>
                </div>
              </div>

              <!-- Error State -->
              <div v-else-if="searchError" class="flex items-center justify-center py-12">
                <div class="flex flex-col items-center gap-3 text-red-400">
                  <span class="material-icons text-4xl">error_outline</span>
                  <span class="text-sm">{{ searchError }}</span>
                </div>
              </div>

              <!-- No Results -->
              <div v-else-if="searchQuery && !searchResults.length && !isSearching" class="flex items-center justify-center py-12">
                <div class="flex flex-col items-center gap-3">
                  <span class="material-icons text-4xl text-gray-600">search_off</span>
                  <span class="text-gray-400 text-sm">No results found for "{{ searchQuery }}"</span>
                </div>
              </div>

              <!-- Empty State -->
              <div v-else-if="!searchQuery" class="px-4 py-8">
                <div class="flex flex-col items-center gap-3 text-gray-500">
                  <span class="material-icons text-4xl">manage_search</span>
                  <span class="text-sm">Start typing to search assets and requests</span>
                </div>
              </div>

              <!-- Results List -->
              <div v-else class="py-2">
                <NuxtLink
                  v-for="result in searchResults"
                  :key="result.id"
                  :to="result.url"
                  @click="closeSearch"
                  class="flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer group"
                >
                  <!-- Thumbnail or Icon -->
                  <div class="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-white/5 flex items-center justify-center">
                    <img
                      v-if="result.thumbnail_url"
                      :src="result.thumbnail_url"
                      :alt="result.title"
                      class="w-full h-full object-cover"
                    />
                    <span v-else class="material-icons text-gray-400">
                      {{ result.entity_type === 'asset' ? 'image' : 'description' }}
                    </span>
                  </div>

                  <!-- Content -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <h3 class="text-white font-medium text-sm truncate group-hover:text-primary-300 transition-colors">
                        {{ result.title }}
                      </h3>
                      <span
                        class="flex-shrink-0 px-2 py-0.5 text-xs rounded-full"
                        :class="result.entity_type === 'asset' ? 'bg-teal-500/20 text-teal-300' : 'bg-purple-500/20 text-purple-300'"
                      >
                        {{ result.entity_type }}
                      </span>
                    </div>
                    <p v-if="result.description" class="text-gray-400 text-xs mt-1 line-clamp-1">
                      {{ result.description }}
                    </p>
                    <span class="text-gray-500 text-xs mt-1 block">
                      {{ formatDate(result.created_at) }}
                    </span>
                  </div>

                  <!-- Arrow Icon -->
                  <div class="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span class="material-icons text-gray-400 text-lg">arrow_forward</span>
                  </div>
                </NuxtLink>
              </div>
            </div>

            <!-- Footer -->
            <div v-if="searchResults.length > 0" class="px-4 py-2 border-t border-white/10 flex items-center justify-between text-xs text-gray-500">
              <span>{{ searchResults.length }} result{{ searchResults.length === 1 ? '' : 's' }}</span>
              <div class="flex items-center gap-3">
                <span class="flex items-center gap-1">
                  <kbd class="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded">↑↓</kbd>
                  Navigate
                </span>
                <span class="flex items-center gap-1">
                  <kbd class="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded">↵</kbd>
                  Select
                </span>
                <span class="flex items-center gap-1">
                  <kbd class="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded">esc</kbd>
                  Close
                </span>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import { useGlobalSearch } from '~/composables/useGlobalSearch'
import { useDebounceFn } from '@vueuse/core'

const { search, searchResults, isSearching, searchError, clearResults } = useGlobalSearch()

const isOpen = ref(false)
const searchQuery = ref('')
const searchInput = ref<HTMLInputElement>()

const debouncedSearch = useDebounceFn(() => {
  search(searchQuery.value)
}, 300)

const openSearch = async () => {
  isOpen.value = true
  await nextTick()
  searchInput.value?.focus()
}

const closeSearch = () => {
  isOpen.value = false
  searchQuery.value = ''
  clearResults()
}

const clearSearch = () => {
  searchQuery.value = ''
  clearResults()
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

// Keyboard shortcut: Cmd+K / Ctrl+K
const handleKeydown = (e: KeyboardEvent) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    openSearch()
  } else if (e.key === 'Escape' && isOpen.value) {
    closeSearch()
  }
}

// Click outside directive
interface ClickOutsideElement extends HTMLElement {
  _clickOutside?: (event: MouseEvent) => void
}

const vClickOutside = {
  mounted(el: ClickOutsideElement, binding: any) {
    el._clickOutside = (event: MouseEvent) => {
      if (!el.contains(event.target as Node)) {
        binding.value()
      }
    }
    document.addEventListener('click', el._clickOutside)
  },
  unmounted(el: ClickOutsideElement) {
    if (el._clickOutside) {
      document.removeEventListener('click', el._clickOutside)
    }
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
