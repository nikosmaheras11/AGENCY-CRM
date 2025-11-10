<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Header -->
    <header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
      <div class="flex items-center">
        <h1 class="text-xl font-semibold">Client Dashboard</h1>
      </div>
      <div class="flex items-center space-x-4">
        <div class="relative">
          <button class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200">
            <span class="material-icons text-xl">search</span>
          </button>
        </div>
        <div class="relative">
          <button class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200">
            <span class="material-icons text-xl">notifications</span>
          </button>
          <div class="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
            3
          </div>
        </div>
        <div class="flex items-center pl-4 border-l border-slate-200">
          <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
            PM
          </div>
          <div class="ml-3">
            <div class="text-sm font-medium">Polymarket</div>
            <div class="text-xs text-slate-500">Client Account</div>
          </div>
          <span class="material-icons text-slate-400 ml-2 text-lg">expand_more</span>
        </div>
      </div>
    </header>
    
    <!-- Dashboard Content -->
    <main class="p-6">
      <div class="grid grid-cols-12 gap-6">
        <!-- Items Needing Review Section -->
        <div class="col-span-12 lg:col-span-7 xl:col-span-8">
          <div class="bg-white rounded-lg shadow-sm border border-slate-200">
            <div class="p-4 sm:p-5 border-b border-slate-200">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <h2 class="text-lg font-semibold text-slate-900">Items Needing Review</h2>
                  <div class="ml-2 bg-blue-100 text-blue-800 text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                    {{ reviewItems.length }}
                  </div>
                </div>
                <button class="text-xs font-semibold text-slate-500 hover:text-slate-700 uppercase tracking-wider">
                  View All
                </button>
              </div>
            </div>
            
            <div class="p-4 sm:p-5">
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div 
                  v-for="item in reviewItems" 
                  :key="item.id"
                  class="relative bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
                >
                  <div :class="`absolute top-0 left-0 w-1.5 h-full ${item.priorityColor}`"></div>
                  
                  <div v-if="item.isNew" class="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full z-10">
                    New
                  </div>
                  
                  <div class="relative pt-[60%] overflow-hidden">
                    <div class="absolute inset-0 bg-slate-100 flex items-center justify-center">
                      <div :class="`text-center px-4 py-2 ${item.typeColor} text-white w-full`">
                        {{ item.type }}
                      </div>
                    </div>
                    
                    <div class="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                      <button class="w-10 h-10 rounded-full bg-white text-green-600 flex items-center justify-center hover:bg-green-50">
                        <span class="material-icons">check_circle</span>
                      </button>
                      <button class="w-10 h-10 rounded-full bg-white text-blue-600 flex items-center justify-center hover:bg-blue-50">
                        <span class="material-icons">chat_bubble</span>
                      </button>
                    </div>
                  </div>
                  
                  <div class="p-3">
                    <h3 class="font-medium text-sm">{{ item.title }}</h3>
                    <div class="flex items-center mt-2 text-xs">
                      <span class="bg-slate-100 text-slate-700 px-2 py-1 rounded-full">{{ item.platform }}</span>
                      <span class="ml-2 text-slate-500">{{ item.tag }}</span>
                    </div>
                    <div :class="`mt-2 text-xs font-medium ${item.dueDateColor}`">
                      {{ item.dueDate }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Slack Messages Section -->
        <div class="col-span-12 md:col-span-6 lg:col-span-5 xl:col-span-4">
          <div class="bg-white rounded-lg shadow-sm border border-slate-200">
            <div class="p-4 sm:p-5 border-b border-slate-200">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <h2 class="text-lg font-semibold text-slate-900">Slack Messages</h2>
                  <div class="ml-2 bg-blue-100 text-blue-800 text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                    {{ slackMessages.length }}
                  </div>
                </div>
                <button class="text-xs font-semibold text-slate-500 hover:text-slate-700 uppercase tracking-wider">
                  View All
                </button>
              </div>
            </div>
            
            <div class="p-4 sm:p-5">
              <div class="space-y-2">
                <div 
                  v-for="message in slackMessages" 
                  :key="message.id"
                  :class="`p-3 ${message.unread ? 'bg-blue-50 border-l-2 border-blue-500' : 'bg-white border border-slate-200'} rounded-lg hover:bg-blue-100 transition-colors cursor-pointer`"
                >
                  <div class="flex">
                    <div class="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center text-xs font-medium">
                      {{ message.initials }}
                    </div>
                    <div class="ml-3 flex-1 min-w-0">
                      <div class="flex items-center justify-between">
                        <div class="font-medium text-sm truncate">{{ message.author }}</div>
                        <div class="text-xs text-slate-500">{{ message.time }}</div>
                      </div>
                      <div class="text-xs text-slate-500 mt-0.5">
                        {{ message.channel }}
                      </div>
                      <div :class="`mt-1 text-sm line-clamp-2 ${message.unread ? 'font-medium' : ''}`">
                        {{ message.text }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="mt-4">
                <button class="text-sm text-blue-600 font-medium hover:text-blue-800">Open in Slack</button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Performance Snapshot Section -->
        <div class="col-span-12">
          <div class="bg-white rounded-lg shadow-sm border border-slate-200">
            <div class="p-4 sm:p-5 border-b border-slate-200">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <h2 class="text-lg font-semibold text-slate-900">Performance Snapshot</h2>
                  <div class="ml-3 text-sm text-slate-500 flex items-center">
                    <span class="material-icons text-base mr-1">refresh</span>
                    Updated 10 minutes ago
                  </div>
                </div>
                <div class="flex items-center">
                  <select class="text-sm border border-slate-300 rounded-md px-2 py-1 bg-white">
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
                  v-for="metric in metrics" 
                  :key="metric.label"
                  class="bg-white border border-slate-200 rounded-lg p-4"
                >
                  <div class="text-sm text-slate-500">{{ metric.label }}</div>
                  <div class="mt-1 flex items-baseline">
                    <div class="text-2xl font-bold">{{ metric.value }}</div>
                    <div :class="`ml-2 text-sm font-medium ${metric.change >= 0 ? 'text-green-600' : 'text-red-600'}`">
                      {{ metric.change >= 0 ? '↑' : '↓' }} {{ Math.abs(metric.change) }}
                    </div>
                  </div>
                  <div class="mt-3 h-8">
                    <div class="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div class="h-full bg-green-500" :style="{width: metric.progress + '%'}"></div>
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
const reviewItems = ref([
  {
    id: 1,
    title: 'Summer Campaign Banner',
    type: 'Banner Ad',
    platform: 'Meta',
    tag: '#Summer2025',
    dueDate: 'Due: Today',
    dueDateColor: 'text-yellow-600',
    priorityColor: 'bg-yellow-500',
    typeColor: 'bg-blue-500',
    isNew: false
  },
  {
    id: 2,
    title: 'Product Photography Set',
    type: 'Product Photos',
    platform: 'Instagram',
    tag: '#ProductLaunch',
    dueDate: 'Due: Overdue',
    dueDateColor: 'text-red-600',
    priorityColor: 'bg-red-500',
    typeColor: 'bg-green-500',
    isNew: true
  },
  {
    id: 3,
    title: 'Q3 Strategy Document',
    type: 'Strategy Doc',
    platform: 'Internal',
    tag: '#StrategicPlanning',
    dueDate: 'Due: Tomorrow',
    dueDateColor: 'text-slate-500',
    priorityColor: 'bg-blue-500',
    typeColor: 'bg-indigo-500',
    isNew: false
  }
])

const slackMessages = ref([
  {
    id: 1,
    author: 'Alex Johnson',
    initials: 'AJ',
    time: '11:42 AM',
    channel: '#campaign-summer',
    text: 'Can you review the latest creative assets for the summer campaign? We need feedback by EOD.',
    unread: true
  },
  {
    id: 2,
    author: 'Taylor Wong',
    initials: 'TW',
    time: 'Yesterday',
    channel: '#direct-message',
    text: 'Just wanted to confirm our meeting tomorrow at 10am to discuss the Q3 strategy.',
    unread: false
  },
  {
    id: 3,
    author: 'Marketing Team',
    initials: 'MT',
    time: 'Yesterday',
    channel: '#team-marketing',
    text: "We've updated the performance reports with the latest data. Take a look when you get a chance.",
    unread: true
  }
])

const metrics = ref([
  { label: 'ROAS', value: '3.6x', change: 0.4, progress: 70 },
  { label: 'CPA', value: '$18.45', change: -2.30, progress: 65 },
  { label: 'Total Spend', value: '$12,450', change: 2100, progress: 75 },
  { label: 'Conversions', value: '674', change: 107, progress: 60 }
])
</script>
