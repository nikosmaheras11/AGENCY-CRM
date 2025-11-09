<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <header class="mb-8">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Agency Dashboard
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          High-level snapshot across all sectors
        </p>
      </header>

      <!-- Sector Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <SectorCard
          v-for="sector in sectors"
          :key="sector.id"
          :sector="sector"
        />
      </div>

      <!-- Activity Feed -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold mb-4">Recent Activity</h2>
            <ActivityFeed :activities="activities" />
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="space-y-6">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold mb-4">Quick Stats</h2>
            <QuickStats :stats="stats" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Mock data - replace with actual Directus API calls
const sectors = ref([
  {
    id: 1,
    name: 'Creative',
    slug: 'creative',
    color: '#8B5CF6',
    icon: 'palette',
    activeProjects: 8,
    pendingApprovals: 3
  },
  {
    id: 2,
    name: 'Performance',
    slug: 'performance',
    color: '#10B981',
    icon: 'trending_up',
    activeCampaigns: 12,
    totalSpend: 45000
  },
  {
    id: 3,
    name: 'Design',
    slug: 'design',
    color: '#F59E0B',
    icon: 'widgets',
    components: 45,
    inReview: 5
  },
  {
    id: 4,
    name: 'Resources',
    slug: 'resources',
    color: '#3B82F6',
    icon: 'folder',
    totalAssets: 1234,
    recentUploads: 23
  }
])

const activities = ref([
  {
    id: 1,
    action: 'created',
    collection: 'creative_assets',
    description: 'New creative asset uploaded for Project Alpha',
    user: 'Sarah Johnson',
    timestamp: '2 hours ago'
  },
  {
    id: 2,
    action: 'updated',
    collection: 'performance_campaigns',
    description: 'Campaign metrics updated for Q4 Launch',
    user: 'Mike Chen',
    timestamp: '4 hours ago'
  }
])

const stats = ref({
  activeProjects: 28,
  totalClients: 15,
  teamMembers: 42,
  assetsManaged: 1234
})
</script>
