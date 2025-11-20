<template>
  <Transition name="slide">
    <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-end">
      <!-- Backdrop -->
      <div 
        class="absolute inset-0 bg-black/50 transition-opacity"
        @click="$emit('update:modelValue', false)"
      />
      
      <!-- Panel -->
      <div class="relative w-full max-w-2xl h-full bg-gradient-dark text-white shadow-2xl overflow-y-auto">
        <!-- Background pattern overlay -->
        <div class="absolute inset-0 bg-pattern opacity-[0.015] pointer-events-none"></div>
        <!-- Header -->
        <div class="sticky top-0 z-10 bg-white/5 backdrop-blur-xl border-b border-white/10 px-6 py-4 relative">
          <div class="flex items-center justify-between mb-4">
            <button
              class="px-4 py-2 text-sm card-glass hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
            >
              <span class="material-icons text-lg">check</span>
              Mark complete
            </button>
            
            <div class="flex items-center gap-2">
              <button class="w-9 h-9 hover:bg-white/10 rounded-lg flex items-center justify-center transition-colors">
                <span class="material-icons text-slate-400">thumb_up</span>
              </button>
              <button class="w-9 h-9 hover:bg-white/10 rounded-lg flex items-center justify-center transition-colors">
                <span class="material-icons text-slate-400">content_copy</span>
              </button>
              <button class="w-9 h-9 hover:bg-white/10 rounded-lg flex items-center justify-center transition-colors">
                <span class="material-icons text-slate-400">link</span>
              </button>
              <button class="w-9 h-9 hover:bg-white/10 rounded-lg flex items-center justify-center transition-colors">
                <span class="material-icons text-slate-400">open_in_full</span>
              </button>
              <button class="w-9 h-9 hover:bg-white/10 rounded-lg flex items-center justify-center transition-colors">
                <span class="material-icons text-slate-400">more_horiz</span>
              </button>
              <button 
                @click="$emit('update:modelValue', false)"
                class="w-9 h-9 hover:bg-white/10 rounded-lg flex items-center justify-center transition-colors"
              >
                <span class="material-icons text-slate-400">close</span>
              </button>
            </div>
          </div>

          <!-- Privacy notice -->
          <div class="flex items-center justify-between text-sm text-gray-400">
            <div class="flex items-center gap-2">
              <span class="material-icons text-base">lock</span>
              <span>This task is private to members of this project.</span>
            </div>
            <button class="text-white hover:underline">Make public</button>
          </div>
        </div>

        <!-- Content -->
        <div class="px-6 py-6 relative">
          <!-- Title -->
          <h1 class="text-2xl font-semibold mb-6">{{ displayData?.title || 'Request Details' }}</h1>

          <!-- Tabs -->
          <div class="mb-6 border-b border-white/10">
            <div class="flex gap-6">
              <button
                v-for="tab in tabs"
                :key="tab"
                @click="activeTab = tab"
                class="pb-3 text-sm font-medium transition-colors relative"
                :class="activeTab === tab ? 'text-white' : 'text-gray-400 hover:text-gray-300'"
              >
                {{ tab }}
                <div 
                  v-if="activeTab === tab"
                  class="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                />
              </button>
            </div>
          </div>

          <!-- Overview Tab -->
          <div v-if="activeTab === 'Overview'">
            <!-- Assignee -->
            <div class="flex items-start gap-4 mb-6">
              <label class="w-32 text-sm text-gray-400 pt-2">Assignee</label>
              <div class="flex-1">
                <div class="flex items-center gap-2 px-3 py-2 bg-gray-800/50 rounded-lg">
                  <div class="w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center text-xs font-medium">
                    NM
                  </div>
                  <span class="text-sm">{{ displayData?.assignee || 'Unassigned' }}</span>
                  <button class="ml-auto text-gray-400 hover:text-white">
                    <span class="material-icons text-sm">close</span>
                  </button>
                </div>
                <button class="text-xs text-gray-400 hover:text-white mt-2">Recently assigned</button>
              </div>
            </div>

            <!-- Due date -->
            <div class="flex items-start gap-4 mb-6">
              <label class="w-32 text-sm text-gray-400 pt-2">Due date</label>
              <div class="flex-1">
                <input
                  type="date"
                  :value="displayData?.due_date || ''"
                  @change="(e) => updateField('due_date', (e.target as HTMLInputElement).value)"
                  class="w-full px-3 py-2 bg-gray-900/50 border border-gray-800 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-gray-700"
                />
              </div>
            </div>

            <!-- Projects -->
            <div class="flex items-start gap-4 mb-6">
              <label class="w-32 text-sm text-gray-400 pt-2">Projects</label>
              <div class="flex-1">
                <div class="flex items-center gap-2 px-3 py-2 bg-gray-800/50 rounded-lg mb-2">
                  <div class="w-3 h-3 rounded bg-purple-500" />
                  <span class="text-sm">Poly</span>
                  <span class="text-xs text-gray-400">To do</span>
                  <button class="ml-auto text-gray-400 hover:text-white">
                    <span class="material-icons text-sm">close</span>
                  </button>
                </div>
                <button class="text-sm text-gray-400 hover:text-white">Add to projects</button>
              </div>
            </div>

            <!-- Dependencies -->
            <div class="flex items-start gap-4 mb-6">
              <label class="w-32 text-sm text-gray-400 pt-2">Dependencies</label>
              <div class="flex-1">
                <button class="text-sm text-gray-400 hover:text-white">Add dependencies</button>
              </div>
            </div>

            <!-- Fields -->
            <div class="flex items-start gap-4 mb-6">
              <label class="w-32 text-sm text-gray-400 pt-2">Fields</label>
              <div class="flex-1 space-y-3">
                <div class="flex items-center justify-between p-3 border border-gray-800 rounded-lg">
                  <div class="flex items-center gap-2 text-gray-400">
                    <span class="material-icons text-sm">priority_high</span>
                    <span class="text-sm">Priority</span>
                  </div>
                  <select
                    :value="displayData?.priority || 'medium'"
                    @change="(e) => updateField('priority', (e.target as HTMLSelectElement).value)"
                    class="px-3 py-1 bg-gray-900 border border-gray-800 text-cyan-400 text-xs font-medium rounded cursor-pointer focus:outline-none focus:border-gray-700"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div class="flex items-center justify-between p-3 border border-gray-800 rounded-lg">
                  <div class="flex items-center gap-2 text-gray-400">
                    <span class="material-icons text-sm">info</span>
                    <span class="text-sm">Status</span>
                  </div>
                  <select
                    :value="displayData?.status || 'new-request'"
                    @change="(e) => updateField('status', (e.target as HTMLSelectElement).value)"
                    class="px-3 py-1 bg-gray-900 border border-gray-800 text-cyan-400 text-xs font-medium rounded cursor-pointer focus:outline-none focus:border-gray-700"
                  >
                    <option value="new-request">New Request</option>
                    <option value="in-progress">In Progress</option>
                    <option value="needs-review">Needs Review</option>
                    <option value="needs-edit">Needs Edit</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Description -->
            <div class="flex items-start gap-4 mb-6">
              <label class="w-32 text-sm text-gray-400 pt-2">Description</label>
              <div class="flex-1">
                <textarea
                  :value="displayData?.description || ''"
                  @blur="(e) => updateField('description', (e.target as HTMLTextAreaElement).value)"
                  placeholder="What is this task about?"
                  class="w-full px-3 py-2 bg-gray-900/50 border border-gray-800 rounded-lg text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-gray-700 resize-none"
                  rows="4"
                />
              </div>
            </div>

            <!-- Creative Specs (if creative project_type) -->
            <div v-if="displayData?.project_type === 'creative'" class="space-y-6 mb-6">
              <div class="flex items-start gap-4">
                <label class="w-32 text-sm text-gray-400 pt-2">Platform</label>
                <div class="flex-1">
                  <select
                    :value="displayData?.format || ''"
                    @change="(e) => updateField('format', (e.target as HTMLSelectElement).value)"
                    class="w-full px-3 py-2 bg-gray-900/50 border border-gray-800 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-gray-700 cursor-pointer"
                  >
                    <option value="">Select platform...</option>
                    <option value="Meta">Meta</option>
                    <option value="Google">Google</option>
                    <option value="Tik Tok">Tik Tok</option>
                    <option value="Reddit">Reddit</option>
                    <option value="X">X</option>
                  </select>
                </div>
              </div>

              <div class="flex items-start gap-4">
                <label class="w-32 text-sm text-gray-400 pt-2">Size</label>
                <div class="flex-1">
                  <input
                    type="text"
                    :value="displayData?.size || ''"
                    @blur="(e) => updateField('size', (e.target as HTMLInputElement).value)"
                    placeholder="e.g., Large, Medium, Small"
                    class="w-full px-3 py-2 bg-gray-900/50 border border-gray-800 rounded-lg text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-gray-700"
                  />
                </div>
              </div>

              <div class="flex items-start gap-4">
                <label class="w-32 text-sm text-gray-400 pt-2">Dimensions</label>
                <div class="flex-1">
                  <input
                    type="text"
                    :value="displayData?.dimensions || ''"
                    @blur="(e) => updateField('dimensions', (e.target as HTMLInputElement).value)"
                    placeholder="e.g., 1080x1080, 1920x1080"
                    class="w-full px-3 py-2 bg-gray-900/50 border border-gray-800 rounded-lg text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-gray-700"
                  />
                </div>
              </div>

              <div class="flex items-start gap-4">
                <label class="w-32 text-sm text-gray-400 pt-2">Duration</label>
                <div class="flex-1">
                  <input
                    type="text"
                    :value="displayData?.duration || ''"
                    @blur="(e) => updateField('duration', (e.target as HTMLInputElement).value)"
                    placeholder="e.g., 15s, 30s, 60s"
                    class="w-full px-3 py-2 bg-gray-900/50 border border-gray-800 rounded-lg text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-gray-700"
                  />
                </div>
              </div>

              <div class="flex items-start gap-4">
                <label class="w-32 text-sm text-gray-400 pt-2">Figma URL</label>
                <div class="flex-1">
                  <div class="flex gap-2 items-center">
                    <input
                      type="url"
                      :value="displayData?.figma_url || ''"
                      @blur="(e) => updateField('figma_url', (e.target as HTMLInputElement).value)"
                      placeholder="https://figma.com/..."
                      class="flex-1 px-3 py-2 bg-gray-900/50 border border-gray-800 rounded-lg text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-gray-700"
                    />
                    <a v-if="displayData?.figma_url" :href="displayData.figma_url" target="_blank" class="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors flex items-center gap-1">
                      <span class="material-icons text-sm">open_in_new</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <!-- Campaign Details -->
            <div class="space-y-6 mb-6">
              <div class="flex items-start gap-4">
                <label class="w-32 text-sm text-gray-400 pt-2">Campaign</label>
                <div class="flex-1">
                  <input
                    type="text"
                    :value="displayData?.campaign || ''"
                    @blur="(e) => updateField('campaign', (e.target as HTMLInputElement).value)"
                    placeholder="Campaign name"
                    class="w-full px-3 py-2 bg-gray-900/50 border border-gray-800 rounded-lg text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-gray-700"
                  />
                </div>
              </div>

              <div class="flex items-start gap-4">
                <label class="w-32 text-sm text-gray-400 pt-2">Target Audience</label>
                <div class="flex-1">
                  <textarea
                    :value="displayData?.target_audience || ''"
                    @blur="(e) => updateField('target_audience', (e.target as HTMLTextAreaElement).value)"
                    placeholder="Describe the target audience..."
                    class="w-full px-3 py-2 bg-gray-900/50 border border-gray-800 rounded-lg text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-gray-700 resize-none"
                    rows="3"
                  />
                </div>
              </div>

              <div class="flex items-start gap-4">
                <label class="w-32 text-sm text-gray-400 pt-2">Campaign Objectives</label>
                <div class="flex-1">
                  <textarea
                    :value="displayData?.campaign_objectives || ''"
                    @blur="(e) => updateField('campaign_objectives', (e.target as HTMLTextAreaElement).value)"
                    placeholder="What are the campaign objectives?"
                    class="w-full px-3 py-2 bg-gray-900/50 border border-gray-800 rounded-lg text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-gray-700 resize-none"
                    rows="3"
                  />
                </div>
              </div>

              <div class="flex items-start gap-4">
                <label class="w-32 text-sm text-gray-400 pt-2">Category</label>
                <div class="flex-1">
                  <input
                    type="text"
                    :value="displayData?.category || ''"
                    @blur="(e) => updateField('category', (e.target as HTMLInputElement).value)"
                    placeholder="e.g., Social Media, Display Ads"
                    class="w-full px-3 py-2 bg-gray-900/50 border border-gray-800 rounded-lg text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-gray-700"
                  />
                </div>
              </div>
            </div>

            <!-- Project Management -->
            <div class="space-y-6 mb-6">
              <div class="grid grid-cols-2 gap-4">
                <div class="flex items-start gap-4">
                  <label class="w-32 text-sm text-gray-400 pt-2">Estimate (hrs)</label>
                  <div class="flex-1">
                    <input
                      type="number"
                      :value="displayData?.estimate_hours || ''"
                      @blur="(e) => updateField('estimate_hours', parseFloat((e.target as HTMLInputElement).value) || null)"
                      placeholder="0"
                      min="0"
                      step="0.5"
                      class="w-full px-3 py-2 bg-gray-900/50 border border-gray-800 rounded-lg text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-gray-700"
                    />
                  </div>
                </div>
                <div class="flex items-start gap-4">
                  <label class="w-32 text-sm text-gray-400 pt-2">Actual (hrs)</label>
                  <div class="flex-1">
                    <input
                      type="number"
                      :value="displayData?.actual_hours || ''"
                      @blur="(e) => updateField('actual_hours', parseFloat((e.target as HTMLInputElement).value) || null)"
                      placeholder="0"
                      min="0"
                      step="0.5"
                      class="w-full px-3 py-2 bg-gray-900/50 border border-gray-800 rounded-lg text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-gray-700"
                    />
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="flex items-start gap-4">
                  <label class="w-32 text-sm text-gray-400 pt-2">Start Date</label>
                  <div class="flex-1">
                    <input
                      type="date"
                      :value="displayData?.start_date || ''"
                      @blur="(e) => updateField('start_date', (e.target as HTMLInputElement).value)"
                      class="w-full px-3 py-2 bg-gray-900/50 border border-gray-800 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-gray-700"
                    />
                  </div>
                </div>
                <div class="flex items-start gap-4">
                  <label class="w-32 text-sm text-gray-400 pt-2">Completed</label>
                  <div class="flex-1">
                    <input
                      type="date"
                      :value="displayData?.completed_date || ''"
                      @blur="(e) => updateField('completed_date', (e.target as HTMLInputElement).value)"
                      class="w-full px-3 py-2 bg-gray-900/50 border border-gray-800 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-gray-700"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Review Process -->
            <div class="space-y-6 mb-6">
              <div class="flex items-start gap-4">
                <label class="w-32 text-sm text-gray-400 pt-2">Review Round</label>
                <div class="flex-1">
                  <input
                    type="number"
                    :value="displayData?.review_round || ''"
                    @blur="(e) => updateField('review_round', parseInt((e.target as HTMLInputElement).value) || null)"
                    placeholder="1"
                    min="1"
                    class="w-full px-3 py-2 bg-gray-900/50 border border-gray-800 rounded-lg text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-gray-700"
                  />
                </div>
              </div>

              <div class="flex items-start gap-4">
                <label class="w-32 text-sm text-gray-400 pt-2">Review Status</label>
                <div class="flex-1">
                  <textarea
                    :value="displayData?.review_status || ''"
                    @blur="(e) => updateField('review_status', (e.target as HTMLTextAreaElement).value)"
                    placeholder="Current review status and feedback..."
                    class="w-full px-3 py-2 bg-gray-900/50 border border-gray-800 rounded-lg text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-gray-700 resize-none"
                    rows="3"
                  />
                </div>
              </div>

              <div class="flex items-start gap-4">
                <label class="w-32 text-sm text-gray-400 pt-2">Brand Guidelines</label>
                <div class="flex-1">
                  <textarea
                    :value="displayData?.brand_guidelines || ''"
                    @blur="(e) => updateField('brand_guidelines', (e.target as HTMLTextAreaElement).value)"
                    placeholder="Brand guidelines and requirements..."
                    class="w-full px-3 py-2 bg-gray-900/50 border border-gray-800 rounded-lg text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-gray-700 resize-none"
                    rows="3"
                  />
                </div>
              </div>
            </div>

            <!-- Add subtask -->
            <button class="flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-8">
              <span class="material-icons text-base">add</span>
              <span>Add subtask</span>
            </button>

            <!-- Comments Section -->
            <div class="border-t border-gray-800 pt-6">
              <div class="flex items-center justify-between mb-4">
                <div class="flex gap-4">
                  <button class="text-sm font-medium text-white border-b-2 border-white pb-1">
                    Comments
                  </button>
                  <button class="text-sm text-gray-400 hover:text-white">
                    All activity
                  </button>
                </div>
                <button class="text-xs text-gray-400 hover:text-white flex items-center gap-1">
                  <span class="material-icons text-sm">sort</span>
                  <span>Oldest</span>
                </button>
              </div>

              <!-- Comments List -->
              <div v-for="comment in comments" :key="comment.id" class="flex gap-3 mb-4">
                <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-medium flex-shrink-0">
                  {{ comment.user_name.charAt(0).toUpperCase() }}
                </div>
                <div class="flex-1">
                  <p class="text-sm text-gray-300">
                    <span class="text-white font-medium">{{ comment.user_name }}</span>
                    <span class="ml-2 text-gray-500">{{ new Date(comment.created_at).toLocaleDateString() }}</span>
                  </p>
                  <p class="text-sm text-gray-400 mt-1">{{ comment.content }}</p>
                </div>
              </div>

              <!-- Comment input -->
              <div class="flex gap-3">
                <div class="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-xs font-medium flex-shrink-0">
                  NM
                </div>
                <div class="flex-1">
                  <textarea
                    v-model="newCommentText"
                    placeholder="Add a comment"
                    class="w-full px-4 py-3 bg-gray-900/50 border border-gray-800 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-700 resize-none"
                    rows="3"
                    @keydown.meta.enter="postComment"
                    @keydown.ctrl.enter="postComment"
                  />
                  <div class="flex justify-end mt-2">
                    <button
                      @click="postComment"
                      :disabled="!newCommentText.trim() || isSubmitting"
                      class="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors"
                    >
                      {{ isSubmitting ? 'Posting...' : 'Post Comment' }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Collaborators -->
              <div class="flex items-center gap-3 mt-6">
                <span class="text-sm text-gray-400">Collaborators</span>
                <div class="flex items-center">
                  <div class="w-7 h-7 rounded-full bg-pink-500 flex items-center justify-center text-xs font-medium border-2 border-[#1d1d1f]">
                    NM
                  </div>
                  <div class="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-xs font-medium border-2 border-[#1d1d1f] -ml-2">
                    <span class="material-icons text-sm text-gray-400">person</span>
                  </div>
                  <button class="w-7 h-7 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center border-2 border-[#1d1d1f] -ml-2 transition-colors">
                    <span class="material-icons text-sm text-gray-400">add</span>
                  </button>
                </div>
                <button class="ml-auto text-sm text-gray-400 hover:text-white flex items-center gap-1">
                  <span class="material-icons text-sm">logout</span>
                  <span>Leave task</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Assets Tab -->
          <div v-else-if="activeTab === 'Assets'">
            <div class="text-center py-12 text-gray-400">
              <span class="material-icons text-5xl mb-4">image</span>
              <p class="text-sm">No creative assets linked to this campaign yet</p>
              <button class="mt-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors">
                Link Creative Asset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type { RequestComment } from '~/types/request-modal'

interface Props {
  modelValue: boolean
  campaign?: any
  requestId?: string // Add requestId prop to fetch real data
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const activeTab = ref('Overview')
const tabs = ['Overview', 'Assets']

// Fetch real request data from database
const { supabase } = useSupabase()
const { user, getCurrentUser } = useAuth()

// Get current user on mount
onMounted(() => {
  getCurrentUser()
})
const requestData = ref<any>(null)
const comments = ref<RequestComment[]>([])
const newCommentText = ref('')
const isSubmitting = ref(false)

// Fetch request data
const fetchRequestData = async () => {
  if (!props.requestId) return
  
  try {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .eq('id', props.requestId)
      .single()
    
    if (error) throw error
    requestData.value = data
    
    // Fetch comments
    await fetchComments()
  } catch (error) {
    console.error('Failed to fetch request:', error)
  }
}

// Fetch comments
const fetchComments = async () => {
  if (!props.requestId) return
  
  try {
    const { data, error } = await supabase
      .from('request_comments')
      .select('*')
      .eq('request_id', props.requestId)
      .order('created_at', { ascending: true })
    
    if (error) throw error
    comments.value = data || []
  } catch (error) {
    console.error('Failed to fetch comments:', error)
  }
}

// Post new comment
const postComment = async () => {
  if (!newCommentText.value.trim() || !user.value || !props.requestId) return
  
  try {
    isSubmitting.value = true
    
    const { data, error } = await supabase
      .from('request_comments')
      .insert({
        request_id: props.requestId,
        content: newCommentText.value.trim(),
        user_id: user.value.id,
        user_name: user.value.user_metadata?.full_name || user.value.email || 'Unknown',
        user_avatar_url: user.value.user_metadata?.avatar_url
      })
      .select()
      .single()
    
    if (error) throw error
    
    comments.value.push(data)
    newCommentText.value = ''
  } catch (error) {
    console.error('Failed to post comment:', error)
  } finally {
    isSubmitting.value = false
  }
}

// Watch for modal open/close
watch(() => props.modelValue, (isOpen) => {
  if (isOpen && props.requestId) {
    fetchRequestData()
  }
}, { immediate: true })

// Display data with fallback to campaign prop
const displayData = computed(() => requestData.value || props.campaign)

// Update field function for CRUD
const updateField = async (fieldName: string, value: any) => {
  if (!props.requestId || !requestData.value) return
  
  try {
    const { error } = await supabase
      .from('requests')
      .update({ 
        [fieldName]: value,
        updated_at: new Date().toISOString()
      })
      .eq('id', props.requestId)
    
    if (error) throw error
    
    // Update local state
    requestData.value = { ...requestData.value, [fieldName]: value }
  } catch (error) {
    console.error(`Failed to update ${fieldName}:`, error)
  }
}
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

.slide-enter-from .absolute,
.slide-leave-to .absolute {
  opacity: 0;
}

.slide-enter-active .absolute,
.slide-leave-active .absolute {
  transition: opacity 0.3s ease;
}
</style>
