import type {
  TemplateDetails,
  TemplateField,
} from './templateTypes'

export function validateTemplate(
  details: TemplateDetails,
  fields: TemplateField[]
): string[] {
  const errors: string[] = []

  if (details.name.trim() === '') {
    errors.push('Enter a template name.')
  }

  if (details.warehouse.trim() === '') {
    errors.push('Select an applicable warehouse.')
  }

  if (fields.length === 0) {
    errors.push('Add at least one field.')
  }

  fields.forEach((field, index) => {
    const fieldName =
      field.label.trim() || `Field ${index + 1}`

    if (field.label.trim() === '') {
      errors.push(
        `Field ${index + 1}: Enter a field label.`
      )
    }

    if (field.type === 'dropdown') {
      const options = (field.options ?? [])
        .map((option) => option.trim())
        .filter((option) => option.length > 0)

      if (options.length === 0) {
        errors.push(
          `${fieldName}: Add at least one dropdown option.`
        )
      }

      const normalizedOptions = options.map(
        (option) => option.toLowerCase()
      )

      const uniqueOptions = new Set(normalizedOptions)

      if (uniqueOptions.size !== options.length) {
        errors.push(
          `${fieldName}: Remove duplicate dropdown options.`
        )
      }
    }

    if (field.type === 'number') {
      const hasInvalidMinimum =
        field.min != null &&
        !Number.isFinite(field.min)

      const hasInvalidMaximum =
        field.max != null &&
        !Number.isFinite(field.max)

      if (hasInvalidMinimum || hasInvalidMaximum) {
        errors.push(
          `${fieldName}: Enter valid number limits.`
        )
      } else if (
        field.min != null &&
        field.max != null &&
        field.min > field.max
      ) {
        errors.push(
          `${fieldName}: Maximum must be greater than or equal to minimum.`
        )
      }
    }
  })

  return errors
}