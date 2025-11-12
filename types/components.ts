import { ComponentPublicInstance } from 'vue'

export interface RequestFormModalMethods {
  open: () => void
  close: () => void
}

export type RequestFormModalInstance = ComponentPublicInstance & RequestFormModalMethods
