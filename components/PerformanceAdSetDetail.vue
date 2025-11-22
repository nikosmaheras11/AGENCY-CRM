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
            <h2 class="text-2xl font-bold">Ad Set Details</h2>
            
            <div class="flex items-center gap-2">
              <button 
                @click="$emit('update:modelValue', false)"
                class="w-9 h-9 hover:bg-white/10 rounded-lg flex items-center justify-center transition-colors"
              >
                <UIcon name="i-heroicons-x-mark" class="text-xl text-slate-400" />
              </button>
            </div>
          </div>
        </div>

        <!-- Content -->
        <div v-if="adSet" class="px-6 py-6 relative">
          <h1 class="text-2xl font-semibold mb-6">{{ adSet.name }}</h1>

          <!-- Ad Set Details -->
          <div class="space-y-6">
            <!-- Name -->
            <div class="flex items-start gap-4">
              <label class="w-32 text-sm text-gray-400 pt-2">Name</label>
              <div class="flex-1">
                <input
                  type="text"
                  :value="adSet.name"
                  @blur="(e) => updateField('name', (e.target as HTMLInputElement).value)"
                  class="w-full px-3 py-2 bg-gray-900/50 border border-gray-800 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-gray-700"
                />
              </div>
            </div>

            <!-- Description -->
            <div class="flex items-start gap-4">
              <label class="w-32 text-sm text-gray-400 pt-2">Description</label>
              <div class="flex-1">
                <textarea
                  :value="adSet.description || ''"
                  @blur="(e) => updateField('description', (e.target as HTMLTextAreaElement).value)"
                  placeholder="Ad set description..."
                  class="w-full px-3 py-2 bg-gray-900/50 border border-gray-800 rounded-lg text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-gray-700 resize-none"
                  rows="4"
                />
              </div>
            </div>

            <!-- Status -->
            <div class="flex items-start gap-4">
              <label class="w-32 text-sm text-gray-400 pt-2">Status</label>
              <div class="flex-1">
                <select
                  :value="adSet.status || 'draft'"
                  @change="(e) => updateField('status', (e.target as HTMLSelectElement).value)"
                  class="w-full px-3 py-2 bg-gray-900/50 border border-gray-800 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-gray-700 cursor-pointer"
                >
                  <option value="draft">Draft</option>
                  <option value="ready_for_review">Ready for Review</option>
                  <option value="in_review">In Review</option>
                  <option value="approved">Approved</option>
                  <option value="changes_requested">Changes Requested</option>
                  <option value="live">Live</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <!-- Platform -->
            <div class="flex items-start gap-4">
              <label class="w-32 text-sm text-gray-400 pt-2">Platform</label>
              <div class="flex-1">
                <input
                  type="text"
                  :value="adSet.platform || ''"
                  @blur="(e) => updateField('platform', (e.target as HTMLInputElement).value)"
                  class="w-full px-3 py-2 bg-gray-900/50 border border-gray-800 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-gray-700"
                />
              </div>
            </div>

            <!-- Audience Description -->
            <div class="flex items-start gap-4">
              <label class="w-32 text-sm text-gray-400 pt-2">Audience</label>
              <div class="flex-1">
                <textarea
                  :value="adSet.audience_description || ''"
                  @blur="(e) => updateField('audience_description', (e.target as HTMLTextAreaElement).value)"
                  placeholder="Target audience description..."
                  class="w-full px-3 py-2 bg-gray-900/50 border border-gray-800 rounded-lg text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-gray-700 resize-none"
                  rows="3"
                />
              </div>
            </div>

            <!-- Age Range -->
            <div class="flex items-start gap-4">
              <label class="w-32 text-sm text-gray-400 pt-2">Age Range</label>
              <div class="flex-1">
                <input
                  type="text"
                  :value="adSet.age_range || ''"
                  @blur="(e) => updateField('age_range', (e.target as HTMLInputElement).value)"
                  placeholder="e.g., 25-45"
                  class="w-full px-3 py-2 bg-gray-900/50 border border-gray-800 rounded-lg text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-gray-700"
                />
              </div>
            </div>

            <!-- Gender -->
            <div class="flex items-start gap-4">
              <label class="w-32 text-sm text-gray-400 pt-2">Gender</label>
              <div class="flex-1">
                <select
                  :value="adSet.gender || 'all'"
                  @change="(e) => updateField('gender', (e.target as HTMLSelectElement).value)"
                  class="w-full px-3 py-2 bg-gray-900/50 border border-gray-800 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-gray-700 cursor-pointer"
                >
                  <option value="all">All</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            <!-- Dates -->
            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-start gap-4">
                <label class="w-32 text-sm text-gray-400 pt-2">Start Date</label>
                <div class="flex-1">
                  <input
                    type="date"
                    :value="adSet.planned_start_date || ''"
                    @change="(e) => updateField('planned_start_date', (e.target as HTMLInputElement).value)"
                    class="w-full px-3 py-2 bg-gray-900/50 border border-gray-800 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-gray-700"
                  />
                </div>
              </div>

              <div class="flex items-start gap-4">
                <label class="w-32 text-sm text-gray-400 pt-2">End Date</label>
                <div class="flex-1">
                  <input
                    type="date"
                    :value="adSet.planned_end_date || ''"
                    @change="(e) => updateField('planned_end_date', (e.target as HTMLInputElement).value)"
                    class="w-full px-3 py-2 bg-gray-900/50 border border-gray-800 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-gray-700"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  adSet?: any
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'updated'): void
}>()

const { supabase } = useSupabase()

// Update field function
const updateField = async (fieldName: string, value: any) => {
  if (!props.adSet?.id) return
  
  try {
    const { error } = await supabase
      .from('ad_sets')
      .update({ 
        [fieldName]: value,
        updated_at: new Date().toISOString()
      })
      .eq('id', props.adSet.id)
    
    if (error) throw error
    
    emit('updated')
    
    console.log(`✅ Updated ${fieldName}`)
  } catch (error) {
    console.error(`❌ Failed to update ${fieldName}:`, error)
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
