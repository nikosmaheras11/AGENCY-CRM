<template>
  <div class="min-h-screen bg-[#131925] text-white overflow-auto">
    <div class="p-8">
      <!-- Dashboard Header -->
      <div class="flex justify-between mb-8">
        <div>
          <h1 class="text-3xl font-semibold m-0">{{ currentTime }}</h1>
          <div class="mt-1">
            <p class="text-slate-400 m-0">Good {{ timeOfDay }},</p>
            <h2 class="text-xl font-medium mt-1 mb-0">Marketing Team</h2>
          </div>
        </div>
        
        <div class="flex items-center gap-6">
          <!-- Client selector -->
          <div class="relative">
            <select class="bg-[#1E2532] border border-slate-700 rounded-md py-2 px-4 text-sm appearance-none pr-8 cursor-pointer">
              <option>All Clients</option>
              <option>Acme Corporation</option>
              <option>Globex Industries</option>
              <option>Initech</option>
            </select>
            <span class="material-icons absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">expand_more</span>
          </div>
          
          <!-- Notification icon -->
          <button class="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#1E2532] transition-colors">
            <span class="material-icons">notifications</span>
            <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          <!-- User profile -->
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-amber-200 to-orange-300 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
            <span class="text-xs font-bold text-slate-900">AD</span>
          </div>
        </div>
      </div>

      <!-- Overview Section -->
      <div class="mb-8">
        <div class="flex items-center mb-6">
          <h2 class="text-2xl font-medium m-0">Overview</h2>
          <div class="flex items-center ml-4 text-slate-400">
            <span class="material-icons text-green-500 mr-1" style="font-size: 20px;">check_circle</span>
            <span class="text-sm">All campaigns active</span>
          </div>
        </div>
        
        <!-- Dashboard Grid -->
        <div class="grid grid-cols-4 gap-6">
          <!-- Alerts Card (1x2) -->
          <div class="bg-[#1E2532] rounded-xl overflow-hidden col-span-1 row-span-2">
            <div class="flex items-center justify-between p-4 border-b border-slate-700">
              <div class="flex items-center">
                <span class="material-icons text-orange-500 mr-2" style="font-size: 20px;">notifications_active</span>
                <h3 class="font-medium text-base m-0">Alerts</h3>
                <span class="ml-2 text-sm text-slate-400">{{ alerts.length }}</span>
              </div>
              <button class="text-xs text-slate-400 uppercase tracking-wider hover:text-white transition-colors">All</button>
            </div>
            
            <div class="p-4">
              <div 
                v-for="alert in alerts" 
                :key="alert.id"
                class="flex items-start py-3 border-b border-slate-700/50 last:border-0"
              >
                <div class="flex-shrink-0 w-2 h-2 rounded-full mt-1.5 mr-3" :class="getAlertColor(alert.type)"></div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium m-0 mb-1">{{ alert.title }}</p>
                  <p class="text-xs text-slate-400 m-0">{{ alert.description }}</p>
                </div>
                <button class="flex-shrink-0 ml-2 text-slate-500 hover:text-white transition-colors">
                  <span class="material-icons" style="font-size: 16px;">chevron_right</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Client Health Score (1x1) -->
          <div class="bg-[#1E2532] rounded-xl overflow-hidden col-span-1 row-span-1">
            <div class="flex items-center justify-between p-4 border-b border-slate-700">
              <h3 class="font-medium text-base m-0">Client Health</h3>
              <span class="text-xs text-slate-400">Last 30 days</span>
            </div>
            
            <div class="p-6">
              <div class="flex items-baseline mb-6">
                <span class="text-5xl font-bold">{{ clientHealth.score }}</span>
                <span class="text-2xl ml-1 text-slate-400">°</span>
              </div>
              
              <div class="space-y-3">
                <div class="flex justify-between text-sm">
                  <span class="text-slate-400">Engagement</span>
                  <span class="font-medium">{{ clientHealth.engagement }}%</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-slate-400">Satisfaction</span>
                  <span class="font-medium">{{ clientHealth.satisfaction }}%</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-slate-400">ROI</span>
                  <span class="font-medium">{{ clientHealth.roi }}x</span>
                </div>
              </div>
              
              <div class="mt-4 pt-4 border-t border-slate-700 flex items-center text-xs text-slate-400">
                <span class="material-icons text-green-500 mr-1" style="font-size: 16px;">trending_up</span>
                <span>Improving trend</span>
              </div>
            </div>
          </div>

          <!-- Campaign Performance (2x1) -->
          <div class="bg-[#1E2532] rounded-xl overflow-hidden col-span-2 row-span-1">
            <div class="flex items-center justify-between p-4 border-b border-slate-700">
              <h3 class="font-medium text-base m-0">Campaign Performance</h3>
              <div class="flex overflow-hidden rounded-md bg-slate-900">
                <button 
                  v-for="period in ['DAY', 'WK', 'MO']" 
                  :key="period"
                  class="py-1 px-3 text-xs transition-colors"
                  :class="performancePeriod === period ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'"
                  @click="performancePeriod = period"
                >
                  {{ period }}
                </button>
              </div>
            </div>
            
            <div class="p-6">
              <div class="flex items-baseline mb-6">
                <span class="text-4xl font-bold">{{ performance.impressions }}</span>
                <span class="text-xl ml-1 text-slate-400">K</span>
                <span class="ml-4 text-sm text-slate-400">Impressions</span>
                <div class="ml-auto px-2 py-1 rounded-md text-xs font-medium" :class="performance.trend >= 0 ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'">
                  {{ performance.trend >= 0 ? '+' : '' }}{{ performance.trend }}%
                </div>
              </div>
              
              <!-- Mini bar chart -->
              <div class="relative h-32 flex items-end gap-1 mb-2">
                <div 
                  v-for="(bar, i) in performance.chartData" 
                  :key="i"
                  class="flex-1 bg-gradient-to-t from-blue-500/50 to-blue-500/20 rounded-t"
                  :style="{ height: bar + '%' }"
                ></div>
              </div>
              
              <div class="flex justify-between text-xs text-slate-400">
                <span v-for="day in ['M', 'T', 'W', 'TH', 'F', 'S', 'SU']" :key="day">{{ day }}</span>
              </div>
            </div>
          </div>

          <!-- Creative Assets (2x1) -->
          <div class="bg-[#1E2532] rounded-xl overflow-hidden col-span-2 row-span-1">
            <div class="flex items-center justify-between p-4 border-b border-slate-700">
              <h3 class="font-medium text-base m-0">Creative Assets</h3>
              <button class="text-xs text-slate-400 uppercase tracking-wider hover:text-white transition-colors">Configure</button>
            </div>
            
            <div class="p-6">
              <div class="flex items-baseline mb-6">
                <span class="text-4xl font-bold">{{ creativeAssets.active }}</span>
                <span class="ml-4 text-sm text-slate-400">Active Assets</span>
              </div>
              
              <div class="mb-4">
                <div class="flex justify-between text-sm mb-2">
                  <span class="text-slate-400">Next review cycle:</span>
                  <span class="text-white">{{ creativeAssets.nextReview }}</span>
                </div>
              </div>
              
              <!-- Progress bar -->
              <div class="relative">
                <div class="h-3 bg-slate-700 rounded-full overflow-hidden flex">
                  <div class="bg-orange-500" :style="{ width: creativeAssets.distribution.inProgress + '%' }"></div>
                  <div class="bg-blue-500" :style="{ width: creativeAssets.distribution.review + '%' }"></div>
                  <div class="bg-green-500" :style="{ width: creativeAssets.distribution.approved + '%' }"></div>
                </div>
                
                <div class="flex justify-between mt-3 text-xs">
                  <div class="flex items-center">
                    <div class="w-2 h-2 rounded-full bg-orange-500 mr-1"></div>
                    <span class="text-slate-400">In Progress</span>
                  </div>
                  <div class="flex items-center">
                    <div class="w-2 h-2 rounded-full bg-blue-500 mr-1"></div>
                    <span class="text-slate-400">In Review</span>
                  </div>
                  <div class="flex items-center">
                    <div class="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                    <span class="text-slate-400">Approved</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Budget Utilization (1x1) -->
          <div class="bg-[#1E2532] rounded-xl overflow-hidden col-span-1 row-span-1">
            <div class="flex items-center justify-between p-4 border-b border-slate-700">
              <h3 class="font-medium text-base m-0">Budget</h3>
              <div class="flex overflow-hidden rounded-md bg-slate-900">
                <button 
                  v-for="period in ['DAY', 'WK', 'MO']" 
                  :key="period"
                  class="py-1 px-3 text-xs transition-colors"
                  :class="budgetPeriod === period ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'"
                  @click="budgetPeriod = period"
                >
                  {{ period }}
                </button>
              </div>
            </div>
            
            <div class="p-6">
              <div class="flex items-baseline mb-6">
                <span class="text-4xl font-bold">{{ budget.total }}</span>
                <span class="text-xl ml-1 text-slate-400">K</span>
                <div class="ml-auto px-2 py-1 rounded-md bg-slate-700 text-xs font-medium">
                  {{ budget.utilized }}%
                </div>
              </div>
              
              <div class="space-y-3">
                <div 
                  v-for="item in budget.breakdown" 
                  :key="item.label"
                  class="space-y-1"
                >
                  <div class="flex justify-between text-xs">
                    <span class="text-slate-400">{{ item.label }}</span>
                    <span class="font-medium">${{ item.value }}K</span>
                  </div>
                  <div class="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div class="h-full bg-blue-500 rounded-full" :style="{ width: item.percent + '%' }"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
const currentTime = computed(() => {
  const now = new Date()
  return now.toLocaleTimeString('en-US', { 
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
})

const timeOfDay = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 18) return 'afternoon'
  return 'evening'
})

const performancePeriod = ref('DAY')
const budgetPeriod = ref('DAY')

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

const clientHealth = ref({
  score: 64,
  engagement: 78,
  satisfaction: 82,
  roi: 2.4
})

const performance = ref({
  impressions: 840,
  trend: 16,
  chartData: [45, 62, 58, 73, 65, 88, 92]
})

const creativeAssets = ref({
  active: 72,
  nextReview: 'Nov 15 at 10:00 AM',
  distribution: {
    inProgress: 35,
    review: 25,
    approved: 40
  }
})

const budget = ref({
  total: 360,
  utilized: 65,
  breakdown: [
    { label: 'Social Media', value: 85, percent: 85 },
    { label: 'Display Ads', value: 60, percent: 60 },
    { label: 'Video', value: 75, percent: 75 },
    { label: 'Search', value: 45, percent: 45 },
    { label: 'Email', value: 25, percent: 25 }
  ]
})

function getAlertColor(type: string) {
  const colors: Record<string, string> = {
    warning: 'bg-orange-500',
    info: 'bg-blue-500',
    success: 'bg-green-500',
    error: 'bg-red-500'
  }
  return colors[type] || 'bg-slate-500'
}
</script>
