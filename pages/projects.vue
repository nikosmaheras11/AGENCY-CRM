<template>
  <div class="h-full bg-[#F5F5F0] overflow-auto">
    <div class="p-8">
      <!-- Header -->
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="text-4xl font-display font-bold text-slate-900 mb-2">
            Campaign Tracking
          </h1>
          <p class="text-slate-600 font-light">
            Main priorities with status tracking
          </p>
        </div>
        <div class="flex gap-3">
          <button class="px-5 py-2.5 bg-white text-slate-900 shadow-md rounded-2xl font-medium hover:shadow-lg transition-all">
            Filter
          </button>
          <button class="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white shadow-md rounded-2xl font-medium transition-all">
            + New Campaign
          </button>
        </div>
      </div>

      <!-- View Switcher -->
      <div class="bg-white shadow-md rounded-2xl p-5 mb-6">
        <div class="flex items-center justify-between">
          <div class="flex gap-2">
            <button 
              @click="viewMode = 'table'"
              class="px-4 py-2 rounded-xl text-sm font-medium transition-all"
              :class="viewMode === 'table' ? 'bg-orange-600 text-white' : 'text-slate-600 hover:bg-slate-100'"
            >
              Table View
            </button>
            <button 
              @click="viewMode = 'kanban'"
              class="px-4 py-2 rounded-xl text-sm font-medium transition-all"
              :class="viewMode === 'kanban' ? 'bg-orange-600 text-white' : 'text-slate-600 hover:bg-slate-100'"
            >
              Board View
            </button>
          </div>
          <div class="text-sm text-slate-600 font-light">
            {{ campaigns.length }} campaigns
          </div>
        </div>
      </div>

      <!-- Table View (Monday.com style) -->
      <div v-if="viewMode === 'table'" class="bg-white shadow-md rounded-2xl overflow-hidden">
        <!-- Table Header -->
        <div class="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wide">
          <div class="col-span-3">Campaign Name</div>
          <div class="col-span-2">Status</div>
          <div class="col-span-2">Priority</div>
          <div class="col-span-2">Owner</div>
          <div class="col-span-1">Progress</div>
          <div class="col-span-2">Due Date</div>
        </div>

        <!-- Table Rows -->
        <div class="divide-y divide-slate-200">
          <div 
            v-for="campaign in campaigns" 
            :key="campaign.id"
            class="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-slate-50 transition-colors"
          >
            <!-- Campaign Name -->
            <div class="col-span-3 flex items-center gap-3">
              <div class="w-8 h-8 rounded bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-semibold text-sm">
                {{ campaign.name.charAt(0) }}
              </div>
              <span class="font-medium text-slate-900">{{ campaign.name }}</span>
            </div>

            <!-- Status -->
            <div class="col-span-2 flex items-center">
              <span 
                class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                :class="getStatusBadge(campaign.status)"
              >
                <span class="w-1.5 h-1.5 rounded-full mr-1.5" :class="getStatusDot(campaign.status)"></span>
                {{ campaign.status }}
              </span>
            </div>

            <!-- Priority -->
            <div class="col-span-2 flex items-center">
              <span 
                class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                :class="getPriorityBadge(campaign.priority)"
              >
                <span class="material-icons text-sm mr-1">{{ getPriorityIcon(campaign.priority) }}</span>
                {{ campaign.priority }}
              </span>
            </div>

            <!-- Owner -->
            <div class="col-span-2 flex items-center gap-2">
              <div class="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-xs">
                {{ campaign.owner.split(' ').map(n => n[0]).join('') }}
              </div>
              <span class="text-sm text-slate-700">{{ campaign.owner }}</span>
            </div>

            <!-- Progress -->
            <div class="col-span-1 flex items-center">
              <div class="flex-1">
                <div class="flex justify-between text-xs text-slate-600 mb-1">
                  <span>{{ campaign.progress }}%</span>
                </div>
                <div class="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    class="h-2 rounded-full transition-all"
                    :class="campaign.progress >= 75 ? 'bg-green-500' : campaign.progress >= 50 ? 'bg-blue-500' : 'bg-orange-500'"
                    :style="{ width: `${campaign.progress}%` }"
                  ></div>
                </div>
              </div>
            </div>

            <!-- Due Date -->
            <div class="col-span-2 flex items-center text-sm text-slate-600">
              <span class="material-icons text-sm mr-1.5">calendar_today</span>
              {{ campaign.dueDate }}
            </div>
          </div>
        </div>
      </div>

      <!-- Kanban Board View -->
      <div v-else class="flex gap-6 overflow-x-auto pb-6">
        <!-- Planning Column -->
        <div class="flex-shrink-0 w-80">
          <div class="bg-[#F0EDE8] shadow-md rounded-2xl overflow-hidden">
            <div class="p-4 border-b border-slate-200">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-slate-400"></span>
                <h3 class="font-display font-semibold text-slate-900">Planning</h3>
                <span class="text-sm text-slate-600">({{ planningCampaigns.length }})</span>
              </div>
            </div>
            <div class="p-4 space-y-3 max-h-[calc(100vh-350px)] overflow-y-auto">
              <CampaignCard 
                v-for="campaign in planningCampaigns" 
                :key="campaign.id" 
                :campaign="campaign"
              />
            </div>
          </div>
        </div>

        <!-- In Progress Column -->
        <div class="flex-shrink-0 w-80">
          <div class="bg-[#E8E3F5] shadow-md rounded-2xl overflow-hidden">
            <div class="p-4 border-b border-slate-200">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-blue-500"></span>
                <h3 class="font-display font-semibold text-slate-900">In Progress</h3>
                <span class="text-sm text-slate-600">({{ inProgressCampaigns.length }})</span>
              </div>
            </div>
            <div class="p-4 space-y-3 max-h-[calc(100vh-350px)] overflow-y-auto">
              <CampaignCard 
                v-for="campaign in inProgressCampaigns" 
                :key="campaign.id" 
                :campaign="campaign"
              />
            </div>
          </div>
        </div>

        <!-- Review Column -->
        <div class="flex-shrink-0 w-80">
          <div class="bg-white shadow-md rounded-2xl overflow-hidden">
            <div class="p-4 border-b border-slate-200">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-purple-500"></span>
                <h3 class="font-display font-semibold text-slate-900">Review</h3>
                <span class="text-sm text-slate-600">({{ reviewCampaigns.length }})</span>
              </div>
            </div>
            <div class="p-4 space-y-3 max-h-[calc(100vh-350px)] overflow-y-auto">
              <CampaignCard 
                v-for="campaign in reviewCampaigns" 
                :key="campaign.id" 
                :campaign="campaign"
              />
            </div>
          </div>
        </div>

        <!-- Completed Column -->
        <div class="flex-shrink-0 w-80">
          <div class="bg-[#E8F5E3] shadow-md rounded-2xl overflow-hidden">
            <div class="p-4 border-b border-slate-200">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-green-500"></span>
                <h3 class="font-display font-semibold text-slate-900">Completed</h3>
                <span class="text-sm text-slate-600">({{ completedCampaigns.length }})</span>
              </div>
            </div>
            <div class="p-4 space-y-3 max-h-[calc(100vh-350px)] overflow-y-auto">
              <CampaignCard 
                v-for="campaign in completedCampaigns" 
                :key="campaign.id" 
                :campaign="campaign"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const viewMode = ref('table')

const campaigns = ref([
  { id: 1, name: 'Q4 Holiday Campaign', status: 'In Progress', priority: 'High', owner: 'Sarah Johnson', progress: 65, dueDate: 'Nov 30, 2024' },
  { id: 2, name: 'Brand Refresh Launch', status: 'Planning', priority: 'High', owner: 'Mike Chen', progress: 25, dueDate: 'Dec 15, 2024' },
  { id: 3, name: 'Product Launch - Winter', status: 'In Progress', priority: 'Critical', owner: 'Emma Davis', progress: 80, dueDate: 'Nov 25, 2024' },
  { id: 4, name: 'Social Media Strategy 2025', status: 'Planning', priority: 'Medium', owner: 'John Smith', progress: 15, dueDate: 'Jan 10, 2025' },
  { id: 5, name: 'Email Marketing Automation', status: 'Review', priority: 'Medium', owner: 'Sarah Johnson', progress: 90, dueDate: 'Nov 20, 2024' },
  { id: 6, name: 'Website Redesign', status: 'In Progress', priority: 'High', owner: 'Mike Chen', progress: 55, dueDate: 'Dec 5, 2024' },
  { id: 7, name: 'Black Friday Promo', status: 'Completed', priority: 'Critical', owner: 'Emma Davis', progress: 100, dueDate: 'Nov 24, 2024' },
  { id: 8, name: 'Customer Retention Campaign', status: 'Review', priority: 'Low', owner: 'John Smith', progress: 85, dueDate: 'Nov 28, 2024' },
  { id: 9, name: 'Influencer Partnership Q1', status: 'Planning', priority: 'Medium', owner: 'Sarah Johnson', progress: 30, dueDate: 'Jan 15, 2025' },
  { id: 10, name: 'Content Calendar Dec', status: 'Completed', priority: 'High', owner: 'Mike Chen', progress: 100, dueDate: 'Nov 15, 2024' }
])

const planningCampaigns = computed(() => campaigns.value.filter(c => c.status === 'Planning'))
const inProgressCampaigns = computed(() => campaigns.value.filter(c => c.status === 'In Progress'))
const reviewCampaigns = computed(() => campaigns.value.filter(c => c.status === 'Review'))
const completedCampaigns = computed(() => campaigns.value.filter(c => c.status === 'Completed'))

const getStatusBadge = (status: string) => {
  const badges: Record<string, string> = {
    'Planning': 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
    'In Progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
    'Review': 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
    'Completed': 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
  }
  return badges[status] || 'bg-gray-100 text-gray-700'
}

const getStatusDot = (status: string) => {
  const dots: Record<string, string> = {
    'Planning': 'bg-gray-500',
    'In Progress': 'bg-blue-500',
    'Review': 'bg-purple-500',
    'Completed': 'bg-green-500'
  }
  return dots[status] || 'bg-gray-500'
}

const getPriorityBadge = (priority: string) => {
  const badges: Record<string, string> = {
    'Critical': 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
    'High': 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
    'Medium': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
    'Low': 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
  }
  return badges[priority] || 'bg-gray-100 text-gray-700'
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
</script>
