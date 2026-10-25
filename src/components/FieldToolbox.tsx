import type { FieldType } from './templateTypes'

type FieldOption = {
  type: FieldType
  label: string
}

const fieldOptions: FieldOption[] = [
  { type: 'short-text', label: 'Short Text' },
  { type: 'long-text', label: 'Long Text' },
  { type: 'number', label: 'Number' },
  { type: 'dropdown', label: 'Dropdown' },
  { type: 'yes-no', label: 'Yes / No' },
  { type: 'date-time', label: 'Date / Time' },
  { type: 'photo', label: 'Photo' },
  { type: 'barcode', label: 'QR / Barcode' },
  { type: 'location', label: 'Location' },
]

type FieldToolboxProps = {
  onAddField: (type: FieldType, label: string) => void
}

export function FieldToolbox({
  onAddField,
}: FieldToolboxProps) {
  return (
    <section
      className="template-builder__toolbox"
      aria-labelledby="field-toolbox-title"
    >
      <h2 id="field-toolbox-title">Field toolbox</h2>

      <p>Click a field type to add it to your form.</p>

      <div className="template-builder__field-options">
        {fieldOptions.map((option) => (
          <button
            key={option.type}
            type="button"
            className="template-builder__field-option"
            onClick={() =>
              onAddField(option.type, option.label)
            }
          >
            <span>{option.label}</span>
            <span aria-hidden="true">+</span>
          </button>
        ))}
      </div>
    </section>
  )
}