import { Extension } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'
import { VueRenderer } from '@tiptap/vue-3'
import tippy, { type Instance as TippyInstance } from 'tippy.js'
import SlashCommandMenu from './SlashCommandMenu.vue'

export const SlashCommand = Extension.create({
  name: 'slashCommand',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        command: ({ editor, range, props }: any) => {
          props.command({ editor, range })
        },
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ]
  },
})

export function getSuggestionItems({ query }: { query: string }) {
  return [
    {
      title: 'Heading 1',
      description: 'Large section heading',
      icon: 'title',
      command: ({ editor, range }: any) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode('heading', { level: 1 })
          .run()
      },
    },
    {
      title: 'Heading 2',
      description: 'Medium section heading',
      icon: 'format_size',
      command: ({ editor, range }: any) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode('heading', { level: 2 })
          .run()
      },
    },
    {
      title: 'Bullet List',
      description: 'Create a simple bullet list',
      icon: 'format_list_bulleted',
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run()
      },
    },
    {
      title: 'Numbered List',
      description: 'Create a numbered list',
      icon: 'format_list_numbered',
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleOrderedList().run()
      },
    },
    {
      title: 'Code Block',
      description: 'Display code with syntax highlighting',
      icon: 'code',
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleCodeBlock().run()
      },
    },
    {
      title: 'Quote',
      description: 'Capture a quote',
      icon: 'format_quote',
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleBlockquote().run()
      },
    },
  ].filter((item) => item.title.toLowerCase().includes(query.toLowerCase()))
}

export function renderSuggestion() {
  let component: VueRenderer
  let popup: TippyInstance[]

  return {
    onStart: (props: any) => {
      component = new VueRenderer(SlashCommandMenu, {
        props,
        editor: props.editor,
      })

      if (!props.clientRect) {
        return
      }

      const referenceElement = document.createElement('div')
      
      // @ts-ignore - tippy types issue
      popup = tippy(referenceElement, {
        getReferenceClientRect: props.clientRect,
        appendTo: () => document.body,
        content: component.element,
        showOnCreate: true,
        interactive: true,
        trigger: 'manual',
        placement: 'bottom-start',
      })
    },

    onUpdate(props: any) {
      component.updateProps(props)

      if (!props.clientRect) {
        return
      }

      popup[0].setProps({
        getReferenceClientRect: props.clientRect,
      })
    },

    onKeyDown(props: any) {
      if (props.event.key === 'Escape') {
        popup[0].hide()
        return true
      }

      return component.ref?.onKeyDown(props.event)
    },

    onExit() {
      popup[0].destroy()
      component.destroy()
    },
  }
}
