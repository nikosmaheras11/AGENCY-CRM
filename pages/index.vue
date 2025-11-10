<template>
  <div class="h-screen bg-gradient-dark text-white overflow-hidden relative flex flex-col">
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
      <div class="grid grid-cols-12 gap-6">

        <!-- Items Needing Review Section -->
        <div class="col-span-12 lg:col-span-7 xl:col-span-8">
          <div class="card-glass card-elevated">
            <div class="p-4 sm:p-5 border-b border-white/10">
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
            
            <div class="p-4 sm:p-5">
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div 
                  v-for="alert in alerts" 
                  :key="alert.id"
                  class="relative card-glass border border-white/10 rounded-lg overflow-hidden shadow-sm hover:shadow-primary/20 transition-all group cursor-pointer"
                >
                  <div :class="`absolute top-0 left-0 w-1.5 h-full ${getAlertColor(alert.type)}`"></div>
                  
                  <div class="relative pt-[60%] overflow-hidden">
                    <div class="absolute inset-0 bg-white/5 backdrop-blur-xl flex items-center justify-center">
                      <div class="text-center px-4 py-2 bg-gradient-primary text-white w-full">
                        {{ alert.type.charAt(0).toUpperCase() + alert.type.slice(1) }} Asset
                      </div>
                    </div>
                    
                    <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                      <button class="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm text-success flex items-center justify-center hover:bg-white/30 transition-colors">
                        <span class="material-icons">check_circle</span>
                      </button>
                      <button class="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm text-primary-400 flex items-center justify-center hover:bg-white/30 transition-colors">
                        <span class="material-icons">chat_bubble</span>
                      </button>
                    </div>
                  </div>
                  
                  <div class="p-3">
                    <h3 class="font-medium text-sm text-white">{{ alert.title }}</h3>
                    <div class="flex items-center mt-2 text-xs">
                      <span class="bg-white/10 text-slate-300 px-2 py-1 rounded-full">Creative</span>
                      <span class="ml-2 text-slate-400">#{{ alert.type }}</span>
                    </div>
                    <div class="mt-2 text-xs font-medium text-slate-300">
                      {{ alert.description }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Slack Messages Section -->
        <div class="col-span-12 md:col-span-6 lg:col-span-5 xl:col-span-4">
          <div class="card-glass card-elevated">
            <div class="p-4 sm:p-5 border-b border-white/10">
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
            
            <div class="p-4 sm:p-5">
              <div class="space-y-2">
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

const alerts = ref([
  {
    id: 1,
    type: 'warning',
    title: 'Campaign budget threshold',
    description: 'Summer campaign reaching 85% of budget'
  },
  {
    id: 2,
    type: 'info',
    title: 'Creative review required',
    description: '5 assets awaiting approval'
  },
  {
    id: 3,
    type: 'success',
    title: 'Campaign milestone reached',
    description: 'Product launch +200% impressions'
  },
  {
    id: 4,
    type: 'error',
    title: 'Deadline approaching',
    description: 'Q4 campaign assets due in 2 days'
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
</script>
