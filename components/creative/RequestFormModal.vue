<template>
  <Teleport to="body">
    <Transition name="modal">
      <div 
        v-if="isOpen" 
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="close"
      >
        <!-- Backdrop -->
        <div 
          class="absolute inset-0 bg-black/70 backdrop-blur-sm"
          @click="close"
        ></div>
        
        <!-- Modal Content -->
        <div class="relative z-10 w-full max-w-2xl">
          <RequestForm 
            @close="close" 
            @submitted="handleSubmitted" 
          />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import RequestForm from './RequestForm.vue'
import type { RequestFormModalMethods } from '~/types/components'

const isOpen = ref(false)
const emit = defineEmits<{
  submitted: [requestId: string]
}>()

const open = (): void => {
  isOpen.value = true
  // Prevent body scroll when modal is open
  document.body.style.overflow = 'hidden'
}

const close = (): void => {
  isOpen.value = false
  // Restore body scroll
  document.body.style.overflow = ''
}

const handleSubmitted = (requestId: string): void => {
  emit('submitted', requestId)
  close()
}

// Expose methods to parent with proper typing
defineExpose<RequestFormModalMethods>({
  open,
  close
})

// Clean up on unmount
onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.3s ease;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95);
}
</style>
