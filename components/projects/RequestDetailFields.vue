<template>
  <div class="detail-fields space-y-6">
    <div class="field-group">
      <h3 class="text-sm font-semibold text-gray-300 mb-3">Status & Assignment</h3>
      <div class="space-y-3">
        <div class="field-row">
          <label class="field-label">Status</label>
          <select 
            :value="request.status" 
            @change="$emit('update', 'status', ($event.target as HTMLSelectElement).value)"
            class="field-input"
          >
            <option value="new-request">New Request</option>
            <option value="in-progress">In Progress</option>
            <option value="needs-review">Needs Review</option>
            <option value="needs-edit">Needs Edit</option>
            <option value="done">Done</option>
          </select>
        </div>
        
        <div class="field-row">
          <label class="field-label">Priority</label>
          <select 
            :value="request.metadata.priority" 
            @change="$emit('update', 'priority', ($event.target as HTMLSelectElement).value)"
            class="field-input"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        
        <div class="field-row">
          <label class="field-label">Assignee</label>
          <input 
            :value="request.metadata.assignee || ''" 
            @blur="$emit('update', 'assignee', ($event.target as HTMLInputElement).value)"
            placeholder="Assign to..."
            class="field-input"
          />
        </div>
      </div>
    </div>
    
    <div class="field-group">
      <h3 class="text-sm font-semibold text-gray-300 mb-3">Timeline</h3>
      <div class="space-y-3">
        <div class="field-row">
          <label class="field-label">Due Date</label>
          <input 
            type="date"
            :value="request.metadata.dueDate || ''" 
            @change="$emit('update', 'dueDate', ($event.target as HTMLInputElement).value)"
            class="field-input"
          />
        </div>
      </div>
    </div>
    
    <div v-if="request.projectType === 'creative'" class="field-group">
      <h3 class="text-sm font-semibold text-gray-300 mb-3">Creative Specifications</h3>
      <div class="space-y-3">
        <div class="field-row">
          <label class="field-label">Platform/Format</label>
          <input 
            :value="request.format || ''" 
            @blur="$emit('update', 'format', ($event.target as HTMLInputElement).value)"
            placeholder="Meta, TikTok, Google..."
            class="field-input"
          />
        </div>
        
        <div class="field-row">
          <label class="field-label">Dimensions</label>
          <input 
            :value="request.dimensions || ''" 
            @blur="$emit('update', 'dimensions', ($event.target as HTMLInputElement).value)"
            placeholder="1080x1080, 1920x1080..."
            class="field-input"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Request } from '~/composables/useRequests'

interface Props {
  request: Request
  saving: boolean
}

defineProps<Props>()
defineEmits<{
  update: [fieldKey: string, value: any]
}>()
</script>

<style scoped>
.field-group {
  @apply p-4 bg-gray-800/50 rounded-lg border border-gray-700;
}

.field-row {
  @apply flex flex-col gap-1.5;
}

.field-label {
  @apply text-xs font-medium text-gray-400 uppercase tracking-wide;
}

.field-input {
  @apply w-full px-3 py-2 
         bg-gray-900 border border-gray-700 rounded-lg
         text-sm text-gray-200 placeholder-gray-500
         focus:outline-none focus:ring-2 focus:ring-blue-500/50
         transition-all;
}
</style>
