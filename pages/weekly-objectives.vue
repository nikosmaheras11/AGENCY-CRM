<template>
  <div class="min-h-screen bg-gradient-dark text-white relative flex">
    <!-- Background pattern overlay -->
    <div class="absolute inset-0 bg-pattern opacity-[0.015] pointer-events-none"></div>
    
    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col relative z-10">
      <!-- Header -->
      <header class="h-16 bg-white/5 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-6">
        <div class="flex items-center gap-4">
          <button @click="navigateTo('/')" class="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <span class="material-icons">arrow_back</span>
          </button>
          <h1 class="text-xl font-semibold text-white">This Week's Objectives</h1>
        </div>
        <div class="flex items-center gap-3">
          <button @click="insertObjectiveBlock" class="px-4 py-2 bg-teal-400 hover:bg-teal-500 text-black rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <span class="material-icons text-lg">add_task</span>
            <span>Add Objective</span>
          </button>
        </div>
      </header>
      
      <!-- Document Canvas with Novel Editor -->
      <main class="flex-1 overflow-y-auto p-6">
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
          
          <!-- TipTap Editor with embedded objective blocks -->
          <div class="mb-6">
            <NovelEditor
              ref="editorRef"
              v-model="documentContent"
              storage-key="weekly-objectives-doc"
              @click-objective="openObjectivePanel"
              @toggle-complete="handleToggleComplete"
            />
          </div>
        </div>
      </main>
    </div>
    
    <!-- Side Panel for Objective Details -->
    <Transition name="slide">
      <div
        v-if="sidePanelOpen"
        class="w-[480px] bg-slate-900/95 backdrop-blur-xl border-l border-white/10 flex flex-col relative z-20"
      >
        <!-- Panel Header -->
        <div class="h-16 px-6 flex items-center justify-between border-b border-white/10">
          <h2 class="text-lg font-semibold text-white">Objective Details</h2>
          <button @click="closeSidePanel" class="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <span class="material-icons">close</span>
          </button>
        </div>
        
        <!-- Panel Content -->
        <div v-if="selectedObjective" class="flex-1 overflow-y-auto p-6">
          <!-- Title -->
          <div class="mb-6">
            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Title</label>
            <input
              v-model="selectedObjective.title"
              type="text"
              class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 outline-none focus:border-teal-400"
              placeholder="Objective title..."
            />
          </div>
          
          <!-- Metadata Grid -->
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Category</label>
              <input
                v-model="selectedObjective.category"
                type="text"
                class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-teal-400"
                placeholder="e.g. Creative"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Due Date</label>
              <input
                v-model="selectedObjective.dueDate"
                type="text"
                class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-teal-400"
                placeholder="e.g. Today"
              />
            </div>
          </div>
          
          <!-- Priority -->
          <div class="mb-6">
            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Priority</label>
            <div class="flex gap-2">
              <button
                v-for="priority in ['low', 'medium', 'high']"
                :key="priority"
                @click="selectedObjective.priority = priority as any"
                :class="[
                  'flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  selectedObjective.priority === priority
                    ? priority === 'high' ? 'bg-error text-white' :
                      priority === 'medium' ? 'bg-orange-300 text-black' :
                      'bg-teal-400 text-black'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                ]"
              >
                {{ priority.charAt(0).toUpperCase() + priority.slice(1) }}
              </button>
            </div>
          </div>
          
          <!-- Status -->
          <div class="mb-6">
            <label class="flex items-center gap-3 cursor-pointer">
              <div
                :class="[
                  'w-6 h-6 rounded flex items-center justify-center border-2 transition-colors',
                  selectedObjective.completed
                    ? 'bg-success border-success'
                    : 'border-white/30'
                ]"
              >
                <span v-if="selectedObjective.completed" class="material-icons text-white text-sm">check</span>
              </div>
              <input
                type="checkbox"
                v-model="selectedObjective.completed"
                class="sr-only"
              />
              <span class="text-sm text-white">Mark as completed</span>
            </label>
          </div>
          
          <!-- Notes -->
          <div class="mb-6">
            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Notes</label>
            <textarea
              v-model="selectedObjective.notes"
              class="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white placeholder-white/30 outline-none focus:border-teal-400 resize-none"
              rows="8"
              placeholder="Add notes, context, or details about this objective..."
            ></textarea>
          </div>
          
          <!-- Actions -->
          <div class="flex gap-3">
            <button
              @click="saveAndClose"
              class="flex-1 px-4 py-3 bg-teal-400 hover:bg-teal-500 text-black rounded-lg text-sm font-medium transition-colors"
            >
              Save & Close
            </button>
            <button
              @click="deleteCurrentObjective"
              class="px-4 py-3 bg-error/20 hover:bg-error/30 text-error rounded-lg text-sm font-medium transition-colors"
            >
              <span class="material-icons">delete</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
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
const documentContent = ref('')
const sidePanelOpen = ref(false)
const selectedObjective = ref<Objective | null>(null)
const editorRef = ref<any>(null)

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

const formattedDate = computed(() => {
  const now = new Date()
  const start = new Date(now)
  start.setDate(now.getDate() - now.getDay()) // Sunday
  const end = new Date(start)
  end.setDate(start.getDate() + 6) // Saturday
  
  return `Week of ${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
})

function insertObjectiveBlock() {
  const newObjective: Objective = {
    id: Date.now().toString(),
    title: 'New Objective',
    category: '',
    priority: 'medium',
    dueDate: '',
    completed: false,
    notes: '',
    createdAt: new Date().toISOString()
  }
  objectives.value.push(newObjective)
  
  // Insert objective block into editor
  if (editorRef.value?.editor) {
    editorRef.value.editor.chain().focus().setObjectiveBlock({
      id: newObjective.id,
      title: newObjective.title,
      category: newObjective.category,
      priority: newObjective.priority,
      dueDate: newObjective.dueDate,
      completed: newObjective.completed
    }).run()
  }
  
  // Open panel to edit details
  openObjectivePanel(newObjective.id)
}

function openObjectivePanel(objectiveId: string) {
  const objective = objectives.value.find(obj => obj.id === objectiveId)
  if (objective) {
    selectedObjective.value = objective
    sidePanelOpen.value = true
  }
}

function handleToggleComplete(objectiveId: string, completed: boolean) {
  const objective = objectives.value.find(obj => obj.id === objectiveId)
  if (objective) {
    objective.completed = completed
    saveToLocalStorage()
  }
}

function closeSidePanel() {
  sidePanelOpen.value = false
  saveToLocalStorage()
}

function saveAndClose() {
  saveToLocalStorage()
  sidePanelOpen.value = false
}

function toggleComplete(objective: Objective) {
  objective.completed = !objective.completed
  saveToLocalStorage()
}

function deleteCurrentObjective() {
  if (selectedObjective.value) {
    objectives.value = objectives.value.filter(obj => obj.id !== selectedObjective.value?.id)
    sidePanelOpen.value = false
    selectedObjective.value = null
    saveToLocalStorage()
  }
}

function saveToLocalStorage() {
  if (process.client) {
    localStorage.setItem('weekly-objectives', JSON.stringify(objectives.value))
    localStorage.setItem('page-title', pageTitle.value)
    localStorage.setItem('document-content', documentContent.value)
  }
}

function loadFromLocalStorage() {
  if (process.client) {
    const savedObjectives = localStorage.getItem('weekly-objectives')
    const savedTitle = localStorage.getItem('page-title')
    const savedContent = localStorage.getItem('document-content')
    
    if (savedObjectives) {
      objectives.value = JSON.parse(savedObjectives)
    }
    if (savedTitle) {
      pageTitle.value = savedTitle
    }
    if (savedContent) {
      documentContent.value = savedContent
    }
  }
}

// Auto-save on changes
watch([objectives, pageTitle, documentContent], () => {
  saveToLocalStorage()
}, { deep: true })

// Load saved data on mount
onMounted(() => {
  loadFromLocalStorage()
})
</script>

<style scoped>
/* Slide transition for side panel */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from {
  transform: translateX(100%);
}

.slide-leave-to {
  transform: translateX(100%);
}
</style>
