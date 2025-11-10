<template>
  <node-view-wrapper class="objective-block-wrapper">
    <div 
      class="objective-block card-glass rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-all"
      :class="{ 'opacity-50': node.attrs.completed }"
      @click="handleClick"
      draggable="true"
      data-drag-handle
    >
      <div class="flex items-start gap-3 p-4">
        <!-- Checkbox -->
        <button
          @click.stop="toggleComplete"
          :class="[
            'w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border-2 transition-colors mt-0.5',
            node.attrs.completed
              ? 'bg-success border-success'
              : 'border-white/30 hover:border-white/50'
          ]"
        >
          <span v-if="node.attrs.completed" class="material-icons text-white text-sm">check</span>
        </button>
        
        <!-- Content -->
        <div class="flex-1 min-w-0">
          <h3 :class="[
            'font-medium text-base mb-2',
            node.attrs.completed ? 'text-slate-400 line-through' : 'text-white'
          ]">
            {{ node.attrs.title || 'Untitled Objective' }}
          </h3>
          
          <!-- Metadata -->
          <div class="flex items-center gap-3 text-xs text-slate-400">
            <span v-if="node.attrs.category" class="flex items-center gap-1">
              <span class="material-icons text-sm">folder</span>
              {{ node.attrs.category }}
            </span>
            <span v-if="node.attrs.dueDate" class="flex items-center gap-1">
              <span class="material-icons text-sm">calendar_today</span>
              {{ node.attrs.dueDate }}
            </span>
            <span :class="[
              'px-2 py-0.5 rounded-full font-medium',
              node.attrs.priority === 'high' ? 'bg-error/20 text-error' :
              node.attrs.priority === 'medium' ? 'bg-orange-300/20 text-orange-300' :
              'bg-teal-400/20 text-teal-300'
            ]">
              {{ node.attrs.priority }}
            </span>
          </div>
        </div>
        
        <!-- Drag Handle -->
        <div class="flex-shrink-0 text-slate-400 hover:text-white cursor-grab active:cursor-grabbing">
          <span class="material-icons">drag_indicator</span>
        </div>
      </div>
    </div>
  </node-view-wrapper>
</template>

<script setup lang="ts">
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3'

const props = defineProps(nodeViewProps)

const emit = defineEmits<{
  'click-objective': [id: string]
  'toggle-complete': [id: string, completed: boolean]
}>()

function handleClick() {
  emit('click-objective', props.node.attrs.id)
}

function toggleComplete() {
  const newCompleted = !props.node.attrs.completed
  
  // Update the node attributes
  props.updateAttributes({
    completed: newCompleted
  })
  
  emit('toggle-complete', props.node.attrs.id, newCompleted)
}
</script>

<style scoped>
.objective-block-wrapper {
  margin: 1rem 0;
}

.objective-block {
  user-select: none;
}

.objective-block-wrapper[data-drag-handle] {
  cursor: grab;
}

.objective-block-wrapper[data-drag-handle]:active {
  cursor: grabbing;
}
</style>
