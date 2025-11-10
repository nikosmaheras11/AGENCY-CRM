<template>
  <div class="min-h-screen bg-gradient-dark text-white relative flex flex-col">
    <!-- Background pattern overlay -->
    <div class="absolute inset-0 bg-pattern opacity-[0.015] pointer-events-none"></div>
    
    <!-- Header -->
    <header class="h-16 bg-white/5 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-6 relative z-10">
      <div class="flex items-center gap-4">
        <button @click="navigateTo('/')" class="p-2 hover:bg-white/10 rounded-lg transition-colors">
          <span class="material-icons">arrow_back</span>
        </button>
        <h1 class="text-xl font-semibold text-white">This Week's Objectives</h1>
      </div>
      <div class="flex items-center gap-3">
        <button @click="addNewObjective" class="px-4 py-2 bg-teal-400 hover:bg-teal-500 text-black rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
          <span class="material-icons text-lg">add</span>
          <span>New Objective</span>
        </button>
      </div>
    </header>
    
    <!-- Document Canvas -->
    <main class="flex-1 overflow-y-auto p-6 relative z-10">
      <div class="max-w-4xl mx-auto">
        <!-- Page Title (Editable) -->
        <div class="mb-8">
          <input
            v-model="pageTitle"
            type="text"
            class="w-full text-4xl font-bold bg-transparent border-none outline-none text-white placeholder-white/30 mb-2"
            placeholder="Untitled"
          />
          <div class="text-sm text-slate-400">
            {{ formattedDate }}
          </div>
        </div>
        
        <!-- Objectives List -->
        <div class="space-y-3">
          <div
            v-for="(objective, index) in objectives"
            :key="objective.id"
            class="card-glass rounded-lg overflow-hidden transition-all hover:shadow-lg"
            :class="{ 'ring-2 ring-teal-400': selectedObjective?.id === objective.id }"
          >
            <!-- Objective Header -->
            <div class="flex items-start gap-3 p-4 cursor-pointer" @click="selectObjective(objective)">
              <!-- Checkbox -->
              <button
                @click.stop="toggleComplete(objective)"
                :class="[
                  'w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border-2 transition-colors mt-0.5',
                  objective.completed
                    ? 'bg-success border-success'
                    : 'border-white/30 hover:border-white/50'
                ]"
              >
                <span v-if="objective.completed" class="material-icons text-white text-sm">check</span>
              </button>
              
              <!-- Content -->
              <div class="flex-1 min-w-0">
                <input
                  v-model="objective.title"
                  @click.stop
                  type="text"
                  :class="[
                    'w-full bg-transparent border-none outline-none font-medium text-base mb-2',
                    objective.completed ? 'text-slate-400 line-through' : 'text-white'
                  ]"
                  placeholder="Objective title..."
                />
                
                <!-- Metadata -->
                <div class="flex items-center gap-3 text-xs text-slate-400">
                  <div class="flex items-center gap-1">
                    <span class="material-icons text-sm">folder</span>
                    <input
                      v-model="objective.category"
                      @click.stop
                      type="text"
                      class="bg-transparent border-none outline-none w-24"
                      placeholder="Category"
                    />
                  </div>
                  <div class="flex items-center gap-1">
                    <span class="material-icons text-sm">calendar_today</span>
                    <input
                      v-model="objective.dueDate"
                      @click.stop
                      type="text"
                      class="bg-transparent border-none outline-none w-24"
                      placeholder="Due date"
                    />
                  </div>
                  <select
                    v-model="objective.priority"
                    @click.stop
                    :class="[
                      'bg-transparent border-none outline-none text-xs px-2 py-1 rounded-full font-medium',
                      objective.priority === 'high' ? 'bg-error/20 text-error' :
                      objective.priority === 'medium' ? 'bg-orange-300/20 text-orange-300' :
                      'bg-teal-400/20 text-teal-300'
                    ]"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              
              <!-- Actions -->
              <button
                @click.stop="deleteObjective(objective.id)"
                class="p-2 hover:bg-error/20 rounded-lg text-slate-400 hover:text-error transition-colors"
              >
                <span class="material-icons text-lg">delete</span>
              </button>
            </div>
            
            <!-- Notes Section (Expandable) -->
            <div
              v-if="selectedObjective?.id === objective.id"
              class="border-t border-white/10 p-4 bg-white/5"
            >
              <div class="mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Notes</div>
              <textarea
                v-model="objective.notes"
                class="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white placeholder-white/30 outline-none focus:border-teal-400 resize-none"
                rows="6"
                placeholder="Add notes, context, or details about this objective..."
              ></textarea>
              
              <!-- Note Actions -->
              <div class="flex items-center gap-2 mt-3">
                <button
                  @click="saveNotes"
                  class="px-3 py-1.5 bg-teal-400 hover:bg-teal-500 text-black rounded text-xs font-medium transition-colors"
                >
                  Save Notes
                </button>
                <button
                  @click="selectedObjective = null"
                  class="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded text-xs font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Empty State -->
        <div v-if="objectives.length === 0" class="text-center py-12">
          <div class="text-6xl mb-4">📋</div>
          <h3 class="text-xl font-semibold text-white mb-2">No objectives yet</h3>
          <p class="text-slate-400 mb-4">Start planning your week by adding your first objective</p>
          <button
            @click="addNewObjective"
            class="px-4 py-2 bg-teal-400 hover:bg-teal-500 text-black rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2"
          >
            <span class="material-icons">add</span>
            <span>Add Objective</span>
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
interface Objective {
  id: string
  title: string
  category: string
  priority: 'low' | 'medium' | 'high'
  dueDate: string
  completed: boolean
  notes: string
  createdAt: string
}

const pageTitle = ref('This Week\'s Priorities')
const objectives = ref<Objective[]>([
  {
    id: '1',
    title: 'Complete Q4 campaign creative assets',
    category: 'Creative',
    priority: 'high',
    dueDate: 'Wed, Nov 13',
    completed: false,
    notes: '',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Review and approve brand guidelines update',
    category: 'Design',
    priority: 'medium',
    dueDate: 'Thu, Nov 14',
    completed: false,
    notes: '',
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Optimize campaign budget allocation',
    category: 'Performance',
    priority: 'high',
    dueDate: 'Tue, Nov 12',
    completed: false,
    notes: '',
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    title: 'Upload new product images to DAM',
    category: 'Resources',
    priority: 'low',
    dueDate: 'Fri, Nov 15',
    completed: true,
    notes: 'All images uploaded and tagged',
    createdAt: new Date().toISOString()
  },
  {
    id: '5',
    title: 'Client meeting prep: Q3 results presentation',
    category: 'Performance',
    priority: 'medium',
    dueDate: 'Today',
    completed: false,
    notes: '',
    createdAt: new Date().toISOString()
  }
])

const selectedObjective = ref<Objective | null>(null)

const formattedDate = computed(() => {
  const now = new Date()
  const start = new Date(now)
  start.setDate(now.getDate() - now.getDay()) // Sunday
  const end = new Date(start)
  end.setDate(start.getDate() + 6) // Saturday
  
  return `Week of ${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
})

function addNewObjective() {
  const newObjective: Objective = {
    id: Date.now().toString(),
    title: '',
    category: '',
    priority: 'medium',
    dueDate: '',
    completed: false,
    notes: '',
    createdAt: new Date().toISOString()
  }
  objectives.value.unshift(newObjective)
  selectedObjective.value = newObjective
}

function selectObjective(objective: Objective) {
  selectedObjective.value = selectedObjective.value?.id === objective.id ? null : objective
}

function toggleComplete(objective: Objective) {
  objective.completed = !objective.completed
  saveToLocalStorage()
}

function deleteObjective(id: string) {
  objectives.value = objectives.value.filter(obj => obj.id !== id)
  if (selectedObjective.value?.id === id) {
    selectedObjective.value = null
  }
  saveToLocalStorage()
}

function saveNotes() {
  saveToLocalStorage()
  // Show a brief success message
  console.log('Notes saved!')
}

function saveToLocalStorage() {
  if (process.client) {
    localStorage.setItem('weekly-objectives', JSON.stringify(objectives.value))
    localStorage.setItem('page-title', pageTitle.value)
  }
}

function loadFromLocalStorage() {
  if (process.client) {
    const savedObjectives = localStorage.getItem('weekly-objectives')
    const savedTitle = localStorage.getItem('page-title')
    
    if (savedObjectives) {
      objectives.value = JSON.parse(savedObjectives)
    }
    if (savedTitle) {
      pageTitle.value = savedTitle
    }
  }
}

// Auto-save on changes
watch([objectives, pageTitle], () => {
  saveToLocalStorage()
}, { deep: true })

// Load saved data on mount
onMounted(() => {
  loadFromLocalStorage()
})
</script>
