import { Node, mergeAttributes } from '@tiptap/core'
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

  renderHTML({ HTMLAttributes }) {
    return ['objective-block', mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return VueNodeViewRenderer(ObjectiveBlockView)
  },

  addCommands() {
    return {
      setObjectiveBlock: (attributes: ObjectiveBlockAttributes) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: attributes,
        })
      },
    }
  },
})
