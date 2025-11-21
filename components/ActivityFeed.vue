<template>
  <div class="space-y-3">
    <div 
      v-for="activity in activities" 
      :key="activity.id"
      class="flex gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all"
    >
      <div class="flex-shrink-0">
        <div 
          class="w-10 h-10 rounded-full flex items-center justify-center"
          :class="getActionColor(activity.action)"
        >
          <span class="material-icons text-lg">
            {{ getActionIcon(activity.action) }}
          </span>
        </div>
      </div>
      
      <div class="flex-1 min-w-0">
        <p class="text-sm text-slate-900 font-medium">
          {{ activity.description }}
        </p>
        <div class="flex items-center gap-2 mt-1">
          <span class="text-xs text-slate-600">
            {{ activity.user }}
          </span>
          <span class="text-xs text-slate-400">•</span>
          <span class="text-xs text-slate-500">
            {{ activity.timestamp }}
          </span>
        </div>
      </div>

      <div class="flex-shrink-0">
        <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium capitalize"
          :class="getCollectionBadge(activity.collection)"
        >
          {{ formatCollection(activity.collection) }}
        </span>
      </div>
    </div>

    <div v-if="activities.length === 0" class="text-center py-8 text-slate-600">
      No recent activity
    </div>
  </div>
</template>

<script setup lang="ts">
interface Activity {
  id: number
  action: string
  collection: string
  description: string
  user: string
  timestamp: string
}

defineProps<{
  activities: Activity[]
}>()

const getActionIcon = (action: string) => {
  const icons: Record<string, string> = {
    created: 'add_circle',
    updated: 'edit',
    deleted: 'delete',
    approved: 'check_circle',
    rejected: 'cancel'
  }
  return icons[action] || 'info'
}

const getActionColor = (action: string) => {
  const colors: Record<string, string> = {
    created: 'bg-secondary/10 text-secondary',
    updated: 'bg-blue-100 text-blue-600',
    deleted: 'bg-red-100 text-red-600',
    approved: 'bg-emerald-100 text-emerald-600',
    rejected: 'bg-orange-100 text-orange-600'
  }
  return colors[action] || 'bg-slate-100 text-slate-600'
}

const getCollectionBadge = (collection: string) => {
  const badges: Record<string, string> = {
    creative_assets: 'bg-purple-100 text-purple-700',
    performance_campaigns: 'bg-secondary/10 text-secondary',
    design_components: 'bg-orange-100 text-orange-700',
    resources: 'bg-blue-100 text-blue-700',
    projects: 'bg-indigo-100 text-indigo-700'
  }
  return badges[collection] || 'bg-slate-100 text-slate-700'
}

const formatCollection = (collection: string) => {
  return collection.replace(/_/g, ' ')
}
</script>
