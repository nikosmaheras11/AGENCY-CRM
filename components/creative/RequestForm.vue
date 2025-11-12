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

<script setup>
const { supabase } = useSupabase()

const emit = defineEmits(['close', 'submitted'])

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

const selectedFile = ref(null)
const isSubmitting = ref(false)

function handleFileChange(event) {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

async function handleSubmit() {
  isSubmitting.value = true
  
  try {
    // Insert request into database
    const { data: request, error: requestError } = await supabase
      .from('requests')
      .insert({
        title: form.value.title,
        description: form.value.description,
        request_type: 'creative',
        status: 'new_request',
        priority: form.value.priority,
        due_date: form.value.dueDate || null,
        metadata: {
          platform: form.value.platform,
          ad_format: form.value.adFormat,
          figma_links: form.value.figmaLinks.split('\n').filter(link => link.trim()),
          inspiration: form.value.inspiration
        }
      })
      .select()
      .single()

    if (requestError) throw requestError

    // Upload file if present
    if (selectedFile.value && request) {
      const fileExt = selectedFile.value.name.split('.').pop()
      const fileName = `${request.id}/${Date.now()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('creative-assets')
        .upload(fileName, selectedFile.value)

      if (uploadError) {
        console.error('File upload error:', uploadError)
      } else {
        // Create asset record
        await supabase.from('assets').insert({
          request_id: request.id,
          name: selectedFile.value.name,
          original_filename: selectedFile.value.name,
          storage_path: fileName,
          file_type: selectedFile.value.type.split('/')[0],
          file_size: selectedFile.value.size
        })
      }
    }

    // Success!
    emit('submitted', request.id)
    emit('close')
    
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
    
  } catch (error) {
    console.error('Error creating request:', error)
    alert('Failed to create request. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}
</script>
