<template>
  <div class="novel-editor-wrapper">
    <ClientOnly>
      <EditorRoot>
        <EditorContent
          :initialContent="initialContent"
          :extensions="extensions"
          class="novel-editor-custom"
          @update="handleUpdate"
        />
      </EditorRoot>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { EditorRoot, EditorContent } from 'novel'
import { defaultExtensions } from 'novel/extensions'
import 'novel/styles.css'

interface Props {
  modelValue?: string
  storageKey?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  storageKey: 'novel-editor'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const initialContent = computed(() => {
  if (!props.modelValue) {
    return {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: []
        }
      ]
    }
  }
  try {
    return JSON.parse(props.modelValue)
  } catch {
    return {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: []
        }
      ]
    }
  }
})

const extensions = defaultExtensions

function handleUpdate({ editor }: any) {
  const json = editor.getJSON()
  emit('update:modelValue', JSON.stringify(json))
}
</script>

<style>
/* Override Novel styles to match app theme */
.novel-editor-wrapper {
  @apply w-full;
}

.novel-editor-custom {
  @apply bg-transparent text-white;
}

/* Editor content area */
.novel-editor-custom .ProseMirror {
  @apply bg-transparent text-white min-h-[200px] px-4 py-3 outline-none;
}

.novel-editor-custom .ProseMirror p {
  @apply text-white text-sm leading-relaxed mb-3;
}

.novel-editor-custom .ProseMirror h1 {
  @apply text-2xl font-bold text-white mb-4;
}

.novel-editor-custom .ProseMirror h2 {
  @apply text-xl font-semibold text-white mb-3;
}

.novel-editor-custom .ProseMirror h3 {
  @apply text-lg font-medium text-white mb-2;
}

.novel-editor-custom .ProseMirror ul,
.novel-editor-custom .ProseMirror ol {
  @apply text-white ml-4 mb-3;
}

.novel-editor-custom .ProseMirror li {
  @apply text-sm mb-1;
}

.novel-editor-custom .ProseMirror code {
  @apply bg-white/10 text-teal-300 px-1.5 py-0.5 rounded text-sm;
}

.novel-editor-custom .ProseMirror pre {
  @apply bg-white/5 border border-white/10 rounded-lg p-4 mb-3 overflow-x-auto;
}

.novel-editor-custom .ProseMirror blockquote {
  @apply border-l-4 border-teal-400 pl-4 text-slate-300 italic mb-3;
}

.novel-editor-custom .ProseMirror a {
  @apply text-teal-400 underline hover:text-teal-300;
}

/* Placeholder */
.novel-editor-custom .ProseMirror p.is-editor-empty:first-child::before {
  @apply text-slate-500;
}

/* Bubble menu styling */
.novel-editor-custom .bubble-menu {
  @apply bg-slate-900 border border-white/10 rounded-lg shadow-xl;
}

.novel-editor-custom .bubble-menu button {
  @apply text-white hover:bg-white/10 transition-colors;
}

/* Slash command menu */
.novel-editor-custom [data-radix-popper-content-wrapper] {
  @apply z-50;
}

.novel-editor-custom [role="menu"] {
  @apply bg-slate-900 border border-white/10 rounded-lg shadow-xl p-1;
}

.novel-editor-custom [role="menuitem"] {
  @apply text-white hover:bg-white/10 rounded px-3 py-2 text-sm cursor-pointer transition-colors;
}

/* Selection */
.novel-editor-custom .ProseMirror ::selection {
  @apply bg-teal-400/30;
}
</style>
