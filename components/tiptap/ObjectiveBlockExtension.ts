import { Node, mergeAttributes, type Command } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import ObjectiveBlockView from './ObjectiveBlockView.vue'

export interface ObjectiveBlockAttributes {
  id: string
  title: string
  category: string
  priority: 'low' | 'medium' | 'high'
  dueDate: string
  completed: boolean
}

export const ObjectiveBlock = Node.create({
  name: 'objectiveBlock',

  group: 'block',

  atom: true,

  draggable: true,

  addAttributes() {
    return {
      id: {
        default: null,
      },
      title: {
        default: '',
      },
      category: {
        default: '',
      },
      priority: {
        default: 'medium',
      },
      dueDate: {
        default: '',
      },
      completed: {
        default: false,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'objective-block',
      },
    ]
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, any> }) {
    return ['objective-block', mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return VueNodeViewRenderer(ObjectiveBlockView)
  },

  addCommands() {
    return {
      setObjectiveBlock:
        (attributes: ObjectiveBlockAttributes): Command =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: attributes,
          })
        },
    } as any
  },
})
