<template>
  <div class="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer">
    <!-- Campaign Header -->
    <div class="flex items-start gap-3 mb-3">
      <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-bold flex-shrink-0">
        {{ campaign.name.charAt(0) }}
      </div>
      <div class="flex-1 min-w-0">
        <h3 class="font-display font-semibold text-slate-900 text-sm mb-1 line-clamp-2">
          {{ campaign.name }}
        </h3>
        <span 
          class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
          :class="getPriorityBadge(campaign.priority)"
        >
          <span class="material-icons text-xs mr-1">{{ getPriorityIcon(campaign.priority) }}</span>
          {{ campaign.priority }}
        </span>
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="mb-3">
      <div class="flex justify-between text-xs text-slate-600 mb-1.5">
        <span>Progress</span>
        <span class="font-medium">{{ campaign.progress }}%</span>
      </div>
      <div class="w-full bg-slate-200 rounded-full h-2">
        <div 
          class="h-2 rounded-full transition-all"
          :class="campaign.progress >= 75 ? 'bg-green-500' : campaign.progress >= 50 ? 'bg-blue-500' : 'bg-orange-500'"
          :style="{ width: `${campaign.progress}%` }"
        ></div>
      </div>
    </div>

    <!-- Footer Info -->
    <div class="flex items-center justify-between">
      <!-- Owner -->
      <div class="flex items-center gap-2">
        <div class="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-xs">
          {{ campaign.owner.split(' ').map(n => n[0]).join('') }}
        </div>
        <span class="text-xs text-slate-600">{{ campaign.owner.split(' ')[0] }}</span>
      </div>

      <!-- Due Date -->
      <div class="flex items-center gap-1 text-xs text-slate-600">
        <span class="material-icons text-sm">calendar_today</span>
        <span>{{ formatDate(campaign.dueDate) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Campaign {
  id: number
  name: string
  status: string
  priority: string
  owner: string
  progress: number
  dueDate: string
}

defineProps<{
  campaign: Campaign
}>()

const getPriorityBadge = (priority: string) => {
  const badges: Record<string, string> = {
    'Critical': 'bg-red-100 text-red-700',
    'High': 'bg-orange-100 text-orange-700',
    'Medium': 'bg-yellow-100 text-yellow-700',
    'Low': 'bg-green-100 text-green-700'
  }
  return badges[priority] || 'bg-slate-100 text-slate-700'
}

const getPriorityIcon = (priority: string) => {
  const icons: Record<string, string> = {
    'Critical': 'error',
    'High': 'arrow_upward',
    'Medium': 'remove',
    'Low': 'arrow_downward'
  }
  return icons[priority] || 'remove'
}

const formatDate = (date: string) => {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
</script>
