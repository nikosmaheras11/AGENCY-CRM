<template>
  <div class="tiptap-editor-wrapper">
    <ClientOnly>
      <div v-if="editor" class="tiptap-toolbar">
        <button
          @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
          :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }"
          class="toolbar-button"
        >
          <span class="material-icons text-base">title</span>
        </button>
        <button
          @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
          :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }"
          class="toolbar-button"
        >
          H2
        </button>
        <button
          @click="editor.chain().focus().toggleBold().run()"
          :class="{ 'is-active': editor.isActive('bold') }"
          class="toolbar-button"
        >
          <span class="material-icons text-base">format_bold</span>
        </button>
        <button
          @click="editor.chain().focus().toggleItalic().run()"
          :class="{ 'is-active': editor.isActive('italic') }"
          class="toolbar-button"
        >
          <span class="material-icons text-base">format_italic</span>
        </button>
        <button
          @click="editor.chain().focus().toggleBulletList().run()"
          :class="{ 'is-active': editor.isActive('bulletList') }"
          class="toolbar-button"
        >
          <span class="material-icons text-base">format_list_bulleted</span>
        </button>
        <button
          @click="editor.chain().focus().toggleOrderedList().run()"
          :class="{ 'is-active': editor.isActive('orderedList') }"
          class="toolbar-button"
        >
          <span class="material-icons text-base">format_list_numbered</span>
        </button>
        <button
          @click="editor.chain().focus().toggleCodeBlock().run()"
          :class="{ 'is-active': editor.isActive('codeBlock') }"
          class="toolbar-button"
        >
          <span class="material-icons text-base">code</span>
        </button>
      </div>
      <EditorContent :editor="editor" class="tiptap-editor" />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { ObjectiveBlock } from './tiptap/ObjectiveBlockExtension'

interface Props {
  modelValue?: string
  storageKey?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  storageKey: 'editor'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'click-objective': [id: string]
  'toggle-complete': [id: string, completed: boolean]
}>()

const editor = useEditor({
  extensions: [
    StarterKit,
    Placeholder.configure({
      placeholder: 'Start writing your notes here... Type "/" for commands or drag objective blocks'
    }),
    ObjectiveBlock
  ],
  content: props.modelValue,
  editorProps: {
    attributes: {
      class: 'prose prose-invert focus:outline-none'
    }
  },
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  }
})

// Expose editor instance to parent
defineExpose({
  editor
})

watch(() => props.modelValue, (newValue) => {
  if (editor.value && newValue !== editor.value.getHTML()) {
    editor.value.commands.setContent(newValue)
  }
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<style scoped>
.tiptap-editor-wrapper {
  @apply w-full;
}

.tiptap-toolbar {
  @apply flex items-center gap-1 p-2 border-b border-white/10 bg-white/5 rounded-t-lg;
}

.toolbar-button {
  @apply p-2 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors;
}

.toolbar-button.is-active {
  @apply bg-teal-400/20 text-teal-400;
}

.tiptap-editor :deep(.ProseMirror) {
  @apply bg-transparent text-white min-h-[200px] px-4 py-4 outline-none;
}

.tiptap-editor :deep(.ProseMirror p) {
  @apply text-white text-sm leading-relaxed mb-3;
}

.tiptap-editor :deep(.ProseMirror h1) {
  @apply text-2xl font-bold text-white mb-4 mt-6;
}

.tiptap-editor :deep(.ProseMirror h2) {
  @apply text-xl font-semibold text-white mb-3 mt-5;
}

.tiptap-editor :deep(.ProseMirror h3) {
  @apply text-lg font-medium text-white mb-2 mt-4;
}

.tiptap-editor :deep(.ProseMirror ul),
.tiptap-editor :deep(.ProseMirror ol) {
  @apply text-white ml-6 mb-3;
}

.tiptap-editor :deep(.ProseMirror li) {
  @apply text-sm mb-1;
}

.tiptap-editor :deep(.ProseMirror code) {
  @apply bg-white/10 text-teal-300 px-1.5 py-0.5 rounded text-sm;
}

.tiptap-editor :deep(.ProseMirror pre) {
  @apply bg-white/5 border border-white/10 rounded-lg p-4 mb-3 overflow-x-auto;
}

.tiptap-editor :deep(.ProseMirror pre code) {
  @apply bg-transparent p-0;
}

.tiptap-editor :deep(.ProseMirror blockquote) {
  @apply border-l-4 border-teal-400 pl-4 text-slate-300 italic mb-3;
}

.tiptap-editor :deep(.ProseMirror a) {
  @apply text-teal-400 underline hover:text-teal-300;
}

/* Placeholder */
.tiptap-editor :deep(.ProseMirror p.is-editor-empty:first-child::before) {
  @apply text-slate-500;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}

/* Selection */
.tiptap-editor :deep(.ProseMirror ::selection) {
  @apply bg-teal-400/30;
}

/* Focus */
.tiptap-editor :deep(.ProseMirror:focus) {
  @apply outline-none;
}
</style>
