<template>
  <div class="min-h-screen bg-gradient-dark text-white relative flex flex-col">
    <!-- Background pattern overlay -->
    <div class="absolute inset-0 bg-pattern opacity-[0.015] pointer-events-none"></div>
    
    <!-- Header -->
    <header class="h-16 bg-white/5 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-6 relative z-10">
      <div class="flex items-center">
        <h1 class="text-xl font-semibold text-white">Client Dashboard</h1>
      </div>
      <div class="flex items-center space-x-4">
        <div class="relative">
          <button class="w-10 h-10 rounded-full bg-white/5 backdrop-blur-xl flex items-center justify-center text-white hover:bg-white/10 transition-colors">
            <span class="material-icons text-xl">search</span>
          </button>
        </div>
        <div class="relative">
          <button class="w-10 h-10 rounded-full bg-white/5 backdrop-blur-xl flex items-center justify-center text-white hover:bg-white/10 transition-colors">
            <span class="material-icons text-xl">notifications</span>
          </button>
          <div class="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
            3
          </div>
        </div>
        <div class="flex items-center pl-4 border-l border-white/10">
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-teal-300 to-primary-400 shadow-primary flex items-center justify-center font-semibold">
            PM
          </div>
          <div class="ml-3">
            <div class="text-sm font-medium text-white">Polymarket</div>
            <div class="text-xs text-slate-400">Client Account</div>
          </div>
          <span class="material-icons text-slate-400 ml-2 text-lg">expand_more</span>
        </div>
      </div>
    </header>
    
    <!-- Dashboard Content -->
    <main class="flex-1 overflow-y-auto p-6 relative z-10">
      <!-- Welcome Section -->
      <div class="mb-6">
        <h2 class="text-3xl font-bold text-white mb-1">Welcome back, Polymarket</h2>
        <p class="text-slate-400 text-sm">{{ currentTime }} • {{ currentDate }}</p>
      </div>
      
      <div class="grid grid-cols-12 gap-4">
        
        <!-- Left Column: Items Needing Review -->
        <div class="col-span-12 lg:col-span-7 xl:col-span-8 space-y-4">
          <div class="card-glass card-elevated flex flex-col h-[calc(100vh-10rem)]">
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
        <div class="col-span-12 lg:col-span-5 xl:col-span-4 space-y-4 h-[calc(100vh-10rem)] flex flex-col">
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
              <div class="space-y-2 max-h-64 overflow-y-auto">
                <div 
                  v-for="(message, index) in slackMessages" 
                  :key="index"
                  :class="`p-3 ${index === 0 ? 'bg-primary-400/10 border-l-2 border-primary-400' : 'bg-white/5 border border-white/10'} rounded-lg hover:bg-primary-400/20 transition-colors cursor-pointer`"
                >
                  <div class="flex">
                    <div class="w-8 h-8 rounded-full bg-white/10 backdrop-blur-xl flex-shrink-0 flex items-center justify-center text-xs font-medium text-white">
                      {{ message.initials }}
                    </div>
                    <div class="ml-3 flex-1 min-w-0">
                      <div class="flex items-center justify-between">
                        <div class="font-medium text-sm truncate text-white">{{ message.author }}</div>
                        <div class="text-xs text-slate-400">{{ message.time }}</div>
                      </div>
                      <div class="text-xs text-slate-400 mt-0.5">
                        {{ message.channel }}
                      </div>
                      <div :class="`mt-1 text-sm line-clamp-2 ${index === 0 ? 'font-medium text-white' : 'text-slate-300'}`">
                        {{ message.text }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="mt-4">
                <button class="text-sm text-primary-400 font-medium hover:text-primary-300 transition-colors">Open in Slack</button>
              </div>
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
        
        <!-- Performance Snapshot Section -->
        <div class="col-span-12">
          <div class="card-glass card-elevated">
            <div class="p-4 sm:p-5 border-b border-white/10">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <h2 class="text-lg font-semibold text-white">Performance Snapshot</h2>
                  <div class="ml-3 text-sm text-slate-400 flex items-center">
                    <span class="material-icons text-base mr-1">refresh</span>
                    Updated 10 minutes ago
                  </div>
                </div>
                <div class="flex items-center">
                  <select class="text-sm bg-white/5 backdrop-blur-xl border border-white/10 rounded-md px-2 py-1 text-white">
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                    <option>This month</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div class="p-4 sm:p-5">
              <!-- Key Metrics -->
              <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div 
                  v-for="metric in performanceMetrics" 
                  :key="metric.label"
                  class="card-glass border border-white/10 rounded-lg p-4"
                >
                  <div class="text-sm text-slate-400">{{ metric.label }}</div>
                  <div class="mt-1 flex items-baseline">
                    <div class="text-2xl font-bold text-white">{{ metric.value }}</div>
                    <div :class="`ml-2 text-sm font-medium ${metric.change >= 0 ? 'text-success' : 'text-error'}`">
                      {{ metric.change >= 0 ? '↑' : '↓' }} {{ metric.changeText }}
                    </div>
                  </div>
                  <div class="mt-3 h-8">
                    <div class="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                      <div class="h-full bg-gradient-teal" :style="{width: metric.progress + '%'}"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
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

const alerts = ref([
  {
    id: 1,
    type: 'warning',
    title: 'Campaign budget threshold',
    description: 'Summer campaign reaching 85% of budget',
    assignee: 'Alex Johnson',
    dueDate: 'Today',
    projectName: 'Summer Campaign'
  },
  {
    id: 2,
    type: 'info',
    title: 'Creative review required',
    description: '5 assets awaiting approval',
    assignee: 'Taylor Wong',
    dueDate: 'Tomorrow',
    projectName: 'Brand Refresh'
  },
  {
    id: 3,
    type: 'success',
    title: 'Campaign milestone reached',
    description: 'Product launch +200% impressions',
    assignee: 'Jordan Lee',
    dueDate: 'Completed',
    projectName: 'Product Launch'
  },
  {
    id: 4,
    type: 'error',
    title: 'Deadline approaching',
    description: 'Q4 campaign assets due in 2 days',
    assignee: 'Sam Rivera',
    dueDate: 'In 2 days',
    projectName: 'Q4 Campaign'
  },
  {
    id: 5,
    type: 'info',
    title: 'Social media content approval needed',
    description: 'Instagram posts for next week ready for review',
    assignee: 'Morgan Chen',
    dueDate: 'Today',
    projectName: 'Social Strategy'
  },
  {
    id: 6,
    type: 'warning',
    title: 'Performance report pending',
    description: 'Monthly analytics report needs final review',
    assignee: 'Casey Kim',
    dueDate: 'Tomorrow',
    projectName: 'Analytics Dashboard'
  },
  {
    id: 7,
    type: 'info',
    title: 'New brand assets uploaded',
    description: 'Logo variations and style guide updates',
    assignee: 'Riley Park',
    dueDate: 'Today',
    projectName: 'Brand Evolution'
  },
  {
    id: 8,
    type: 'warning',
    title: 'Ad copy revisions requested',
    description: 'Client feedback on display ad campaign',
    assignee: 'Jordan Lee',
    dueDate: 'In 3 days',
    projectName: 'Display Campaign'
  }
])

const slackMessages = ref([
  {
    author: 'Alex Johnson',
    initials: 'AJ',
    time: '11:42 AM',
    channel: '#campaign-summer',
    text: 'Can you review the latest creative assets for the summer campaign? We need feedback by EOD.'
  },
  {
    author: 'Taylor Wong',
    initials: 'TW',
    time: 'Yesterday',
    channel: '#direct-message',
    text: 'Just wanted to confirm our meeting tomorrow at 10am to discuss the Q3 strategy.'
  },
  {
    author: 'Marketing Team',
    initials: 'MT',
    time: 'Yesterday',
    channel: '#team-marketing',
    text: "We've updated the performance reports with the latest data. Take a look when you get a chance."
  }
])

const weeklyObjectives = ref([
  {
    id: 1,
    title: 'Complete Q4 campaign creative assets',
    category: 'Creative',
    priority: 'high',
    dueDate: 'Wed, Nov 13',
    completed: false
  },
  {
    id: 2,
    title: 'Review and approve brand guidelines update',
    category: 'Design',
    priority: 'medium',
    dueDate: 'Thu, Nov 14',
    completed: false
  },
  {
    id: 3,
    title: 'Optimize campaign budget allocation',
    category: 'Performance',
    priority: 'high',
    dueDate: 'Tue, Nov 12',
    completed: false
  },
  {
    id: 4,
    title: 'Upload new product images to DAM',
    category: 'Resources',
    priority: 'low',
    dueDate: 'Fri, Nov 15',
    completed: true
  },
  {
    id: 5,
    title: 'Client meeting prep: Q3 results presentation',
    category: 'Performance',
    priority: 'medium',
    dueDate: 'Today',
    completed: false
  }
])

const performanceMetrics = ref([
  { label: 'ROAS', value: '3.6x', change: 0.4, changeText: '+0.4', progress: 70 },
  { label: 'CPA', value: '$18.45', change: -2.30, changeText: '$2.30', progress: 65 },
  { label: 'Total Spend', value: '$12,450', change: 2100, changeText: '+$2,100', progress: 75 },
  { label: 'Conversions', value: '674', change: 107, changeText: '+107', progress: 60 }
])

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
  // Navigate to CRM tab filtered by this week's priorities
  console.log('Navigating to CRM with weekly priorities filter')
  // TODO: Implement navigation to CRM with filters
  // navigateTo('/crm?filter=weekly-priorities')
}
</script>
