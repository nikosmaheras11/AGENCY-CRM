<template>
  <UModal :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <div class="p-6 bg-gray-900 border border-gray-800 rounded-lg">
      <div class="flex items-start gap-4">
        <div class="p-2 rounded-full" :class="danger ? 'bg-red-500/10 text-red-500' : 'bg-gray-500/10 text-gray-400'">
          <UIcon :name="danger ? 'i-heroicons-exclamation-triangle' : 'i-heroicons-information-circle'" class="text-2xl" />
        </div>
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-white mb-2">{{ title }}</h3>
          <p class="text-gray-400 text-sm mb-6">{{ description }}</p>
          
          <div class="flex items-center justify-end gap-3">
            <UButton
              color="gray"
              variant="ghost"
              @click="$emit('cancel')"
            >
              {{ cancelLabel }}
            </UButton>
            <UButton
              :color="danger ? 'red' : 'primary'"
              :variant="danger ? 'solid' : 'solid'"
              :loading="loading"
              @click="$emit('confirm')"
            >
              {{ confirmLabel }}
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </UModal>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  danger: false,
  loading: false
})

defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()
</script>
