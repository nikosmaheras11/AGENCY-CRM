<template>
  <Transition name="slide">
    <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-end">
      <!-- Backdrop -->
      <div 
        class="absolute inset-0 bg-black/50 transition-opacity"
        @click="$emit('update:modelValue', false)"
      />
      
      <!-- Panel -->
      <div class="relative w-full max-w-2xl h-full bg-[#1d1d1f] text-white shadow-2xl overflow-y-auto">
        <!-- Header -->
        <div class="sticky top-0 z-10 bg-[#1d1d1f] border-b border-gray-800 px-6 py-4">
          <div class="flex items-center justify-between mb-4">
            <button
              class="px-4 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
            >
              <span class="material-icons text-lg">check</span>
              Mark complete
            </button>
            
            <div class="flex items-center gap-2">
              <button class="w-9 h-9 hover:bg-gray-800 rounded-lg flex items-center justify-center transition-colors">
                <span class="material-icons text-gray-400">thumb_up</span>
              </button>
              <button class="w-9 h-9 hover:bg-gray-800 rounded-lg flex items-center justify-center transition-colors">
                <span class="material-icons text-gray-400">content_copy</span>
              </button>
              <button class="w-9 h-9 hover:bg-gray-800 rounded-lg flex items-center justify-center transition-colors">
                <span class="material-icons text-gray-400">link</span>
              </button>
              <button class="w-9 h-9 hover:bg-gray-800 rounded-lg flex items-center justify-center transition-colors">
                <span class="material-icons text-gray-400">open_in_full</span>
              </button>
              <button class="w-9 h-9 hover:bg-gray-800 rounded-lg flex items-center justify-center transition-colors">
                <span class="material-icons text-gray-400">more_horiz</span>
              </button>
              <button 
                @click="$emit('update:modelValue', false)"
                class="w-9 h-9 hover:bg-gray-800 rounded-lg flex items-center justify-center transition-colors"
              >
                <span class="material-icons text-gray-400">close</span>
              </button>
            </div>
          </div>

          <!-- Privacy notice -->
          <div class="flex items-center justify-between text-sm text-gray-400">
            <div class="flex items-center gap-2">
              <span class="material-icons text-base">lock</span>
              <span>This task is private to members of this project.</span>
            </div>
            <button class="text-white hover:underline">Make public</button>
          </div>
        </div>

        <!-- Content -->
        <div class="px-6 py-6">
          <!-- Title -->
          <h1 class="text-2xl font-semibold mb-6">{{ campaign?.name || 'Campaign Details' }}</h1>

          <!-- Tabs -->
          <div class="mb-6 border-b border-gray-800">
            <div class="flex gap-6">
              <button
                v-for="tab in tabs"
                :key="tab"
                @click="activeTab = tab"
                class="pb-3 text-sm font-medium transition-colors relative"
                :class="activeTab === tab ? 'text-white' : 'text-gray-400 hover:text-gray-300'"
              >
                {{ tab }}
                <div 
                  v-if="activeTab === tab"
                  class="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                />
              </button>
            </div>
          </div>

          <!-- Overview Tab -->
          <div v-if="activeTab === 'Overview'">
            <!-- Assignee -->
            <div class="flex items-start gap-4 mb-6">
              <label class="w-32 text-sm text-gray-400 pt-2">Assignee</label>
              <div class="flex-1">
                <div class="flex items-center gap-2 px-3 py-2 bg-gray-800/50 rounded-lg">
                  <div class="w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center text-xs font-medium">
                    NM
                  </div>
                  <span class="text-sm">{{ campaign?.assignee || 'Nikos Maheras' }}</span>
                  <button class="ml-auto text-gray-400 hover:text-white">
                    <span class="material-icons text-sm">close</span>
                  </button>
                </div>
                <button class="text-xs text-gray-400 hover:text-white mt-2">Recently assigned</button>
              </div>
            </div>

            <!-- Due date -->
            <div class="flex items-start gap-4 mb-6">
              <label class="w-32 text-sm text-gray-400 pt-2">Due date</label>
              <div class="flex-1">
                <div class="flex items-center gap-2 px-3 py-2 bg-gray-800/50 rounded-lg">
                  <span class="material-icons text-gray-400 text-sm">calendar_today</span>
                  <span class="text-sm">{{ campaign?.dueDate || 'Today – Nov 11' }}</span>
                  <button class="ml-auto text-gray-400 hover:text-white">
                    <span class="material-icons text-sm">close</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Projects -->
            <div class="flex items-start gap-4 mb-6">
              <label class="w-32 text-sm text-gray-400 pt-2">Projects</label>
              <div class="flex-1">
                <div class="flex items-center gap-2 px-3 py-2 bg-gray-800/50 rounded-lg mb-2">
                  <div class="w-3 h-3 rounded bg-purple-500" />
                  <span class="text-sm">Poly</span>
                  <span class="text-xs text-gray-400">To do</span>
                  <button class="ml-auto text-gray-400 hover:text-white">
                    <span class="material-icons text-sm">close</span>
                  </button>
                </div>
                <button class="text-sm text-gray-400 hover:text-white">Add to projects</button>
              </div>
            </div>

            <!-- Dependencies -->
            <div class="flex items-start gap-4 mb-6">
              <label class="w-32 text-sm text-gray-400 pt-2">Dependencies</label>
              <div class="flex-1">
                <button class="text-sm text-gray-400 hover:text-white">Add dependencies</button>
              </div>
            </div>

            <!-- Fields -->
            <div class="flex items-start gap-4 mb-6">
              <label class="w-32 text-sm text-gray-400 pt-2">Fields</label>
              <div class="flex-1 space-y-3">
                <div class="flex items-center justify-between p-3 border border-gray-800 rounded-lg">
                  <div class="flex items-center gap-2 text-gray-400">
                    <span class="material-icons text-sm">priority_high</span>
                    <span class="text-sm">Priority</span>
                  </div>
                  <span class="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs font-medium rounded">
                    {{ campaign?.priority || 'Low' }}
                  </span>
                </div>
                <div class="flex items-center justify-between p-3 border border-gray-800 rounded-lg">
                  <div class="flex items-center gap-2 text-gray-400">
                    <span class="material-icons text-sm">info</span>
                    <span class="text-sm">Status</span>
                  </div>
                  <span class="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs font-medium rounded">
                    {{ campaign?.status || 'On track' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Description -->
            <div class="flex items-start gap-4 mb-6">
              <label class="w-32 text-sm text-gray-400 pt-2">Description</label>
              <div class="flex-1">
                <textarea
                  placeholder="What is this task about?"
                  class="w-full px-3 py-2 bg-transparent border border-gray-800 rounded-lg text-sm text-gray-400 placeholder-gray-600 focus:outline-none focus:border-gray-700 resize-none"
                  rows="4"
                />
              </div>
            </div>

            <!-- Add subtask -->
            <button class="flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-8">
              <span class="material-icons text-base">add</span>
              <span>Add subtask</span>
            </button>

            <!-- Comments Section -->
            <div class="border-t border-gray-800 pt-6">
              <div class="flex items-center justify-between mb-4">
                <div class="flex gap-4">
                  <button class="text-sm font-medium text-white border-b-2 border-white pb-1">
                    Comments
                  </button>
                  <button class="text-sm text-gray-400 hover:text-white">
                    All activity
                  </button>
                </div>
                <button class="text-xs text-gray-400 hover:text-white flex items-center gap-1">
                  <span class="material-icons text-sm">sort</span>
                  <span>Oldest</span>
                </button>
              </div>

              <!-- Activity item -->
              <div class="flex gap-3 mb-4">
                <div class="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-xs font-medium flex-shrink-0">
                  NM
                </div>
                <div class="flex-1">
                  <p class="text-sm text-gray-400">
                    <span class="text-white font-medium">Nikos Maheras</span> created this task
                    <span class="ml-2">1 minute ago</span>
                  </p>
                </div>
              </div>

              <!-- Comment input -->
              <div class="flex gap-3">
                <div class="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-xs font-medium flex-shrink-0">
                  NM
                </div>
                <div class="flex-1">
                  <textarea
                    placeholder="Add a comment"
                    class="w-full px-4 py-3 bg-gray-900/50 border border-gray-800 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-700 resize-none"
                    rows="3"
                  />
                </div>
              </div>

              <!-- Collaborators -->
              <div class="flex items-center gap-3 mt-6">
                <span class="text-sm text-gray-400">Collaborators</span>
                <div class="flex items-center">
                  <div class="w-7 h-7 rounded-full bg-pink-500 flex items-center justify-center text-xs font-medium border-2 border-[#1d1d1f]">
                    NM
                  </div>
                  <div class="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-xs font-medium border-2 border-[#1d1d1f] -ml-2">
                    <span class="material-icons text-sm text-gray-400">person</span>
                  </div>
                  <button class="w-7 h-7 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center border-2 border-[#1d1d1f] -ml-2 transition-colors">
                    <span class="material-icons text-sm text-gray-400">add</span>
                  </button>
                </div>
                <button class="ml-auto text-sm text-gray-400 hover:text-white flex items-center gap-1">
                  <span class="material-icons text-sm">logout</span>
                  <span>Leave task</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Assets Tab -->
          <div v-else-if="activeTab === 'Assets'">
            <div class="text-center py-12 text-gray-400">
              <span class="material-icons text-5xl mb-4">image</span>
              <p class="text-sm">No creative assets linked to this campaign yet</p>
              <button class="mt-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors">
                Link Creative Asset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  campaign?: any
}

defineProps<Props>()
defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const activeTab = ref('Overview')
const tabs = ['Overview', 'Assets']
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

.slide-enter-from .absolute,
.slide-leave-to .absolute {
  opacity: 0;
}

.slide-enter-active .absolute,
.slide-leave-active .absolute {
  transition: opacity 0.3s ease;
}
</style>
