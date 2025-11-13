<template>
  <DashboardLayout>
    <div class="p-6">
      <!-- Welcome Section -->
      <div class="mb-4">
        <h2 class="text-3xl font-bold text-white mb-1">Welcome back, Polymarket</h2>
        <p class="text-slate-400 text-sm">{{ currentTime }} • {{ currentDate }}</p>
      </div>
      
      <!-- Main Content Grid -->
      <div class="grid grid-cols-12 gap-4 h-[calc(100vh-10rem)]">
        
        <!-- Left Column: Items Needing Review -->
        <div class="col-span-12 lg:col-span-7 xl:col-span-8">
          <div class="card-glass card-elevated flex flex-col h-full">
            <div class="p-3 sm:p-4 border-b border-white/10 flex-shrink-0">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <h2 class="text-lg font-semibold text-white">Items Needing Review</h2>
                  <div class="ml-2 bg-primary-400/20 text-primary-300 text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                    {{ alerts.length }}
                  </div>
                </div>
                <button class="text-xs font-semibold text-slate-400 hover:text-white uppercase tracking-wider transition-colors">
                  View All
                </button>
              </div>
            </div>
            
            <div class="p-3 sm:p-4 flex-1 overflow-y-auto">
              <div class="space-y-2">
                <div 
                  v-for="alert in alerts" 
                  :key="alert.id"
                  class="relative flex items-center gap-4 p-4 card-glass border border-white/10 rounded-lg hover:bg-white/5 hover:shadow-primary/20 transition-all cursor-pointer group"
                  @click="openTask(alert.id)"
                >
                  <!-- Priority/Type Indicator -->
                  <div :class="`w-1 h-12 rounded-full flex-shrink-0 ${getAlertColor(alert.type)}`"></div>
                  
                  <!-- Task Icon -->
                  <div :class="`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center ${getAlertBgColor(alert.type)}`">
                    <span class="material-icons text-lg" :class="getAlertTextColor(alert.type)">{{ getAlertIcon(alert.type) }}</span>
                  </div>
                  
                  <!-- Task Content -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between gap-3">
                      <div class="flex-1 min-w-0">
                        <h3 class="font-medium text-sm text-white truncate">{{ alert.title }}</h3>
                        <p class="mt-1 text-xs text-slate-400 line-clamp-1">{{ alert.description }}</p>
                      </div>
                      <div class="flex items-center gap-2 flex-shrink-0">
                        <span class="text-xs px-2 py-1 rounded-full bg-white/10 text-slate-300">Creative</span>
                        <span :class="`text-xs px-2 py-1 rounded-full font-medium ${getAlertBadgeColor(alert.type)}`">
                          {{ alert.type.charAt(0).toUpperCase() + alert.type.slice(1) }}
                        </span>
                      </div>
                    </div>
                    
                    <!-- Metadata Row -->
                    <div class="flex items-center gap-4 mt-2 text-xs text-slate-400">
                      <div class="flex items-center gap-1">
                        <span class="material-icons text-sm">person</span>
                        <span>{{ alert.assignee || 'Unassigned' }}</span>
                      </div>
                      <div class="flex items-center gap-1">
                        <span class="material-icons text-sm">calendar_today</span>
                        <span>{{ alert.dueDate || 'No due date' }}</span>
                      </div>
                      <div v-if="alert.projectName" class="flex items-center gap-1">
                        <span class="material-icons text-sm">folder</span>
                        <span>{{ alert.projectName }}</span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Arrow Icon -->
                  <div class="flex-shrink-0 text-slate-400 group-hover:text-white transition-colors">
                    <span class="material-icons">chevron_right</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Right Column: Slack Messages + This Week's Objectives -->
        <div class="col-span-12 lg:col-span-5 xl:col-span-4 space-y-4 h-full flex flex-col">
          <!-- Slack Messages Section -->
          <div class="card-glass card-elevated flex-shrink-0">
            <div class="p-3 sm:p-4 border-b border-white/10">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <h2 class="text-lg font-semibold text-white">Slack Messages</h2>
                  <div class="ml-2 bg-primary-400/20 text-primary-300 text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                    3
                  </div>
                </div>
                <button class="text-xs font-semibold text-slate-400 hover:text-white uppercase tracking-wider transition-colors">
                  View All
                </button>
              </div>
            </div>
            
            <div class="p-3 sm:p-4">
              <SlackMessageFeed :limit="10" />
            </div>
          </div>
          
          <!-- This Week's Objectives Section -->
          <div class="card-glass card-elevated flex-1 flex flex-col">
            <div class="p-3 sm:p-4 border-b border-white/10 flex-shrink-0">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <h2 class="text-lg font-semibold text-white">This Week's Objectives</h2>
                  <div class="ml-2 bg-teal-400/20 text-teal-300 text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                    {{ weeklyObjectives.length }}
                  </div>
                </div>
                <button 
                  @click="navigateToCRM"
                  class="text-xs font-semibold text-slate-400 hover:text-white uppercase tracking-wider transition-colors"
                >
                  See More
                </button>
              </div>
            </div>
            
            <div class="p-3 sm:p-4 flex-1 overflow-y-auto">
              <div class="space-y-2">
                <div 
                  v-for="objective in weeklyObjectives" 
                  :key="objective.id"
                  class="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors cursor-pointer group"
                  @click="openObjective(objective.id)"
                >
                  <!-- Checkbox -->
                  <div 
                    :class="`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border-2 transition-colors ${
                      objective.completed 
                        ? 'bg-success border-success' 
                        : 'border-white/30 group-hover:border-white/50'
                    }`"
                  >
                    <span v-if="objective.completed" class="material-icons text-white text-sm">check</span>
                  </div>
                  
                  <!-- Content -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between gap-2">
                      <h3 :class="`font-medium text-sm truncate ${
                        objective.completed ? 'text-slate-400 line-through' : 'text-white'
                      }`">
                        {{ objective.title }}
                      </h3>
                      <span :class="`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                        objective.priority === 'high' ? 'bg-error/20 text-error' :
                        objective.priority === 'medium' ? 'bg-orange-300/20 text-orange-300' :
                        'bg-teal-400/20 text-teal-300'
                      }`">
                        {{ objective.priority }}
                      </span>
                    </div>
                    <div class="flex items-center gap-3 mt-1 text-xs text-slate-400">
                      <span>{{ objective.category }}</span>
                      <span>•</span>
                      <span>{{ objective.dueDate }}</span>
                    </div>
                  </div>
                  
                  <!-- Arrow Icon -->
                  <div class="flex-shrink-0 text-slate-400 group-hover:text-white transition-colors">
                    <span class="material-icons text-sm">chevron_right</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

definePageMeta({
  middleware: ['auth']
})

// Current time and date
const currentTime = ref('')
const currentDate = ref('')

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  })
  currentDate.value = now.toLocaleDateString('en-US', { 
    weekday: 'long',
    month: 'long', 
    day: 'numeric',
    year: 'numeric'
  })
}

// Update time immediately and every minute
onMounted(() => {
  updateTime()
  setInterval(updateTime, 60000) // Update every minute
})

const alerts = ref([])

// Slack messages now loaded dynamically via SlackMessageFeed component

const weeklyObjectives = ref([])

function getAlertColor(type: string) {
  const colors: Record<string, string> = {
    warning: 'bg-orange-300',
    info: 'bg-primary-400',
    success: 'bg-success',
    error: 'bg-error'
  }
  return colors[type] || 'bg-gray-500'
}

function getAlertBgColor(type: string) {
  const colors: Record<string, string> = {
    warning: 'bg-orange-300/20',
    info: 'bg-primary-400/20',
    success: 'bg-success/20',
    error: 'bg-error/20'
  }
  return colors[type] || 'bg-gray-500/20'
}

function getAlertTextColor(type: string) {
  const colors: Record<string, string> = {
    warning: 'text-orange-300',
    info: 'text-primary-400',
    success: 'text-success',
    error: 'text-error'
  }
  return colors[type] || 'text-gray-500'
}

function getAlertBadgeColor(type: string) {
  const colors: Record<string, string> = {
    warning: 'bg-orange-300/20 text-orange-300',
    info: 'bg-primary-400/20 text-primary-300',
    success: 'bg-success/20 text-success',
    error: 'bg-error/20 text-error'
  }
  return colors[type] || 'bg-gray-500/20 text-gray-500'
}

function getAlertIcon(type: string) {
  const icons: Record<string, string> = {
    warning: 'warning',
    info: 'info',
    success: 'check_circle',
    error: 'error'
  }
  return icons[type] || 'help'
}

function openTask(taskId: number) {
  // Navigate to task detail page or open modal
  console.log('Opening task:', taskId)
  // TODO: Implement navigation to task detail
  // navigateTo(`/tasks/${taskId}`)
}

function openObjective(objectiveId: number) {
  // Navigate to objective detail or CRM with filter
  console.log('Opening objective:', objectiveId)
  // TODO: Implement navigation to objective detail
  // navigateTo(`/crm?filter=objective-${objectiveId}`)
}

function navigateToCRM() {
  // Navigate to weekly objectives page
  navigateTo('/weekly-objectives')
}
</script>
