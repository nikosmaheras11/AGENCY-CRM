<template>
  <div class="h-full bg-[#F5F5F0] overflow-auto">
    <div class="p-8">
      <!-- Header with Brand Focus -->
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="text-4xl font-bold text-slate-900 mb-2">
            Overview
          </h1>
          <p class="text-slate-600">
            {{currentDate}}
          </p>
        </div>
        <div class="flex items-center gap-4">
          <button class="p-2 hover:bg-white/60 rounded-lg transition-colors">
            <span class="material-icons text-slate-600">search</span>
          </button>
          <button class="p-2 hover:bg-white/60 rounded-lg transition-colors">
            <span class="material-icons text-slate-600">notifications</span>
          </button>
          <button class="p-2 hover:bg-white/60 rounded-lg transition-colors">
            <span class="material-icons text-slate-600">settings</span>
          </button>
        </div>
      </div>

      <!-- Modular Dashboard Grid (matches screenshot layout) -->
      <div class="grid grid-cols-12 gap-4 mb-4">
        <!-- Large Primary Card - Ongoing Projects -->
        <div class="col-span-12 md:col-span-6 lg:col-span-4">
          <div class="bg-[#E8E3F5] shadow-md rounded-2xl p-8 h-full hover:shadow-lg transition-all">
            <div class="text-sm text-slate-600 font-light mb-4">Ongoing Projects</div>
            <div class="text-8xl font-display font-bold text-slate-900 mb-2 tracking-tighter">{{ stats.activeProjects }}</div>
            <div class="text-base text-slate-600 font-light">Active today</div>
          </div>
        </div>

        <!-- Medium Card - Completed with trend -->
        <div class="col-span-6 md:col-span-3 lg:col-span-4">
          <div class="bg-[#E8F5E3] shadow-md rounded-2xl p-8 h-full hover:shadow-lg transition-all">
            <div class="text-sm text-slate-600 font-light mb-4">Completed</div>
            <div class="text-7xl font-display font-bold text-slate-900 mb-2 tracking-tighter">{{stats.completedThisWeek}}</div>
            <div class="flex items-center gap-2 mt-2">
              <span class="text-emerald-600 text-sm font-medium">+12%</span>
              <span class="text-sm text-slate-600 font-light">This week</span>
            </div>
          </div>
        </div>

        <!-- Tall Card - Campaign Performance -->
        <div class="col-span-6 md:col-span-3 lg:col-span-4 row-span-2">
          <div class="bg-gradient-to-b from-amber-900 to-amber-700 shadow-md rounded-2xl p-8 h-full hover:shadow-lg transition-all flex flex-col">
            <div class="text-sm text-amber-100 font-light mb-4">Active Campaigns</div>
            <div class="text-7xl font-display font-bold text-white mb-2 tracking-tighter">{{stats.activeCampaigns}}</div>
            <div class="text-sm text-amber-100 font-light mb-6">Running now</div>
            
            <!-- Mini chart placeholder -->
            <div class="flex-1 flex items-end gap-1 mt-auto">
              <div class="flex-1 bg-white/20 rounded-t h-12"></div>
              <div class="flex-1 bg-white/30 rounded-t h-20"></div>
              <div class="flex-1 bg-white/40 rounded-t h-16"></div>
              <div class="flex-1 bg-white/50 rounded-t h-24"></div>
              <div class="flex-1 bg-white/60 rounded-t h-28"></div>
              <div class="flex-1 bg-white/80 rounded-t h-32"></div>
            </div>
          </div>
        </div>

        <!-- Wide Card - Pending Review -->
        <div class="col-span-12 lg:col-span-8">
          <div class="bg-[#F0EDE8] shadow-md rounded-2xl p-8 hover:shadow-lg transition-all">
            <div class="flex items-center justify-between mb-4">
              <div class="text-sm text-slate-600 font-light">Pending Review</div>
              <div class="text-xs text-slate-500 font-light">Last 30 days</div>
            </div>
            <div class="flex items-end gap-8">
              <div class="text-7xl font-display font-bold text-slate-900 tracking-tighter">{{stats.pendingReview}}</div>
              <div class="flex items-center gap-2 mb-4">
                <span class="text-amber-600 text-sm font-medium">↑ 5</span>
                <span class="text-sm text-slate-600 font-light">Since yesterday</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Grid -->
      <div class="grid grid-cols-12 gap-4">
        <!-- Recent Updates -->
        <div class="col-span-12 lg:col-span-8">
          <div class="bg-white shadow-md rounded-2xl p-8">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-display font-semibold text-slate-900">Recent Updates</h2>
              <button class="text-sm text-slate-600 hover:text-slate-900 transition-colors font-light">View All</button>
            </div>
            <ActivityFeed :activities="activities" />
          </div>
        </div>

        <!-- Sidebar -->
        <div class="col-span-12 lg:col-span-4 space-y-4">
          <!-- Performance Card -->
          <div class="bg-white shadow-md rounded-2xl p-8">
            <h2 class="text-lg font-display font-semibold text-slate-900 mb-6">Performance</h2>
            <div class="space-y-6">
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm text-slate-600 font-light">Approval Rate</span>
                  <span class="text-lg font-display font-semibold text-slate-900">87%</span>
                </div>
                <div class="w-full bg-slate-200 rounded-full h-1.5">
                  <div class="bg-emerald-500 h-1.5 rounded-full" style="width: 87%"></div>
                </div>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-slate-600 font-light">Avg. Review Time</span>
                <span class="text-base font-display font-semibold text-slate-900">2.3d</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-slate-600 font-light">Assets This Month</span>
                <span class="text-base font-display font-semibold text-slate-900">142</span>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="bg-white shadow-md rounded-2xl p-8">
            <h2 class="text-lg font-display font-semibold text-slate-900 mb-6">Quick Actions</h2>
            <div class="space-y-3">
              <button class="w-full flex items-center gap-3 p-4 bg-slate-100 text-slate-900 rounded-2xl hover:bg-slate-200 transition-all group">
                <span class="material-icons text-slate-600 group-hover:text-slate-900">add_circle</span>
                <span class="text-sm font-medium">New Project</span>
              </button>
              <button class="w-full flex items-center gap-3 p-4 bg-slate-100 text-slate-900 rounded-2xl hover:bg-slate-200 transition-all group">
                <span class="material-icons text-slate-600 group-hover:text-slate-900">upload_file</span>
                <span class="text-sm font-medium">Upload Asset</span>
              </button>
              <button class="w-full flex items-center gap-3 p-4 bg-slate-100 text-slate-900 rounded-2xl hover:bg-slate-200 transition-all group">
                <span class="material-icons text-slate-600 group-hover:text-slate-900">campaign</span>
                <span class="text-sm font-medium">New Campaign</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const currentDate = computed(() => {
  const now = new Date()
  return now.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  })
})

const activities = ref([
  {
    id: 1,
    action: 'created',
    collection: 'creative_assets',
    description: 'Hero banner V3 uploaded for Project Alpha',
    user: 'Sarah Johnson',
    timestamp: '2 hours ago'
  },
  {
    id: 2,
    action: 'approved',
    collection: 'creative_assets',
    description: 'Product video approved for Q4 Campaign',
    user: 'Mike Chen',
    timestamp: '4 hours ago'
  },
  {
    id: 3,
    action: 'updated',
    collection: 'performance_campaigns',
    description: 'Google Ads campaign budget increased to $15K',
    user: 'Emma Davis',
    timestamp: '5 hours ago'
  },
  {
    id: 4,
    action: 'created',
    collection: 'projects',
    description: 'New project "Brand Refresh 2024" initiated',
    user: 'John Smith',
    timestamp: '1 day ago'
  },
  {
    id: 5,
    action: 'updated',
    collection: 'design_components',
    description: 'Button component updated in design system',
    user: 'Sarah Johnson',
    timestamp: '1 day ago'
  }
])

const stats = ref({
  activeProjects: 8,
  completedThisWeek: 12,
  pendingReview: 3,
  activeCampaigns: 4
})
</script>
