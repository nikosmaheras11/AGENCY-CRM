<!-- components/FileDropzone.vue -->
<script setup lang="ts">
const props = defineProps<{
  accept?: string
  multiple?: boolean
  maxSize?: number // in MB
}>()

const emit = defineEmits<{
  upload: [files: File[]]
}>()

const isDragging = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = true
}

const handleDragLeave = () => {
  isDragging.value = false
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false

  const files = Array.from(e.dataTransfer?.files || [])
  processFiles(files)
}

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = Array.from(target.files || [])
  processFiles(files)
}

const processFiles = (files: File[]) => {
  const maxSizeBytes = (props.maxSize || 50) * 1024 * 1024
  
  // Filter files by size
  const validFiles = files.filter(file => {
    if (file.size > maxSizeBytes) {
      console.warn(`File ${file.name} exceeds max size of ${props.maxSize}MB`)
      return false
    }
    return true
  })

  if (validFiles.length > 0) {
    emit('upload', validFiles)
  }
}

const openFileDialog = () => {
  fileInput.value?.click()
}
</script>

<template>
  <div
    class="border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer"
    :class="isDragging 
      ? 'border-primary-500 bg-primary-500/10' 
      : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800/50'"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
    @click="openFileDialog"
  >
    <input
      ref="fileInput"
      type="file"
      :accept="accept"
      :multiple="multiple"
      @change="handleFileSelect"
      class="hidden"
    />

    <div class="flex flex-col items-center gap-3">
      <div class="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center">
        <UIcon 
          name="i-heroicons-cloud-arrow-up" 
          class="text-3xl"
          :class="isDragging ? 'text-primary-500' : 'text-gray-400'"
        />
      </div>

      <div>
        <p class="text-lg font-medium text-white mb-1">
          Drop files here or click to browse
        </p>
        <p class="text-sm text-gray-400">
          {{ accept ? `Accepted: ${accept}` : 'All file types accepted' }}
          {{ maxSize ? ` • Max ${maxSize}MB` : '' }}
        </p>
      </div>

      <UButton 
        variant="soft" 
        color="primary"
        @click.stop="openFileDialog"
      >
        Browse Files
      </UButton>
    </div>
  </div>
</template>
