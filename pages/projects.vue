<template>
  <div class="min-h-screen bg-gradient-dark text-white relative flex flex-col">
    <!-- Background pattern overlay -->
    <div class="absolute inset-0 bg-pattern opacity-[0.015] pointer-events-none"></div>
    
    <!-- Campaign Detail Panel -->
    <CampaignDetailPanel 
      v-model="showCampaignDetail" 
      :campaign="selectedCampaign" 
      :request-id="selectedRequestId || undefined"
    />
    
    <div class="p-6 sm:p-8 relative z-10">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-4xl font-display font-bold text-white mb-2">
            Project Management
          </h1>
          <p class="text-slate-400 font-light">
            Track project timeline, estimates, and deliverables
          </p>
          <p v-if="loading" class="text-xs text-yellow-400 mt-1">Loading requests...</p>
          <p v-else-if="error" class="text-xs text-red-400 mt-1">Error: {{ error.message }}</p>
          <p v-else class="text-xs text-green-400 mt-1">Loaded {{ allRequests.length }} requests</p>
        </div>
        <div class="flex gap-3">
          <button class="px-5 py-2.5 card-glass hover:bg-white/10 text-white rounded-2xl font-medium transition-all">
            Filter
          </button>
          <button class="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white shadow-primary rounded-2xl font-medium transition-all">
            + New Project
          </button>
        </div>
      </div>

      <!-- View Switcher -->
      <div class="card-glass card-elevated p-5 mb-6">
        <div class="flex items-center justify-between">
          <div class="flex gap-2">
            <button 
              @click="viewMode = 'table'"
              class="px-4 py-2 rounded-xl text-sm font-medium transition-all"
              :class="viewMode === 'table' ? 'bg-primary-500 text-white shadow-primary' : 'text-slate-300 hover:bg-white/10'"
            >
              Table View
            </button>
            <button 
              @click="viewMode = 'kanban'"
              class="px-4 py-2 rounded-xl text-sm font-medium transition-all"
              :class="viewMode === 'kanban' ? 'bg-primary-500 text-white shadow-primary' : 'text-slate-300 hover:bg-white/10'"
            >
              Board View
            </button>
          </div>
          <div class="text-sm text-slate-400 font-light">
            {{ campaigns.length }} projects
          </div>
        </div>
      </div>

      <!-- Table View -->
      <div v-if="viewMode === 'table'" class="card-glass card-elevated overflow-hidden">
        <!-- Table Header -->
        <div class="grid grid-cols-12 gap-4 px-6 py-4 bg-white/5 border-b border-white/10 text-xs font-semibold text-slate-400 uppercase tracking-wide">
          <div class="col-span-3">Project Name</div>
          <div class="col-span-2">Status</div>
          <div class="col-span-2">Priority</div>
          <div class="col-span-2">Owner</div>
          <div class="col-span-1">Progress</div>
          <div class="col-span-2">Due Date</div>
        </div>

        <!-- Table Rows -->
        <div class="divide-y divide-white/10">
          <div 
            v-for="campaign in campaigns" 
            :key="campaign.id"
            @click="openCampaignDetail(campaign)"
            class="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-white/5 transition-colors cursor-pointer"
          >
            <!-- Project Name -->
            <div class="col-span-3 flex items-center gap-3">
              <div class="w-8 h-8 rounded bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                {{ campaign.name.charAt(0) }}
              </div>
              <span class="font-medium text-white">{{ campaign.name }}</span>
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
                {{ campaign.owner.split(' ').map((n: string) => n[0]).join('') }}
              </div>
              <span class="text-sm text-slate-300">{{ campaign.owner }}</span>
            </div>

            <!-- Progress -->
            <div class="col-span-1 flex items-center">
              <div class="flex-1">
                <div class="flex justify-between text-xs text-slate-400 mb-1">
                  <span>{{ campaign.progress }}%</span>
                </div>
                <div class="w-full bg-white/10 rounded-full h-2">
                  <div 
                    class="h-2 rounded-full transition-all"
                    :class="campaign.progress >= 75 ? 'bg-green-500' : campaign.progress >= 50 ? 'bg-blue-500' : 'bg-orange-500'"
                    :style="{ width: `${campaign.progress}%` }"
                  ></div>
                </div>
              </div>
            </div>

            <!-- Due Date -->
            <div class="col-span-2 flex items-center text-sm text-slate-400">
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
          <div class="card-glass card-elevated overflow-hidden">
            <div class="p-4 border-b border-white/10">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-slate-400"></span>
                <h3 class="font-display font-semibold text-white">Planning</h3>
                <span class="text-sm text-slate-400">({{ planningCampaigns.length }})</span>
              </div>
            </div>
            <div class="p-4 space-y-3 max-h-[calc(100vh-350px)] overflow-y-auto">
              <CampaignCard 
                v-for="campaign in planningCampaigns" 
                :key="campaign.id" 
                :campaign="campaign"
                @click="openCampaignDetail(campaign)"
              />
            </div>
          </div>
        </div>

        <!-- In Progress Column -->
        <div class="flex-shrink-0 w-80">
          <div class="card-glass card-elevated overflow-hidden">
            <div class="p-4 border-b border-white/10">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-blue-400"></span>
                <h3 class="font-display font-semibold text-white">In Progress</h3>
                <span class="text-sm text-slate-400">({{ inProgressCampaigns.length }})</span>
              </div>
            </div>
            <div class="p-4 space-y-3 max-h-[calc(100vh-350px)] overflow-y-auto">
              <CampaignCard 
                v-for="campaign in inProgressCampaigns" 
                :key="campaign.id" 
                :campaign="campaign"
                @click="openCampaignDetail(campaign)"
              />
            </div>
          </div>
        </div>

        <!-- Review Column -->
        <div class="flex-shrink-0 w-80">
          <div class="card-glass card-elevated overflow-hidden">
            <div class="p-4 border-b border-white/10">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-purple-400"></span>
                <h3 class="font-display font-semibold text-white">Review</h3>
                <span class="text-sm text-slate-400">({{ reviewCampaigns.length }})</span>
              </div>
            </div>
            <div class="p-4 space-y-3 max-h-[calc(100vh-350px)] overflow-y-auto">
              <CampaignCard 
                v-for="campaign in reviewCampaigns" 
                :key="campaign.id" 
                :campaign="campaign"
                @click="openCampaignDetail(campaign)"
              />
            </div>
          </div>
        </div>

        <!-- Completed Column -->
        <div class="flex-shrink-0 w-80">
          <div class="card-glass card-elevated overflow-hidden">
            <div class="p-4 border-b border-white/10">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-green-400"></span>
                <h3 class="font-display font-semibold text-white">Completed</h3>
                <span class="text-sm text-slate-400">({{ completedCampaigns.length }})</span>
              </div>
            </div>
            <div class="p-4 space-y-3 max-h-[calc(100vh-350px)] overflow-y-auto">
              <CampaignCard 
                v-for="campaign in completedCampaigns" 
                :key="campaign.id" 
                :campaign="campaign"
                @click="openCampaignDetail(campaign)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Campaign {
  id: number
  name: string
  status: 'Planning' | 'In Progress' | 'Review' | 'Completed'
  priority: 'Critical' | 'High' | 'Medium' | 'Low'
  owner: string
  progress: number
  dueDate: string
}

const viewMode = ref('table')
const showCampaignDetail = ref(false)
const selectedCampaign = ref<Campaign | null>(null)
const selectedRequestId = ref<string | null>(null)

function openCampaignDetail(campaign: Campaign) {
  selectedCampaign.value = campaign
  // Get the actual request ID from the _originalRequest property
  selectedRequestId.value = (campaign as any)._originalRequest?.id || null
  showCampaignDetail.value = true
}

// Use unified request system to fetch project-type requests
const { fetchRequests, allRequests, loading, error } = useRequests()

// Fetch requests on mount
onMounted(async () => {
  await fetchRequests()
})

// Show ALL requests from database as projects (no filtering by type)
const campaigns = computed(() => {
  return allRequests.value
    .map(req => ({
      id: parseInt(req.id.split('-')[0], 16), // Convert UUID to number for compatibility
      name: req.title || 'Untitled Project',
      status: mapRequestStatusToCampaignStatus(req.status),
      priority: mapRequestPriority(req.metadata.priority),
      owner: req.metadata.assignee || 'Unassigned',
      progress: calculateProgress(req),
      dueDate: req.metadata.dueDate ? new Date(req.metadata.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No due date',
      _originalRequest: req // Keep reference to original request data
    }))
})

const planningCampaigns = computed(() => campaigns.value.filter(c => c.status === 'Planning'))
const inProgressCampaigns = computed(() => campaigns.value.filter(c => c.status === 'In Progress'))
const reviewCampaigns = computed(() => campaigns.value.filter(c => c.status === 'Review'))
const completedCampaigns = computed(() => campaigns.value.filter(c => c.status === 'Completed'))

// Map request status to campaign status buckets
function mapRequestStatusToCampaignStatus(status: string): 'Planning' | 'In Progress' | 'Review' | 'Completed' {
  const statusMap: Record<string, 'Planning' | 'In Progress' | 'Review' | 'Completed'> = {
    'new-request': 'Planning',
    'in-progress': 'In Progress',
    'needs-review': 'Review',
    'needs-edit': 'In Progress',
    'done': 'Completed'
  }
  return statusMap[status] || 'Planning'
}

// Map request priority to campaign priority
function mapRequestPriority(priority: string | null | undefined): 'Critical' | 'High' | 'Medium' | 'Low' {
  if (!priority) return 'Medium'
  const priorityMap: Record<string, 'Critical' | 'High' | 'Medium' | 'Low'> = {
    'critical': 'Critical',
    'high': 'High',
    'medium': 'Medium',
    'low': 'Low'
  }
  return priorityMap[priority.toLowerCase()] || 'Medium'
}

// Calculate progress based on status and review round
function calculateProgress(req: any): number {
  const statusProgress: Record<string, number> = {
    'new-request': 10,
    'in-progress': 50,
    'needs-review': 75,
    'needs-edit': 60,
    'done': 100
  }
  return statusProgress[req.status] || 0
}

const getStatusBadge = (status: string) => {
  const badges: Record<string, string> = {
    'Planning': 'bg-slate-500/20 text-slate-300',
    'In Progress': 'bg-blue-500/20 text-blue-300',
    'Review': 'bg-purple-500/20 text-purple-300',
    'Completed': 'bg-green-500/20 text-green-300'
  }
  return badges[status] || 'bg-white/10 text-slate-300'
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
    'Critical': 'bg-red-500/20 text-red-300',
    'High': 'bg-orange-500/20 text-orange-300',
    'Medium': 'bg-yellow-500/20 text-yellow-300',
    'Low': 'bg-green-500/20 text-green-300'
  }
  return badges[priority] || 'bg-white/10 text-slate-300'
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
