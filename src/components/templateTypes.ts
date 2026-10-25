export type FieldType =
  | 'short-text'
  | 'long-text'
  | 'number'
  | 'dropdown'
  | 'yes-no'
  | 'date-time'
  | 'photo'
  | 'barcode'
  | 'location'

export type TemplateField = {
  id: string
  type: FieldType
  label: string
  required: boolean
  options?: string[]
  min?: number | null
  max?: number | null
}

export type FieldSettingsUpdate = {
  label?: string
  required?: boolean
  options?: string[]
  min?: number | null
  max?: number | null
}

export type TemplateDetails = {
  name: string
  industry: string
  process: string
  warehouse: string
  description: string
}

export type TemplateDraft = {
  schemaVersion: 1
  details: TemplateDetails
  fields: TemplateField[]
  savedAt: string
}