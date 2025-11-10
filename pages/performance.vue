<template>
  <div class="h-full bg-[#F5F5F0] overflow-auto">
    <!-- Campaign Detail Panel -->
    <CampaignDetailPanel v-model="showCampaignDetail" :campaign="selectedCampaign" />
    
    <div class="p-8">
      <!-- Header -->
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="text-4xl font-display font-bold text-slate-900 mb-2">
            Performance
          </h1>
          <p class="text-slate-600 font-light">
            Live creative performance & real-time reporting
          </p>
        </div>
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2 px-4 py-2 bg-white shadow-md rounded-2xl">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span class="text-sm font-medium text-slate-900">Live</span>
          </div>
          <button class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md rounded-2xl font-medium transition-all">
            + New Campaign
          </button>
        </div>
      </div>

      <!-- Real-Time Metrics -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-[#E8E3F5] shadow-md rounded-2xl p-8">
          <p class="text-sm text-slate-600 font-light mb-4">Total Spend</p>
          <p class="text-6xl font-display font-bold text-slate-900 tracking-tighter">$45K</p>
          <div class="flex items-center gap-2 mt-2">
            <span class="text-emerald-600 text-sm font-medium">+12.5%</span>
            <span class="text-xs text-slate-600 font-light">This month</span>
          </div>
        </div>

        <div class="bg-white shadow-md rounded-2xl p-6">
          <div class="flex items-center justify-between mb-3">
            <span class="material-icons text-2xl text-blue-500">visibility</span>
            <span class="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">+8.3%</span>
          </div>
          <p class="text-sm text-slate-600 mb-1">Impressions</p>
          <p class="text-3xl font-bold text-slate-900">2.4M</p>
          <p class="text-xs text-slate-500 mt-1">Last 7 Days</p>
        </div>

        <div class="bg-white shadow-md rounded-2xl p-6">
          <div class="flex items-center justify-between mb-3">
            <span class="material-icons text-2xl text-purple-500">ads_click</span>
            <span class="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded">-0.4%</span>
          </div>
          <p class="text-sm text-slate-600 mb-1">CTR</p>
          <p class="text-3xl font-bold text-slate-900">3.2%</p>
          <p class="text-xs text-slate-500 mt-1">Average</p>
        </div>

        <div class="bg-white shadow-md rounded-2xl p-6">
          <div class="flex items-center justify-between mb-3">
            <span class="material-icons text-2xl text-orange-500">shopping_cart</span>
            <span class="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">+15.2%</span>
          </div>
          <p class="text-sm text-slate-600 mb-1">Conversions</p>
          <p class="text-3xl font-bold text-slate-900">1,234</p>
          <p class="text-xs text-slate-500 mt-1">This Week</p>
        </div>
      </div>

      <!-- Live Creative Performance Grid -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-display font-semibold text-slate-900">Live Creative Performance</h2>
          <div class="flex gap-2">
            <button class="px-3 py-1.5 text-sm bg-white shadow-md text-slate-900 rounded-lg hover:shadow-lg transition-all">
              Filter by Platform
            </button>
            <button class="px-3 py-1.5 text-sm bg-white shadow-md text-slate-900 rounded-lg hover:shadow-lg transition-all">
              Export Report
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <PerformanceCreativeCard 
            v-for="creative in liveCreatives" 
            :key="creative.id" 
            :creative="creative"
          />
        </div>
      </div>

      <!-- Campaigns Table -->
      <div class="bg-white shadow-md rounded-2xl overflow-hidden">
        <div class="p-6 border-b border-slate-200">
          <h2 class="text-xl font-display font-semibold text-slate-900">Campaign Overview</h2>
        </div>

      <div class="divide-y divide-slate-200">
        <div 
          v-for="campaign in campaigns" 
          :key="campaign.id"
          @click="openCampaignDetail(campaign)"
          class="p-6 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <h3 class="text-lg font-display font-semibold text-slate-900">
                  {{ campaign.name }}
                </h3>
                <span 
                  class="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
                  :class="getStatusBadge(campaign.status)"
                >
                  {{ campaign.status }}
                </span>
              </div>
              <p class="text-sm text-slate-600">
                {{ campaign.platform }} • Started {{ campaign.startDate }}
              </p>
            </div>
            <button class="text-slate-400 hover:text-slate-600">
              <span class="material-icons">more_vert</span>
            </button>
          </div>

          <!-- Campaign Metrics -->
          <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <p class="text-xs text-slate-600 mb-1">Budget</p>
              <p class="text-sm font-semibold text-slate-900">${{ campaign.budget.toLocaleString() }}</p>
            </div>
            <div>
              <p class="text-xs text-slate-600 mb-1">Spent</p>
              <p class="text-sm font-semibold text-slate-900">${{ campaign.spent.toLocaleString() }}</p>
            </div>
            <div>
              <p class="text-xs text-slate-600 mb-1">Impressions</p>
              <p class="text-sm font-semibold text-slate-900">{{ formatNumber(campaign.impressions) }}</p>
            </div>
            <div>
              <p class="text-xs text-slate-600 mb-1">Clicks</p>
              <p class="text-sm font-semibold text-slate-900">{{ formatNumber(campaign.clicks) }}</p>
            </div>
            <div>
              <p class="text-xs text-slate-600 mb-1">CTR</p>
              <p class="text-sm font-semibold text-slate-900">{{ campaign.ctr }}%</p>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="mt-4">
            <div class="flex justify-between text-xs text-slate-600 mb-1">
              <span>Budget Usage</span>
              <span>{{ Math.round((campaign.spent / campaign.budget) * 100) }}%</span>
            </div>
            <div class="w-full bg-slate-200 rounded-full h-2">
              <div 
                class="bg-green-600 h-2 rounded-full transition-all"
                :style="{ width: `${Math.min((campaign.spent / campaign.budget) * 100, 100)}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const showCampaignDetail = ref(false)
const selectedCampaign = ref<any>(null)

function openCampaignDetail(campaign: any) {
  selectedCampaign.value = campaign
  showCampaignDetail.value = true
}

const liveCreatives = ref([
  {
    id: 1,
    name: 'Hero Banner - Holiday Sale',
    platform: 'Google Ads',
    type: 'image',
    impressions: 324500,
    clicks: 12450,
    ctr: 3.8,
    conversions: 234,
    spend: 4230,
    roas: 4.2,
    status: 'performing'
  },
  {
    id: 2,
    name: 'Product Video - Black Friday',
    platform: 'Facebook Ads',
    type: 'video',
    impressions: 567800,
    clicks: 18940,
    ctr: 3.3,
    conversions: 412,
    spend: 5680,
    roas: 5.8,
    status: 'performing'
  },
  {
    id: 3,
    name: 'Carousel Ad - Gift Guide',
    platform: 'Instagram',
    type: 'carousel',
    impressions: 189200,
    clicks: 4230,
    ctr: 2.2,
    conversions: 89,
    spend: 2100,
    roas: 2.1,
    status: 'underperforming'
  },
  {
    id: 4,
    name: 'Retargeting Banner',
    platform: 'Google Ads',
    type: 'image',
    impressions: 445600,
    clicks: 15890,
    ctr: 3.6,
    conversions: 287,
    spend: 3450,
    roas: 4.8,
    status: 'performing'
  },
  {
    id: 5,
    name: 'Story Ad - Limited Offer',
    platform: 'Instagram',
    type: 'story',
    impressions: 234100,
    clicks: 6780,
    ctr: 2.9,
    conversions: 145,
    spend: 1890,
    roas: 3.2,
    status: 'performing'
  },
  {
    id: 6,
    name: 'LinkedIn Sponsored Post',
    platform: 'LinkedIn',
    type: 'image',
    impressions: 123400,
    clicks: 2340,
    ctr: 1.9,
    conversions: 34,
    spend: 2340,
    roas: 1.4,
    status: 'underperforming'
  }
])

const campaigns = ref([
  {
    id: 1,
    name: 'Q4 Holiday Campaign',
    platform: 'Google Ads',
    status: 'active',
    budget: 15000,
    spent: 8420,
    impressions: 1245000,
    clicks: 42300,
    ctr: 3.4,
    startDate: 'Nov 1, 2024'
  },
  {
    id: 2,
    name: 'Brand Awareness - Meta',
    platform: 'Facebook Ads',
    status: 'active',
    budget: 10000,
    spent: 6780,
    impressions: 890000,
    clicks: 28500,
    ctr: 3.2,
    startDate: 'Oct 15, 2024'
  },
  {
    id: 3,
    name: 'Product Launch',
    platform: 'LinkedIn Ads',
    status: 'paused',
    budget: 8000,
    spent: 4230,
    impressions: 320000,
    clicks: 9800,
    ctr: 3.1,
    startDate: 'Oct 1, 2024'
  },
  {
    id: 4,
    name: 'Retargeting Campaign',
    platform: 'Google Ads',
    status: 'active',
    budget: 5000,
    spent: 3890,
    impressions: 456000,
    clicks: 15200,
    ctr: 3.3,
    startDate: 'Nov 8, 2024'
  }
])

const getStatusBadge = (status: string) => {
  const badges: Record<string, string> = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    paused: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    ended: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
  }
  return badges[status] || 'bg-gray-100 text-gray-800'
}

const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}
</script>
