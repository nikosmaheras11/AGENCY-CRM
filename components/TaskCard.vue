<template>
  <div class="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
    <div class="flex items-start justify-between mb-3">
      <h4 class="font-medium text-gray-900 dark:text-white text-sm">
        {{ task.title }}
      </h4>
      <span 
        class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ml-2"
        :class="getPriorityBadge(task.priority)"
      >
        {{ task.priority }}
      </span>
    </div>

    <div class="space-y-2">
      <div class="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
        <span class="material-icons text-sm">folder</span>
        <span>{{ task.project }}</span>
      </div>

      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
            {{ task.assignee.charAt(0) }}
          </div>
          <span class="text-xs text-gray-600 dark:text-gray-400">{{ task.assignee }}</span>
        </div>

        <div class="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
          <span class="material-icons text-sm">calendar_today</span>
          <span>{{ task.dueDate }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Task {
  id: number
  title: string
  project: string
  priority: string
  assignee: string
  dueDate: string
  status: string
}

defineProps<{
  task: Task
}>()

const getPriorityBadge = (priority: string) => {
  const badges: Record<string, string> = {
    high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    low: 'bg-secondary/10 text-secondary dark:bg-secondary/30 dark:text-secondary'
  }
  return badges[priority] || 'bg-gray-100 text-gray-800'
}
</script>
