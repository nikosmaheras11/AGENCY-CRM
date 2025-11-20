/**
 * Types for Request Detail Modal and Request-Level Comments
 * 
 * Note: These are SEPARATE from asset comments which are spatial/positioned
 */

// Request Comment (task-level discussion)
export interface RequestComment {
  id: string
  request_id: string
  parent_comment_id: string | null
  content: string
  user_id: string
  user_name: string
  user_avatar_url: string | null
  is_edited: boolean
  is_deleted: boolean
  created_at: string
  updated_at: string
}

// Comment tree node for threading
export interface CommentNode extends RequestComment {
  replies: CommentNode[]
}

// Field configuration types
export type FieldType = 
  | 'text' 
  | 'textarea' 
  | 'url' 
  | 'date' 
  | 'number' 
  | 'currency'
  | 'select'
  | 'user-select'
  | 'client-select'
  | 'tag-input'

export interface FieldOption {
  value: string
  label: string
  icon?: string
  color?: string
}

export interface FieldConfig {
  key: string
  label: string
  type: FieldType
  placeholder?: string
  options?: FieldOption[]
  rows?: number
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  validate?: (value: any) => boolean | string
}

export interface FieldGroup {
  title: string
  icon?: string
  fields: FieldConfig[]
}

// Modal tabs
export type ModalTab = 'details' | 'comments' | 'activity'
