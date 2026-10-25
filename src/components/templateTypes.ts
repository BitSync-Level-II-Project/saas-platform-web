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
}

export type FieldSettingsUpdate = {
  label?: string
  required?: boolean
}