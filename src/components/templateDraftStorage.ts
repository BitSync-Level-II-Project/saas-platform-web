
import type {
  SavedTemplateDraft,
  TemplateDraft,
} from './templateTypes'

import { validateTemplate } from './validateTemplate'
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

function isSavedDraft(value: unknown): value is SavedTemplateDraft {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    isDraft(value)
  )
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



const DRAFTS_KEY = 'sitetrace.template-builder.drafts.v1'

export function loadSavedDrafts(): SavedTemplateDraft[] {
  try {
    const stored = localStorage.getItem(DRAFTS_KEY)

    if (stored === null) {
      const previousDraft = loadTemplateDraft()

      return previousDraft
        ? [{ ...previousDraft, id: 'imported-current-draft' }]
        : []
    }

    const parsed: unknown = JSON.parse(stored)

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.filter(isSavedDraft)
  } catch {
    return []
  }
}

export function saveTemplateDraft(
  draft: SavedTemplateDraft
): void {
  const existingDrafts = loadSavedDrafts()

  const existing = existingDrafts.find(
    (item) => item.id === draft.id
  )

  if (existing?.status === 'published') {
    throw new Error(
      'Published versions cannot be overwritten.'
    )
  }

  if (draft.status === 'published') {
    const errors = validateTemplate(
      draft.details,
      draft.fields
    )

    if (errors.length > 0 || draft.version !== 1) {
      throw new Error(
        'The template is not ready for publishing.'
      )
    }
  }

  const updatedDrafts = [
    draft,
    ...existingDrafts.filter(
      (item) => item.id !== draft.id
    ),
  ]

  localStorage.setItem(
    DRAFTS_KEY,
    JSON.stringify(updatedDrafts)
  )
}