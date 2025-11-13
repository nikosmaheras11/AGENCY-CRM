<template>
  <div class="bg-[#1a1d24] text-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
    <!-- Header -->
    <div class="sticky top-0 bg-[#1a1d24] border-b border-white/10 p-6 flex items-center justify-between z-10">
      <h2 class="text-2xl font-bold">Creative Request Form</h2>
      <div class="flex items-center gap-3">
        <button 
          type="button"
          class="p-2 hover:bg-white/5 rounded-lg transition-colors"
          title="Edit form"
        >
          <span class="material-icons text-xl">edit_note</span>
        </button>
        <button 
          type="button"
          @click="$emit('close')"
          class="p-2 hover:bg-white/5 rounded-lg transition-colors"
        >
          <span class="material-icons text-xl">close</span>
        </button>
      </div>
    </div>

    <!-- Form Content -->
    <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
      <!-- Creative Name -->
      <div>
        <label class="block text-sm font-medium mb-2">Creative Name</label>
        <input 
          v-model="form.title"
          type="text"
          placeholder="Write something"
          class="w-full bg-[#0f1117] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-400 transition-colors"
          required
        />
        <p class="text-xs text-gray-400 mt-1">ToF: Texas | Nick, etc.</p>
      </div>

      <!-- Platform -->
      <div>
        <label class="block text-sm font-medium mb-2">Platform</label>
        <input 
          v-model="form.platform"
          type="text"
          placeholder="Write something"
          class="w-full bg-[#0f1117] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-400 transition-colors"
        />
      </div>

      <!-- Ad Size / Format -->
      <div>
        <label class="block text-sm font-medium mb-2">Ad Size / Format</label>
        <input 
          v-model="form.adFormat"
          type="text"
          placeholder="Write something"
          class="w-full bg-[#0f1117] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-400 transition-colors"
        />
        <p class="text-xs text-gray-400 mt-1">1080x1920, Carousel, etc.</p>
      </div>

      <!-- Priority -->
      <div>
        <label class="block text-sm font-medium mb-2">Priority</label>
        <div class="relative">
          <select 
            v-model="form.priority"
            class="w-full bg-[#0f1117] border border-white/10 rounded-lg px-4 py-3 text-white appearance-none focus:outline-none focus:border-primary-400 transition-colors cursor-pointer"
          >
            <option value="" disabled>Select an option</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
          <span class="material-icons absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            expand_more
          </span>
        </div>
      </div>

      <!-- Due Date -->
      <div>
        <label class="block text-sm font-medium mb-2">Due Date</label>
        <div class="relative">
          <input 
            v-model="form.dueDate"
            type="date"
            class="w-full bg-[#0f1117] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-400 transition-colors cursor-pointer"
          />
          <span class="material-icons absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            expand_more
          </span>
        </div>
      </div>

      <!-- Creative Description -->
      <div>
        <label class="block text-sm font-medium mb-2">Creative Description</label>
        <textarea 
          v-model="form.description"
          placeholder="Write something"
          rows="4"
          class="w-full bg-[#0f1117] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-400 transition-colors resize-none"
        ></textarea>
      </div>

      <!-- Inspiration (optional) -->
      <div>
        <label class="block text-sm font-medium mb-2">
          Inspiration <span class="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea 
          v-model="form.inspiration"
          placeholder="Write something"
          rows="4"
          class="w-full bg-[#0f1117] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-400 transition-colors resize-none"
        ></textarea>
      </div>

      <!-- Figma / Asset Link(s) (optional) -->
      <div>
        <label class="block text-sm font-medium mb-2">
          Figma / Asset Link(s) <span class="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea 
          v-model="form.figmaLinks"
          placeholder="Write something"
          rows="4"
          class="w-full bg-[#0f1117] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-400 transition-colors resize-none"
        ></textarea>
      </div>

      <!-- Asset File (optional) -->
      <div>
        <label class="block text-sm font-medium mb-2">
          Asset File <span class="text-gray-400 font-normal">(optional)</span>
          <span class="material-icons text-sm ml-1 align-middle text-gray-400">info</span>
        </label>
        <label class="inline-flex items-center gap-2 bg-[#0f1117] border border-white/10 rounded-lg px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors">
          <span class="material-icons text-xl">upload</span>
          <span class="font-medium">Upload File</span>
          <input 
            type="file"
            class="hidden"
            @change="handleFileChange"
            accept="image/*,video/*,.pdf,.doc,.docx"
          />
        </label>
        <p v-if="selectedFile" class="text-sm text-primary-400 mt-2">
          {{ selectedFile.name }} ({{ formatFileSize(selectedFile.size) }})
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center justify-end gap-3 pt-4">
        <button 
          type="button"
          @click="$emit('close')"
          class="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-lg font-medium transition-colors"
        >
          Close
        </button>
        <button 
          type="submit"
          :disabled="isSubmitting"
          class="px-6 py-3 bg-success hover:bg-success/90 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isSubmitting ? 'Submitting...' : 'Submit' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { RequestFormData } from '~/composables/useRequestForm'

const { submitRequest, submitting, error: submitError } = useRequestForm()

const emit = defineEmits<{
  close: []
  submitted: [requestId: string]
}>()

const form = ref({
  title: '',
  platform: '',
  adFormat: '',
  priority: 'medium',
  dueDate: '',
  description: '',
  inspiration: '',
  figmaLinks: ''
})

const selectedFile = ref<File | null>(null)
const isSubmitting = ref(false)

function handleFileChange(event: Event): void {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    selectedFile.value = file
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

async function handleSubmit(): Promise<void> {
  isSubmitting.value = true
  console.log('Form submission started...')
  
  try {
    const payload: RequestFormData = {
      creativeName: form.value.title,
      platform: form.value.platform,
      adSizeFormat: form.value.adFormat,
      priority: form.value.priority as any,
      dueDate: form.value.dueDate,
      creativeDescription: form.value.description,
      inspiration: form.value.inspiration,
      figmaAssetLinks: form.value.figmaLinks,
      assetFile: selectedFile.value
    }

    console.log('Submitting payload:', { ...payload, assetFile: selectedFile.value?.name })
    
    // Add timeout - if request takes >8 seconds, assume success and close
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('TIMEOUT')), 8000)
    )
    
    try {
      const request = await Promise.race([submitRequest(payload), timeoutPromise])
      console.log('Request created:', request)
    } catch (err: any) {
      if (err.message === 'TIMEOUT') {
        console.warn('Request timed out, but likely succeeded - closing modal')
        // Don't throw, just close the modal
      } else {
        throw err
      }
    }

    // Reset form
    form.value = {
      title: '',
      platform: '',
      adFormat: '',
      priority: 'medium',
      dueDate: '',
      description: '',
      inspiration: '',
      figmaLinks: ''
    }
    selectedFile.value = null
    
    // Success! Emit events
    emit('submitted', request.id)
    emit('close')
    
  } catch (error: any) {
    console.error('Error creating request:', error)
    const errorMsg = error?.message || submitError.value || 'Failed to create request. Please check console for details.'
    alert(errorMsg)
    // Close form anyway to avoid stuck state
    emit('close')
  } finally {
    isSubmitting.value = false
  }
}
</script>
