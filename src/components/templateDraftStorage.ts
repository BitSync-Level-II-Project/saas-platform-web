
import type {
  SavedTemplateDraft,
  TemplateDraft,
} from './templateTypes'

import { validateTemplate } from './validateTemplate'
const STORAGE_KEY = 'sitetrace.template-builder.draft.v1'

export type DraftLoadResult =
  | {
      status: 'success'
      drafts: SavedTemplateDraft[]
    }
  | {
      status: 'error'
      message: string
    }

class InvalidStoredDraftsError extends Error {}

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

function isSavedDraft(
  value: unknown
): value is SavedTemplateDraft {
  if (!isRecord(value)) {
    return false
  }

  const { id, status, version, publishedAt } = value

  if (
    typeof id !== 'string' ||
    id.trim() === '' ||
    !isDraft(value)
  ) {
    return false
  }

  if (
    status !== undefined &&
    status !== 'draft' &&
    status !== 'published'
  ) {
    return false
  }

  if (
    version !== undefined &&
    (
      typeof version !== 'number' ||
      !Number.isSafeInteger(version) ||
      version < 1
    )
  ) {
    return false
  }

  if (
    publishedAt !== undefined &&
    (
      typeof publishedAt !== 'string' ||
      !Number.isFinite(Date.parse(publishedAt))
    )
  ) {
    return false
  }

  if (status === 'published') {
    return (
      version !== undefined &&
      typeof publishedAt === 'string'
    )
  }

  return true
}

export function loadTemplateDraft(): TemplateDraft | null {
  const stored = localStorage.getItem(STORAGE_KEY)

  if (stored === null) {
    return null
  }

  const parsed: unknown = JSON.parse(stored)

  if (!isDraft(parsed)) {
    throw new InvalidStoredDraftsError(
      'The previous draft has an invalid format.'
    )
  }

  return parsed
}


const DRAFTS_KEY = 'sitetrace.template-builder.drafts.v1'

export function loadSavedDrafts(): DraftLoadResult {
  try {
    const stored = localStorage.getItem(DRAFTS_KEY)

    if (stored === null) {
      const previousDraft = loadTemplateDraft()

      return {
        status: 'success',
        drafts: previousDraft
          ? [
              {
                ...previousDraft,
                id: 'imported-current-draft',
              },
            ]
          : [],
      }
    }

    const parsed: unknown = JSON.parse(stored)

    if (
      !Array.isArray(parsed) ||
      !parsed.every(isSavedDraft)
    ) {
      throw new InvalidStoredDraftsError(
        'The saved template collection is invalid.'
      )
    }

    const ids = parsed.map((draft) => draft.id)

    if (new Set(ids).size !== ids.length) {
      throw new InvalidStoredDraftsError(
        'Duplicate template IDs were found.'
      )
    }

    return {
      status: 'success',
      drafts: parsed,
    }
  } catch (error) {
    const isInvalidData =
      error instanceof SyntaxError ||
      error instanceof InvalidStoredDraftsError

    return {
      status: 'error',
      message: isInvalidData
        ? 'Saved templates contain invalid or unsupported data. Your stored data has not been changed.'
        : 'Browser storage could not be accessed. Check your browser settings and try again.',
    }
  }
}

export function saveTemplateDraft(
  draft: SavedTemplateDraft
): void {
  const result = loadSavedDrafts()

if (result.status === 'error') {
  throw new Error(
    'Save blocked because existing templates could not be loaded.'
  )
}

if (!isSavedDraft(draft)) {
  throw new Error(
    'The template has an invalid storage format.'
  )
}

const existingDrafts = result.drafts

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