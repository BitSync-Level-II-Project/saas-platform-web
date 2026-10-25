import type { TemplateDraft } from './templateTypes'

const STORAGE_KEY = 'sitetrace.template-builder.draft.v1'

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  )
}

function isDraft(value: unknown): value is TemplateDraft {
  if (!isRecord(value)) {
    return false
  }

  const details = value.details
  const fields = value.fields

  if (
    value.schemaVersion !== 1 ||
    typeof value.savedAt !== 'string' ||
    !isRecord(details) ||
    !Array.isArray(fields)
  ) {
    return false
  }

  const detailKeys = [
    'name',
    'industry',
    'process',
    'warehouse',
    'description',
  ]

  if (
    !detailKeys.every(
      (key) => typeof details[key] === 'string'
    )
  ) {
    return false
  }

  const allowedTypes = [
    'short-text',
    'long-text',
    'number',
    'dropdown',
    'yes-no',
    'date-time',
    'photo',
    'barcode',
    'location',
  ]

  const validFields = fields.every((field) => {
    if (!isRecord(field)) {
      return false
    }

    return (
      typeof field.id === 'string' &&
      typeof field.label === 'string' &&
      typeof field.required === 'boolean' &&
      typeof field.type === 'string' &&
      allowedTypes.includes(field.type) &&
      (field.options === undefined ||
        (Array.isArray(field.options) &&
          field.options.every(
            (option) => typeof option === 'string'
          ))) &&
      (field.min == null ||
        (typeof field.min === 'number' &&
          Number.isFinite(field.min))) &&
      (field.max == null ||
        (typeof field.max === 'number' &&
          Number.isFinite(field.max)))
    )
  })

  const ids = fields.map((field) =>
    isRecord(field) ? field.id : undefined
  )

  return validFields && new Set(ids).size === ids.length
}

export function loadTemplateDraft(): TemplateDraft | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)

    if (!stored) {
      return null
    }

    const parsed: unknown = JSON.parse(stored)

    return isDraft(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function saveTemplateDraft(
  draft: TemplateDraft
): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(draft)
  )
}